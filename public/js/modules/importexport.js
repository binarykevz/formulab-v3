window.importExport = {
    _pending: [],

    openImport() {
        this._pending = [];
        document.getElementById('import-preview').innerHTML = '';
        document.getElementById('confirm-import-btn').disabled = true;
        document.getElementById('import-progress').style.display = 'none';
        document.getElementById('file-input').value = '';
        modal.open('import-modal');
    },

    handleFile(event) {
        const file = event.target.files[0];
        if (!file) return;
        const fill = document.getElementById('progress-fill');
        const prog = document.getElementById('import-progress');
        prog.style.display = 'block';
        fill.style.width = '30%';

        const reader = new FileReader();
        reader.onload = (e) => {
            fill.style.width = '60%';
            try {
                const data = new Uint8Array(e.target.result);
                const wb = XLSX.read(data, { type: 'array' });
                const json = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
                fill.style.width = '100%';

                this._pending = json.map(row => ({
                    name: row['Material Name'] || row['Name'] || row['name'] || row['Raw Material'] || '',
                    code: row['Code'] || row['Material Code'] || '',
                    price: parseFloat(row['Price'] || row['Price per kg'] || 0),
                    amountPerSachet: parseFloat(row['Amount per Sachet'] || row['sachet'] || 0),
                    qtyBulk: parseFloat(row['Qty in Bulk'] || row['Quantity'] || row['qty'] || 0),
                    supplier: row['Supplier'] || row['supplier'] || '',
                })).filter(m => m.name);

                if (!this._pending.length) {
                    document.getElementById('import-preview').innerHTML = '<p style="color:var(--accent-red)"><i class="fas fa-exclamation-triangle"></i> No valid data found.</p>';
                    return;
                }

                const { esc, fmt, calcUnitCost } = Utils;
                document.getElementById('import-preview').innerHTML = `
                    <p style="color:var(--accent-green);margin-bottom:12px"><i class="fas fa-check-circle"></i> Found <strong>${this._pending.length}</strong> materials</p>
                    <div class="table-wrap" style="max-height:250px;overflow-y:auto"><table>
                        <thead><tr><th>Name</th><th>Code</th><th>Price</th><th>Sachet</th><th>Qty</th><th>Unit Cost</th></tr></thead>
                        <tbody>${this._pending.map(m => `<tr><td>${esc(m.name)}</td><td>${esc(m.code)}</td><td>${fmt(m.price)}</td>
                            <td>${m.amountPerSachet}g</td><td>${m.qtyBulk}kg</td>
                            <td style="font-family:'JetBrains Mono',monospace;color:var(--accent-cyan)">${fmt(calcUnitCost(m.price, m.qtyBulk))}</td></tr>`).join('')}</tbody></table></div>`;
                document.getElementById('confirm-import-btn').disabled = false;
            } catch (err) {
                document.getElementById('import-preview').innerHTML = `<p style="color:var(--accent-red)"><i class="fas fa-exclamation-triangle"></i> ${err.message}</p>`;
            }
        };
        reader.readAsArrayBuffer(file);
    },

    async confirm() {
        for (const m of this._pending) {
            try { await API.createMaterial(m); } catch {}
        }
        this._pending = [];
        modal.close('import-modal');
        await window.materialModule.load();
        window.AppNav.renderAll();
    },

    exportExcel() {
        const mats = window.materialModule._materials;
        if (!mats.length) { alert('No materials to export.'); return; }
        const { fmt, calcUnitCost } = Utils;
        const data = mats.map(m => ({
            'Material Name': m.name, 'Code': m.code, 'Price per kg': m.price,
            'Amount per Sachet': m.amount_per_sachet, 'Qty in Bulk': m.qty_bulk,
            'Supplier': m.supplier, 'Unit Cost': calcUnitCost(m.price, m.qty_bulk).toFixed(4),
        }));
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Materials');
        XLSX.writeFile(wb, `materials_${new Date().toISOString().slice(0, 10)}.xlsx`);
    }
};

// Drag & drop for upload zone
document.addEventListener('DOMContentLoaded', () => {
    const uz = document.getElementById('upload-zone');
    if (uz) {
        uz.addEventListener('click', () => document.getElementById('file-input').click());
        uz.addEventListener('dragover', e => { e.preventDefault(); uz.style.borderColor = 'var(--accent-cyan)'; });
        uz.addEventListener('dragleave', () => { uz.style.borderColor = 'var(--border)'; });
        uz.addEventListener('drop', e => {
            e.preventDefault(); uz.style.borderColor = 'var(--border)';
            if (e.dataTransfer.files.length) {
                document.getElementById('file-input').files = e.dataTransfer.files;
                window.importExport.handleFile({ target: { files: [e.dataTransfer.files] } });
            }
        });
    }
});
