window.AppNav = {
    showTab(tab, el) {
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        document.getElementById('tab-' + tab).classList.add('active');
        if (el) el.classList.add('active');
        const titles = { dashboard: 'Dashboard', inventory: 'Raw Materials', formulation: 'Formulation', purchaserequest: 'Purchase Requests', suppliers: 'Suppliers', reports: 'Reports', team: 'Team' };
        document.getElementById('page-title').textContent = titles[tab] || tab;

        // Lazy render
        switch (tab) {
            case 'dashboard': window.dashboardModule.render(); break;
            case 'inventory': window.materialModule.renderInventoryTab(); break;
            case 'formulation': window.formulationModule.renderTab(); break;
            case 'purchaserequest': window.prModule.renderTab(); break;
            case 'suppliers': window.supplierModule.renderTab(); break;
            case 'reports': window.reportsModule.render(); break;
            case 'team': window.teamModule.render(); break;
        }
        if (window.innerWidth <= 900) {
            document.getElementById('sidebar').classList.remove('visible');
            document.getElementById('main-content').classList.remove('expanded');
        }
    },

    toggleSidebar() {
        document.getElementById('sidebar').classList.toggle('visible');
        document.getElementById('main-content').classList.toggle('expanded');
    },

    enterApp() {
        const user = window.AppState.user;
        document.getElementById('auth-screen').style.display = 'none';
        document.getElementById('app-screen').style.display = 'block';
        document.getElementById('sidebar-org').textContent = user.organization;
        document.getElementById('user-display-name').textContent = user.username;
        document.getElementById('user-dept-badge').textContent = user.department;
        document.getElementById('user-avatar').textContent = user.username.charAt(0).toUpperCase();
        GridCanvas.draw('cyan');
        this._applyPermissions();
        this.loadAll();
    },

    _applyPermissions() {
        const dept = window.AppState.user.department;
        document.querySelectorAll('.nav-item[data-perm]').forEach(el => {
            el.style.display = Utils.hasPermission(dept, el.dataset.perm) ? '' : 'none';
        });
    },

    async loadAll() {
        await Promise.all([
            window.materialModule.load(),
            window.formulationModule.load(),
            window.supplierModule.load(),
            window.prModule.load(),
        ]);
        this.renderAll();
    },

    renderAll() {
        const active = document.querySelector('.tab-content.active')?.id?.replace('tab-', '');
        if (active) this.showTab(active, document.querySelector('.nav-item.active'));
    }
};
