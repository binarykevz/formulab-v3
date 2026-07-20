window.GridCanvas = {
    draw(color = 'cyan') {
        const c = document.getElementById('grid-canvas');
        if (!c) return;
        const ctx = c.getContext('2d');
        c.width = window.innerWidth;
        c.height = window.innerHeight;

        const prefix = color === 'red' ? 'rgba(255,61,90,' : color === 'green' ? 'rgba(0,230,118,' : 'rgba(0,212,255,';

        ctx.clearRect(0, 0, c.width, c.height);
        const grad = ctx.createRadialGradient(c.width / 2, c.height / 2, 0, c.width / 2, c.height / 2, c.width * 0.7);
        grad.addColorStop(0, prefix + '0.04)');
        grad.addColorStop(1, 'rgba(4,13,33,1)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, c.width, c.height);

        ctx.strokeStyle = prefix + '0.08)';
        ctx.lineWidth = 1;
        for (let x = 0; x < c.width; x += 50) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, c.height); ctx.stroke(); }
        for (let y = 0; y < c.height; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(c.width, y); ctx.stroke(); }

        ctx.fillStyle = prefix + '0.15)';
        for (let i = 0; i < 30; i++) {
            ctx.beginPath();
            ctx.arc(Math.random() * c.width, Math.random() * c.height, Math.random() * 2 + 1, 0, Math.PI * 2);
            ctx.fill();
        }

        this._currentColor = color;
    },

    // After a feedback color flash, revert to cyan
    flash(color, duration = 2000) {
        this.draw(color);
        setTimeout(() => this.draw('cyan'), duration);
    },

    init() {
        this.draw('cyan');
        window.addEventListener('resize', () => this.draw(this._currentColor || 'cyan'));
    }
};
