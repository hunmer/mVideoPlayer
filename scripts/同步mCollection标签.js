// ==UserScript==
// @name    同步mCollection标签
// @version    1.0
// @author    hunmer
// @description    同步mCollection标签
// @namespace    e348066b-452c-4e28-8f04-b6d978590621

// ==/UserScript==
(() => {
    g_plugin.registerEvent('loadClips', () => {
        $.getJSON('http://127.0.0.1:41597/tags', (tags, textStatus) => {
            if(textStatus == 'success'){
                tags.forEach(tag => g_tag.tags.add(tag))
                g_tag.initTags()
            }
        });
    })
})()
