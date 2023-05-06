// ==UserScript==
// @name    导入mCollection
// @version    1.0
// @author    hunmer
// @description    导入mCollection,或者eagle
// @namespace    2c4707ac-4bb5-447c-812b-86d2627df038

// ==/UserScript==

var g_import = {
    api: 'http://localhost:41597/',
    init() {
        const self = this
        $(`<a href="#" class="btn btn-icon" aria-label="Button" data-action="clips_import" title="导入mCollection"><i class="ti ti-database-import fs-2"></i></a>`).appendTo('#extra_tabs .btn-group')

        g_hotkey.hotkey_register('ctrl+keyi', { title: '导入mCollection', content: "doAction('clips_import')", type: 2 })
        g_action.registerAction({
            clips_import() {
                self.importClips(g_clips.data, g_clips.currentMd5)
            },
            files_folder_item_import() {
                g_files.entriesGroup(g_files.getCollapseKey(g_menu.key), (k, v) => {
                    if (v.clips && v.clips > 0) {
                        self.importClips(g_clips.getData(k), k)
                    }
                })
                g_menu.hideMenu('files_folder_item')
            }
        })

        g_menu.list['files_folder_item'].items.push({
            icon: "database-import",
            text: "导入mCollection",
            action: "files_folder_item_import"
        })

    },

    importClips(list, md5) {
        let items = list.map(clip => {
            let path = g_clips.getClipFile('video', clip, md5)
            return {
                path,
                tags: clip.tags,
                name: getFileName(path, false),
                cover: g_clips.getClipFile('cover', clip, md5),
                desc: clip.desc || '',
            }
        })
        // TODO 导入完成后的回调，提示是否删除片段
        this.import({ items }).then(({ status, msg, id }) => {
            toast(msg, status)
            let timer = setInterval(() => {
                $.getJSON(this.api + 'importResult?id=' + id, (json, textStatus) => {
                    if (textStatus == 'success' && json.msg == '导入完成') {
                        clearInterval(timer)
                        toast('导入成功')
                    }
                });
            }, 1000)
        }) // TODO 目标文件夹选择
    },

    import(data) {
        return new Promise(reslove => {
            fetch(this.api + "api/item/addFromPaths", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                        // 'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: JSON.stringify(data)
                })
                .then(response => response.json())
                .then(reslove)
                .catch(error => console.log('导入失败,请确保mCollection在后台运行!'));
        })

    },

}
g_import.init()
