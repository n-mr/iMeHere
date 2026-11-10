document.addEventListener('DOMContentLoaded', () => {
    initTypewriter();
    initCardHaptics();
    initMagneticIcons();
    initCardSpotlight();
    initDepthTilt();
    initFit();
    initCopyGuard();
});
function initCopyGuard() {
    document.addEventListener('copy', (e) => {
        const t = e.target;
        if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return;
        e.preventDefault();
    });
    document.addEventListener('cut', (e) => {
        const t = e.target;
        if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return;
        e.preventDefault();
    });
    document.addEventListener('dragstart', (e) => {
        if (e.target && e.target.tagName === 'IMG') e.preventDefault();
    });
}
function initCardSpotlight() {
    if (!window.matchMedia('(hover: hover)').matches) return;
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('pointermove', (e) => {
            const rect = card.getBoundingClientRect();
            card.style.setProperty('--mx', (e.clientX - rect.left).toFixed(1) + 'px');
            card.style.setProperty('--my', (e.clientY - rect.top).toFixed(1) + 'px');
        }, { passive: true });
        card.addEventListener('pointerleave', () => {
            card.style.removeProperty('--mx');
            card.style.removeProperty('--my');
        });
    });
}
function initFit() {
    const stage = document.querySelector('.stage');
    const core = document.querySelector('.core');
    if (!stage || !core) return;
    const AIR = 16;
    const MIN = 0.25;
    let frame = 0;
    function measure() {
        frame = 0;
        stage.style.setProperty('--fit', '1');
        const w = Math.max(core.offsetWidth, core.scrollWidth) * 1.02;
        const h = Math.max(core.offsetHeight, core.scrollHeight) * 1.02;
        if (!w || !h) return;
        const availW = window.innerWidth - AIR * 2;
        const availH = window.innerHeight - AIR * 2;
        const scale = Math.min(1, availW / w, availH / h);
        stage.style.setProperty('--fit', Math.max(MIN, scale).toFixed(4));
    }
    function schedule() {
        if (document.hidden) { measure(); return; }
        if (frame) return;
        frame = requestAnimationFrame(measure);
    }
    window.addEventListener('resize', schedule, { passive: true });
    window.addEventListener('orientationchange', schedule);
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(schedule).catch(() => {});
    }
    if ('ResizeObserver' in window) {
        new ResizeObserver(schedule).observe(core);
    }
    measure();
}
function initTypewriter() {
    const phrases = [
        "Creative Developer",
        "Security Researcher",
        "UI/UX Enthusiast",
        "Just Thinking outside the Box.",
        "Don't stop learning.."
    ];
    const element = document.getElementById('typed-text');
    if (!element) return;
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const TYPE_SPEED = 80;
    const ERASE_SPEED = 40;
    const PAUSE_END = 2000;
    const PAUSE_NEW = 500;
    const INITIAL_DELAY = 1500;
    function type() {
        const currentPhrase = phrases[phraseIndex];
        if (isDeleting) {
            element.textContent = currentPhrase.substring(0, charIndex - 1);
            charIndex--;
        } else {
            element.textContent = currentPhrase.substring(0, charIndex + 1);
            charIndex++;
        }
        let speed = isDeleting ? ERASE_SPEED : TYPE_SPEED;
        if (!isDeleting && charIndex === currentPhrase.length) {
            speed = PAUSE_END;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            speed = PAUSE_NEW;
        }
        setTimeout(type, speed);
    }
    setTimeout(type, INITIAL_DELAY);
}
function initCardHaptics() {
    document.querySelectorAll('.card').forEach(link => {
        link.addEventListener('touchstart', () => {
            if (navigator.vibrate) navigator.vibrate(15);
        }, { passive: true });
    });
}
function initMagneticIcons() {
    document.querySelectorAll('.card').forEach(card => {
        const icon = card.querySelector('.card-icon');
        if (!icon) return;
        const ICON_Z = 16;
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            icon.style.transform =
                `translate3d(${x * 0.12}px, ${y * 0.08}px, ${ICON_Z + 4}px) scale(1.06)`;
        });
        card.addEventListener('mouseleave', () => {
            icon.style.transform = `translateZ(${ICON_Z}px)`;
        });
    });
}
function initDepthTilt() {
    const stage = document.querySelector('.stage');
    if (!stage) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(hover: none)').matches) return;
    const MAX_TILT = 6;
    const IDLE_AMPLITUDE = 1.5;
    const LERP = 0.08;
    const EPSILON = 0.0015;
    const IDLE_DELAY = 4000;
    const IDLE_PERIOD = 12000;
    const rtl = getComputedStyle(stage).direction === 'rtl' ? -1 : 1;
    const root = document.documentElement;
    const rectOf = () => stage.getBoundingClientRect();
    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;
    let pointerInside = false;
    let idleMode = false;
    let idleTimer = null;
    let idleStart = 0;
    let frame = null;
    function render() {
        root.style.setProperty('--rx', (-currentY * MAX_TILT).toFixed(3) + 'deg');
        root.style.setProperty('--ry', (currentX * MAX_TILT * rtl).toFixed(3) + 'deg');
        root.style.setProperty('--px', currentX.toFixed(4));
        root.style.setProperty('--py', currentY.toFixed(4));
    }
    function tick(now) {
        if (idleMode) {
            const phase = ((now - idleStart) / IDLE_PERIOD) * Math.PI * 2;
            targetX = Math.sin(phase) * (IDLE_AMPLITUDE / MAX_TILT);
            targetY = Math.cos(phase * 0.7) * (IDLE_AMPLITUDE / MAX_TILT);
        }
        currentX += (targetX - currentX) * LERP;
        currentY += (targetY - currentY) * LERP;
        render();
        const settled = Math.abs(targetX - currentX) < EPSILON
                     && Math.abs(targetY - currentY) < EPSILON;
        if (settled && !idleMode && !pointerInside) {
            frame = null;
            return;
        }
        frame = requestAnimationFrame(tick);
    }
    function start() {
        if (frame === null) frame = requestAnimationFrame(tick);
    }
    function engageIdle() {
        if (pointerInside) return;
        idleMode = true;
        idleStart = performance.now();
        start();
    }
    function onPointerMove(e) {
        if (!pointerInside) {
            pointerInside = true;
            clearTimeout(idleTimer);
        }
        idleMode = false;
        const rect = rectOf();
        if (!rect.width || !rect.height) return;
        targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        targetY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
        targetX = Math.max(-1, Math.min(1, targetX));
        targetY = Math.max(-1, Math.min(1, targetY));
        start();
    }
    function onPointerLeave() {
        pointerInside = false;
        idleMode = false;
        targetX = 0;
        targetY = 0;
        start();
        clearTimeout(idleTimer);
        idleTimer = setTimeout(engageIdle, IDLE_DELAY);
    }
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointercancel', onPointerLeave);
    document.addEventListener('mouseleave', onPointerLeave);
    render();
    idleTimer = setTimeout(engageIdle, IDLE_DELAY);
}
