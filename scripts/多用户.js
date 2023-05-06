// ==UserScript==
// @name    多用户
// @version    1.0
// @author    hunmer
// @description    多用户
// @namespace    0c7a96bb-0046-4d77-bb2d-3d2e0209826e

// ==/UserScript==

({
    init() {
        const self = this
        g_plugin.menu_add({
            title: '用户切换',
            action: 'mu_prompt'
        })
        g_action.registerAction({
            mu_prompt() {
                self.prompt()
            }
        })
    },

    prompt() {
        let list = this.list()
        confirm(g_tabler.build_radio_list({
            list,
            value: g_localKey
        }), {
            id: 'mu_prompt',
            title: '多用户列表',
            buttons: [{
                    id: 'add',
                    text: '新增',
                    class: 'btn-success',
                }, {
                    id: 'delete',
                    text: '删除',
                    class: 'btn-warning',
                },
                {
                    id: 'apply',
                    text: '应用',
                    class: 'btn-info',
                }
            ],
            onBtnClick: btn => {
                let selected = $('#modal_mu_prompt .form-check-input:checked').val()
                switch (btn.id) {
                    case 'btn_add':
                        prompt('', { title: '输入key' }).then(key => {
                            if (!isEmpty(key) && !list.includes(key)) {
                                list.push(key)
                                this.save(list)
                                toast('添加成功', 'success')
                                this.prompt()
                            }
                        })
                        return;
                    case 'btn_delete':
                        if (selected == g_localKey_default) return toast('默认的不能删除', 'danger')
                        let i = list.indexOf(selected)
                        if (i >= 0) {
                            confirm('确定要删除 '+selected+'吗？数据将会丢失!', {type: 'danger'}).then(() => {
                                list.splice(i, 1)
                                this.save(list)
                                toast('删除成功', 'success')
                                this.prompt()
                                // TODO 清空数据
                            })
                        }
                        return;

                    case 'btn_apply':
                        this.apply(selected)
                        return
                }
            }
        })
    },

    list() {
        return uniqueArr([g_localKey_default, ...(local_get('mu_list', '') || '').split('||')]).filter(s => s != '')
    },

    save(list) {
        local_set('mu_list', list.join('||'), '');
    },

    apply(key) {
        local_set('local_key', key, '');
        setTimeout(() => location.reload(), 500)
    },


}).init()
