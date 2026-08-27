export function fireConfetti() {
    chrome.storage.local.get(['boostStickersEnabled'], data => {
        if (data.boostStickersEnabled !== false) launchSimpleConfetti();
    });
    return;

    const count = 200;
    const defaults = {
        origin: { y: 0.7 }
    };

    function fire(particleRatio, opts) {
        confetti(Object.assign({}, defaults, opts, {
            particleCount: Math.floor(count * particleRatio)
        }));
    }

    // We need a confetti library. Since we can't easily npm install in this environment without a build step active,
    // we will implement a simple canvas-based confetti here or expect the 'canvas-confetti' library to be present.
    // BUT: The user environment is static files. I should write a simple raw JS confetti implementation or download one.
    // Let's write a simple lightweight one to avoid dependency hell.

    launchSimpleConfetti();
}

function launchSimpleConfetti() {
    document.getElementById('focus-boost-sticker')?.remove();
    if (!document.getElementById('focus-boost-sticker-style')) {
        const style = document.createElement('style');
        style.id = 'focus-boost-sticker-style';
        style.textContent = `@font-face { font-family:'Next Bravo'; src:url('${chrome.runtime.getURL('assets/fonts/Next Bravo.ttf')}') format('truetype'); font-display:swap; } @keyframes focusBoostSticker { 0% { opacity:0; transform:translateY(42px) scale(.84) rotate(-4deg); } 12% { opacity:1; transform:translateY(0) scale(1.04) rotate(0); } 68% { opacity:1; transform:translateY(-280px) scale(1); } 100% { opacity:0; transform:translateY(-520px) scale(.90); } }`;
        document.head.appendChild(style);
    }
    const sticker = document.createElement('div');
    sticker.id = 'focus-boost-sticker';
    sticker.style.cssText = "position:fixed;right:18px;bottom:20px;z-index:9999;pointer-events:none;text-align:right;color:#ffe7a7;font-family:'Next Bravo';line-height:.78;letter-spacing:-.05em;text-shadow:3px 3px 0 #6d3300,0 0 18px rgba(255,151,0,.88);animation:focusBoostSticker 3s cubic-bezier(.18,.82,.25,1) both;";
    sticker.innerHTML = '<span style="display:block;font-size:28px;">YOU</span><span style="display:block;font-size:40px;">DID IT</span>';
    document.body.appendChild(sticker);
    setTimeout(() => sticker.remove(), 3100);
    return;

    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#ffd36e', '#ff9f1c', '#ff6b35', '#7dd3fc'];

    for (let i = 0; i < 70; i++) {
        particles.push({
            x: canvas.width - 8 - Math.random() * 68,
            y: canvas.height + Math.random() * 90,
            vx: Math.random() * 1.2 - .6,
            vy: -(Math.random() * 9 + 15),
            color: colors[Math.floor(Math.random() * colors.length)],
            size: Math.random() * 3 + 2,
            length: Math.random() * 18 + 22
        });
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let active = false;
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            if (p.y > -p.length) active = true;
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 7;
            ctx.fillRect(p.x - p.size / 2, p.y + p.length * .37, p.size, p.length * .63);
            ctx.beginPath();
            ctx.moveTo(p.x - p.size * 2.2, p.y + p.length * .45);
            ctx.lineTo(p.x, p.y);
            ctx.lineTo(p.x + p.size * 2.2, p.y + p.length * .45);
            ctx.closePath();
            ctx.fill();
        });

        if (active) requestAnimationFrame(animate);
        else canvas.remove();
    }
    animate();
}
