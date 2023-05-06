// ==UserScript==
// @name        阿里云盘同步
// @version     1.0
// @author      hunmer
// @description 把数据库合并到阿里云盘
// ==/UserScript==


/*

{
    "drive_id": "408429",
    "domain_id": "bj29",
    "file_id": "626982a19e418cfb11e8492497e907c39e713bc3",
    "name": "分享",
    "type": "folder",
    "created_at": "2022-04-27T17:51:29.694Z",
    "updated_at": "2022-04-27T17:51:36.190Z",
    "hidden": false,
    "starred": false,
    "status": "available",
    "parent_file_id": "root",
    "encrypt_mode": "none"
}

{
    "drive_id": "408429",
    "domain_id": "bj29",
    "file_id": "63930be0a41f19ba01f841fabf67a86d908ee93a",
    "name": "HITTEST_32088110.tmp",
    "type": "file",
    "created_at": "2022-12-09T10:20:16.082Z",
    "updated_at": "2022-12-09T10:20:16.082Z",
    "file_extension": "tmp",
    "mime_type": "text/plain; charset=utf-8",
    "mime_extension": "txt",
    "hidden": false,
    "size": 0,
    "starred": false,
    "status": "available",
    "parent_file_id": "root",
    "content_hash": "DA39A3EE5E6B4B0D3255BFEF95601890AFD80709",
    "content_hash_name": "sha1",
    "category": "others",
    "encrypt_mode": "none",
    "punish_flag": 0,
    "revision_version": 1
}


*/
var g_aliyun = {
    init() {
        const self = this
        self.token = getConfig('aliyun_token', '')
        // self.get()
        // self.file_list({
        //     parent_file_id: '6396bbee4558996ac8fb443487a3945b17492217'
        // })

        nodejs.files.dirFiles("I:\\software\\test\\test", [], list => console.log(list.map(file => { return { file, hash: nodejs.files.getFileMd5(file, 'sha1') } })))

        this.file_list_hash('6396d49a4a6530e634554e9dabee398801d71497', {
            items: [],
            paths: []
        }, result => {
            console.log(result)
            console.log(result.items.length)
        })
    },

    // TODO 根据file_id获取path路径
    file_getParents(file_id) {
        return this.http({
            url: 'https://api.aliyundrive.com/adrive/v1/file/get_path',
            type: 'POST',
            postData: {
                drive_id: "408429",
                file_id
            },
        })
    },

    // 获取目录下所有文件的hash
    // BUG 
    async file_list_hash(fid, ret, callback) {
        let list = await this.file_list({ parent_file_id: fid })
        Promise.all(list.items.map(async item => {
            let { file_id, content_hash: hash, name, parent_file_id: parent } = item
            if (item.type == 'folder') {
                ret.paths.push({ name, file_id, parent })
                await this.file_list_hash(file_id, ret)
            } else {
                ret.items.push({ name, hash, parent })
            }
        })).then(() => {
            callback && callback(ret)
        })
    },

    file_list(opts = {}) {
        return this.http({
            url: 'https://api.aliyundrive.com/adrive/v3/file/list',
            type: 'POST',
            postData: Object.assign({ drive_id: "408429", parent_file_id: "root", limit: 20, all: false, url_expire_sec: 14400, image_thumbnail_process: "image/resize,w_256/format,jpeg", image_url_process: "image/resize,w_1920/format,jpeg/interlace,1", video_thumbnail_process: "video/snapshot,t_1000,f_jpg,ar_auto,w_256", fields: "*", order_by: "updated_at", order_direction: "DESC" }, opts),
        })
    },

    get() {
        this.http({
            url: 'https://api.aliyundrive.com/adrive/v2/user/get',
            type: 'POST',
            postData: {},
        }).then(data => {
            console.log(data)
            if (!data.default_drive_id) { // 过期的token
                this.show()
            } else
            if (this.win) { // 存在登录窗口
                this.win.close()
                delete this.win
            }
        })
    },


    show() {
        let win = this.win = new nodejs.remote.BrowserWindow({
            title: '阿里云盘',
            width: 1450,
            height: 970,
            webPreferences: {
                spellcheck: false,
                nodeIntegration: true,
                contextIsolation: true,
            }
        })
        // TODO 做个全局接口
        let setListener = nodejs.session.defaultSession.webRequest.onBeforeSendHeaders
        setListener({ urls: ['*://*/*'] }, (details, callback) => {
            let token = details.requestHeaders.Authorization
            if (!isEmpty(token)) {
                this.token = token
                setConfig('aliyun_token', token)
                setListener(null)

                this.get()
            }
            callback({ cancel: false });
        })
        win.loadURL('https://www.aliyundrive.com/sign/in?spm=aliyundrive.index.0.0.2d8310110DQn6S', { userAgent: 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.134 Safari/537.36 Edg/103.0.1264.71' })
    },

    // 网络请求
    http(opts) {
        return new Promise(async (reslove) => {
            let http = {
                method: opts.method || 'POST',
                json: true,
                url: opts.url,
                headers: {
                    'User-Agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36 Edg/107.0.1418.42`,
                    'authorization': this.token,
                    "content-type": "application/json;charset=UTF-8",
                    'sec-ch-ua': '"Not?A_Brand";v="8", "Chromium";v="108", "Microsoft Edge";v="108"',
                    'sec-ch-ua-mobile': '?0',
                    "x-canary": "client=web,app=adrive,version=v3.12.2",
                    'x-device-id': 'eLMdHA8TNTcBASQOA3n6DiGD',
                    "referer": "https://www.aliyundrive.com",
                    'origin': 'https://www.aliyundrive.com',
                },
                encoding: null
            }
            if (opts.method == 'GET') {
                http.url += '?' + Object.entries(opts.postData).map(([name, value]) => name + '=' + value).join('&')
            } else {
                http.form = JSON.stringify(opts.postData)
            }
            nodejs.request(http, (err, res, body) => {
                if (res.headers['content-encoding'] && res.headers['content-encoding'].indexOf('gzip') != -1) {
                    this.gzip.unzip(body, function(err, buffer) {
                        reslove(buffer.toString())
                    })
                } else {
                    reslove(body)
                }
            })
        })
    },

}
g_aliyun.init()