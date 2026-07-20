window.reportsModule = {
    render() {
        const mats = window.materialModule._materials;
        const prs = window.prModule._prs;
        const { fmt, calcUnitCost } = Utils;

        const totalQty = mats.reduce((s, m) => s + parseFloat(m.qty_bulk || 0), 0);
        const avgUC = mats.length ? mats.reduce((s, m) => s + calcUnitCost(m.price, m.qty_bulk), 0) / mats.length : 0;
        const maxS = mats.reduce((s, m) => s + (m.qty_bulk * 1000 / (m.amount_per_sachet || 1)), 0);
        const approved = prs.filter(p => p.status === 'approved' || p.status === 'received').length;

        document.getElementById('tab-reports').innerHTML = `
            <div class="stats-grid">
                <div class="stat-card sc-blue"><div class="sc-icon"><i class="fas fa-weight-hanging"></i></div><div class="sc-data"><h3>${totalQty.toFixed(1)} kg</h3><p>Total Quantity</p></div></div>
                <div class="stat-card sc-cyan"><div class="sc-icon"><i class="fas fa-coins"></i></div><div class="sc-data"><h3>${fmt(avgUC)}</h3><p>Avg Unit Cost</p></div></div>
                <div class="stat-card sc-amber"><div class="sc-icon"><i class="fas fa-pills"></i></div><div class="sc-data"><h3>${Math.floor(maxS).toLocaleString()}</h3><p>Max Sachets</p></div></div>
                <div class="stat-card sc-green"><div class="sc-icon"><i class="fas fa-check-double"></i></div><div class="sc-data"><h3>${approved}</h3><p>Approved PRs</p></div></div>
            </div>
            <div class="card"><div class="card-header"><h3><i class="fas fa-chart-pie"></i> Cost Breakdown</h3></div>
            <div class="card-body"><div class="table-wrap"><table><thead><tr><th>Material</th><th>Unit Cost</th><th>Qty</th><th>Value</th><th>Share</th></tr></thead><tbody>${this._rows(mats)}</tbody></table></div></div></div>`;
    },

    _rows(mats) {
        const { esc, fmt, calcUnitCost } = Utils;
        const totalVal = mats.reduce((s, m) => s + m.price * m.qty_bulk, 0);
        if (!mats.length) return '<tr><td colspan="5"><div class="empty-state"><p>No data</p></div></td></tr>';
        return mats.map(m => {
            const val = m.price * m.qty_bulk;
            const pct = totalVal > 0 ? (val / totalVal * 100) : 0;
            return `<tr><td><strong>${esc(m.name)}</strong></td>
                <td style="font-family:'JetBrains Mono',monospace">${fmt(calcUnitCost(m.price, m.qty_bulk))}</td>
                <td>${m.qty_bulk} kg</td><td>${fmt(val)}</td>
                <td><div style="display:flex;align-items:center;gap:8px">
                    <div style="flex:1;height:6px;background:var(--bg-input);border-radius:3px;overflow:hidden;min-width:80px">
                        <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,var(--accent-blue),var(--accent-cyan));border-radius:3px"></div>
                    </div><span style="font-family:'JetBrains Mono',monospace;font-size:11px">${pct.toFixed(1)}%</span></div></td></tr>`;
        }).join('');
    }
};
