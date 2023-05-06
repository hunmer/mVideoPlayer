// ==UserScript==
// @name        调用第三方下载器
// @version     1.0
// @author      hunmer
// @description 调用第三方下载器
// ==/UserScript==

({
    init(){
        g_plugin.registerEvent('aria2c_addUri', data => {
            let url = data.realUrl || data.url
            console.log(url)
            // g_downloader.item_remove(data.id)
            // $arr[] = 'F:\IDM\IDMan.exe /d "${url}" /p H:\music /f "a.mp4" /a';
        })
    },
}).init()