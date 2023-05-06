
g_border.init({
    addItem(h, method = 'appendTo'){
          $(h)[method]('#navbar-menu .navbar-nav')
    },
	init(){
		this.bar.html(`
			<header class="navbar navbar-expand-md w-full p-0" style="height:30px;min-height: unset;">
            <div class="p-0 w-full d-flex flex-grow-1 ms-2" style="height:30px">
                <div class="navbar-nav flex-row order-md-last align-items-center"  style="min-height: unset;">
                    <div id="traffic">
                        <div class="traffic_icons d-flex align-items-center m-0" style="font-size: 1.2rem;margin-top: 2px;">
                            <div data-action="sidebar_toggle,right"><i class="ti ti-layout-sidebar-right"></i></div>
                            <div data-action="settings,general"><i class="ti ti ti-settings"></i></div>
                            <div data-action="darkMode" ><i class="ti ti-moon"></i></div>
                            <div data-action="pin"><i class="ti ti-pin"></i></div>
                        </div>
                        <div class="light" style="background-color: #55efc4" data-action="min"></div>
                        <div class="light" style="background-color: #ffeaa7" data-action="max"></div>
                        <div class="light" style="background-color: #ff7675" data-action="close"></div>
                    </div>
                </div>

                <div class="collapse navbar-collapse" id="navbar-menu">
                    <div class="d-flex flex-column flex-md-row flex-fill align-items-stretch align-items-md-center">
                        <ul class="navbar-nav">
                             <li class="nav-item">
                                <a class="nav-link" href="#" data-action="sidebar_toggle,left">
                                  <i class="ti ti-layout-sidebar"></i>
                                </a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="#" data-action="ui,foll_updates">
                                  <span class="nav-link-title">视频</span>
                                </a>
                            </li>
                            <li class="nav-item dropdown" >
                                <a class="nav-link dropdown-toggle" data-bs-toggle="dropdown" data-bs-auto-close="outside" role="button" aria-expanded="false">
                                    <span class="nav-link-title">
                                        解析
                                    </span>
                                </a>
                                <div class="dropdown-menu  dropdown-menu-arrow bg-dark text-white">
                                    <a class="dropdown-item" href="#" data-action="prompt_loadFile">播放视频</a>
                                    <a class="dropdown-item" href="#" data-action="prompt_parseLink">解析链接</a>
                                    <a class="dropdown-item" href="#" data-action="prompt_parsePlaylist">解析播放列表</a>
                                </div>
                            </li>

                            <li class="nav-item dropdown" >
                                <a class="nav-link dropdown-toggle" data-bs-toggle="dropdown" data-bs-auto-close="outside" role="button" aria-expanded="false">
                                    <span class="nav-link-title">
                                        插件
                                    </span>
                                </a>
                                <div class="dropdown-menu  dropdown-menu-arrow bg-dark text-white" id="dropdown_plugins">
                                    <a class="dropdown-item" href="#" data-action="modal_hotkey">快捷键列表</a>
                                    <a class="dropdown-item" href="#" data-action="modal_plugin">插件列表</a>
                                    <div class="dropdown-divider"></div>

                                </div>
                            </li>
                            <li class="nav-item dropdown">
                                <a class="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown" data-bs-auto-close="outside" role="button" aria-expanded="false">
                                    <span class="nav-link-title">
                                        下载
                                    </span>
                                </a>
                                <div class="dropdown-menu  dropdown-menu-arrow bg-dark text-white">
                                    <a class="dropdown-item" href="#">
                                        下载列表
                                    </a>
                                    <a class="dropdown-item" href="#" data-action="openSavePath">
                                        打开目录
                                    </a>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </header>
		`)
	}

})