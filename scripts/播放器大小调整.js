// ==UserScript==
// @name    播放器大小调整
// @version    1.0
// @author    hunmer
// @description    播放器大小调整
// @namespace    b4724988-58ff-4ac7-a45a-5f5ea750ca75

// ==/UserScript==

({
    init() {
        const self = this
        

        g_hotkey.hotkey_register('ctrl+=', { title: '扩大播放器尺寸', content: "doAction('player_size_add')", type: 2 })
        g_hotkey.hotkey_register('ctrl+-', { title: '缩小播放器尺寸', content: "doAction('player_size_reduce')", type: 2 })
       
        g_action.registerAction({
            player_size_add(){
                self.size_add(10)
            },
            player_size_reduce(){
                self.size_add(-10)
            },
            player_size_restore(){
                self.size_set(100)
            },
        }) 

        this.config = getConfig('player_resizer', {
            size: 100,
        })

        g_style.addStyle('player_size', `

            .dplayer {
               background-color: #000;
            }

            .dplayer-video-wrap {
                width: ${this.config.size}%;
                margin: 0 auto;
            }

        `)

        g_setting.onSetConfig('player_resizer', data => {
            $('.dplayer-video-wrap').width(data.size+'%')
        })
    },

    size_set(i){
        let size = Math.max(30, Math.min(100, i))
        this.config.size = size
        setConfig('player_resizer', this.config)
    },

    size_add(i){
        this.size_set(this.config.size + i)
    },


}).init()
