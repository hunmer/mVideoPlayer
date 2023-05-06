var g_files = new basedata({
    name: 'files',
    list: local_readJson('files', {}),
    saveData: data => local_saveJson('files', data),
    insertDefault() {
        return {
           clips: [],
            date: new Date().getTime(),
        }
    },
    init() {
        const self = this
        g_menu.registerMenu({
            name: 'files_item',
            selector: '.video_list_item[data-md5]',
            dataKey: 'data-md5',
            items: [{
                icon: 'file',
                text: '默认打开',
                action: 'files_item_open',
            }, {
                icon: 'folder',
                text: '打开目录',
                action: 'files_item_folder',
            }, {
                icon: 'trash',
                text: '删除',
                class: 'text-danger',
                action: 'files_item_delete'
            }],
        })

        g_style.addStyle('files', `
            #files_list .accordion {
                --tblr-accordion-transition: none;
            }
        `)

         g_menu.registerMenu({
            name: 'files_folder_item',
            selector: '#files_list .accordion-button',
            dataKey: 'data-collapse',
            items: [{
                icon: 'trash',
                text: '删除',
                class: 'text-danger',
                action: 'files_folder_item_delete'
            }],
        });

        // TODO action跟menu绑定 简便写法
        g_action.registerAction({
            files_load(dom) {
                self.loadVideo(getParentAttr(dom, 'data-md5'))
            },
        }).registerAction(['files_item_open', 'files_item_folder', 'files_item_delete'], (dom, action) => {
            let md5 = g_menu.key || self.getCurrentMd5()
            let d = self.get(md5)
            switch (action[0]) {
                case 'files_item_folder':
                    ipc_send('openFolder', d.file)
                    break;

                case 'files_item_open':
                    nodejs.files.openFile(d.file)
                    break;

                case 'files_item_delete':
                    self.remove(md5)
                    break;
            }
            g_menu.hideMenu('files_item')
        }).registerAction(['files_folder_item_delete'], (dom, action) => {
            let group = self.getCollapseKey(g_menu.key)
            switch (action[0]) {
                case 'files_folder_item_delete':
                    Object.keys(self.sorts[group]).forEach(md5 => self.remove(md5))
                    self.refresh()
                    break;
            }
            g_menu.hideMenu('files_folder_item')
        })

        g_plugin.registerEvent('playPrev', () => self.isPlaying() && self.loadSibling('prev'))
        g_plugin.registerEvent('playNext', () => self.isPlaying() && self.loadSibling())

        let conf = { title: '删除', content: "doAction('files_item_delete')", type: 2 }
        g_hotkey.hotkey_register('delete', conf)
        g_hotkey.hotkey_register('shift+delete', conf)

        g_fileDrop.register('files_videos', {
            selector: 'body',
            layout: `
                <div class="w-max h-max d-flex align-items-center justify-content-center" style="background-color: rgba(0, 0, 0, .7)">
                    <div class="bg-light p-2 border rounded-3 row align-items-center text-center" style="height: 30vh;width: 50vw;">
                      <div class="col-12">
                        <i class="ti ti-file-import text-muted" style="font-size: 8rem" ></i>
                      </div>
                      <h3 class="col-12 text-muted">
                        导入文件
                      </h3>
                    </div>
                </div>
            `,
            exts: ['mp4', 'ts', 'webm', 'flv'],
            async onParse(r) {
                for (let dir of r.dirs) {
                    r.files.push(...await nodejs.files.dirFiles(dir, this.exts))
                }
                self.reviceFiles(r.files)
            }
        })

        // 带有md5标识的视频被播放
        g_plugin.registerEvent('videoTabEvent', ({ event, args }) => {
            if (event == 'show') {
                let md5 = self.getTabValue(args.tab)
                if (md5) self.setActive(md5)
            }
        })

        g_plugin.registerEvent('clipsSaved', ({ data, md5 }) => self.setClips(md5, data.length))
    },

    // 设置激活视频
    setActive(md5) {
        let cb = () => {
            let el = this.getItem(md5)
            if (el.length) {
                el.parents('.collapse').addClass('show').siblings('.show').removeClass('show')
                this.getActive().removeClass('active')
                el.addClass('active')[0].scrollIntoViewIfNeeded()
                return true
            }
        }
        if (!cb()) { // 未加载列表
            let group = this.getGroup(md5)
            if (isEmpty(group)) return

            this.showItems(group)
            cb()
        }
    },

    // 获取视频所在群组
    getGroup(md5) {
        for (let [k, v] of Object.entries(this.sorts)) {
            if (v[md5]) return k
        }
    },

    // 遍历群组
    entriesGroup(group, callback){
        for (let [k, v] of Object.entries(this.sorts[group])) {
            if(callback(k, v) === false) return
        }
    },

    // 当前群组
    currentGroup(){
        return this.getGroup(this.getCurrentMd5())
    },

    // 设置视频片段数量显示
    setClips(md5, cnt) {
        let d = this.get(md5)
        if (d) {
            d.clips = cnt
            this.save(false)
            this.setBadge(md5, cnt)
        }
    },

    // 设置标记
    setBadge(md5, text) {
        this.getItem(md5).find('.badge').toggleClass('hide1', text == '').html(text)
    },

    getTabValue(tab, key = 'md5') {
        return g_videoTabs.getTabValue(key, tab) // 获取tab内的md5属性
    },

    // 获取当前激活的dom
    getActive() {
        return this.getItem('', '.active')
    },

    // 获取dom
    getItem(md5 = '', classes = '') {
        return getEle({ md5 }, '.video_list_item' + classes)
    },

    // 加载视频
    loadVideo(md5) {
        let { file } = this.get(md5)
        g_player.newTab({ md5, value: file, title: getFileName(file, false), folder: __dirname + '\\' })
    },

    // 是否正在播列表文件
    isPlaying(tab) {
        return !isEmpty(this.getTabValue(tab))
    },

    // 加载上下视频
    loadSibling(pos = 'next') {
        let md5 = getChildAttr(this.getActive()[pos](), 'data-md5')
        console.log(md5)
        md5 && this.loadVideo(md5)
    },

    remove(key) {
        let d = this.get(key)
        if (d) {
            g_videoTabs.closeByFile(d.file)
            delete this.list[key];
            let group = this.getGroup(key)
            if(Object.keys(this.sorts[group]).length <= 1){
                this.getCollapse(group).parents('.accordion-item').remove() // 没有视频了，移除组
                delete this.sorts[group]
            }else{
                this.getItem(key).remove()
                delete this.sorts[group][key]
            }
            this.save(false);
            if (g_hotkey.is('shiftKey')) { // 删除原视频
                setTimeout(() => nodejs.files.remove(d.file), 1000) // 文件解除占用
                toast('成功删除原视频!', 'success')
            }
        }
        g_plugin.callEvent('files_remove', { key, d })
    },

    reviceFiles(files) {
        let key
        let h = ''
        let skip = 0
        let md5_list = []
        files.forEach(file => {
            key = nodejs.files.getMd5(file)
            h += `<a data-action="files_load" class="d-block" data-md5="${key}" href='#'>${getFileName(file, false)}</a>`
            if (this.get(key)) return skip++

            md5_list.push(key)
            this.add(key, { file }, false)
        })

        let added = files.length - skip
        if (added) {
            this.save()
            toast('成功添加' + added + '个文件!</br>'+h, 'success')
        }else
        if(files.length == 1){
           g_files.loadVideo(key)
        }
        return md5_list
    },
    sorts: {},
    refresh() {
        let r = this.sorts = {}
        // let sort = 'pinyin'
        let sort = 'dir'
        this.entries((k, v) => {
            let [dir, name] = v.file.split('\\').slice(-2)
            switch (sort) {
                case 'pinyin':
                    key = PinYinTranslate.sz(name[0])
                    break;
                case 'dir':
                    key = dir
                    break;
            }
            if (!r[key]) r[key] = {}
            r[key][k] = v
        })

        let datas = Object.entries(r).map(([k, items], i) => {
            return {
                html: '',
                group: i,
                bodyClass: 'p-0 m-0 list-group list-group-flush',
                prop: 'data-value="' + k + '"'
            }
        })

        let getGroup = e => this.getCollapseKey(e.currentTarget.dataset.collapse)
        let html = datas.length ? 
            g_tabler.build_accordion({
                datas,
                id: 'group',
                header: k => {
                    k = this.getCollapseKey(k)
                    return `<span class="badge bg-primary me-2">${Object.keys(r[k]).length}</span><span class="text-nowarp">${k}</span>`
                },
                default: false,
                parent: false,
                onOpen: e => g_files.showItems(getGroup(e)), // 展开时展示内容
                onClose: e => g_files.getCollapse(getGroup(e)).find('.accordion-body').html(''), // 关闭时清空内容
                collapse_start: `<div class="list-group list-group-flush">`,
                collapse_end: `</div>`,
            }) : `
            <div class="text-center">
                <i class="ti ti-box fs-2"></i></br>
                <h4 class="text-center">拖放添加文件...</h4>
            </div>
        `
        $('#files_list_content').html(html)

        // 设置当前md5激活状态
        let currentMd5 = this.getCurrentMd5()
        currentMd5 && this.setActive(currentMd5)
    },

    getCollapseKey(i) {
        return Object.keys(this.sorts)[i]
    },

    getCollapse(value) {
        return getEle({ value }, '.accordion-collapse')
    },

    showItems(k) {
        let v = this.sorts[k]
        if (!v) return

        let h = ''
        let items = Object.entries(v).sort((a, b) => {
            let a1 = getNumber(getFileName(a[1].file, false))
            let b1 = getNumber(getFileName(b[1].file, false))
            return a1 - b1
        })
        items.forEach(([md5, item]) => {
            let [dir, name] = item.file.split('\\').slice(-2)
            let cnt = item.clips
            /*
                <div class="col-auto">
                  <a href="#" tabindex="-1">
                    <span class="avatar" style="background-image: url(./start.jpg)"></span>
                  </a>
                </div>
            */
            h += `
                <div class="video_list_item list-group-item" data-md5="${md5}"  data-file="${item.file}" draggable="true">
                    <div class="row">
                    <div class="col text-truncate">
                        <a href="#" data-action="files_load" class="text-body d-block"> <span class="badge bg-danger me-2 ${cnt > 0 ? '' : 'hide1'}">${cnt}</span>${getFileName(name, false)}</a>
                        <div class="text-muted text-truncate mt-n1">${dir}</div>
                    </div>
                    </div>
                </div>
            `
        })
        this.getCollapse(k).find('.accordion-body').html(h)
    },

    getCurrentMd5() {
        return g_videoTabs.getTabValue('md5')
    }
})

g_leftTabs.register('files', {
    onTabChanged: () => g_files.refresh(),
    tab: {
        id: 'files',
        icon: 'video',
        title: '视频',
        html: `
            <div class="overflow-y-auto h-full p-2 overflow-hidden" id="files_list">
                <div class="input-group mb-2" hidden>
                    <button type="button" class="btn dropdown-toggle" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    </button>
                    <div class="dropdown-menu" style="">
                    <a class="dropdown-item" href="#">
                        Action
                    </a>
                    </div>
                    <input type="text" class="form-control" placeholder="搜索...">
                    <button class="btn" type="button"><ti class="ti ti-search fs-2"></ti></button>
                </div>
                <div id="files_list_content"></div>
            </div>
            `
    },
}, g_files)