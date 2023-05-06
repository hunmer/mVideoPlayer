// ==UserScript==
// @name    影视规则
// @version    1.0
// @author    hunmer
// @description    影视规则
// @namespace    397c02c3-171f-48d4-9484-13e477e97f8a

// ==/UserScript==
let g_rule = {
    rule_default: function (i, url, props = {}) {
        let ret
        switch (i) {
            case 1:
                ret = {
                    url: url,
                    information: {
                        title: `$('.stui-content__detail .title').html()`,
                        desc: `$('.stui-content__detail .detail-content').html()`,
                        cover: `document.querySelector('.pic img').dataset.original`,
                        list: `
                            (() => {
                                let r = {};
                                let i = 0;
                                for(let playlist of document.querySelectorAll('.stui-content__playlist')){
                                    i++;
                                    for(let item of playlist.querySelectorAll('a')){
                                        if(!r['播放列表'+i]) r['播放列表'+i] = {};
                                        r['播放列表'+i][item.outerText] = item.href;
                                    }
                                }
                                return r;
                            })();
                        `,
                    }
                }
                break;


            case 2:
                ret = {
                    url: url,
                    information: {
                        title: `$('.player-title-link').text()`,
                        desc: `$('.module-info-introduction-content p').text()`,
                        cover: `$('.module-item-pic img').attr('src')`,
                        list: `
                            (() => {
                                let r = {};
                                $('.module-tab-item.tab-item').each((i, tab) => {
                                    r[tab.dataset.dropdownValue || 'default'] = {};
                                });

                                $('.module-play-list-content').each((i, tab) => {
                                  for(let a of tab.children) r[Object.keys(r)[i]][a.outerText] = a.href;
                                });
                                return r;
                            })();
                        `,
                    }
                }
                break;

            case 3:
                ret = {
                    url: url,
                    information: {
                        title: `$('.hl-dc-title').text()`,
                        desc: `$('.blurb').text()`,
                        cover: `document.querySelector('.pic img').dataset.original`,
                        list: `
                            (() => {
                                let r = {};
                                $('.hl-tabs a').each((i, tab) => {
                                    r[tab.outerText.trim()] = {};
                                });

                                $('.hl-plays-list').each((i, list) => {
                                  for(let a of list.querySelectorAll('a')) r[Object.keys(r)[i]][a.outerText] = a.href;
                                });
                                return r;
                            })();
                        `,
                    }
                }
                break;

            case 4:
                ret = {
                    url: url,
                    information: {
                        title: `$('.page-title').text()`,
                        desc: `$('.video-info-content span').text()`,
                        cover: `$('.video-cover img').data('src')`,
                        list: `
                            (() => {
                                let r = {'播放地址': {}};
                                $('.module .scroll-content a').each((i, a) => r['播放地址'][a.outerText] = a.href);
                                return r;
                            })();
                        `,
                    }
                }
                break;

            case 5:
                ret = {
                    url: url,
                    information: {
                        title: `$('.page-title').text()`,
                        desc: `$('.vod_content').text()`,
                        cover: `document.querySelector('.module-item-cover img').dataset.src`,
                        list: `
                            (() => {
                                let r = {};
                                $('.module-tab-item.tab-item').each((i, tab) => {
                                    r[tab.dataset.dropdownValue] = {};
                                });

                                $('.module-player-list .scroll-content').each((i, tab) => {
                                  for(let a of tab.children) r[Object.keys(r)[i]][a.outerText] = a.href;
                                });
                                return r;
                            })();
                        `,
                    }
                }
                break;

            case 6:
                ret = {
                    url: url,
                    information: {
                        title: `document.querySelector('.stui-content__detail .title').outerText`,
                        desc: `document.querySelector('.detail-content').outerText`,
                        cover: `document.querySelector('.pic img').dataset.original`,
                        list: `
                        (() => {
                            let r = {'播放列表1': {}};
                            for(let a of document.querySelectorAll('.stui-content__playlist a')){
                               r['播放列表1'][a.outerText] = a.href;
                            }
                            return r;
                        })();
                    `,
                    }
                }
                break;

            case 7:
                ret = {
                    url: url,
                    information: {
                        title: `$('.myui-content__detail .title').text()`,
                        desc: `$('.sketch.content').text()`,
                        cover: `$('.picture img')[0].src`,
                        list: `
                            (() => {
                                let r = {};
                                $('.nav-tabs:eq(0) li').each((i, tab) => {
                                    r[tab.outerText] = {};
                                });

                                $('.myui-content__list').each((i, list) => {
                                  for(let a of list.querySelectorAll('a')) r[Object.keys(r)[i]][a.outerText] = a.href;
                                });
                                return r;
                            })();
                        `,
                    }
                }
                break;

            case 8:
                ret = {
                    url,
                    information: {
                        title: `document.querySelector('h1.title').innerText`,
                        desc: `document.querySelector('.desc').innerText`,
                        cover: `document.querySelector('.picture img').dataset.original`,
                        list: `
                            (() => {
                                let r = {};
                                let i = 0;
                                for(let playlist of document.querySelectorAll('.nav-tabs li')){
                                    i++;
                                    r['播放列表'+i] = {}
                                    for(let item of document.querySelectorAll('#playlist'+i+' a')){
                                        r['播放列表'+i][item.outerText] = item.href;
                                    }
                                }
                                return r;
                            })();
                            `,

                    }
                }
                break;
        }
        Object.assign(ret.information, props)
        return ret
    },
    list: {},
    search(keyword) {
        for (let [name, item] of Object.entries(this.rule)) {
            if (item.search) {

            }
        }
    },

    init() {
        const self = this
        let rule = {

            追剧兔: {
                url: 'https://www.zjtu.cc/vodplay/(.*?)/',
                information: {
                    title: `$('.cor7').text()`,
                    desc: `$('.cor3').text()`,
                    cover: `$('.poster')[0].style.backgroundImage.replace('url("', '').replace('")', '')`,
                    list: `
                         (() => {
                            let r = {};
                            $('a[data-from]').each((i, tab) => {
                                let k = '播放列表'+(i+1)
                                r[k] = {};
                                $('.player-xl-list ul:eq('+i+') a').each((i1, a) => {
                                    r[k][a.outerText] = a.href;
                                })

                            });
                            return r;
                        })();
                    `,
                }
            },


            爱迪影视: {
                url: 'https://aidi.tv/movie/(.*?).html',
                information: {
                    title: `document.querySelector('h2').outerText`,
                    desc: `document.querySelector('.content_desc span').outerText`,
                    list: `
                        (() => {
                            document.querySelectorAll('.play_source_tab a').forEach((tab, i) => {
                                 let n = tab.outerText
                                 r[n] = {}
                                for(let a of document.querySelectorAll('.play_list_box')[i].querySelectorAll('a')) r[n][a.outerText] = a.href;
                            })
                            return r;
                        })();
                    `,
                }
            },

            看了么: {
                url: 'https://www.ksksl.com/voddetail/(.*?).html',
                information: {
                    title: `document.querySelector('h1').outerText`,
                    desc: ``,
                    list: `
                        (() => {
                            let r = {};
                            for(let list of document.querySelectorAll('.list-box.marg')){
                                let n = list.querySelector('h2').outerText
                                r[n] = {}
                              for(let a of list.querySelectorAll('.play_li a')) r[n][a.outerText] = a.href;
                            }
                            return r;
                        })();
                    `,
                }
            },

            影视大全: {
                url: 'https://www.jinshier66.com/album/(.*?).htm',
                information: {
                    title: `document.querySelector('h2').outerText`,
                    desc: `document.querySelector('.details-content-default').outerText`,
                    search: `$('#wd').val(%keyword%);$('.btn-search').click()`,
                    list: `
                        (() => {
                            let r = {};
                            $('#playTab a.gico').each((i, tab) => {
                                r[tab.outerText] = {};
                            });

                            $('.playlist ul').each((i, list) => {
                              for(let a of list.querySelectorAll('a')) r[Object.keys(r)[i]][a.outerText] = a.href;
                            });
                            return r;
                        })();
                    `,
                }
            },
            嘀哩嘀哩: {
                url: 'https://www.bdys01.com/(.*?).htm',
                information: {
                    title: `document.querySelector('h2').outerText`,
                    desc: ``,
                    cover: `document.querySelector('.cover-lg-max-25 img').src`,
                    list: `
                        (() => {
                            let r = {'播放列表1': {}};
                            for(let a of document.querySelectorAll('#play-list a')){
                               r['播放列表1'][a.outerText] = a.href;
                            }
                            return r;
                        })();
                    `,
                }
            },
            高清mp4: {
                url: 'https://www.mp4pa.com/mp4/(.*?).html',
                information: {
                    title: `document.querySelector('.title').outerText`,
                    desc: `document.querySelector('.desc').outerText`,
                    list: `
                        (() => {
                            let r = {};
                            $('#NumTab a').each((i, tab) => {
                                r[tab.outerText] = {};
                            });

                            $('.play_list_box').each((i, list) => {
                              for(let a of list.querySelectorAll('a')) r[Object.keys(r)[i]][a.outerText] = a.href;
                            });
                            return r;
                        })();
                    `,
                }
            },

            橘子影院: {
                url: 'http://kcsybk.cn/index.php/vod/detail/id/(.*?).html',
                information: {
                    title: `document.querySelector('.fyy').outerText`,
                    desc: `document.querySelector('#cText').outerText`,
                    list: `
                        (() => {
                            let r = {};
                            $('.channelname').each((i, tab) => {
                                r[tab.outerText] = {};
                            });

                            $('.play_list_box').each((i, list) => {
                              for(let a of list.querySelectorAll('a')) r[Object.keys(r)[i]][a.outerText] = a.href;
                            });
                            return r;
                        })();
                    `,
                }
            },

            厂长资源: {
                url: 'https://www.czspp.com/movie/(.*?).html',
                information: {
                    title: `document.querySelector('.moviedteail_tt h1').outerText`,
                    desc: `document.querySelector('.yp_context p').outerText`,
                    list: `
                        (() => {
                            let r = {'播放列表1': {}};
                            for(let a of document.querySelectorAll('.paly_list_btn a')){
                               r['播放列表1'][a.outerText] = a.href;
                            }
                            return r;
                        })();
                    `,
                }
            },
            干饭影视: {
                url: 'http://www.gfysys.com/voddetail/(.*?).html',
                information: {
                    title: `document.querySelector('.title.wdetail').outerText`,
                    desc: `document.querySelector('.detail-sketch').outerText`,
                    list: `
                         (() => {
                                let r = {};
                                for(let playlist of document.querySelectorAll('.channelname')){
                                    let r1 = {};
                                    for(let item of playlist.querySelectorAll()){
                                        r1[item.outerText] = item.href;
                                    }
                                    r[playlist.outerText] = r1;
                                }
                                return r;
                            })();
                    `,
                }
            },
            小强迷: {
                url: ['https://www.xqmi.top/index.php/vod/detail/id/(.*?).html', 'https://www.xqmi.top/index.php/vod/play/id/(.*?)/sid/(.*?)/nid/(.*?).html'],
                url_replace: `(() => {
                        let id = cutString({url}, '/id/', '.html');
                        if(id != ''){
                            return 'https://www.xqmi.top/index.php/vod/play/id/'+id+'/sid/1/nid/1.html'
                        }
                        return {url}
                    })();
                    `,
                information: {
                    title: `$('.video-title h2').text()`,
                    desc: `$('.stui-content__desc').text()`,
                    list: `
                            (() => {
                                let r = {};
                                let i = 0;
                                for(let playlist of $('.stui-content__playlist')){
                                    i++;
                                    for(let item of $(playlist).find('a')){
                                        if(!r['播放列表'+i]) r['播放列表'+i] = {};
                                        r['播放列表'+i][item.outerText] = item.href;
                                    }
                                }
                                return r;
                            })();
                        `,
                }
            },
            哗嘀影视: {
                url: 'https://www.btbdys.com/aiqing/(.*?).html',
                information: {
                    title: `$('h1.d-none.d-md-block').text()`,
                    desc: `$('p.d-none.d-md-block.mb-0').text()`,
                    list: `
                            (() => {
                                let r = {};
                                for(let item of $('.btn.btn-square.me-2')){
                                    r['播放列表'][item.outerText] = item.href;
                                }
                                return r;
                            })();
                        `,
                }
            },
            速搜TV: {
                url: 'https://www.sstv.pw/play-(.*?)/',
                information: {
                    title: `$('.has-sub h2').text()`,
                    cover: `document.querySelector('.picture img').dataset.original`,
                    list: `
                       (() => {
                            let r = {};
                            $('.product-filter-list a').each((i, playlist) => {
                                let list = {}
                                for(let link of $('#playlist'+i+' a')){
                                    list[link.outerText] = link.href;
                                }
                                r[playlist.outerText] = list
                            })
                            return r;
                        })();
                        `,
                }
            },
            皮皮鸭: {
                url: 'https://www.sstv.pw/play-(.*?)',
                information: {
                    title: `document.querySelector('.slide-info-title').outerText`,
                    cover: `document.querySelector('.detail-pic').dataset.original`,
                    list: `
                       (() => {
                            let r = {};
                            let b = document.querySelectorAll('.anthology-list-play')
                            document.querySelectorAll('.anthology a.swiper-slide').forEach((playlist,i)=>{
                                let list = {}
                                for (let link of b[i].querySelectorAll('a')) {
                                    list[link.outerText] = link.href;
                                }
                                r[playlist.outerText] = list
                            })
                            return r
                        })();
                        `,
                }
            },

            mayiyahu: {
                url: 'https://www.mayiyahu.com/v/id-(.*?)',
                information: {
                    title: `document.querySelector('.detailinfo h1').outerText`,
                    desc: `document.querySelector('.tjuqing').outerText`,
                    cover: `document.querySelector('.detail-pic').dataset.original`,
                    list: `
                       (() => {
                            let r = {};
                            let b = document.querySelectorAll('.videolist ')
                            document.querySelectorAll('#play li').forEach((playlist,i)=>{
                                let list = {}
                                for (let link of b[i].querySelectorAll('a')) {
                                    list[link.outerText] = link.href;
                                }
                                r[playlist.outerText] = list
                            })
                            return r
                        })();
                        `,
                }
            },

            一龙高清: this.rule_default(1, 'http://www.yilonghd.com/detail/(.*?).html'),
            看看剧: this.rule_default(1, 'https://www.kankanju.cc/vod/(.*?).html'),
            影视之家: this.rule_default(1, 'https://www.q6qq.com/voddetail/(.*?).html'),
            皮皮泡: this.rule_default(1, 'https://www.pipipao.com/vod/(.*?).html'),
            达达龟: this.rule_default(1, 'http://www.dadagui.me/voddetail/(.*?).html'),
            libvio: this.rule_default(1, 'https://www.libvio.me/detail/(.*?).html'),
            神马影院: this.rule_default(1, 'https://www.smdyy1.cc/kan/(.*?).html'),
            双十电影: this.rule_default(1, 'https://www.1010dy.vip/detail/(.*?)/'),
            影院之家: this.rule_default(1, 'https://www.txxlcdc.cn/voddetail/(.*?).html'),
            va影视: this.rule_default(1, 'https://www.vays.cn/index.php/vod/detail/id/(.*?).html'),

            netflix: this.rule_default(2, 'https://netflix.mom/voddetail/(.*?).html'), // 
            看看屋: this.rule_default(2, 'https://www.kkw361.com/voddetail/(.*?).html'), // 
            大米星球: this.rule_default(2, 'https://www.dm718.com/voddetail/(.*?).html'), // 
            瓜皮TV: this.rule_default(2, 'https://guapitv.xyz/vod/(.*?).html'),
            人人影视: this.rule_default(2, 'https://www.rrets.cc/play-(.*?)', {
                desc: '',
                cover: `$('.history-a img').attr('src')`,
                list: `
                    (() => {
                        let r = {};
                        $('.vod-playerUrl').each((i, tab) => {
                            let urls = {}
                            $('.anthology-list-play:eq('+i+') a').each((i, a) => urls[a.outerText] = a.href);
                            r[tab.dataset.form] = urls;
                        });
                        return r;
                    })();
                `,
            }),
            蓝光影院: this.rule_default(2, 'https://www.lgyy.cc/voddetail/(.*?).html'),
            奇粹视频: this.rule_default(2, 'http://www.blssv.com/index.php/vod/detail/id/(.*?).html'),
            莫扎兔: this.rule_default(2, 'http://www.dazhutizi.net/index.php/vod/detail/id/(.*?).html'),
            快猫影视: this.rule_default(2, 'https://www.maomiava.com/index.php/vod/detail/id/(.*?).html'),
            voflix: this.rule_default(2, 'https://www.voflix.com/detail/(.*?).html'),
            nikeTV: this.rule_default(2, 'https://www.ajeee.com/detail/(.*?).html'),
            freeok: this.rule_default(2, 'https://www.freeok.vip/voddetail/(.*?).html'),
            小宝影视: this.rule_default(2, 'https://www.1iuxb.com/voddetail/(.*?).html'),
            伊雪湾: this.rule_default(2, 'https://www.yixuewan.com/index.php/vod/detail/id/(.*?).html'),
            秋霞影院: this.rule_default(2, 'https://www.qiuxia360.com/voddetail/(.*?).html'),
            西瓜影院: this.rule_default(2, 'https://www.xigua133.com/voddetail/(.*?).html'),

            '87影院': this.rule_default(3, 'https://87dyba.com/voddetail/(.*?).html'),
            '85看': this.rule_default(3, 'https://www.85kankan.com/index.php/vod/detail/id/(.*?).html'),

            麻花影视: this.rule_default(2, 'https://www.mhyyy.com/detail/(.*?).html'),
            牛马TV: this.rule_default(4, 'https://www.niumatv.cc/vod/(.*?).html'),
            爱看影院: this.rule_default(1, 'https://www.ikyy.cc/detail/(.*?).html'),
            um影院: this.rule_default(4, 'https://www.umkan.com/index.php/vod/detail/id/(.*?).html'),
            视中心影视: this.rule_default(4, 'https://www.ksksi.com/voddetail/(.*?).html'),
            星辰影院: this.rule_default(4, 'https://www.xcyingy.com/vod/(.*?).html'),
            锐行加速: this.rule_default(4, 'https://www.cjtyy.top/index.php/vod/detail/id/(.*?).html'),
            小熊影视: this.rule_default(4, 'https://www.xxys520.com/voddetail/(.*?).html'),
            稀饭影视: this.rule_default(4, 'https://www.xifanys.com/yingpiandetail/(.*?).html'),
            '6080dy3': this.rule_default(4, 'https://www.6080dy3.com/video/(.*?).html', {
                list: `
                (() => {
                    let r = {};
                    $('.module-tab-item.tab-item').each((i, tab) => {
                        let links = {}
                        $('.scroll-content:eq('+i+') a').each((i, a) => {
                          links[a.outerText] = a.href;
                        });
                        r[tab.dataset.dropdownValue] = links;
                    });
                    return r
                })();
                `
            }),

            我爱跟剧: this.rule_default(5, 'https://www.genmov.com/video/(.*?).html'),
            我爱跟剧: this.rule_default(5, 'https://52gen.top/video/(.*?).html'),

            饭团影院: this.rule_default(6, 'https://www.fantuanhd.com/detail/(.*?).html'),
            ab影院: this.rule_default(6, 'https://abu22.com/voddetail/(.*?).html'),

            'hdmoli': this.rule_default(7, 'https://www.hdmoli.com/movie/(.*?).html'),
            '31看影视': this.rule_default(7, 'http://www.31kan.vip/31kan/(.*?).html'),
            '333影视': this.rule_default(7, 'https://www.ylwt33.com/voddetail/(.*?).html'),

            饺子录像厅: this.rule_default(8, 'https://www.jiaozi.me/movie/(.*?).html'),
            ystv: this.rule_default(8, 'https://www.333ys.tv/voddetail/(.*?).html'),

        }
        self.list = rule;

        // 网络监听
        nodejs.session.fromPartition('persist:webview').webRequest.onBeforeRequest({ urls: ['*://*/*'] }, (details, callback) => {
            let { url, webContents } = details;
            let cancel = false
            if (webContents) {
                let type
                let wid = webContents.id

                let d = self._temp[wid]
                if (d) {
                    if (!d.result && new RegExp(d.rule).test(url)) {
                        type = d.type
                        d.result = url // 防止重复触发
                    }
                } else
                    if (url.indexOf('.m3u8') != -1) {
                        type = 'url';
                        // 替换和过滤一些播放器(GET参数带了URL播放地址)
                        let u = new URL(url).searchParams
                        if (u.has('url') && u.get('url').toLowerCase().startsWith('http')) {
                            url = u.get('url')
                        }
                        cancel = true // 有些m3u8只能访问一次？？
                    } else
                        if (details.resourceType == 'media') {
                            type = 'media'
                        }
                type && self.browser_callback({ webContents, url, type })
            }

            callback({ cancel });
        })

        g_action.registerAction({
            select_parseLink(dom) {
                if (!isEmpty(dom.value)) {
                    let { rule, type } = self.test[dom.value]
                    g_form.setElementVal('prompt_parseLink', { rule, type })
                }
            },
            prompt_parseLink() {
                g_form.confirm1({
                    id: 'prompt_parseLink',
                    title: '解析链接',
                    elements: {
                        url: {
                            title: '链接',
                            type: 'textarea',
                            // value: getClipboardText(),
                            value: 'https://v.youku.com/v_show/id_XMzQxODMxNzA0OA==.html?spm=a2h0c.8166622.PhoneSokuUgc_8.dscreenshot'
                        },
                        name: {
                            title: '类型',
                            type: 'select',
                            list: Object.keys(self.test),
                            props: 'data-action="select_parseLink"',
                        },
                        rule: {
                            title: '捕获规则',
                        },
                        type: {
                            title: '捕获规则',
                            list: { media: 'm3u8', url: 'mp4' },
                            type: 'select'
                        },
                    },
                    callback({ vals }) {
                        let { url, type, rule } = vals
                        let win = self.url_parse(url, src => {
                            g_player.newTab({ url, value: src, title: '解析视频' })
                        }, type)
                        self._temp[win.webContents.id] = { type, rule }
                    }
                })
            },
        })
        // this.playlist_parse('https://www.fantuanhd.com/detail/id-1404.html')
        // doAction('cp_loadURL,https://www.fantuanhd.com/detail/id-1404.html')
    },

    _temp: {},
    test: {
        youku: {
            rule: 'https://pl-ali.youku.com/playlist/m3u8?(.*?)',
            type: 'url'
        }
    },

    browser_callback(opts) {
        // if(!opts.web) opts.web = 
        let win = getBrowserWindowFromWebContents(opts.webContents);
        let wid = opts.webContents.id
        if (win) win.close();
        this._temp[wid] && delete this._temp[wid]
        let type = opts.type
        if (this.ids[wid]) {
            let { events } = this.ids[wid]
            delete this.ids[wid]
            if (events[type]) {
                for (let callback of events[type]) {
                    if (callback(opts) === false) return
                }
            }
        }
    },

    browser_on(wid, eventName, callback) {
        if (this.ids[wid]) {
            if (!this.ids[wid].events[eventName]) this.ids[wid].events[eventName] = []
            this.ids[wid].events[eventName].push(callback)
        }
    },

    rule_get: function (id) {
        return this.list[id];
    },

    entries(callback) {
        for (let [k, v] of Object.entries(this.list)) {
            if (callback(k, v) === false) return
        }
    },

    // 提取页面信息
    detail_fetch: async function (web) {
        let url = web.getURL()
        let ret = { url }
        let name = this.url_match(url);
        if (name) {
            let r = this.rule_get(name);
            console.log(name, r);
            if (r) {
                for (let kn in r.information) {
                    let res = await web.executeJavaScript(r.information[kn]);
                    console.log(res)
                    ret[kn] = res;
                }
            }
            console.log(ret)
            let win = getBrowserWindowFromWebContents(web);
            if (win) win.close();
        }
        return ret;
    },

    // 匹配播放列表地址
    url_match: function (url, retName = true) {
        for (let [k, v] of Object.entries(this.list)) {
            for (let reg of [].concat(v.url)) {
                if (new RegExp(reg).test(url)) {
                    if (!retName) {
                        if (v.url_replace) {
                            url = eval(d.url_replace.replaceAll('{url}', `"${url}"`));
                        }
                        return url;
                    }
                    return k;
                }
            }
        }
    },

    ids: {},
    playlist_parse(url, callback) {
        let win = this.browser_build(url)
        // 'did-stop-load'
        win.webContents.on('dom-ready', e => {
            this.detail_fetch(e.sender).then(callback)
        });
    },

    url_parse(url, callback, type) {
        let win = this.browser_build(url)
        let wid = win.webContents.id
        let fun = ({ url }) => callback(url)
        if (isEmpty(type) || type == 'url') this.browser_on(wid, 'url', fun)
        if (isEmpty(type) || type == 'media') this.browser_on(wid, 'media', fun)
        return win
    },

    browser_close(url) {
        for (let [id, d] of Object.entries(this.ids)) {
            if (isEmpty(url) || d.url == url) {
                !d.win.isDestroyed() && d.win.close()
                delete this.ids[id]
            }
        }
    },

    browser_build(url) {
        this.browser_close(url)
        let path = nodejs.dir + '\\js\\rule\\'
        let debug = true
        let win = new nodejs.remote.BrowserWindow({
            show: debug,
            fullScreen: true,
            webPreferences: {
                // preload: path + 'preload.js',
                images: debug,
                webSecurity: false,
                offscreen: !debug,
                partition: "persist:webview",
            }
        })
        // win.openDevTools()
        win.loadURL(url)
        this.ids[win.webContents.id] = {
            events: {},
            win,
            url,
        }

        win.webContents.setAudioMuted(true);
        // win.webContents.on('ipc-message', function(event) {
        //     console.log(event);
        //     let d = event.args;
        //     let webview = event.target;
        //     switch (event.channel) {
        //         case 'close':
        //             break;
        //     }
        // });
        return win
    }
}

g_rule.init();

