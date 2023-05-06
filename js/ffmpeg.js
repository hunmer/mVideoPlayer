// (await g_data.getMd5List()).forEach(md5 => g_item.item_getVal('cover', md5))

assignInstance(g_ffmpeg, {
    init(){
        this.mgr = new Queue('ffmpeg', {
            max: 3,
            interval: 1000,
        })
    },
})