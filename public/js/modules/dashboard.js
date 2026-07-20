window.dashboardModule = {
    render() {
        const mats = window.materialModule._materials;
        const forms = window.formulationModule._formulations;
        const prs = window.prModule._prs;
        const sups = window.supplierModule._suppliers;
        const { esc, fmt, calcUnitCost } = Utils;

        document.getElementById('tab-dashboard').innerHTML = `
            <div class="stats-grid">
                <div class="stat-card sc-blue"><div class="sc-icon"><i class="fas fa-boxes-stacked"></i></div><div class="sc-data"><h3>${mats.length}</h3><p>Raw Materials</p></div></div>
                <div class="stat-card sc-cyan"><div class="sc-icon"><i class="fas fa-flask"></i></div><div class="sc-data"><h3>${forms.length}</h3><p>Formulations</p></div></div>
                <div class="stat-card sc-amber"><div class="sc-icon"><i class="fas fa-cart-shopping"></i></div><div class="sc-data"><h3>${prs.filter(p=>p.status==='pending').length}</h3><p>Pending PRs</p></div></div>
                <div class="stat-card sc-green"><div class="sc-icon"><i class="fas fa-truck"></i></div><div class="sc-data"><h3>${sups.length}</h3><p>Suppliers</p></div></div>
                <div class="stat-card sc-purple"><div class="sc-icon"><i class="fas fa-dollar-sign"></i></div><div class="sc-data"><h3>${fmt(mats.reduce((s,m)=>s+m.price*m.qty_bulk,0))}</h3><p>Inventory Value</p></div></div>
                <div class="stat-card sc-red"><div class="sc-icon"><i class="fas fa-receipt"></i></div><div class="sc-data"><h3>${prs.length}</h3><p>Total Requests</p></div></div>
            </div>
            <div class="grid-2">
                <div class="card"><div class="card-header"><h3><i class="fas fa-clock-rotate-left"></i> Recent PRs</h3></div><div class="card-body">${this._prList(prs)}</div></div>
                <div class="card"><div class="card-header"><h3><i class="fas fa-boxes-stacked"></i> Recent Materials</h3></div><div class="card-body">${this._matList(mats)}</div></div>
            </div>`;
    },
    _prList(prs) {
        if (!prs.length) return '<div class="empty-state"><p>No requests yet</p></div>';
        return prs.slice(0, 5).map(p => `<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border)">
            <div><strong>#${p.id}</strong> ${Utils.esc(p.material_name)}</div>
            <span class="badge badge-${p.status}">${p.status}</span></div>`).join('');
    },
    _matList(mats) {
        if (!mats.length) return '<div class="empty-state"><p>No materials yet</p></div>';
        return mats.slice(0, 5).map(m => `<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border)">
            <div><strong>${Utils.esc(m.name)}</strong> <span class="badge badge-info">${Utils.esc(m.code)}</span></div>
            <span style="color:var(--accent-cyan);font-family:'JetBrains Mono',monospace;font-size:12px">${Utils.fmt(Utils.calcUnitCost(m.price, m.qty_bulk))}</span></div>`).join('');
    }
};
