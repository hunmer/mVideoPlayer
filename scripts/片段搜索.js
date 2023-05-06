// ==UserScript==
// @name    片段搜索
// @version    1.0
// @author    hunmer
// @description    片段搜索
// @namespace    216455e1-8456-45c9-bb90-1970bc475579

// ==/UserScript==
({
    init() {
        g_plugin.menu_add({
            title: '片段搜索',
            action: 'clips_search'
        })
        g_action.registerAction({
            clips_search: () => this.prompt()
        })
        g_hotkey.hotkey_register('ctrl+keyf', {
            title: '搜索片段',
            content: "doAction('clips_search')",
            type: 2
        })
        g_input.bind({
            clip_search_inputs: () => this.update()
        })
    },

    lastFolder: '',
    update() {
        let r = {}
        let d = g_form.getVals('clips_search')
        let folder_changed = this.lastFolder != d.folder
        let file_changed = this.lastFile != d.file
        if (d.folder && folder_changed) {
            let files = { all: '所有' }

            Object.values(g_files.sorts[d.folder]).forEach(item => {
                let file = item.file
                files[file] = getFileName(file, false)
            })
            g_form.assignElementVal('clips_search', 'file', {list: files})
        }

        let h = ''
        let tags = []
        g_files.entries((md5, data) => {
            if (d.folder && d.folder != '') {
                let group = g_files.getGroup(md5)
                if (d.folder != group) return
            }

            if (d.file && d.file != 'all') {
                if (data.file != d.file) return
            }

            let clips = g_clips.getData(md5)
            if (clips.length) {

                let h1 = ''
                clips.forEach(clip => {
                    if(d.tag.length && !arr_include(d.tag, clip.tags)) return

                    h1 += g_clips.parseClip(clip, md5).replace('clip col-6', 'clip col-3')
                    tags.push(...clip.tags)
                })
                if (h1) {
                    h += (d.group ? `
                    <div class="p-3 mb-3 card">
                        <h4>${data.file}</h4>
                        <div class="row">{html}</div>
                    </div>` : '{html}').replace('{html}', h1)
                }

                r[md5] = Object.assign(data, { clips })

            }
        })
        if(folder_changed){
            g_form.setElementVal('clips_search', 'tag', uniqueArr(tags), 'list')
        }
        this.lastFile = d.file
        this.lastFolder = d.folder

        $('#clips_search_list').html(h).find('.lazyload').lazyload()
    },

    prompt() {
        g_form.confirm1({
            id: 'clips_search',
            title: '搜索片段',
            elements: {
                group: {
                    title: '分组',
                    type: 'switch',
                    props: 'name=clip_search_inputs',
                    value: false,
                },
                folder: {
                    title: '<i class="ti ti-folder me-2"></i>文件夹',
                    type: 'select',
                    props: 'name=clip_search_inputs',
                    list: ['', ...Object.keys(g_files.sorts)],
                    value: '',
                },
                file: {
                    title: '<i class="ti ti-file me-2"></i>文件',
                    type: 'select',
                    props: 'name=clip_search_inputs',
                    list: ['所有'],
                    value: '',
                },
                tag: {
                    title: '<i class="ti ti-tag me-2"></i>标签',
                    type: 'checkbox_list',
                    props: 'name=clip_search_inputs',
                    list: [],
                    value: '',
                },
                // TODO 标签选择器 时长选择器 
            }
        }, {
            html: `
            <div class="row w-full">
                <div class="col-9 row" id="clips_search_list"></div>
                <div class="modal_form col-3"></div>
            </div>
            `,
            width: '80%',
            scrollable: true,
        })
    },
}).init()
