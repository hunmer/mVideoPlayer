var g_videoTabs = {
    init() {
        
        g_hotkey.register('ctrl+keyw',  {
            title: '关闭当前tab',
            content: "g_videoTabs.tabs.close(g_videoTabs.tabs.getActive())",
            type: 2,
        })

        g_hotkey.register('ctrl+shift+keyw',  {
            title: '关闭全部tab',
            content: "g_videoTabs.tabs.clear()",
            type: 2,
        })

        g_action.registerAction({
            // 加载视频
            video_reload(dom) {
                dom = $(dom).addClass('btn-loading')
                let par = dom.parents('.datalist')
                let tab = getParentAttr(dom, 'data-tab-content')
                let url = par.data('src')
                // setConfig('player_lastURL', url)
                let player = g_player.newPlayer(tab, par.find('.player')[0], {url}, e => {
                    dom.addClass('hide')
                }, e => {
                    dom.removeClass('btn-loading')
                    console.error(e)
                })
            },
            video_reloadCurrent(){
                g_player.getPlayer().reload()
            }
        })

        let opts = {
            nowarp: true,
            name: 'video_tabs',
            container: '#video_tabs',
            cardBody: 'p-0',
            list: local_readJson('videoTabs', []),
            saveData: data => local_saveJson('videoTabs', data),
            event_shown({tab}){
                g_detailTabs.videoTabEvent('show', { tab })
                if(getConfig('autoPlay')){
                    g_videoTabs.tabs.getContent(tab).getEle('video_reload')[0].click()
                }
                // 暂停其他视频
                setTimeout(() => {
                    this.getTabs().forEach(id => g_player.getPlayer(id).pause(id != tab))
                }, 500)
            },
            event_hide({tab}){
                g_detailTabs.videoTabEvent('close', { tab })
            },
            parseContent: (k, v) => {
                return `
                <div class="datalist h-full position-relative" data-src="${v.value}">
                    <button class="btn btn-primary btn-pill position-absolute bottom-10 end-10 zIndex-top" data-action="video_reload"><i class="ti ti-player-play fs-2 mr-2"></i>加载视频</button>
                    <div class="player w-full h-full" style="background-image: url(${v.poster || ''})">
                    </div>
                </div>
                `
            },
            defaultMenuItems: {
                close: {
                    icon: 'x',
                    text: '关闭',
                },
                closeOther: {
                    icon: 'x',
                    text: '关闭其他',
                },
            },
            menuItems: {
                refresh: {
                    icon: 'refresh',
                    text: '刷新',
                    callback({key, name}){

                    }
                },
                detail: {
                    icon: 'list',
                    text: '详细',
                    callback({key, name}){
                        prompt(JSON.stringify(this.data.get(key), null, 4), {rows: 20, scrollable: true})
                    }
                }
            },
       
        }
        this.tabs = new TabList(opts)
        g_plugin.registerEvent('onPluginsLoaded', () => this.tabs.refresh())
    },

    // 根据文件关闭tab
    closeByFile(file) {
        let tab = this.tabs.find('file', file)
        if (tab) this.tabs.close(tab)
    },

    // 获取tab属性
    getTabValue(key, tab) {
        return g_videoTabs.tabs.getValue(tab, key)
    },

    // 新建视窗
    tab_new(opts) {
        getConfig('oneTab') && this.tabs.clear()
        let find = this.tabs.data.values().find(item => item.value == opts.value)
        if(!find) return this.tabs.add(opts, true)
        this.tabs.setActive(find.id)
        return find.id
    },

}

g_videoTabs.init()