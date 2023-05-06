
var g_tag = {
    selected: [],
    tags: new Set(local_readJson('tags', [])),
    init() {
        const self = this
        const hideBadges = () => $('#tag_list label .badge').addClass('hide1')
        g_action.registerAction({
            tag_input: () => self.refresh(),
            tag_input_keyup: () => hideBadges(),
            tag_clear: () => self.initTags([], true),
            tag_toggle: dom => self.tag_toggle(dom.value),
            tag_input_keydown(dom, a, e) {
                let key = e.originalEvent.key
                if (key == 'Enter') self.tag_input(dom.value)
                let badges = $('#tag_list label .badge').slice(0, 9)
                if (e.ctrlKey) {
                    if (['1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(key)) {
                        badges[key - 1].click()
                        hideBadges()
                        self.clearInput(true)
                    } else {
                        badges.each((i, el) => $(el).html(i + 1).removeClass('hide1'))
                    }
                }
            },
        })

        $(`<li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown" data-bs-auto-close="outside" role="button" aria-expanded="false">
                <span class="nav-link-title">标签</span>
            </a>
            <div class="dropdown-menu  dropdown-menu-arrow bg-dark text-white">
                <a class="dropdown-item" data-action="tag_clear">清空</a>
            </div>
        </li>`).appendTo('#navbar-menu .navbar-nav')


        g_hotkey.hotkey_register({
            'digit3': {
                title: '聚焦标签',
                content: "$('#input_tags').focus()",
                type: 2,
            }
        })

        g_plugin.registerEvent('loadClip', ({ clip }) => self.tag_selected(clip.tags))
        g_plugin.registerEvent('addClip', ({ clip }) => {
            let t = $('#input_tags').val()
            if (t != '') { // 标签输入框残留内容尝试输入
                self.tag_input(t)
            }
        })
        g_plugin.registerEvent('loadClips', ({ data }) => {
            data.forEach(({tags}) => tags.forEach(tag => self.tags.add(tag)))
            self.initTags()
        })

        $(() => {
            $('#tag_container').html(`
                <div class="input-icon">
                    <input type="text" value="" id="input_tags" class="form-control form-control-rounded" placeholder="搜索..." data-input="tag_input" data-keydown="tag_input_keydown" data-keyup="tag_input_keyup">
                    <span class="input-icon-addon">
                        <i class="ti ti-search fs-2"></i>
                    </span>
                </div>
                <div id="tag_list" class="form-selectgroup pt-3 p-1 overflow-y-auto align-content-start" style="height: 250px;"></div>
            `).find('input').on('focus', () => g_player.getPlayer().tryPause())
            // .on('blur', () => g_player.getPlayer().tryPlay());
            self.initTags()
        })
    },

    tag_input(tag) {
        $('#input_tags').val('')
        if (new RegExp("^[a-zA-Z]+$").test(tag)) { // 全英文 默认选中第一个结果
            tag = getEle({ change: 'tag_toggle' }).val()
        }
        if (isEmpty(tag)) return
        
        this.tags.add(tag)
        this.save()

        this.tag_toggle(tag)
        this.refresh()
    },

    initTags(tags, save = false) {
        if(tags) this.tags = new Set(tags || [])
        this.refresh()
        save && this.save()
    },

    history: local_readJson('tag_history', {}),
    tag_toggle(tag, clear = true) {
        let i = this.selected.indexOf(tag)
        if (i == -1) {
            this.selected.push(tag)
        } else {
            this.selected.splice(i, 1)
        }
        this.history[tag] = new Date().getTime()
        local_saveJson('tag_history', this.history)
        clear && this.clearInput()
    },

    tag_selected(tags) {
        this.clearInput()
        this.selected = tags
        this.refresh()
    },

    save() {
        local_saveJson('tags', Array.from(this.tags))
    },

    reset() {
        this.selected = []
        this.clearInput()
    },

    clearInput(focus = false) {
        this.setInput()[focus ? 'focus' : 'blur']()
        this.refresh()
    },

    setInput(val = ''){
        return getEle({ input: 'tag_input' }).val(val)
    },

    refresh() {
        let h = ''
        let s = getEle({ input: 'tag_input' }).val()
        let py = PinYinTranslate.start(s);
        let sz = PinYinTranslate.sz(s);
        Array.from(this.tags).filter((key, i) => key.indexOf(s) != -1 || PinYinTranslate.start(key).indexOf(py) != -1 || PinYinTranslate.sz(key).indexOf(sz) != -1)
            .sort((a, b) => {
                // 根据标签最后选中时间排序
                return this.selected.indexOf(b) - this.selected.indexOf(a) || (this.history[b] || 0) - (this.history[a] || 0)
            }).forEach(tag => {
                h += `
              <label class="form-selectgroup-item position-relative">
                <span class="badge bg-blue badge-notification badge-pill hide1"></span>
                <input data-change="tag_toggle" type="checkbox" value="${tag}" class="form-selectgroup-input" ${this.selected.includes(tag) ? 'checked' : ''}>
                <span class="form-selectgroup-label">${tag}</span>
              </label>
            `
            })
        $('#tag_list').html(h)
    }
}

g_tag.init()