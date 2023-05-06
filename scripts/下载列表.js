// ==UserScript==
// @name    下载列表
// @version    1.0
// @author    hunmer
// @description    下载列表
// @namespace    92cad99f-54d6-4f2a-8d58-b670f88f9fc8

// ==/UserScript==

g_detailTabs.register('downlist', {
    onTabChanged: old => {
        g_downloader.refresh()
    },
    tab: {
        id: 'downlist',
        icon: 'download',
        title: `<span class="badge bg-red badge-pill hide" id='badge_downloading'></span>`,
        /* 
         <div class="col">
                    <select class="form-select p-1">
                        <option selected disabled>选择剧名</option>
                    </select>
                </div>
         */
        html: `
        <div class="p-2">
            <h3 class="d-flex w-full pb-2 border-bottom">
                <div class="col-auto">
                    <button data-action="download_add" class="btn btn-cyan p-1" title="添加下载"><i class="ti fs-2 ti-plus"></i></button>
                    <button data-action="download_start" class="btn btn-teal p-1" title="开始下载"><i class="ti fs-2 ti-player-play"></i></button>
                    <button data-action="download_clear" class="btn btn-red p-1" title="清空全部"><i class="ti fs-2 ti-trash"></i></button>
                    <button data-action="download_clear_completed" class="btn btn-yellow p-1" title="清空已下载"><i class="ti fs-2  ti-refresh"></i></button>
                    <button data-action="download_path" class="btn btn-cyan p-1" title="当前下载目录"><i class="ti fs-2 ti-folder"></i></button>
                    <button data-action="download_settings" class="btn p-1" title="当前下载目录"><i class="ti fs-2 ti-settings"></i></button>
                    <button data-action="download_checklist" class="btn p-1" title="检查任务"><i class="ti fs-2 ti-check"></i></button>
                </div>
            </h3>

            <div id="download_list" class="list-group list-group-flush list-group-hoverable" style="max-height: calc(100vh - 100px);overflow-y: auto;padding-bottom: 100px;"></div>
        </div>
         `
    },
}, {
    init() {
        $(`<span class="badge p-0 bg-cyan-lt cursor-pointer h-fit me-2" data-action="aria2c_setting" id="badge_downloadSpeed">连接中...</span>`).insertBefore('#traffic')
    }
})
