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
        subcategories: [
            { name: 'Room Cleanup', key: 'daily-room' }
        ],
        options: [
            { name: 'Grocery Sorting', game: 'sort-grocery' },
            { name: 'Laundry Sorting', game: 'sort-laundry' },
            { name: 'Recycling Sort', game: 'sort-recycling' },
            { name: 'School Bag Packing', game: 'sort-schoolbag' },
            { name: 'Table Setting', game: 'sort-table' }
        ]
    },
    'daily-room': {
        title: 'Room Cleanup',
        parent: 'daily-skills',
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
            { name: 'Fruit Counter', game: 'fruit-counter' },
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
            { name: 'Word Matcher', game: 'word-matcher' },
            { name: 'Alphabet Explorer', game: 'alphabet-explorer' },
            { name: 'Word Explorer', game: 'word-explorer' },
            { name: 'Word Creator', game: 'word-creator' }
        ]
    },
    'money-counter': {
        title: 'Money Shop',
        game: 'money-counter'
    },
    'primary': {
        title: 'Primary',
        titleMl: 'പ്രൈമറി',
        options: [
            { name: 'Types of Houses', ml: '🏠 വീടുകളുടെ തരങ്ങൾ', game: 'pri-houses' },
            { name: 'Rooms in a House', ml: '🚪 വീട്ടിലെ മുറികൾ', game: 'pri-rooms' },
            { name: 'Letter Tracing', ml: '✍️ അക്ഷരചിത്രം', game: 'pri-letters' },
            { name: 'Kerala Flowers', ml: '🌺 കേരളത്തിലെ പൂക്കൾ', game: 'pri-flowers' },
            { name: 'Flower Matching', ml: '🔗 പൂക്കൾ ജോഡിക്കുക', game: 'pri-flower-match' }
        ]
    },
    'secondary': {
        title: 'Secondary',
        titleMl: 'സെക്കൻഡറി',
        options: [
            { name: 'My Name', ml: '🔤 എന്റെ പേര്', game: 'sec-name-id' },
            { name: 'Build My Name', ml: '🎈 പേര് ഉണ്ടാക്കാം', game: 'sec-name-build' },
            { name: 'First Aid Box', ml: '🩹 ഫസ്റ്റ് എയ്ഡ് ബോക്സ്', game: 'sec-first-aid' },
            { name: 'Coins & Notes', ml: '💰 നാണയങ്ങളും നോട്ടുകളും', game: 'sec-currency' },
            { name: 'Body & Plant', ml: '🧍 ശരീരവും സസ്യവും', game: 'sec-body-plant' },
            { name: 'Helpers & Places', ml: '👮 സഹായികളും സ്ഥലങ്ങളും', game: 'sec-helpers-places' },
            { name: 'Mobile Phone', ml: '📱 മൊബൈൽ ഫോൺ', game: 'sec-mobile' },
            { name: 'Flower Bouquet', ml: '💐 പൂച്ചെണ്ട്', game: 'sec-bouquet' },
            { name: 'Daily Living', ml: '🚦 ദൈനംദിന ജീവിതം', game: 'sec-daily-living' }
        ]
    },
    'vocational': {
        title: 'Vocational',
        titleMl: 'തൊഴിൽപരിചയം',
        options: [
            { name: 'Kerala Instruments', ml: '🥁 വാദ്യോപകരണങ്ങൾ', game: 'voc-instruments' },
            { name: 'Party Decoration',   ml: '🎈 ജന്മദിന അലങ്കാരം', game: 'voc-party-decorate' },
            { name: 'Card Handover',      ml: '💌 കാർഡ് നൽകാം', game: 'voc-card-handover' },
            { name: 'Cap Matching',       ml: '🥳 തൊപ്പി കണ്ടെത്താം', game: 'voc-cap-match' },
            { name: 'Cake Sharing',       ml: '🍰 കേക്ക് പങ്കിടാം', game: 'voc-cake-share' },
            { name: 'Birthday Photo',     ml: '📷 ജന്മദിന ഫോട്ടോ', game: 'voc-photo' },
            { name: 'DIY Card',           ml: '✂️ കാർഡ് ഉണ്ടാക്കാം', game: 'voc-card-craft' }
        ]
    },
    'pre-primary': {
        title: 'Pre-Primary',
        options: [
            { name: '🦁 Animal Hunt',        game: 'pp-animal-hunt'  },
            { name: '🐘 Size Quiz',          game: 'pp-size-quiz'    },
            { name: '🐾 3D Animal Explorer', game: 'model-cards'     },
            { name: '🦉 Animal Parts',       game: 'model-cards-2'   },
            { name: '🎨 Animal Drawing',     game: 'animal-drawing'  },
            { name: '🦟 Mosquito Clap',      game: 'mosquito-clap'   },
            { name: '😊 Feelings',           game: 'feelings'        },
            { name: '🔢 Pattern Finder',     game: 'pattern-finder'  },
            { name: '🎨 Colour Match',       game: 'colour-match'    },
            { name: '🍎 Fruits vs Vegetables', game: 'fruits-vegetables' },
            { name: '🚗 Vehicles',           game: 'vehicles'        },
            { name: 'Domestic & Wild Animals', ml: '🐄 നാട്ടു & കാട്ടു മൃഗങ്ങൾ', game: 'pp-animals' },
            { name: 'Animal Quiz & Match', ml: '🎯 മൃഗങ്ങളെ തിരിച്ചറിയാം', game: 'pp-animal-quiz' },
            { name: 'Odd One Out', ml: '🔍 വ്യത്യസ്തമായത്', game: 'pp-odd-one-out' },
            { name: 'Types of Hen', ml: '🐓 കോഴിയുടെ തരങ്ങൾ', game: 'pp-hen-types' },
            { name: 'Animals & Homes', ml: '🏠 മൃഗങ്ങളുടെ വീടുകൾ', game: 'pp-animal-homes' },
            { name: 'Young Ones', ml: '🐤 മൃഗക്കുഞ്ഞുങ്ങൾ', game: 'pp-animal-young' },
            { name: 'Animal Puzzle', ml: '🧩 മൃഗത്തെ ഉണ്ടാക്കാം', game: 'pp-animal-puzzle' },
            { name: 'Animal Sorting', ml: '📦 തരംതിരിക്കാം', game: 'pp-animal-sort' },
            { name: 'Animal Movement Path', ml: '✨ സഞ്ചാരപഥം', game: 'pp-animal-path' }
        ]
    },

};

const gameCards = document.querySelectorAll('.game-card');

// ─────────────────────────────────────────────────────────────
//  Session mode gating (Class = multiplayer only, Individual =
//  no multiplayer, Guest = everything). Safe no-op if Session
//  isn't loaded.
// ─────────────────────────────────────────────────────────────
function gameAllowed(gameKey) {
  return (typeof Session === 'undefined') ? true : Session.isGameAllowed(gameKey);
}

// All game keys reachable under a category (recurses subcategories).
function collectCategoryGames(catKey, seen) {
  seen = seen || new Set();
  const cat = CATEGORIES[catKey];
  if (!cat || seen.has(catKey)) return [];
  seen.add(catKey);
  let games = [];
  if (cat.game) games.push(cat.game);
  if (cat.options) cat.options.forEach(o => { if (o.game) games.push(o.game); });
  if (cat.subcategories) cat.subcategories.forEach(s => { games = games.concat(collectCategoryGames(s.key, seen)); });
  return games;
}

function categoryAllowed(catKey) {
  return collectCategoryGames(catKey).some(gameAllowed);
}

// Hide top-level cards that this session mode can't use.
function applyModeVisibility() {
  gameCards.forEach(card => {
    const g = card.getAttribute('data-game');
    const c = card.getAttribute('data-category');
    let ok = true;
    if (g) ok = gameAllowed(g);
    else if (c) ok = categoryAllowed(c);
    card.style.display = ok ? '' : 'none';
  });
}
applyModeVisibility();

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

    const overlay   = document.getElementById('submenu-overlay');
    const box       = document.getElementById('submenu-box');
    const titleEl   = document.getElementById('submenu-title');
    const optsCont  = document.getElementById('submenu-options');
    titleEl.innerHTML = category.titleMl
      ? '<span class="opt-ml">' + category.titleMl + '</span>' +
        '<span class="opt-en">' + category.title + '</span>'
      : category.title;
    optsCont.innerHTML  = '';
    box.classList.remove('pp-grid');
    // All level modules use the compact 3-up grid; Secondary has 9
    // entries and would otherwise render as one very tall column.
    if (categoryName === 'pre-primary' || categoryName === 'primary' ||
        categoryName === 'secondary' ||
        categoryName === 'vocational') box.classList.add('pp-grid');

    // \u2500\u2500 Back button \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
    if (category.parent) {
        const backEl = document.createElement('div');
        backEl.className = 'submenu-option';
        backEl.style.background   = 'linear-gradient(135deg, #fef3c7, #fde68a)';
        backEl.style.borderColor  = '#f59e0b';
        backEl.textContent        = '\u2190 Back';
        const goBack = (e) => {
            if (e.type === 'click' && e.sourceCapabilities && e.sourceCapabilities.firesTouchEvents) return;
            if (e.type === 'touchend') e.preventDefault();
            playSound('click');
            showSubmenu(category.parent);
        };
        backEl.addEventListener('click',    goBack);
        backEl.addEventListener('touchend', goBack);
        optsCont.appendChild(backEl);
    }

    // \u2500\u2500 Subcategory buttons \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
    if (category.subcategories) {
        category.subcategories.forEach(sub => {
            if (!categoryAllowed(sub.key)) return; // mode gating
            const subEl = document.createElement('div');
            subEl.className   = 'submenu-option';
            subEl.textContent = sub.name;
            const goSub = (e) => {
                if (e.type === 'click' && e.sourceCapabilities && e.sourceCapabilities.firesTouchEvents) return;
                if (e.type === 'touchend') e.preventDefault();
                playSound('click');
                showSubmenu(sub.key);
            };
            subEl.addEventListener('click',    goSub);
            subEl.addEventListener('touchend', goSub);
            optsCont.appendChild(subEl);
        });
    }

    // \u2500\u2500 Option buttons \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
    if (category.options) {
        category.options.forEach(option => {
            if (option.game && !gameAllowed(option.game)) return; // mode gating
            option._parentKey = categoryName; // tag for routing
            const optEl = document.createElement('div');
            optEl.className   = 'submenu-option';
            // Malayalam-first, English underneath. Entries without an
            // ml (the older categories) render exactly as before.
            if (option.ml) {
                optEl.innerHTML = '<span class="opt-ml">' + option.ml + '</span>' +
                                  '<span class="opt-en">' + option.name + '</span>';
            } else {
                optEl.textContent = option.name;
            }
            const goOpt = (e) => {
                if (e.type === 'click' && e.sourceCapabilities && e.sourceCapabilities.firesTouchEvents) return;
                if (e.type === 'touchend') e.preventDefault();
                handleOptionTap(option);
            };
            optEl.addEventListener('click',    goOpt);
            optEl.addEventListener('touchend', goOpt);
            optsCont.appendChild(optEl);
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
    // Defensive: block games this session mode isn't allowed to open.
    if (!gameAllowed(gameName)) { playSound('error'); return; }

    // Individual mode: record which game the student opened.
    if (typeof Session !== 'undefined' && Session.isIndividual()) {
        Session.logActivity('game_open', { game: gameName });
    }

    const mainMenu = document.getElementById('main-menu');
    const menuAudio = document.getElementById('menu-audio');

    // Pause menu audio when loading a game
    if (menuAudio) {
        menuAudio.pause();
    }

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
            case 'underwater-explorer':
                window.location.href = 'games/underwater-explorer.html';
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
            case 'sort-grocery':
                window.location.href = 'games/room-sorter.html?room=grocery';
                break;
            case 'sort-laundry':
                window.location.href = 'games/room-sorter.html?room=laundry';
                break;
            case 'sort-recycling':
                window.location.href = 'games/room-sorter.html?room=recycling';
                break;
            case 'sort-schoolbag':
                window.location.href = 'games/room-sorter.html?room=schoolbag';
                break;
            case 'sort-table':
                window.location.href = 'games/room-sorter.html?room=table';
                break;
            case 'fruit-counter':
                window.location.href = 'games/fruit-counter.html';
                break;
            case 'word-matcher':
                window.location.href = 'games/word-matcher.html';
                break;
            case 'money-counter':
                window.location.href = 'games/money-counter.html';
                break;
            case 'arithmetica':
                window.location.href = 'games/arithmetica-multi.html';
                break;
            case 'number-crunch':
                window.location.href = 'games/number-crunch-multi.html';
                break;
            case 'fruit-math':
                window.location.href = 'games/fruit-math-multi.html';
                break;
            case 'word-explorer':
                window.location.href = 'games/word-explorer.html';
                break;
            case 'number-explorer':
                window.location.href = 'games/number-explorer.html';
                break;
            case 'alphabet-explorer':
                window.location.href = 'games/alphabet-explorer-multi.html';
                break;
            case 'word-creator':
                window.location.href = 'games/word-creator.html';
                break;
            case 'music-maker':
                window.location.href = 'games/music-maker.html';
                break;
            case 'creature-creator':
                window.location.href = 'games/creature-creator.html';
                break;
            case 'butterfly-tracker':
                window.location.href = 'games/butterfly-tracker.html';
                break;
            case 'balloon-popper':
                window.location.href = 'games/balloon-popper.html';
                break;
            case 'fish-it':
                window.location.href = 'games/fish-it.html';
                break;
            case 'puzzle-balance':
                window.location.href = 'games/puzzle-balance.html';
                break;
            case 'tug-of-war':
                window.location.href = 'games/3d-viewer.html';
                break;
            case '3d-viewer':
                window.location.href = 'games/3d-viewer.html';
                break;
            case 'memory-match':
                window.location.href = 'games/memory-match.html';
                break;
            case 'shape-sorter':
                window.location.href = 'games/shape-sorter.html';
                break;
            case 'video-360-player':
                window.location.href = 'games/video-360-player.html';
                break;
            case 'pp-animal-hunt':
                window.location.href = 'games/pp-animal-hunt.html';
                break;
            case 'pp-size-quiz':
                window.location.href = 'games/pp-size-quiz.html';
                break;
            case 'model-cards':
                window.location.href = 'games/model-cards.html';
                break;
            case 'model-cards-2':
                window.location.href = 'games/model-cards-2.html';
                break;
            case 'animal-drawing':
                window.location.href = 'games/animal-drawing.html';
                break;
            case 'mosquito-clap':
                window.location.href = 'games/mosquito-clap.html';
                break;
            case 'feelings':
                window.location.href = 'games/feelings.html';
                break;
            case 'pattern-finder':
                window.location.href = 'games/pattern-finder.html';
                break;
            case 'colour-match':
                window.location.href = 'games/colour-match.html';
                break;
            case 'fruits-vegetables':
                window.location.href = 'games/fruits-vegetables.html';
                break;
            case 'vehicles':
                window.location.href = 'games/vehicles.html';
                break;
            case 'pri-houses':
                window.location.href = 'games/pri-houses.html';
                break;
            case 'pri-rooms':
                window.location.href = 'games/pri-rooms.html';
                break;
            case 'pri-letters':
                window.location.href = 'games/pri-letters.html';
                break;
            case 'pri-flowers':
                window.location.href = 'games/pri-flowers.html';
                break;
            case 'pri-flower-match':
                window.location.href = 'games/pri-flower-match.html';
                break;
            case 'sec-name-id':
                window.location.href = 'games/sec-name-id.html';
                break;
            case 'sec-name-build':
                window.location.href = 'games/sec-name-build.html';
                break;
            case 'sec-first-aid':
                window.location.href = 'games/sec-first-aid.html';
                break;
            case 'sec-currency':
                window.location.href = 'games/sec-currency.html';
                break;
            case 'sec-body-plant':
                window.location.href = 'games/sec-body-plant.html';
                break;
            case 'sec-helpers-places':
                window.location.href = 'games/sec-helpers-places.html';
                break;
            case 'sec-mobile':
                window.location.href = 'games/sec-mobile.html';
                break;
            case 'sec-bouquet':
                window.location.href = 'games/sec-bouquet.html';
                break;
            case 'sec-daily-living':
                window.location.href = 'games/sec-daily-living.html';
                break;
            case 'pp-animals':
                window.location.href = 'games/pp-animals.html';
                break;
            case 'pp-animal-quiz':
                window.location.href = 'games/pp-animal-quiz.html';
                break;
            case 'pp-odd-one-out':
                window.location.href = 'games/pp-odd-one-out.html';
                break;
            case 'pp-hen-types':
                window.location.href = 'games/pp-hen-types.html';
                break;
            case 'pp-animal-homes':
                window.location.href = 'games/pp-animal-homes.html';
                break;
            case 'pp-animal-young':
                window.location.href = 'games/pp-animal-young.html';
                break;
            case 'pp-animal-puzzle':
                window.location.href = 'games/pp-animal-puzzle.html';
                break;
            case 'pp-animal-sort':
                window.location.href = 'games/pp-animal-sort.html';
                break;
            case 'pp-animal-path':
                window.location.href = 'games/pp-animal-path.html';
                break;
            case 'voc-instruments':
                window.location.href = 'games/voc-instruments.html';
                break;
            case 'voc-party-decorate':
                window.location.href = 'games/voc-party-decorate.html';
                break;
            case 'voc-card-handover':
                window.location.href = 'games/voc-card-handover.html';
                break;
            case 'voc-cap-match':
                window.location.href = 'games/voc-cap-match.html';
                break;
            case 'voc-cake-share':
                window.location.href = 'games/voc-cake-share.html';
                break;
            case 'voc-photo':
                window.location.href = 'games/voc-photo.html';
                break;
            case 'voc-card-craft':
                window.location.href = 'games/voc-card-craft.html';
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
