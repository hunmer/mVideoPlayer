// ==UserScript==
// @name        单剧情搜索
// @version     1.0
// @author      hunmer
// @description 搜索某部电视剧的剧情
// ==/UserScript==

var g_dsj = {
    path: nodejs.dir + '\\episode\\',
    sites: {
        百度: {
            url: 'https://www.baidu.com/s?wd=site:baike.baidu.com/ {keyword} 电视剧',
            match: 'https://baike.baidu.com/item/(.*?)',
            css: `
                #content_left {padding-left: 20px !important}
                [tpl="app/head-tab"],[tpl="app/search-tool"],[tpl="app/footer"],#head {display: none !important}
            `,
            rule: `
                (() => {
                    let r = [];
                    for(let dl of document.querySelectorAll('#dramaSerialList dl')){
                        for(let dt of dl.querySelectorAll('dt')){
                            r.push({
                                title: dt.outerText,
                                text: dt.nextElementSibling.outerText
                            })
                        }
                    }
                    window.electron.send('episode', r)
                })()
            `
        },

        剧情吧: {
            url: 'https://www.52juqingba.com/',
            js(keyword, url) {
                if (url == 'https://www.52juqingba.com/') {
                    return `
                        document.querySelector('#keywords').value = "${keyword}";
                        document.querySelector('[value="搜剧情"]').click()
                    `
                } else
                if (url.startsWith('https://www.52juqingba.com/show/')) {
                    return `document.querySelectorAll('.menu_tab a')[1].click()` // 点击剧情
                }
            },
            match: 'https://www.52juqingba.com/story/(.*?)/',
            css: `
             
            `,
            rule: `
                (() => {
                    let r = [];
                    let links = []
                    let stop = false
                    for (let a of document.querySelectorAll('.epipage a')) links.push(a.href)
                    let next = ()=>{
                        if(stop) return
                        let link = links.shift()
                        if (!link){
                            stop = true;
                            return window.electron.send('episode', r)
                        }
                        fetch(link).then(data=>{
                            if (data.status == 200) {
                                data.text().then(body=>{
                                    let tree = $(body)
                                    r.push({
                                        title: tree.find('.epi_t').text().trim(),
                                        text: tree.find('.clear.epi_c').text().trim()
                                    })
                                    next()
                                }
                                )
                            } else {
                                next()
                            }
                        })
                    }
                   for (let i = 0; i < 6; i++) next()
                })()
            `
        },

        电视猫: {
            url: 'https://www.tvmao.com/query.jsp?keys={keyword}',
            match: 'https://www.tvmao.com/drama/(.*?)',
            getURL: url => {
                return url + '/episode'
            },
            css: `
                body > div:nth-child(1),iframe,.topic_footer {display: none !important}
                .article-wrap{ width: unset !important}
            `,
            rule: `
               (()=>{
                let r = [];
                let links = []
                let stop = false
                for (let a of document.querySelectorAll('.epipage a')) links.push(a.href)
                let next = ()=>{
                    if(stop) return
                    let link = links.shift()
                    if (!link){
                        stop = true;
                        return window.electron.send('episode', r)
                    }
                    fetch(link).then(data=>{
                        if (data.status == 200) {
                            data.text().then(body=>{
                                let tree = $(body)
                                r.push({
                                    title: tree.find('.epi_t').text().trim(),
                                    text: tree.find('.clear.epi_c').text().trim()
                                })
                                next()
                            }
                            )
                        } else {
                            next()
                        }
                    })
                }
               for (let i = 0; i < 6; i++) next()
            }
            )()
            `
        },
    },
    init() {
        const self = this
        let tabs = this.tabs = g_tabs.register('dsj_tabs', {
            target: '#dsj_tabs',
            saveData: false,
            hideOneTab: false,
            items: copyObj(this.items),
            menu: `
                <div class="d-flex">
                    <a class="nav-link p-2" data-action="dsj_search" title="搜索电视剧"><i class="ti ti-search fs-2"></i></a>
                </div>
                `,
            parseContent(k, v) {
                return `
                    <div class="datalist h-full pb-4">
                        <div class="row row-cards datalist-items"></div>
                   </div>
                `
            },
            onShow(tab, ev) {
                let d = self.sites[tab]
                let btn = $(ev.target.parentElement)
                btn.addClass('border border-primary').siblings('.border-primary').removeClass('border border-primary')

                let con = g_dsj.tabs.getContent(tab).addClass('show1')
                con.siblings('.show1').removeClass('show1')

                g_dsj.tabs.tab_tabs().forEach(k => {
                    let web = g_dsj.tabs.getContent(k).find('webview')
                    if (!web.length) return

                    web = web[0]
                    if (k == tab) {
                        if (!web._inited) {
                            web._inited = true
                            web.addEventListener('will-navigate', function(e) {
                                if (d.getURL) { // 自定义url跳转
                                    e.preventDefault()
                                    web.loadURL(d.getURL(e.url))
                                }
                            })
                            web.addEventListener('ipc-message', event => {
                                var d = event.args; // 数组
                                var web = event.target;
                                switch (event.channel) {
                                    case 'episode':
                                        var data = d[0]
                                        g_plugin.callEvent('dsj_getEpisode', {
                                            data: d[0],
                                            fileName: self.keyword + '.json',
                                            load: true
                                        }).then(d => {
                                            let { data, fileName, load } = d
                                            if (data.length) {
                                                !isEmpty(fileName) && nodejs.files.write(self.path + fileName, JSON.stringify(data))
                                                load && self.load(data)
                                            }
                                        })
                                        return
                                }
                            });
                            web.addEventListener('dom-ready', function(e) {
                                let url = this.getURL()
                                if (RegExp(d.match).test(url)) { // 可以捕捉信息
                                    toast('开始捕获剧情信息...')
                                    return this.executeJavaScript(d.rule)
                                }
                                if (!this._inited) {
                                    this._inited = true // 防止返回主页重复执行
                                    let id = this.getWebContentsId()
                                    let webContents = nodejs.remote.webContents.fromId(id)
                                    webContents.setWindowOpenHandler(function(data) {
                                        // 新窗口总是在当前窗口打开
                                        webContents.loadURL(data.url)
                                        return { action: 'deny' }
                                    });
                                }
                                if (d.js) {
                                    let code = d.js(self.keyword, this.getURL())
                                    if (!isEmpty(code)) return this.executeJavaScript(code)
                                }
                                if (d.css) {
                                    this.insertCSS(d.css)
                                }
                            })
                            web.src = web.dataset.src
                        }
                    }
                })
            },
            onHide(tab, ev) {

            },
            onClose(tab) {

            }
        })
        g_action.registerAction({
            dsj_search() {
                prompt(g_playlist.data ? g_playlist.data.title : '', {
                    title: '输入要搜索的电视剧'
                }).then(keyword => {
                    if (!isEmpty(keyword)) self.search(keyword)
                })
            },
            dsj_findInPage(dom) {
                self.words = dom.value.split(' ')
                self.parse(self.data)
            },
            dsj_load(dom, a) {
                let { exists, read } = nodejs.files
                let file = self.path + a[1] + '.json'
                if (exists(file)) {
                    self.parse(JSON.parse(read(file)))
                }
            },
            dsj_findInPage_keydown(dom, action, e) {
                if (e.keyCode == 13) {
                    self.word_jump(e.ctrlKey ? -1 : 1)
                }
            },
            dsj_hide(dom) {
                $(dom).toggleClass('text-primary')
                self.toggleHide()

            },
            dsj_showDetail(dom, a) {
                let { name, items } = this.results[a[1]]
                let { text, title } = items[a[2]]
                alert(`<h2 class="text-center">${title}</h2><p>${replaceAll_once(text, this.search, '<b class="text-danger">' + this.search + '</b>' )}</p>`, { title: name, btn_ok: '复制信息', scrollable: true }).then(() => ipc_send('copy', name + ' ' + title))
            },
            dsj_findAll(dom, a, e) {
                if (e.keyCode == 13) {
                    $('#dsj_searchAll').html('').scrollTop(0)


                    let h = ''
                    let search = this.search = dom.value
                    let results = this.results = self.searchFile(search)
                    results.forEach(({ name, items }, i) => {
                        let h1 = ''
                        items.forEach((item, i1) => {
                            h1 += '<p><b>' + item.title + ' : </b>'
                            let start = 0
                            let cnt = 0
                            while (true) {
                                let i = item.text.indexOf(search, start);
                                if (i == -1) break;
                                h1 += item.text.substr(i - 6, 16).replace(search, '<b class="text-danger">' + search + '</b>') + '...'
                                start = i + search.length;
                            }

                            h1 += `<a href='#' class="ms-2" data-action="dsj_showDetail,${i},${i1}">详情</a></p>`
                        })
                        h += `
                        <div class="card mb-2">
                          <div class="card-header card-header-light">
                            <h3 class="card-title">${name}</h3>
                          </div>
                          <div class="card-body">${h1}</div>
                        </div>`
                    })

                    $('#dsj_searchAll').html(h)
                }
            },
            dsj_listSearch(dom, a, e) {
                if (e.keyCode == 13) {
                    let h = ''
                    let s = dom.value
                    let py = PinYinTranslate.start(s);
                    let sz = PinYinTranslate.sz(s);
                    nodejs.files.dirFiles(self.path, ['json'], files => {
                        files.map(file => getFileName(file, false)).filter(key => key.indexOf(s) != -1)
                            .forEach(file => {
                                h += `<a href="#" data-action="dsj_load,${file}" class="btn mt-2 btn-outline-primary me-2">${file.replace('['+cutString(file, '[', ']')+']', '')}</a>`
                            })
                    })
                    $('#dsj_list').html(h || `<h4 class="text-center">没有任何搜索结果</h4>`)
                }
            },
        })
        // this.search('流金岁月')
    },

    load(data) {
        this.data = data
        this.parse(data)
    },

    searchFile(keyword) {
        let r = []
        if (keyword != '') {
            nodejs.files.dirFiles(this.path, ['json'], files => {
                files.forEach(file => {
                    try {
                        let json = JSON.parse(nodejs.files.read(file))
                        let items = json.filter(item => item.text.indexOf(keyword) != -1)
                        if (items.length) {
                            r.push({
                                name: getFileName(file, false),
                                items
                            })
                        }
                    } catch (err) {}
                })
            })
        }
        console.log(r)
        return r
    },

    // 隐藏没有结果的集数
    toggleHide(b) {
        if (b == undefined) b = getEle('dsj_hide').hasClass('text-primary')
        for (let episode of $('.dsj_episode')) {
            episode.classList.toggle('hide', b && episode.querySelectorAll('.dsj_word').length == 0)
        }
    },

    words: [],

    parse(list) {
        let h = ''
        this.data = list
        let c = 0
        let toNum = s => parseInt(s.replace(/[^0-9]/ig, ''))
        list.sort((a, b) => toNum(a.title) - toNum(b.title))
            .forEach(item => {
                let find = 0
                let text = item.text
                for (let word of this.words) {
                    if (word != '') {
                        if (text.indexOf(word) == -1) {
                            text = item.text // 任意个条件不满足则复原
                            find = 0
                            break;
                        }
                        find++
                        text = replaceAll_once(text, word, i => `<b class="dsj_word bg-warning" data-index="${c++}">${word}</b>`)
                    }
                }

                h += `<div class="dsj_episode">
                    <h2 class="${find > 0 ? 'bg-primary text-light' : ''}">${item.title}</h2><p>${text}</p>
            </div>`
            })
        let con = this.tabs.getContent('default')
        con.find('.container').html(h)
        con.find('#dsj_search b').html(c)
        this.tabs.setActive('default')
        this.toggleHide()
        c && setTimeout(() => this.word_jump(), 250)
    },

    word_jump(step = 1) {
        let list = $('.dsj_word')
        let max = list.length
        if (!max) return

        let active_class = 'fs-2'
        let index = (parseInt(list.filter('.' + active_class).removeClass(active_class).data('index')) || 0) + step
        if (index < 0) {
            index = max - 1
        } else
        if (index >= max) {
            index = 0
        }

        let active = list.filter('[data-index=' + index + ']')
        if (active.length) {
            active.addClass(active_class)[0].scrollIntoView()
        }
        $('#dsj_search b').html((index + 1) + '/' + max)
    },
    items: {
        default: {
            id: 'default',
            title: '<i class="ti ti-list fs-2 me-2" title="查看电视剧分集剧情"></i>剧情',
            getTabIndex: () => 999,
            html: `
                <div class="position-relative h-full">
                    <div class="container p-4 overflow-y-auto" style="height: calc(100% - 100px);padding-bottom: 300px !important">
                        <h4 class="text-center mt-3">点击右侧的放大镜开始搜索剧情...</h4>
                    </div>
                    <div class="position-fixed bottom-10 end-10 card" id="dsj_search">
                        <div class="position-relative">
                             <input placeholder="输入关键词搜索，空格添加多个..." type="text" class="form-control" style="padding-right: 50px;" data-change="dsj_findInPage" data-keydown="dsj_findInPage_keydown" />
                             <div class="position-absolute top-10 end-10">
                                <i class="ti ti-eye fs-2" data-action="dsj_hide"></i>
                                <b></b>
                             </div>
                        </div>
                    </div>
                </div>
                `,
        },
        search: {
            id: 'search',
            title: '<i class="ti ti-search fs-2 me-2" title="从本地库中搜索所有包含词语的剧集"></i>全局',
            getTabIndex: () => 998,
            html: `
                <div class="position-relative h-full  mb-3 border-end">
                    <div class="input-icon mb-3">
                        <input placeholder="输入关键词搜索..." type="text" class="form-control" data-keydown="dsj_findAll" />
                        <span class="input-icon-addon">
                          
                        </span>
                    </div>

                    <div class="container p-4 overflow-y-auto" style="height: calc(100% - 100px);padding-bottom: 300px !important"  id="dsj_searchAll">
                    </div>
                </div>
                `,
        },
        list: {
            id: 'list',
            title: '<i class="ti ti-file fs-2 me-2" title="从本地库中搜索所有包含词语的电视剧"></i>剧名',
            getTabIndex: () => 997,
            html: `
                <div class="position-relative h-full  mb-3 border-end">
                    <div class="input-icon mb-3">
                        <input placeholder="输入关键词搜索..." type="text" class="form-control" data-keydown="dsj_listSearch" />
                    </div>

                    <div class="container p-4 overflow-y-auto" style="height: calc(100% - 100px);padding-bottom: 300px !important" id="dsj_list">
                    </div>
                </div>
                `,
        }
    },
    search(keyword, sites) {
        this.words = []
        this.keyword = keyword
        let items = {}
        for (let [id, d] of Object.entries(sites || this.sites)) {
            items[id] = {
                id,
                title: id,
                html: `
                     <div class="overflow-y-auto h-full">
                        <webview data-src="${d.url.replace('{keyword}', keyword)}" useragent="Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.134 Safari/537.36 Edg/103.0.1264.71" class="w-full h-full" preload='file://${__dirname}/js/webview.js'  contextIsolation="false" nodeintegration allowpopups></webview>
                    </div>
                `,
            }
        }
        this.tabs.setItems(Object.assign(items, this.items))
        this.tabs.setActive('电视猫') // TODO
    }

}
g_detailTabs.register('dsj', {
    onTabChanged: tab => {},
    tab: {
        id: 'dsj',
        title: '<i class="ti ti-file-text fs-2"></i>',
        html: `<div id="dsj_tabs" class="w-full h-full"></div>`
    },
}, g_dsj)