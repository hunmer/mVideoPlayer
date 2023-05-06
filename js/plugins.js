
assignInstance(g_plugin, {
    menu_add(opts) {
        let h = `<a class="dropdown-item" href="#" data-action="${opts.action}">${opts.title}</a>`
        $(h).insertAfter('#dropdown_plugins .dropdown-divider')
    },
	init(){
        $(() => this.initPlugins())
	}
})
