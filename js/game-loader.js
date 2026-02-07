const CATEGORIES = {
    'jungle': {
        title: 'Jungle Games',
        options: [
            { name: 'Forest Animals', game: 'forest-animals' },
            { name: 'Hidden Animals', game: 'hidden-animals' }
        ]
    },
    'daily-skills': {
        title: 'Daily Skills',
        options: [
            { name: 'Room Sorting', game: 'room-sorter' }
        ]
    }
};

const gameCards = document.querySelectorAll('.game-card');

gameCards.forEach(card => {
    card.addEventListener('click', function() {
        const gameName = this.getAttribute('data-game');
        const categoryName = this.getAttribute('data-category');

        if (this.classList.contains('locked')) {
            playSound('error');
            return;
        }

        playSound('click');

        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = '';
        }, 200);

        if (categoryName) {
            setTimeout(() => {
                showSubmenu(categoryName);
            }, 300);
        } else if (gameName) {
            setTimeout(() => {
                loadGame(gameName);
            }, 300);
        }
    });

    card.addEventListener('mouseenter', function() {
        if (!this.classList.contains('locked')) {
            playSound('hover');
        }
    });
});

function showSubmenu(categoryName) {
    const category = CATEGORIES[categoryName];
    if (!category) return;

    const overlay = document.getElementById('submenu-overlay');
    const title = document.getElementById('submenu-title');
    const optionsContainer = document.getElementById('submenu-options');

    title.textContent = category.title;
    optionsContainer.innerHTML = '';

    category.options.forEach(option => {
        const optionEl = document.createElement('div');
        optionEl.className = 'submenu-option';
        optionEl.textContent = option.name;
        optionEl.onclick = () => {
            playSound('click');
            closeSubmenu();
            setTimeout(() => loadGame(option.game), 300);
        };
        optionsContainer.appendChild(optionEl);
    });

    overlay.classList.add('active');
}

function closeSubmenu() {
    const overlay = document.getElementById('submenu-overlay');
    overlay.classList.remove('active');
}

document.getElementById('submenu-close').addEventListener('click', () => {
    playSound('click');
    closeSubmenu();
});

document.getElementById('submenu-overlay').addEventListener('click', (e) => {
    if (e.target.id === 'submenu-overlay') {
        playSound('click');
        closeSubmenu();
    }
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
                window.location.href = 'solar-system.html';
                break;
            case 'coloring-book':
                window.location.href = 'games/coloring-book.html';
                break;
            case 'particle-playground':
                window.location.href = 'games/particle-playground.html';
                break;
            case 'goalkeeper':
                window.location.href = 'games/goalkeeper.html';
                break;
            case 'fruit-ninja':
                window.location.href = 'games/fruit-ninja.html';
                break;
            case 'forest-animals':
                window.location.href = 'games/forest-animals.html';
                break;
            case 'hidden-animals':
                window.location.href = 'games/hidden-animals.html';
                break;
            case 'room-sorter':
                window.location.href = 'games/room-sorter.html';
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
