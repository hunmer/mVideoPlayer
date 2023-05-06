// ==UserScript==
// @name        videoCliper
// @version     1.0
// @author      hunmer
// @description 把一个视频分成多个视频
// ==/UserScript==

var g_vm = {

    init() {
        const self = this
        $('<i class="ti ti-cut fs-2" data-action="videoManager" title="视频裁剪"></i>').appendTo('#icons_left')
        g_action.registerAction('videoManager', () => {
            self.show()
        })
    },

    getPath() {
        return nodejs.dir + '\\videoManager\\'
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