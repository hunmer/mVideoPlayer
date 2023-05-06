var g_detailTabs = {
    init() {
        const self = this
        this.tabs = new TabList({
            name: 'detail_tabs',
            container: '#detail_tabs',
            moreItems: {},
            cardBody: 'p-0',
            // getTabIndex: tab => self.instance[tab].opts.index, // TODO 
            event_shown: ({tab, ev}) => self.instance[tab] && self.instance[tab].opts.onTabChanged(tab, ev),
        })

        loadRes([ 'js/detailTabs/clips.js', 'js/detailTabs/meta.js'], () => {
 
        })
    },

    // videoTab事件c
    videoTabEvent(event, args) {
        // 传递给组件
        g_plugin.callEvent('videoTabEvent', {event, args}).then(({event, args}) => {
            for (let [id, { opts, inst }] of Object.entries(this.instance)) {
                 opts.onVideoEvent && opts.onVideoEvent(event, args)
            }
        })
    },

    instance: {},
    register(id, opts, inst) {
        this.instance[id] = { opts, inst }
        this.tabs.add(opts.tab, false)
        inst.init && inst.init()
    },
}

g_detailTabs.init()