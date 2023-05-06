// ==UserScript==
// @name    视频缩略图
// @version    1.0
// @author    hunmer
// @description    视频缩略图
// @namespace    a32c2a91-cd5c-4790-a49f-eceeadbbaadb

// ==/UserScript==

var g_plugin_thumb = {
    init() {
        const self = this
        self.data = local_readJson('plugin_covers', {})

        const getSelected = (selector = '.bg-primary') => $('#cover_images ._cover' + selector)
        const removeSelected = () => getSelected().removeClass('bg-primary')

        // compVideo('e86b4e66ad5f2fafb8877d50abbb49f7')
        g_action.registerAction({
            cover_clear() {
                let md5 = self.currentMd5
                if (md5) {
                    delete self.data[md5]
                    self.save()

                    nodejs.files.removeDir(self.getDir(md5))
                    $('#cover_images').html('')
                }
            },
            cover_load(dom) {
                self.loadVideo(dom.dataset.md5)
            },
            cover_toPlay(dom, action, e) {
                dom = $(dom)

                let offset = -0.5 // TODO 自定义
                let selected = getSelected()
                let t2 = dom.data('time') * 1 + offset
                if (e.ctrlKey) {
                    removeSelected()
                    dom.addClass('bg-primary')
                    g_cut.setTime('start', t2)
                } else
                if (e.shiftKey || e.altKey) {
                    if (!selected.length) return

                    removeSelected()
                    let dom1 = $(selected[0])
                    for (let i = Math.min(dom1.index(), dom.index()); i <= Math.max(dom1.index(), dom.index()); i++) {
                        getSelected(':eq(' + i + ')').addClass('bg-primary')
                    }

                    let t1 = dom1.data('time') * 1 + offset
                    // g_cut.setTime('start', Math.min(t1, t2), true, true)
                    g_cut.setTime('end', Math.max(t1, t2))

                    if (e.shiftKey) {
                        g_tag.clearInput(true)
                    } else {
                        return doAction('cut_start') // 直接裁剪
                    }
                }
                g_player.getPlayer().setCurrentTime(t2)
            },
        })

        g_plugin.registerEvent('loadClips', data => {
            self.checkCover()
        }, 1);

        g_plugin.registerEvent('beforeCutVideo', () => {
            removeSelected().addClass('bg-secondary')
        }, 1);

        g_plugin.registerEvent('afterCutVideo', ({ clip }) => {
            // getSelected('.bg-secondary').removeClass('bg-secondary')
            for (let t = clip.start; t <= clip.end; t++) {
                $('#cover_images [data-time="' + t + '"]').replaceClass('bg-', 'bg-warning')
            }
            // checkCover()
        }, 1);

    },


    checkCover() {
        const find = c => g_clips.data.findIndex(({ start, end }) => c >= start && c <= end)
        for (let img of $('#cover_images [data-time]')) {
            img.classList.toggle('bg-warning', find(img.dataset.time * 1) !== -1)
        }
    },

    initVideo(md5) {
        g_detailTabs.tabs.getButton('thumb').toggleClass('hide', md5 == undefined)
        if (!this.data[md5]) {
            $('#cover_images').html(md5 ? `
                <div class="text-center p-2">
                    <button class="btn btn-primary" data-action="cover_load" data-md5="${md5}">加载预览</button>
                </div>
            ` : '')
        } else {
            this.loadVideo(md5)
        }
    },

    getDir(md5) {
        return nodejs.dir + '\\cache\\' + md5 + '\\'
    },

    async loadVideo(md5, fps = 1) {
        const self = this
        let h = ''
        let path = this.getDir(md5)
        this.currentMd5 = md5

        const getImage = i => `<div class="col-3 mt-2 _cover" data-action="cover_toPlay" data-time=${i} ><img class="w-full lazyload" src="./res/loading.gif" data-src="${path+i+'.jpg'}" title="${getTime(i)}"></div>`

        if (this.data[md5]) {
            for (let i = 1; i <= this.data[md5]; i++) {
                h += getImage(i)
            }
            $('#cover_images').html(h).find('.lazyload').lazyload()
            return this.checkCover()
        }

        $('#cover_images').html('')
        let file = g_files.get(md5).file
        let last = 1
        // let data = await g_ffmpeg.video_meta(file)
        // if (data && data.streams) {
        nodejs.files.mkdir(path);
        let ffmpeg = new nodejs.cli.ffmpeg(file, { progress: true })
        ffmpeg.on('end', function() {
                self.data[md5] = last
                self.save()
            })
            .on('progress', function(progress) {
                h = ''
                let time = toTime(progress)
                for (let i = last; i <= time; i++) h += getImage(i)
                last = time

                $(h).appendTo('#cover_images').find('.lazyload').lazyload()
                console.log('progress', progress);
            })
            .vf(path + '%d.jpg', 1)
        // }
    },

    save() {
        local_saveJson('plugin_covers', this.data)

    },

}

g_detailTabs.register('thumb', {
    onTabChanged(tab) {
        g_plugin_thumb.initVideo(g_files.getCurrentMd5())
    },
    tab: {
        id: 'thumb',
        icon: 'photo',
        title: ' ',
        html: `
         <div class="position-relative">
            <div class="overflow-y-auto overflow-x-hidden row" id="cover_images" style="height: calc(100vh - 80px)">
            </div>
            ${g_tabler.buildButtonGroup([
                {title: '清空', icon: 'trash text-danger', action: 'cover_clear'},
            ], 'position-absolute left-0 bottom-0')}
        </div>
        `
    },
}, g_plugin_thumb)
