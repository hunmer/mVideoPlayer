// ==UserScript==
// @name    视频录制
// @version    1.0
// @author    hunmer
// @description    在线录制视频
// @namespace    4a20b5c5-b96e-4f0f-8c12-ca2068bc9355

// ==/UserScript==

var g_recorder = {
    buffer: [],
    time: 0,
    option: {
        mimeType: 'video/webm;codecs=h264,opus'
    },
    init() {
        const self = this
        g_action.registerAction({
            recorder_start() {
                self.recorder_start()
            },
            recorder_stop() {
                self.recorder_stop()
            },
            recorder_switch() {
                self.recorder_switch()
            }
        })

        g_hotkey.hotkey_register({
            'ctrl+s': {
                title: '录制暂停/恢复',
                content: "doAction('recorder_switch')",
                type: 2,
            },
            'ctrl+d': {
                title: '开始录制',
                content: "doAction('recorder_start')",
                type: 2,
            },
            'ctrl+f': {
                title: '停止录制',
                content: "doAction('recorder_stop')",
                type: 2,
            }
        })
    },

    recorder_init(video) {
        let option = this.option
        let playing = false
            this.time = 0
        this.recorder = recorder = new MediaRecorder(video.captureStream(), option);
        recorder.ondataavailable = e => {
            if(e.data.size > 0){
                this.buffer.push(e.data);
                console.log(renderSize(e.data.size))
            }
        }
        recorder.onstart = e => {
            playing = true
            this.buffer = [];
            soundTip('res/bi.mp3')
            // console.log('开始录制')

        }
        recorder.onstop = async e => {
            playing = false

            let input = nodejs.dir + "\\temp.webm"
            let output = `${nodejs.dir}\\recorder\\${new Date().getTime()}.mp4`
            nodejs.files.write(input, new Int8Array(await new Blob(this.buffer, { type: option }).arrayBuffer()));
            this.buffer = [];
            // console.log('停止录制')
            // webm 转 MP4
            g_ffmpeg.video_cut({
                input,
                output,
                duration: this.time,
                args: ['-c:v copy'],
            }, progress => {}, err => {
                if(err){
                    console.error(err)
                }else{
                    soundTip('res/done.mp3')
                    alert(`<video title="支持拖动到其他软件" class="w-full" data-file="${output}" draggable="true" src="${output}" controls autoplay></video>`, {
                        title: '录制完毕',
                        btn_ok: '定位',
                        once: true,
                    }).then(() => ipc_send('openFolder', output))
                }
            })
        }
        recorder.onerror = e => {
            console.log(event);
        }
        recorder.onpause = e => {
            playing = false
            // console.log('暂停录制')
        }
        recorder.onresume = e => {
            playing = true
            // console.log('恢复录制')
        }
        let tip = this.tip = $(`
            <span class="status status-blue position-absolute top-10 end-10 zIndex-top cursor-pointer" data-action="recorder_switch">
              <span class="status-indicator status-red status-indicator-animated">
                  <span class="status-indicator-circle"></span>
                  <span class="status-indicator-circle"></span>
                  <span class="status-indicator-circle"></span>
              </span>
              <b>00:00</b>
            </span>
        `).appendTo(g_videoTabs.tabs.getCurrentContent().find('.player'))
        let interval = 100
        this.timer = setInterval(() => {
            let h = ''
            if (playing) {
                let time = this.time += interval / 1000
                h = getTime(time)
            } else {
                h = '暂停中'
            }
            tip.find('b').html(h)
        }, interval)
    },

    recorder_switch() {
        let recorder = this.recorder
        if (recorder) {
            if (recorder.state == 'recording') {
                recorder.pause()
            } else {
                recorder.resume()
            }
        }
    },

    recorder_start() {
        let video = g_player.getPlayer().video
        if (!video) return

        if (!this.recorder) {
            this.recorder_init(video)
        }
        this.recorder.start()
        this.recorder.requestData()
    },

    recorder_stop() {
        if (this.recorder) {
            this.recorder.stop()
            clearInterval(this.timer);
            this.tip.remove()
            delete this.recorder
        }
    },
}

g_recorder.init()
