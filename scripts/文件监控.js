// ==UserScript==
// @name        文件监控
// @version     1.0
// @author      hunmer
// @description 自定义监控文件夹，自动添加到播放列表
// ==/UserScript==

var g_observ = {

    init() {
        const self = this
        g_setting.setDefault({
            observ_target: [nodejs.os.homedir() + '\\Videos\\*.mp4'].join("\n")
        })
        g_setting.tabs.download = {
            title: '自动导入',
            icon: 'eye',
            elements: {
                // TODO 动态改
                observ_target: {
                    title: '监视目录',
                    type: 'textarea',
                    value: () => getConfig('observ_target', ''),
                    rows: 6,
                },
            }
        }

        // TODO 监控整个form changes 事件
        g_setting.onSetConfig({
            observ_target(val){
                console.log(val)
                self.register()
            }
        })

        self.register()
    },

    register(){
        g_fw.register('video', {
            target: getConfig('observ_target').split("\n"), 
            onReady() {

            },
            onChange(path, stats) {
                if (stats) {
                    // console.log(`File ${path} changed size to ${stats.size}`);
                    notifiMsg('检测到有新视频，点击添加', {
                        text: `【${renderSize(stats.size)}】${path}`,
                        onclick ()  {
                            let md5 = g_files.reviceFiles([path])
                            g_files.loadVideo(md5[0])
                            ipc_send('show');
                            ipc_send('max');
                        },
                    })
                }
            }
        })
    },

}
g_observ.init()