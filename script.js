// Navigation scroll effect
const navbar = document.querySelector('.navbar');
const homeSection = document.getElementById('home');

function handleNavbarScroll() {
    const homeHeight = homeSection.offsetHeight;
    const scrollPosition = window.scrollY;
    
    // Add 'scrolled' class when user scrolls past home section
    if (scrollPosition > homeHeight - 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}

// Listen for scroll events
window.addEventListener('scroll', handleNavbarScroll);

// Check on page load
handleNavbarScroll();

// Hex to string helper for typed greeting
function decodeHexString(hex) {
    return hex
        .trim()
        .split(/\s+/)
        .map((byte) => String.fromCharCode(parseInt(byte, 16)))
        .join('');
}

const GREETING_HEX = "48 69 20 65 76 65 72 79 6f 6e 65 2c 20 77 65 6c 63 6f 6d 65 20 74 6f 20 6d 79 20 70 6f 72 74 66 6f 6c 69 6f 2e";
const GREETING_TEXT = decodeHexString(GREETING_HEX);
const HEX_PAIRS = GREETING_HEX.split(' ');

// Typing Animation Configuration
const TYPE_SETTINGS = {
    hexTypingSpeed: 75,
    decryptSpeed: 120,
    deleteSpeed: 50,
    pauseAfterHex: 600,
    pauseAfterPlain: 2000,
    restartDelay: 600
};

// State
let displayedHex = '';
let hexCharIndex = 0;
let decryptIndex = 0;

// DOM Elements
const typedTextElement = document.getElementById('typed-text');
const cursorElement = document.getElementById('cursor');

// Cursor blink animation
function blinkCursor() {
    setInterval(() => {
        cursorElement.style.opacity = 
            cursorElement.style.opacity === '0' ? '1' : '0';
    }, 500);
}

function startTypingCycle() {
    displayedHex = '';
    hexCharIndex = 0;
    decryptIndex = 0;
    if (typedTextElement) {
        typedTextElement.classList.remove('decrypting', 'decrypted');
        typedTextElement.textContent = '';
    }
    typeHex();
}

function typeHex() {
    if (!typedTextElement) return;
    if (hexCharIndex < GREETING_HEX.length) {
        displayedHex += GREETING_HEX[hexCharIndex];
        typedTextElement.textContent = displayedHex;
        hexCharIndex++;
        setTimeout(typeHex, TYPE_SETTINGS.hexTypingSpeed);
    } else {
        setTimeout(() => {
            typedTextElement.classList.add('decrypting');
            startDecrypt();
        }, TYPE_SETTINGS.pauseAfterHex);
    }
}

function startDecrypt() {
    decryptIndex = 0;
    decryptStep();
}

function decryptStep() {
    if (!typedTextElement) return;
    if (decryptIndex < HEX_PAIRS.length) {
        const plainPortion = GREETING_TEXT.slice(0, decryptIndex + 1);
        const remainingPairs = HEX_PAIRS.slice(decryptIndex + 1).join(' ');
        const separator = plainPortion && remainingPairs && !plainPortion.endsWith(' ') ? ' ' : '';
        typedTextElement.textContent = remainingPairs
            ? `${plainPortion}${separator}${remainingPairs}`
            : plainPortion;
        decryptIndex++;
        setTimeout(decryptStep, TYPE_SETTINGS.decryptSpeed);
    } else {
        typedTextElement.textContent = GREETING_TEXT;
        typedTextElement.classList.remove('decrypting');
        typedTextElement.classList.add('decrypted');
        setTimeout(startDeletingPlain, TYPE_SETTINGS.pauseAfterPlain);
    }
}

function startDeletingPlain() {
    if (!typedTextElement) return;
    typedTextElement.classList.remove('decrypting');
    deletePlainStep();
}

function deletePlainStep() {
    if (!typedTextElement) return;
    const current = typedTextElement.textContent;
    if (current.length > 0) {
        typedTextElement.textContent = current.slice(0, -1);
        setTimeout(deletePlainStep, TYPE_SETTINGS.deleteSpeed);
    } else {
        typedTextElement.classList.remove('decrypted');
        setTimeout(startTypingCycle, TYPE_SETTINGS.restartDelay);
    }
}

// Smooth scroll for navigation links
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            targetSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Profile Card Tilt Effect
const cardContainer = document.querySelector('.profile-card-container');
const card = document.querySelector('.profile-card');

// Helper functions for profile card
function clamp(value, min = 0, max = 100) {
    return Math.min(Math.max(value, min), max);
}

function round(value, precision = 3) {
    return parseFloat(value.toFixed(precision));
}

function adjust(value, fromMin, fromMax, toMin, toMax) {
    return round(toMin + ((toMax - toMin) * (value - fromMin)) / (fromMax - fromMin));
}

function easeInOutCubic(x) {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

let rafId = null;

function updateCardTransform(offsetX, offsetY) {
    if (!card || !cardContainer) return;

    const width = card.clientWidth;
    const height = card.clientHeight;

    const percentX = clamp((100 / width) * offsetX);
    const percentY = clamp((100 / height) * offsetY);

    const centerX = percentX - 50;
    const centerY = percentY - 50;

    const properties = {
        '--pointer-x': `${percentX}%`,
        '--pointer-y': `${percentY}%`,
        '--background-x': `${adjust(percentX, 0, 100, 35, 65)}%`,
        '--background-y': `${adjust(percentY, 0, 100, 35, 65)}%`,
        '--pointer-from-center': `${clamp(Math.hypot(percentY - 50, percentX - 50) / 50, 0, 1)}`,
        '--pointer-from-top': `${percentY / 100}`,
        '--pointer-from-left': `${percentX / 100}`,
        '--rotate-x': `${round(-(centerX / 5))}deg`,
        '--rotate-y': `${round(centerY / 4)}deg`
    };

    Object.entries(properties).forEach(([property, value]) => {
        cardContainer.style.setProperty(property, value);
    });
}

function createSmoothAnimation(duration, startX, startY) {
    if (!card || !cardContainer) return;

    const startTime = performance.now();
    const targetX = cardContainer.clientWidth / 2;
    const targetY = cardContainer.clientHeight / 2;

    const animationLoop = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = clamp(elapsed / duration);
        const easedProgress = easeInOutCubic(progress);

        const currentX = adjust(easedProgress, 0, 1, startX, targetX);
        const currentY = adjust(easedProgress, 0, 1, startY, targetY);

        updateCardTransform(currentX, currentY);

        if (progress < 1) {
            rafId = requestAnimationFrame(animationLoop);
        }
    };

    rafId = requestAnimationFrame(animationLoop);
}

function cancelAnimation() {
    if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
    }
}

// Profile Card Event Listeners
if (card && cardContainer) {
    card.addEventListener('pointermove', (event) => {
        const rect = card.getBoundingClientRect();
        updateCardTransform(event.clientX - rect.left, event.clientY - rect.top);
    });

    card.addEventListener('pointerenter', () => {
        cancelAnimation();
        cardContainer.classList.add('active');
        card.classList.add('active');
    });

    card.addEventListener('pointerleave', (event) => {
        createSmoothAnimation(600, event.offsetX, event.offsetY);
        cardContainer.classList.remove('active');
        card.classList.remove('active');
    });

    // Initialize card position
    const initialX = cardContainer.clientWidth - 70;
    const initialY = 60;
    updateCardTransform(initialX, initialY);
    createSmoothAnimation(1500, initialX, initialY);
}

// Contact Button Handler
const contactBtn = document.getElementById('contact-btn');
if (contactBtn) {
    contactBtn.addEventListener('click', () => {
        // You can customize this action
        // For example, scroll to contact links or open email client
        const emailLink = document.querySelector('.contact-link[href^="mailto:"]');
        if (emailLink) {
            window.location.href = emailLink.getAttribute('href');
        }
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    blinkCursor();
    startTypingCycle();
});
