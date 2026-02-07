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
            { name: 'Bedroom Cleanup', game: 'sort-bedroom' },
            { name: 'Kitchen Cleanup', game: 'sort-kitchen' },
            { name: 'Living Room Cleanup', game: 'sort-living' }
        ]
    },
    'learning': {
        title: 'Learning',
        subcategories: [
            { name: 'Maths', key: 'learning-maths' },
            { name: 'Alphabets', key: 'learning-alphabets' }
        ]
    },
    'learning-maths': {
        title: 'Maths',
        parent: 'learning',
        options: [
            { name: 'Number Explorer', game: 'number-explorer' },
            { name: 'Arithmetica', game: 'arithmetica' },
            { name: 'Number Crunch', game: 'number-crunch' },
            { name: 'Fruit Math', game: 'fruit-math' }
        ]
    },
    'learning-alphabets': {
        title: 'Alphabets',
        parent: 'learning',
        options: [
            { name: 'Alphabet Explorer', game: 'alphabet-explorer' },
            { name: 'Word Explorer', game: 'word-explorer' },
            { name: 'Word Creator', game: 'word-creator' }
        ]
    }
};

const gameCards = document.querySelectorAll('.game-card');

function handleCardTap(card) {
    const gameName = card.getAttribute('data-game');
    const categoryName = card.getAttribute('data-category');

    if (card.classList.contains('locked')) {
        playSound('error');
        return;
    }

    playSound('click');

    card.style.transform = 'scale(0.95)';
    setTimeout(() => {
        card.style.transform = '';
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
}

gameCards.forEach(card => {
    card.addEventListener('click', function(e) {
        if (e.sourceCapabilities && e.sourceCapabilities.firesTouchEvents) return;
        handleCardTap(this);
    });

    card.addEventListener('touchend', function(e) {
        e.preventDefault();
        handleCardTap(this);
    });

    card.addEventListener('mouseenter', function() {
        if (!this.classList.contains('locked')) {
            playSound('hover');
        }
    });
});

function handleOptionTap(option) {
    playSound('click');
    closeSubmenu();
    setTimeout(() => loadGame(option.game), 300);
}

function showSubmenu(categoryName) {
    const category = CATEGORIES[categoryName];
    if (!category) return;

    const overlay = document.getElementById('submenu-overlay');
    const title = document.getElementById('submenu-title');
    const optionsContainer = document.getElementById('submenu-options');

    title.textContent = category.title;
    optionsContainer.innerHTML = '';

    if (category.parent) {
        const backEl = document.createElement('div');
        backEl.className = 'submenu-option';
        backEl.style.background = 'linear-gradient(135deg, #fef3c7, #fde68a)';
        backEl.style.borderColor = '#f59e0b';
        backEl.textContent = '\u2190 Back';
        backEl.addEventListener('click', (e) => {
            if (e.sourceCapabilities && e.sourceCapabilities.firesTouchEvents) return;
            playSound('click');
            showSubmenu(category.parent);
        });
        backEl.addEventListener('touchend', (e) => {
            e.preventDefault();
            playSound('click');
            showSubmenu(category.parent);
        });
        optionsContainer.appendChild(backEl);
    }

    if (category.subcategories) {
        category.subcategories.forEach(sub => {
            const subEl = document.createElement('div');
            subEl.className = 'submenu-option';
            subEl.textContent = sub.name;
            subEl.addEventListener('click', (e) => {
                if (e.sourceCapabilities && e.sourceCapabilities.firesTouchEvents) return;
                playSound('click');
                showSubmenu(sub.key);
            });
            subEl.addEventListener('touchend', (e) => {
                e.preventDefault();
                playSound('click');
                showSubmenu(sub.key);
            });
            optionsContainer.appendChild(subEl);
        });
    }

    if (category.options) {
        category.options.forEach(option => {
            const optionEl = document.createElement('div');
            optionEl.className = 'submenu-option';
            optionEl.textContent = option.name;
            optionEl.addEventListener('click', (e) => {
                if (e.sourceCapabilities && e.sourceCapabilities.firesTouchEvents) return;
                handleOptionTap(option);
            });
            optionEl.addEventListener('touchend', (e) => {
                e.preventDefault();
                handleOptionTap(option);
            });
            optionsContainer.appendChild(optionEl);
        });
    }

    overlay.classList.add('active');
}

function closeSubmenu() {
    const overlay = document.getElementById('submenu-overlay');
    overlay.classList.remove('active');
}

document.getElementById('submenu-close').addEventListener('click', (e) => {
    if (e.sourceCapabilities && e.sourceCapabilities.firesTouchEvents) return;
    playSound('click');
    closeSubmenu();
});
document.getElementById('submenu-close').addEventListener('touchend', (e) => {
    e.preventDefault();
    playSound('click');
    closeSubmenu();
});

document.getElementById('submenu-overlay').addEventListener('click', (e) => {
    if (e.sourceCapabilities && e.sourceCapabilities.firesTouchEvents) return;
    if (e.target.id === 'submenu-overlay') {
        playSound('click');
        closeSubmenu();
    }
});
document.getElementById('submenu-overlay').addEventListener('touchend', (e) => {
    if (e.target.id === 'submenu-overlay') {
        e.preventDefault();
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
            case 'sort-bedroom':
                window.location.href = 'games/room-sorter.html?room=bedroom';
                break;
            case 'sort-kitchen':
                window.location.href = 'games/room-sorter.html?room=kitchen';
                break;
            case 'sort-living':
                window.location.href = 'games/room-sorter.html?room=living';
                break;
            case 'arithmetica':
                window.location.href = 'games/arithmetica.html';
                break;
            case 'number-crunch':
                window.location.href = 'games/number-crunch.html';
                break;
            case 'fruit-math':
                window.location.href = 'games/fruit-math.html';
                break;
            case 'word-explorer':
                window.location.href = 'games/word-explorer.html';
                break;
            case 'number-explorer':
                window.location.href = 'games/number-explorer.html';
                break;
            case 'alphabet-explorer':
                window.location.href = 'games/alphabet-explorer.html';
                break;
            case 'word-creator':
                window.location.href = 'games/word-creator.html';
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

document.addEventListener('touchstart', (event) => {
    for (let i = 0; i < event.changedTouches.length; i++) {
        let t = event.changedTouches[i];
        let ring = document.createElement('div');
        ring.style.cssText = 'position:fixed;width:60px;height:60px;border:3px solid rgba(79,70,229,.5);border-radius:50%;pointer-events:none;z-index:9999;transform:translate(-50%,-50%) scale(0);animation:touchRingPop .5s ease forwards;left:' + t.clientX + 'px;top:' + t.clientY + 'px;';
        document.body.appendChild(ring);
        ring.addEventListener('animationend', () => ring.remove());
    }
}, { passive: true });
