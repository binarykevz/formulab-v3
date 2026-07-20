window.materialModule = {
    _materials: [],

    async load() { try { this._materials = await API.getMaterials(); } catch { this._materials = []; } },

    render() {
        const q = (document.getElementById('search-inv')?.value || '').toLowerCase();
        const list = this._materials.filter(m => m.name?.toLowerCase().includes(q) || m.code?.toLowerCase().includes(q));
        const tb = document.getElementById('inventory-table');
        if (!list.length) { tb.innerHTML = '<tr><td colspan="8"><div class="empty-state"><i class="fas fa-boxes-stacked"></i><h4>No materials found</h4></div></td></tr>'; return; }
        const { esc, fmt, calcUnitCost } = Utils;
        tb.innerHTML = list.map(m => {
            const uc = calcUnitCost(m.price, m.qty_bulk);
            return `<tr>
                <td><strong>${esc(m.name)}</strong></td>
                <td><span class="badge badge-info">${esc(m.code)}</span></td>
                <td>${fmt(m.price)}</td>
                <td>${m.qty_bulk}</td>
                <td>${m.amount_per_sachet}</td>
                <td>${esc(m.supplier) || 'N/A'}</td>
                <td style="font-family:'JetBrains Mono',monospace;color:var(--accent-cyan)">${fmt(uc)}</td>
                <td><div class="action-btns">
                    <button class="btn-icon" onclick="window.materialModule.edit('${m.id}')" title="Edit"><i class="fas fa-pen"></i></button>
                    <button class="btn-icon" onclick="window.materialModule.remove('${m.id}')" style="color:var(--accent-red)"><i class="fas fa-trash"></i></button>
                </div></td></tr>`;
        }).join('');
    },

    openModal(ctx) {
        document.getElementById('mat-edit-id').value = '';
        document.getElementById('mat-edit-ctx').value = ctx || 'inventory';
        document.getElementById('mat-modal-title').innerHTML = ctx === 'formulation' ? '<i class="fas fa-flask"></i> Add to Formulation' : '<i class="fas fa-box"></i> Add Material';
        ['mat-name', 'mat-code', 'mat-price', 'mat-qty'].forEach(id => document.getElementById(id).value = '');
        document.getElementById('mat-sachet').value = '0';
        document.getElementById('auto-uc').textContent = '$0.0000';
        this._populateSuppliers();
        modal.open('material-modal');
    },

    _populateSuppliers() {
        const sel = document.getElementById('mat-supplier');
        sel.innerHTML = '<option value="">Select</option>' + window.supplierModule._suppliers.map(s => `<option value="${Utils.esc(s.name)}">${Utils.esc(s.name)}</option>`).join('');
    },

    updateAutoCost() {
        const p = parseFloat(document.getElementById('mat-price').value) || 0;
        const q = parseFloat(document.getElementById('mat-qty').value) || 0;
        document.getElementById('auto-uc').textContent = Utils.fmt(Utils.calcUnitCost(p, q));
    },

    async save() {
        const id = document.getElementById('mat-edit-id').value;
        const ctx = document.getElementById('mat-edit-ctx').value;
        const data = {
            name: document.getElementById('mat-name').value.trim(),
            code: document.getElementById('mat-code').value.trim(),
            price: parseFloat(document.getElementById('mat-price').value) || 0,
            qtyBulk: parseFloat(document.getElementById('mat-qty').value) || 0,
            amountPerSachet: parseFloat(document.getElementById('mat-sachet').value) || 0,
            supplier: document.getElementById('mat-supplier').value,
        };
        if (!data.name || !data.code) { alert('Name and code required.'); return; }

        try {
            if (ctx === 'formulation') {
                await API.createFormulation(data);
            } else if (id) {
                await API.updateMaterial(id, data);
            } else {
                await API.createMaterial(data);
            }
             modal.close('material-modal');
        await this.load();
        window.formulationModule._formulations = await API.getFormulations();
        window.AppNav.renderAll();
        window.AppNav.refreshCurrent();
    } catch (e) { alert(e.message); }
},

edit(id) {
        const m = this._materials.find(x => x.id === id);
        if (!m) return;
        document.getElementById('mat-edit-id').value = m.id;
        document.getElementById('mat-edit-ctx').value = 'inventory';
        document.getElementById('mat-modal-title').innerHTML = '<i class="fas fa-pen"></i> Edit Material';
        document.getElementById('mat-name').value = m.name;
        document.getElementById('mat-code').value = m.code;
        document.getElementById('mat-price').value = m.price;
        document.getElementById('mat-qty').value = m.qty_bulk;
        document.getElementById('mat-sachet').value = m.amount_per_sachet || 0;
        this._populateSuppliers();
        document.getElementById('mat-supplier').value = m.supplier || '';
        this.updateAutoCost();
        modal.open('material-modal');
    },

    async remove(id) {
    if (!confirm('Remove from formulation?')) return;
    await API.deleteFormulation(id);
    await this.load(); window.AppNav.renderAll();
    await this.load(); window.AppNav.refreshCurrent();
},

exportPDF() {
    const { fmt, calcUnitCost, calcSachetCost, esc } = Utils;

    renderInventoryTab() {
        const { esc, fmt, calcUnitCost } = Utils;
        document.getElementById('tab-inventory').innerHTML = `
            <div class="card"><div class="card-header"><h3><i class="fas fa-boxes-stacked"></i> Raw Materials Inventory</h3>
            <div class="card-actions"><div class="search-box"><i class="fas fa-search"></i><input type="text" class="form-control" placeholder="Search..." id="search-inv" oninput="window.materialModule.render()"></div>
            <button class="btn btn-cyan" onclick="window.materialModule.openModal()"><i class="fas fa-plus"></i> Add</button></div></div>
            <div class="card-body"><div class="table-wrap"><table><thead><tr><th>Name</th><th>Code</th><th>Price/kg</th><th>Qty Bulk</th><th>Sachet(g)</th><th>Supplier</th><th>Unit Cost</th><th>Actions</th></tr></thead><tbody id="inventory-table"></tbody></table></div></div></div>`;
        this.render();
    }
};
