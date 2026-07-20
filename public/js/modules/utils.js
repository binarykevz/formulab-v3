window.Utils = {
    genId: () => Date.now().toString(36) + Math.random().toString(36).substr(2, 9),
    esc(s) { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; },
    fmt(v) { return '$' + parseFloat(v || 0).toFixed(4); },
    calcUnitCost(price, qty) { return (!qty || qty === 0) ? 0 : (price * 1000) / qty; },
    calcSachetCost(amt, uc) { return amt * 1000 * uc; },
    hasPermission(dept, feature) {
        const perms = {
            inventory: ['inventory', 'purchasing', 'management', 'production', 'qa'],
            formulation: ['r&d', 'qa', 'production', 'management'],
            purchaseRequest: ['qa', 'r&d', 'marketing', 'production', 'purchasing', 'inventory', 'management'],
            purchaseApprove: ['purchasing', 'management'],
            suppliers: ['purchasing', 'inventory', 'management'],
            reports: ['management', 'qa', 'purchasing'],
        };
        return (perms[feature] || []).includes(dept?.toLowerCase());
    }
};
