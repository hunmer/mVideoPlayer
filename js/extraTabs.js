var g_extraTabs = {
    init() {
        const self = this

        this.tabs =  new TabList({
            name: 'extra_tabs',
            container: '#extra_contents',
            moreItems: {},
            // getTabIndex: tab => self.instance[tab].opts.index, // TODO 
            event_shown: ({tab, ev}) => self.instance[tab] && self.instance[tab].opts.onTabChanged(tab, ev),
        })
        loadRes([ 'js/extraTabs/cut.js', 'js/extraTabs/tag.js' ], () => this.tabs.setActive('cut'))
    },

    instance: {},
    register(id, opts, inst) {
        this.instance[id] = { opts, inst }
        this.tabs.add(opts.tab, false)
        inst.init && inst.init()
    },
}

g_extraTabs.init()