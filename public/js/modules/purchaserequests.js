window.prModule = {
    _prs: [],
    _filter: 'all',

    async load() { try { this._prs = await API.getPRs(); } catch { this._prs = []; } },

    render() {
        const { esc } = Utils;
        const user = window.AppState.user;
        const canApprove = Utils.hasPermission(user.department, 'purchaseApprove');

        // Filter bar
        const statuses = ['all', 'pending', 'approved', 'rejected', 'arrival', 'received'];
        document.getElementById('pr-filter-bar').innerHTML = statuses.map(s => {
            const label = s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1);
            const cnt = s === 'all' ? this._prs.length : this._prs.filter(p => p.status === s).length;
            return `<button class="${s === this._filter ? 'active' : ''}" onclick="window.prModule.setFilter('${s}')">${label} (${cnt})</button>`;
        }).join('');

        let prs = this._filter === 'all' ? this._prs : this._prs.filter(p => p.status === this._filter);

        const tb = document.getElementById('pr-table');
        if (!prs.length) { tb.innerHTML = '<tr><td colspan="10"><div class="empty-state"><i class="fas fa-cart-shopping"></i><h4>No requests</h4></div></td></tr>'; return; }

        tb.innerHTML = prs.map(p => {
            let actions = `<button class="btn btn-sm btn-ghost" onclick="window.prModule.view(${p.id})"><i class="fas fa-eye"></i></button>`;
            if (canApprove && p.status === 'pending') {
                actions += ` <button class="btn btn-sm btn-green" onclick="window.prModule.quickStatus(${p.id},'approved')"><i class="fas fa-check"></i></button>`;
                actions += ` <button class="btn btn-sm btn-red" onclick="window.prModule.quickStatus(${p.id},'rejected')"><i class="fas fa-xmark"></i></button>`;
            }
            if (canApprove && p.status === 'approved') actions += ` <button class="btn btn-sm btn-amber" onclick="window.prModule.quickStatus(${p.id},'arrival')"><i class="fas fa-ship"></i></button>`;
            if (canApprove && p.status === 'arrival') actions += ` <button class="btn btn-sm btn-cyan" onclick="window.prModule.quickStatus(${p.id},'received')"><i class="fas fa-box-open"></i></button>`;

            return `<tr>
                <td style="font-family:'JetBrains Mono',monospace;color:var(--accent-cyan)">#${p.id}</td>
                <td><strong>${esc(p.material_name)}</strong></td>
                <td><span class="badge badge-info">${esc(p.material_code)}</span></td>
                <td>${p.quantity} ${esc(p.unit)}</td>
                <td style="max-width:140px;overflow:hidden;text-overflow:ellipsis">${esc(p.reason) || '-'}</td>
                <td>${esc(p.requested_by)}</td>
                <td><span class="dept-badge" style="font-size:10px">${esc(p.requestor_dept)}</span></td>
                <td>${new Date(p.created_at).toLocaleDateString()}</td>
                <td><span class="badge badge-${p.status}">${p.status}</span></td>
                <td><div class="action-btns">${actions}</div></td></tr>`;
        }).join('');
    },

    renderTab() {
        document.getElementById('tab-purchaserequest').innerHTML = `
            <div class="card"><div class="card-header"><h3><i class="fas fa-cart-shopping"></i> Purchase Requests</h3>
            <button class="btn btn-cyan" onclick="window.prModule.openModal()"><i class="fas fa-plus"></i> New Request</button></div>
            <div class="card-body">
                <div class="status-filter" id="pr-filter-bar"></div>
                <div class="table-wrap"><table><thead><tr><th>PR #</th><th>Material</th><th>Code</th><th>Qty</th><th>Reason</th><th>By</th><th>Dept</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead><tbody id="pr-table"></tbody></table></div>
            </div></div>`;
        this.render();
    },

    setFilter(s) { this._filter = s; this.render(); },

    openModal() { ['pr-mat-name', 'pr-mat-code', 'pr-qty', 'pr-reason'].forEach(id => document.getElementById(id).value = ''); modal.open('pr-modal'); },

    async submit() {
        const name = document.getElementById('pr-mat-name').value.trim();
        const qty = parseFloat(document.getElementById('pr-qty').value);
        if (!name || !qty) { alert('Material name and quantity required.'); return; }
        await API.createPR({
            materialName: name, materialCode: document.getElementById('pr-mat-code').value.trim(),
            quantity: qty, unit: document.getElementById('pr-unit').value, reason: document.getElementById('pr-reason').value.trim(),
        });
        modal.close('pr-modal');
        await this.load(); window.AppNav.renderAll();
    },

    async quickStatus(id, status) {
        await API.updatePRStatus(id, status);
        await this.load(); window.AppNav.renderAll();
    },

    async view(id) {
        const p = this._prs.find(x => x.id === id);
        if (!p) return;
        const { esc } = Utils;
        const user = window.AppState.user;
        const canApprove = Utils.hasPermission(user.department, 'purchaseApprove');

        document.getElementById('prd-title').innerHTML = `<i class="fas fa-file-lines"></i> PR #${p.id}`;
        document.getElementById('prd-body').innerHTML = `
            <div class="detail-grid">
                <div class="detail-item"><label>Material</label><span>${esc(p.material_name)}</span></div>
                <div class="detail-item"><label>Code</label><span>${esc(p.material_code)}</span></div>
                <div class="detail-item"><label>Qty</label><span>${p.quantity} ${esc(p.unit)}</span></div>
                <div class="detail-item"><label>Status</label><span class="badge badge-${p.status}">${p.status}</span></div>
                <div class="detail-item"><label>By</label><span>${esc(p.requested_by)}</span></div>
                <div class="detail-item"><label>Dept</label><span>${esc(p.requestor_dept)}</span></div>
                <div class="detail-item"><label>Date</label><span>${new Date(p.created_at).toLocaleString()}</span></div>
                <div class="detail-item"><label>Reason</label><span>${esc(p.reason) || 'N/A'}</span></div>
            </div><h4 style="margin-bottom:12px"><i class="fas fa-clock-rotate-left" style="color:var(--accent-cyan)"></i> History</h4>
            <ul class="history-timeline" id="prd-history"></ul>`;

        try {
            const history = await API.getPRHistory(id);
            document.getElementById('prd-history').innerHTML = history.map(h => `<li>
                <span class="h-status badge badge-${h.status}">${h.status}</span>
                <div class="h-meta">by ${esc(h.changed_by)} at ${new Date(h.changed_at).toLocaleString()}</div></li>`).join('');
        } catch { document.getElementById('prd-history').innerHTML = '<li>No history</li>'; }

        let footer = `<button class="btn btn-ghost" onclick="modal.close('pr-detail-modal')">Close</button>`;
        if (canApprove && p.status === 'pending') {
            footer += `<button class="btn btn-green" onclick="window.prModule.quickStatus(${p.id},'approved');modal.close('pr-detail-modal')"><i class="fas fa-check"></i> Approve</button>`;
            footer += `<button class="btn btn-red" onclick="window.prModule.quickStatus(${p.id},'rejected');modal.close('pr-detail-modal')"><i class="fas fa-xmark"></i> Reject</button>`;
        }
        if (canApprove && p.status === 'approved') footer += `<button class="btn btn-amber" onclick="window.prModule.quickStatus(${p.id},'arrival');modal.close('pr-detail-modal')"><i class="fas fa-ship"></i> Arrival</button>`;
        if (canApprove && p.status === 'arrival') footer += `<button class="btn btn-cyan" onclick="window.prModule.quickStatus(${p.id},'received');modal.close('pr-detail-modal')"><i class="fas fa-box-open"></i> Received</button>`;
        document.getElementById('prd-footer').innerHTML = footer;
        modal.open('pr-detail-modal');
    }
};
