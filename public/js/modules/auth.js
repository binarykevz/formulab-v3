window.authModule = {
    init() {
        document.getElementById('login-form').addEventListener('submit', e => { e.preventDefault(); this.doLogin(); });
        document.getElementById('register-form').addEventListener('submit', e => { e.preventDefault(); this.doRegister(); });
    },

    showForm(type) {
        document.getElementById('login-form').classList.toggle('active', type === 'login');
        document.getElementById('register-form').classList.toggle('active', type === 'register');
        this._hideStatus();
    },

    _showStatus(msg, type) {
        const el = document.getElementById('auth-status-msg');
        el.textContent = msg;
        el.className = type;
    },
    _hideStatus() { const el = document.getElementById('auth-status-msg'); el.className = ''; el.style.display = 'none'; },

    async doLogin() {
        const id = document.getElementById('login-id').value;
        const pw = document.getElementById('login-pw').value;
        try {
            const res = await API.login(id, pw);
            GridCanvas.draw('green');
            this._showStatus('Login successful!', 'success');
            SessionCache.set(res.token, res.user);
            window.AppState.user = res.user;
            window.AppState.token = res.token;
            setTimeout(() => window.AppNav.enterApp(), 600);
        } catch (e) {
            GridCanvas.draw('red');
            this._showStatus(e.message, 'error');
            setTimeout(() => GridCanvas.draw('cyan'), 2000);
        }
    },

    async doRegister() {
        const pw = document.getElementById('reg-pw').value;
        const pw2 = document.getElementById('reg-pw2').value;
        if (pw !== pw2) { this._showStatus('Passwords do not match.', 'error'); return; }
        try {
            await API.register({
                username: document.getElementById('reg-username').value,
                email: document.getElementById('reg-email').value,
                password: pw,
                organization: document.getElementById('reg-org').value,
                department: document.getElementById('reg-dept').value,
            });
            GridCanvas.draw('green');
            this._showStatus('Account created! You can now login.', 'success');
            setTimeout(() => { this.showForm('login'); GridCanvas.draw('cyan'); }, 2000);
        } catch (e) {
            GridCanvas.draw('red');
            this._showStatus(e.message, 'error');
            setTimeout(() => GridCanvas.draw('cyan'), 2000);
        }
    },

    logout() {
        SessionCache.clear();
        window.AppState.user = null;
        window.AppState.token = null;
        document.getElementById('app-screen').style.display = 'none';
        document.getElementById('auth-screen').style.display = 'flex';
        document.getElementById('login-id').value = '';
        document.getElementById('login-pw').value = '';
        this.showForm('login');
        GridCanvas.draw('cyan');
    },

    restore() {
        const cache = SessionCache.get();
        if (cache?.token && cache?.user) {
            window.AppState.user = cache.user;
            window.AppState.token = cache.token;
            return true;
        }
        return false;
    }
};
