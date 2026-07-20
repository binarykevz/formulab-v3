// ═══ APP ENTRY POINT ═══
window.AppState = { user: null, token: null };

document.addEventListener('DOMContentLoaded', () => {
    GridCanvas.init();
    window.authModule.init();

    if (window.authModule.restore()) {
        window.AppNav.enterApp();
    }

    // Chat poll every 3s
    setInterval(() => window.chatModule.poll(), 3000);
});
