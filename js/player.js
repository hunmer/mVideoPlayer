var g_player = {

    init() {
        const self = this

        g_action.registerAction({
            playPrev: () => g_plugin.callEvent('playPrev'),
            playNext: () => g_plugin.callEvent('playNext')
        })

        g_plugin.registerEvent('modal_show', () => self.getPlayer().tryPause())
        g_plugin.registerEvent('modal_hide', () => self.getPlayer().tryPlay())

        $(window).on('blur', () => self.getPlayer().tryPause()).on('focus', () => self.getPlayer().tryPlay())
        $(document).
        on('mousewheel', '#video_tabs video', function(e) {
            if (!$('input:focus').length) {
                let video = g_player.getPlayer().video
                self.onMouseWheel(e, video).then(add => video.currentTime += add)
            }
        })
    
    },

    onMouseWheel(e, video, def = 1) {
        return new Promise(reslove => {
            e = e.originalEvent || e
            let duration = video.duration
            let opts = {
                'alt': 1,
                'ctrl': 5,
                'shift': 'duration * 0.01',
                'alt+shift': 'duration * 0.05',
                'ctrl+shift': 'duration * 0.1',
            }
            if (!isNaN(duration)) {
                let key = g_hotkey.getInputCode(e, 'key')
                let add = eval(opts[key]) || def
                reslove(e.deltaY > 0 ? 0 - add : add)
                clearEventBubble(e);
            }
        })
    },

    newTab(opts) {
        let tab = g_videoTabs.tab_new(Object.assign({
            // value: src,
            // title,
            // url, // 网页链接
            poster: '',
            // folder, // 数据保存目录
        }, opts))
        setTimeout(() => g_detailTabs.tabs.setActive('clips'), 500)
    },

    newPlayer(tab, container, video, onLoaded, onError) {
        let contextmenu = [{
                text: '上一集',
                click() {
                    doAction('playPrev');
                },
            }, {
                text: '下一集',
                click() {
                    doAction('playNext');
                },
            },
            /*{
                text: '生成进度条预览图',
                click: player => {
                    doAction('videoThumb');
                },
            },*/
            {
                text: '关闭文件',
                click() {
                    g_videoTabs.tabs.tab_remove()
                },
            }
        ]
        if (nodejs.files.exists(video.url)) {
            video.url = fileToUrl(video.url)
        } else
        if (video.url.startsWith('http')) {
            contextmenu.push({
                text: '下载',
                click() {
                    const get = k => g_videoTabs.getTabValue(k)

                    let url = get('url')
                    let title = get('title')
                    g_downloader.modal_download({
                        url,
                        fileName: title,
                        pathName: get('folder'),
                    })
                },
            })
        }
        
        let config = {
            hotkey: true,
            autoplay: true,
            volume: 1,
            container,
            screenshot: true,
            video,
            pluginOptions: {
                flv: {
                    // refer to https://github.com/bilibili/flv.js/blob/master/docs/api.md#flvjscreateplayer
                    mediaDataSource: {
                        // mediaDataSource config
                    },
                    config: {
                        lazyLoad: false,
                    },
                },
            },
            contextmenu
        }

        let player = new DPlayer(config)
        player.on('loadeddata', function(e) {
            player.notice(player.video.videoWidth+'x'+player.video.videoHeight)
            onLoaded && onLoaded(e)
        });
        player.on('error', function(e) {
            onError && onError(e)
        });
        this.players[tab] = player
        return player
    },

    players: {},
    getPlayer(tab) {
        tab ??= g_videoTabs.tabs.getActive()
        let player = this.players[tab]
        let video = player ? player.video : undefined
        return {
            video,
            player,
            setCurrentTime(time, play = true) {
                video.currentTime = time
                this.pause(!play)
            },
            getURL(realURL = false) {
                let url = video.src
                if (realURL && !url.startsWith('file:') && !['m3u8', 'mp4'].includes(getExtName(url, false))) {
                    return new Promise(reslove => g_rule.url_parse(g_videoTabs.getTabValue('url', tab), reslove))
                }
                return urlToFile(player.options.video.url)
            },
            pause(paused) {
                if(!video) return
                if (paused == undefined) paused = !video.paused
                if (paused) {
                    video.pause()
                } else {
                    video.play()
                }
            },
            getCurrentTime() {
                return video.currentTime
            },
            tryPause() {
                if (video) {
                    g_cache.lastPlaying = !video.paused
                    video.pause()
                }

            },
            tryPlay() {
                if (g_cache.lastPlaying) {
                    delete g_cache.lastPlaying
                    video && video.play()
                }
            },

            reload(){
                // let src = this.getURL(true)
                let src = video.src
                let time = this.getCurrentTime()
                video.src = ''
                video.src = src
                video.currentTime = time
            }
        }
    },

    coverTimers: {},
    getCover(id, video, width, height) {
        const clearTimer = () => {
            let timer = this.coverTimers[id]
            if (timer) {
                clearInterval(timer)
                delete this.coverTimers[id]
            }
        }
        clearTimer()
        return new Promise(reslove => {
            this.coverTimers[id] = setInterval(async () => {
                if (video.seeking === false) { // 视频跳转完成
                    clearTimer()
                    getImgBase64(video, width, height).then(img => reslove(img))
                }
            }, 20)
        })
    },

}

g_player.init()