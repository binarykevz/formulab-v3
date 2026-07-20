window.API = {
    base: '/api',

    async request(method, path, body) {
        const opts = { method, headers: { 'Content-Type': 'application/json' } };
        const cache = window.SessionCache.get();
        if (cache?.token) opts.headers['Authorization'] = 'Bearer ' + cache.token;
        if (body) opts.body = JSON.stringify(body);
        const res = await fetch(this.base + path, opts);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Request failed');
        return data;
    },

    // Auth
    login: (identifier, password) => window.API.request('POST', '/auth/login', { identifier, password }),
    register: (d) => window.API.request('POST', '/auth/register', d),

    // Materials
    getMaterials: () => window.API.request('GET', '/materials'),
    createMaterial: (d) => window.API.request('POST', '/materials', d),
    updateMaterial: (id, d) => window.API.request('PUT', '/materials/' + id, d),
    deleteMaterial: (id) => window.API.request('DELETE', '/materials/' + id),

    // Formulations
    getFormulations: () => window.API.request('GET', '/formulations'),
    createFormulation: (d) => window.API.request('POST', '/formulations', d),
    deleteFormulation: (id) => window.API.request('DELETE', '/formulations/' + id),

    // Suppliers
    getSuppliers: () => window.API.request('GET', '/suppliers'),
    createSupplier: (d) => window.API.request('POST', '/suppliers', d),
    deleteSupplier: (id) => window.API.request('DELETE', '/suppliers/' + id),

    // Purchase Requests
    getPRs: () => window.API.request('GET', '/purchase-requests'),
    createPR: (d) => window.API.request('POST', '/purchase-requests', d),
    updatePRStatus: (id, status) => window.API.request('PATCH', '/purchase-requests/' + id + '/status', { status }),
    getPRHistory: (id) => window.API.request('GET', '/purchase-requests/' + id + '/history'),

    // Chat
    getMessages: (since) => window.API.request('GET', '/chat?since=' + encodeURIComponent(since || '')),
    sendMessage: (text) => window.API.request('POST', '/chat', { text }),

    // Team
    getTeam: () => window.API.request('GET', '/team'),
};
