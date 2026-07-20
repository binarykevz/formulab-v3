window.supplierModule = {
    _suppliers: [],

    async load() { try { this._suppliers = await API.getSuppliers(); } catch { this._suppliers = []; } },

    render() {
        const { esc } = Utils;
        const tb = document.getElementById('supplier-table');
        if (!this._suppliers.length) { tb.innerHTML = '<tr><td colspan="6"><div class="empty-state"><i class="fas fa-truck"></i><h4>No suppliers</h4></div></td></tr>'; return; }
        tb.innerHTML = this._suppliers.map(s => `<tr>
            <td><strong>${esc(s.name)}</strong></td><td>${esc(s.contact) || '-'}</td>
            <td>${esc(s.email) || '-'}</td><td>${esc(s.phone) || '-'}</td>
            <td><span class="badge badge-info">materials</span></td>
            <td><button class="btn-icon" onclick="window.supplierModule.remove('${s.id}')" style="color:var(--accent-red)"><i class="fas fa-trash"></i></button></td>
        </tr>`).join('');
    },

    renderTab() {
        document.getElementById('tab-suppliers').innerHTML = `
            <div class="card"><div class="card-header"><h3><i class="fas fa-truck"></i> Suppliers</h3>
            <button class="btn btn-cyan" onclick="window.supplierModule.openModal()"><i class="fas fa-plus"></i> Add</button></div>
            <div class="card-body"><div class="table-wrap"><table><thead><tr><th>Name</th><th>Contact</th><th>Email</th><th>Phone</th><th>Materials</th><th>Actions</th></tr></thead><tbody id="supplier-table"></tbody></table></div></div></div>`;
        this.render();
    },

    openModal() { ['sup-name', 'sup-contact', 'sup-email', 'sup-phone'].forEach(id => document.getElementById(id).value = ''); modal.open('supplier-modal'); },

    async save() {
        const name = document.getElementById('sup-name').value.trim();
        if (!name) { alert('Name required.'); return; }
        await API.createSupplier({ name, contact: document.getElementById('sup-contact').value, email: document.getElementById('sup-email').value, phone: document.getElementById('sup-phone').value });
        modal.close('supplier-modal');
        await this.load(); window.AppNav.renderAll();
    },

    async remove(id) {
        if (!confirm('Delete supplier?')) return;
        await API.deleteSupplier(id);
        await this.load(); window.AppNav.renderAll();
    }
};
