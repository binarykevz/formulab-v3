window.chatModule = {
    _open: false,
    _lastCount: 0,

    toggle() {
        this._open = !this._open;
        document.getElementById('chat-panel').classList.toggle('open', this._open);
        if (this._open) { this.render(); document.getElementById('chat-badge').classList.remove('visible'); }
    },

    async render() {
        try {
            const msgs = await API.getMessages();
            const container = document.getElementById('chat-messages');
            const user = window.AppState.user;
            const { esc } = Utils;
            container.innerHTML = msgs.map(m => {
                const isMe = m.username === user.username;
                const time = new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                return `<div class="chat-msg ${isMe ? 'outgoing' : 'incoming'}">
                    <div class="msg-header"><span class="msg-dept">${esc(m.department)}</span><span class="msg-user">${esc(m.username)}</span><span class="msg-time">${time}</span></div>
                    <div class="msg-text">${esc(m.text)}</div></div>`;
            }).join('');
            container.scrollTop = container.scrollHeight;
        } catch (e) { console.error('Chat render error:', e); }
    },

    async send() {
        const input = document.getElementById('chat-input');
        const text = input.value.trim();
        if (!text) return;
        try { await API.sendMessage(text); input.value = ''; this.render(); } catch (e) { console.error(e); }
    },

    poll() {
        if (!window.AppState.user) return;
        API.getMessages().then(msgs => {
            if (msgs.length > this._lastCount && !this._open) {
                const badge = document.getElementById('chat-badge');
                badge.textContent = msgs.length - this._lastCount;
                badge.classList.add('visible');
            }
            this._lastCount = msgs.length;
            if (this._open) this.render();
        }).catch(() => {});
    }
};
