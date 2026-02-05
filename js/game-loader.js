// Game loader functionality
const gameCards = document.querySelectorAll('.game-card');

gameCards.forEach(card => {
    card.addEventListener('click', function() {
        const gameName = this.getAttribute('data-game');

        if (this.classList.contains('locked')) {
            // Play error sound
            playSound('error');
            return;
        }

        // Play click sound
        playSound('click');

        // Add click animation
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = '';
        }, 200);

        // Load game after animation
        setTimeout(() => {
            loadGame(gameName);
        }, 300);
    });

    // Hover sound effect
    card.addEventListener('mouseenter', function() {
        if (!this.classList.contains('locked')) {
            playSound('hover');
        }
    });
});

function loadGame(gameName) {
    const mainMenu = document.getElementById('main-menu');

    // Fade out menu
    mainMenu.style.transition = 'opacity 0.5s ease-out';
    mainMenu.style.opacity = '0';

    setTimeout(() => {
        mainMenu.style.display = 'none';

        // Load the game page
        switch(gameName) {
            case 'canvas':
                window.location.href = 'FreeCanvas.html';
                break;
            case 'solar-system':
                window.location.href = 'Solar System';
                break;
            case 'music-maker':
                window.location.href = 'games/music-maker.html';
                break;
            case 'particle-playground':
                window.location.href = 'games/particle-playground.html';
                break;
            case 'rhythm-dance':
                window.location.href = 'games/rhythm-dance.html';
                break;
            case 'creature-creator':
                window.location.href = 'games/creature-creator.html';
                break;
            default:
                console.log('Game not found:', gameName);
                mainMenu.style.display = 'block';
                mainMenu.style.opacity = '1';
        }
    }, 500);
}

// Sound effects using Web Audio API
let audioContext;

function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playSound(type) {
    initAudio();

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    switch(type) {
        case 'click':
            oscillator.frequency.value = 800;
            gainNode.gain.value = 0.3;
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.1);
            break;
        case 'hover':
            oscillator.frequency.value = 600;
            gainNode.gain.value = 0.1;
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.05);
            break;
        case 'error':
            oscillator.frequency.value = 200;
            gainNode.gain.value = 0.3;
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.2);
            break;
    }
}

// Keyboard navigation
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        // Return to menu or quit
        const mainMenu = document.getElementById('main-menu');
        if (mainMenu.style.display === 'none') {
            window.location.href = 'index.html';
        }
    }
});

// Touch support for interactive wall
document.addEventListener('touchstart', (event) => {
    // Enable touch interactions
    event.preventDefault();
}, { passive: false });
