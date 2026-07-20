window.SessionCache = {
    KEY: 'erp_session_cache',
    TTL: 7 * 24 * 60 * 60 * 1000, // 7 days in ms

    set(token, user) {
        const entry = { token, user, timestamp: Date.now() };
        localStorage.setItem(this.KEY, JSON.stringify(entry));
    },

    get() {
        try {
            const raw = localStorage.getItem(this.KEY);
            if (!raw) return null;
            const entry = JSON.parse(raw);
            if (Date.now() - entry.timestamp > this.TTL) {
                this.clear();
                return null;
            }
            return entry;
        } catch { return null; }
    },

    clear() { localStorage.removeItem(this.KEY); },

    isValid() {
        const e = this.get();
        return e && e.token && e.user;
    }
};
