var g_sideL = {

    init() {
        g_sidebar.register('left', {
            html: `<div id="left_tabs" class="h-full"></div>`,
            style: `
                :root {
                    --offset-left: 300px;
                }
                #sidebar_left {
                    left: 0;
                    top: 0;
                    width: var(--offset-left);
                    margin-left: 0px;
                    height: 100vh;
                }
                #sidebar_left.hideSidebar {
                    margin-left: calc(0px - var(--offset-left));
                }
                main[sidebar-left]{
                    padding-left: var(--offset-left);
                }
            `,
            onShow: e => {
                // setCssVar('--offset-left', '300px')
                g_sizeable.restore('sidebar_left')
            },
            onHide: e => {
                // setCssVar('--offset-left', '0px')
            },
        })
        g_style.addStyle('sidebar_left', `
            #left_tabs tablist {
                height: 100vh;
                position: relative;
            }
            #left_tabs .card-tabs {
                z-index: 2;
                position: absolute;
                bottom: 15px;
            }
            #left_tabs .card-body {
                height: 100vh;
                padding: 0;
            }
        `)

        $('#sidebar_left').addClass('border-end shadow')

        g_sizeable.register('sidebar_left', {
            selector: '#sidebar_left',
            memory: true,
            allow: ['right'],
            width_min: 150,
            width_max: 300,
            style: {
                backgroundColor: 'unset',
            },
            change: (t, i) => {
                if (t == 'width') { // 调整高度
                    setCssVar('--offset-left', i + 'px')
                    return { resize: false }
                }
            }
        })
    }
}

g_sideL.init()

var g_leftTabs = {
    instance: {},
    init() {
        const self = this
        this.tabs = new TabList({
            hideOneTab: false,
            name: 'left_tabs',
            container: '#left_tabs',
            moreItems: {},
            // getTabIndex: tab => self.instance[tab].opts.index, // TODO 
            event_shown: ({tab, ev}) => self.instance[tab] && self.instance[tab].opts.onTabChanged(tab, ev),
        })
        $(() => loadRes(['js/detailTabs/files.js'], () => self.tabs.setActive('files')))
    },
    register(id, opts, inst) {
        this.instance[id] = { opts, inst }
        this.tabs.add(opts.tab, false)
        inst.init && inst.init()
    },
}

g_leftTabs.init()