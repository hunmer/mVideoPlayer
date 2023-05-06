// ==UserScript==
// @name        剧情采集与搜索
// @version     1.0
// @author      hunmer
// @description 剧情采集与搜索
// ==/UserScript==
var g_sprider = {
    path: _dataPath + '\\scripts\\剧情采集\\',
    init() {
        // this.collection()
        this.list = JSON.parse(nodejs.files.read(this.path + 'list.json', '{}'))
        // this.parse()
    },

    save() {
        nodejs.files.write(this.path + 'list.json', JSON.stringify(this.list))
    },

    parse() {
        var fileName, timer
        g_dsj.sites['爬虫'] = copyObj(g_dsj.sites['电视猫'])
        g_dsj.tabs.setItems({
            爬虫: {
                id: '爬虫',
                title: '爬虫',
                html: `
                     <div class="overflow-y-auto h-full">
                        <webview useragent="Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.134 Safari/537.36 Edg/103.0.1264.71" class="w-full h-full" preload='file://${__dirname}/js/webview.js'  contextIsolation="false" nodeintegration></webview>
                    </div>
                `,
            }
        })

        let eid = g_plugin.registerEvent('dsj_getEpisode', data => {
            // 不加载且更改文件名
            data.load = false
            data.fileName = fileName
            next()
        })

        let list = Object.entries(this.list)
        let { getMd5, exists } = nodejs.files
        const next = () => {
            timer && clearTimeout(timer)
            if(list.length == 0){
                delete g_dsj.sites['爬虫']
                g_dsj.tabs.setItems({})
                g_plugin.unregisterEvent(eid)
                return alert('结束!')
            }
            let [url, title] = list.shift()
            url += (url.substr(-1) != '/' ? '/' : '') + 'episode'
            console.log(url, title)
            let file = '[电视猫-' + cutString(url, 'drama/', '/') + ']'+ title + '.json'
            if (!exists( g_dsj.path + file)) {
                fileName = file

                g_dsj.tabs.getContent('爬虫').find('webview').attr('src', url.replace('m.', 'www.'))
                g_dsj.tabs.setActive('爬虫')

                timer = setTimeout(next, 1000 * 10) // 超时或者404
            }else{
                next()
            }
        }
        next()
    },

    collection() {
        let c = 0
        let cursor = 0

        let win = this.win = new nodejs.remote.BrowserWindow({
            width: 300,
            height: 300,
        });
        let web = win.webContents
        const next = () => {
            let url = `https://www.baidu.com/s?wd=site%3Awww.tvmao.com%2F%20%E5%A4%A7%E7%BB%93%E5%B1%80%20%26%20%E5%89%A7%E6%83%85%E4%BB%8B%E7%BB%8D&pn=${cursor}&rn=50&tn=json`
            this.win.loadURL(url)
        }
        const parse = body => {
            try {
                body = JSON.parse(body)
                let { resultnum, entry, all, pn } = body.feed
                let status = `页数: ${pn} 采集: ${c} 进度: ${cursor}/${all}`
                win.title = status
                entry.forEach(({ url, title }) => {
                    if (typeof(title) == 'string' && url.indexOf('/drama/') != -1) {
                        title = title.split('剧情介绍')[0]
                        this.list[url] = title
                            ++c % 500 === 0 && this.save()
                    }
                })
                if (resultnum > 0) {
                    cursor += resultnum
                    next()
                }
            } catch (err) {
                win.show()
            }
        }
        web.on('dom-ready', e => {
            web.executeJavaScript(`document.body.innerText`).then(parse)
        })
        next()
    },

    fetch() {

    },

}

g_sprider.init()