// ==UserScript==
// @name        onlineCutter
// @version     1.0
// @author      hunmer
// @description 在线视频裁剪
// ==/UserScript==

var g_vm = {

    init() {
        const self = this
        $('<i class="ti ti-brand-youtube fs-2" data-action="youtube_tv" title="Youtube"></i>').appendTo('#icons_left')
        g_action.registerAction('youtube_tv', () => {
            self.show()
        })
    },

    getPath() {
        return nodejs.dir + '\\youtube_tv\\'
    },

    show() {
        let path = this.getPath()
        win = new nodejs.remote.BrowserWindow({
            // width: 500,
            // height: 500,
            show: false,
            fullScreen: true,
            webPreferences: {
                spellcheck: false,
                webSecurity: false,
                preload: path + 'preload.js',
                nodeIntegration: true,
                webviewTag: true,
                contextIsolation: false,
                partition: "persist:main",
            }
        })
        win.openDevTools()
        win.loadFile(path + 'index.html')
        win.show();

    },

}
g_vm.init()