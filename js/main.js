document.addEventListener('DOMContentLoaded', () => {
    initTypewriter();
    initNavigation();
    initMagneticIcons();
});
function initTypewriter() {
    const phrases = [
        "Creative Developer",
        "Security Researcher",
        "UI/UX Enthusiast",
        "Just Thinking outside the Box.",
        "Don't stop learning.."
    ];
    
    const element = document.getElementById('typed-text');
    if (!element || phrases.length === 0) return;
    
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
function initNavigation() {
    const links = document.querySelectorAll('.social-link');
    
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const url = link.getAttribute('href');
            
            const newWindow = window.open(url, '_blank', 'noopener');
            
            if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
                window.location.href = url;
            }
        });
        
    });
}
function initMagneticIcons() {
    document.querySelectorAll('.social-link').forEach(link => {
        link.addEventListener('mousemove', (e) => {
            const rect = link.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            const icon = link.querySelector('i, svg');
            if (icon) {
                icon.style.transform = `translate(${x * 0.2}px, ${y * 0.1}px) scale(1.20)`;
            }
        });
        link.addEventListener('mouseleave', () => {
            const icon = link.querySelector('i, svg');
            if (icon) {
                icon.style.transform = '';
            }
        });
        link.addEventListener('touchstart', () => {
            if (navigator.vibrate) navigator.vibrate(15);
        }, { passive: true });
    });
}
