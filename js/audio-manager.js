/**
 * Audio Manager - Centralized audio handling for all games
 * Features: Auto-loop, volume sync, and scenario-based audio
 */

class AudioManager {
    constructor() {
        this.audio = null;
        this.isPlaying = false;
        this.volume = 0.5;
        this.audioMap = {
            // Main Pages
            /* 'index' (the menu) is deliberately unmapped. It has its own live score,
               js/ambient-music.js — and while this entry existed the menu played
               menu.mp3 twice: once from its own <audio> element and once from here,
               slightly out of sync. */
            'intro': 'intro',
            'FreeCanvas': 'Free Canvas',
            'solar-system': 'solarsystem',
            
            // Game Audio Mapping
            'shape-sorter': 'ShaapeSorter',
            'fish-it': 'Fish-it',
            'balloon-popper': 'Baloon',
            'butterfly-tracker': 'Butterfly',
            'coloring-book': 'colouring',
            'creature-creator': 'trace-it',
            'underwater-explorer': 'Sea',
            'forest-animals': 'forest',
            'hidden-animals': 'forest',
            'music-maker': 'Learning',
            'goalkeeper': 'Goalkeeper',
            'particle-playground': 'Free Canvas',
            'puzzle-balance': 'Puzzle',
            'room-sorter': 'Daily life scenarios',
            'number-explorer': 'jyproject-endless-shore-part2-399386',
            'arithmetica-multi': 'jyproject-endless-shore-part2-399386',
            'arithmetica': 'jyproject-endless-shore-part2-399386',
            'number-crunch': 'jyproject-endless-shore-part2-399386',
            'number-crunch-multi': 'jyproject-endless-shore-part2-399386',
            'fruit-math': 'jyproject-endless-shore-part2-399386',
            'fruit-math-multi': 'jyproject-endless-shore-part2-399386',
            'word-explorer': 'jyproject-endless-shore-part2-399386',
            'word-creator': 'jyproject-endless-shore-part2-399386',
            'memory-match': 'jyproject-endless-shore-part2-399386',
            'fruit-counter': 'jyproject-endless-shore-part2-399386',
            'word-matcher': 'jyproject-endless-shore-part2-399386',
            '3d-viewer': 'idoberg-space-chords-loop-310493',
            'video-360-player': 'jyproject-endless-shore-part2-399386',
            'fruit-ninja': 'jyproject-endless-shore-part2-399386',
            'rhythm-dance': 'jyproject-endless-shore-part2-399386',

            /* ── Pre-Primary games ───────────────────────────────── */
            'pp-size-color':    'forest',
            'pp-mosquito-clap': 'forest',
            'pp-body-parts':    'forest',
            'pp-egg-count':     'jyproject-endless-shore-part2-399386',
            'fruits-vegetables':'jyproject-endless-shore-part2-399386',

            /* -- Primary + Secondary modules ---------------------- */
            'pri-houses':         'Daily life scenarios',
            'pri-rooms':          'Daily life scenarios',
            'pri-flowers':        'forest',
            'pri-flower-match':   'forest',
            'sec-name-build':     'jyproject-endless-shore-part2-399386',
            'sec-first-aid':      'Daily life scenarios',
            'sec-currency':       'jyproject-endless-shore-part2-399386',
            'sec-helpers-places': 'Daily life scenarios',
            'sec-mobile':         'jyproject-endless-shore-part2-399386',
            'sec-bouquet':        'forest',
            'sec-daily-living':   'Daily life scenarios',

            /* -- Pre-Primary Module 2 ---------------------------- */
            'pp-animals':      'forest',
            'pp-animal-quiz':  'forest',
            'pp-odd-one-out':  'forest',
            'pp-hen-types':    'forest',
            'pp-animal-homes': 'forest',
            'pp-animal-young': 'forest',
            'pp-animal-sort':   'forest',

            /* -- Vocational. The six Birthday modules run their own
                  synthesized music via js/birthday-common.js and so
                  deliberately do NOT include audio-manager.js. ----- */
            'voc-instruments':  'Learning',

            /* Added after an audit found these logging "No audio mapping found"
               and running silent. Tracks chosen to match the neighbours above:
               the jobs set is working life, so it takes the same calm ambient
               bed as the other Secondary/Vocational boards; the party and cap
               activities are celebratory, so they take 'Learning', which is
               what voc-instruments already uses. */
            'voc-job-call':     'Daily life scenarios',
            'voc-job-day':      'Daily life scenarios',
            'voc-job-hats':     'Daily life scenarios',
            'voc-job-tools':    'Daily life scenarios',
            'voc-job-where':    'Daily life scenarios',
            'voc-cap-match':    'Learning',
            'voc-party-decorate': 'Learning',
            'pp-size-quiz':     'forest',

            /* -- Older activities that include audio-manager.js but had
                  no track, so they played silence and logged a warning. */
            'animal-drawing': 'trace-it',
            'colour-match':   'colouring',
            'feelings':       'jyproject-endless-shore-part2-399386',
            'mosquito-clap':  'forest',
            'pattern-finder': 'jyproject-endless-shore-part2-399386'
        };
    }

    /**
     * Initialize audio for a specific page
     * @param {string} pageName - The page identifier (filename without extension)
     * @param {number} volume - Optional volume level (0-1)
     */
    initialize(pageName, volume = 0.5) {
        this.volume = volume;
        const audioFile = this.audioMap[pageName];

        console.log(`[Audio Manager] Initializing for page: ${pageName}`);

        /* Pages that run their own music on purpose. Listed so they read as a
           decision rather than as a missing mapping — the warning below is what
           an audit uses to find activities that are silent by accident, and it
           is only useful if it does not also fire for the ones silent by design. */
        const OWN_AUDIO = ['index', 'alphabet-explorer', 'alphabet-explorer-multi', 'vehicles'];
        if (!audioFile && OWN_AUDIO.indexOf(pageName) !== -1) return;

        if (!audioFile) {
            console.warn(`[Audio Manager] No audio mapping found for page: ${pageName}`);
            return;
        }

        console.log(`[Audio Manager] Mapped audio file: ${audioFile}`);
        this.createAudioElement(audioFile);
        this.setupAutoLoop();
        this.play();
    }

    /**
     * Create audio element and add to DOM
     * @param {string} audioFile - The audio filename (without .mp3 extension)
     */
    createAudioElement(audioFile) {
        // Remove existing audio if any
        if (this.audio) {
            this.audio.pause();
            this.audio.remove();
        }

        /* `../assets/` is correct from games/, which is where this manager has
           always been used — but index.html sits at the repo root, so from
           there the same path climbs out of the project entirely and the track
           silently 404s. The menu has been running without its music for that
           reason. Resolve against where the page actually is instead. */
        const atRoot = !/\/games\//.test(window.location.pathname);
        const base = atRoot ? './assets/Audio/' : '../assets/Audio/';

        this.audio = document.createElement('audio');
        this.audio.id = 'game-audio';
        this.audio.src = `${base}${audioFile}.mp3`;
        this.audio.volume = this.volume;
        this.audio.preload = 'auto';
        this.audio.crossOrigin = 'anonymous';

        document.body.appendChild(this.audio);

        console.log(`[Audio Manager] Loading: ${audioFile}.mp3 from ${base}${audioFile}.mp3`);

        // Error handling
        this.audio.addEventListener('error', (e) => {
            console.error(`[Audio Manager] Failed to load audio: ${audioFile}`, e);
        });

        this.audio.addEventListener('canplay', () => {
            console.log(`[Audio Manager] Audio ready: ${audioFile}`);
        });

        return this.audio;
    }

    /**
     * Setup automatic looping with proper synchronization
     */
    setupAutoLoop() {
        if (!this.audio) return;

        // Play audio fully then loop
        this.audio.addEventListener('ended', () => {
            this.audio.currentTime = 0;
            this.audio.play().catch(err => {
                console.warn('Audio autoplay was prevented:', err);
            });
        }, false);
    }

    /**
     * Play audio
     */
    play() {
        if (!this.audio) return;

        console.log(`[Audio Manager] Playing audio`);

        const playPromise = this.audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(err => {
                console.warn('[Audio Manager] Audio playback failed:', err);
                // Fallback: Try again on user interaction
                const playOnClick = () => {
                    this.audio.play().catch(() => {
                        console.warn('[Audio Manager] Still unable to play audio');
                    });
                    document.removeEventListener('click', playOnClick);
                };
                document.addEventListener('click', playOnClick);
            });
        }
        this.isPlaying = true;
    }

    /**
     * Pause audio
     */
    pause() {
        if (this.audio) {
            this.audio.pause();
            this.isPlaying = false;
        }
    }

    /**
     * Resume audio
     */
    resume() {
        if (this.audio) {
            this.audio.play().catch(err => {
                console.warn('Audio resume failed:', err);
            });
            this.isPlaying = true;
        }
    }

    /**
     * Stop audio and reset
     */
    stop() {
        if (this.audio) {
            this.audio.pause();
            this.audio.currentTime = 0;
            this.isPlaying = false;
        }
    }

    /**
     * Set volume (0-1)
     */
    setVolume(level) {
        this.volume = Math.max(0, Math.min(1, level));
        if (this.audio) {
            this.audio.volume = this.volume;
        }
    }

    /**
     * Fade in audio
     */
    fadeIn(duration = 2000) {
        if (!this.audio) return;

        this.audio.volume = 0;
        this.play();

        const startTime = Date.now();
        const fadeInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            this.audio.volume = this.volume * progress;

            if (progress >= 1) {
                clearInterval(fadeInterval);
            }
        }, 50);
    }

    /**
     * Fade out audio
     */
    fadeOut(duration = 2000) {
        if (!this.audio) return;

        const startVolume = this.audio.volume;
        const startTime = Date.now();
        const fadeInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            this.audio.volume = startVolume * (1 - progress);

            if (progress >= 1) {
                this.pause();
                this.audio.volume = this.volume;
                clearInterval(fadeInterval);
            }
        }, 50);
    }

    /**
     * Get current audio element
     */
    getAudio() {
        return this.audio;
    }

    /**
     * Check if audio is playing
     */
    isAudioPlaying() {
        return this.isPlaying && this.audio && !this.audio.paused;
    }
}

// Global audio manager instance
const audioManager = new AudioManager();

// Make it accessible globally
window.audioManager = audioManager;

// Helper function to get page name from current file
function getPageName() {
    const pathname = window.location.pathname;
    let pageName = pathname.split('/').pop().split('.')[0];
    if (!pageName || pageName === '' || pageName === 'index') {
        pageName = 'index';
    }
    return pageName;
}

// Auto-initialize audio when DOM is ready or after a delay for module scripts
function initializeAudio() {
    const pageName = getPageName();
    audioManager.initialize(pageName, 0.5);
}

document.addEventListener('DOMContentLoaded', () => {
    initializeAudio();
});

// For module scripts that load after DOMContentLoaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAudio);
} else {
    // If script loads after DOM is ready
    setTimeout(initializeAudio, 500);
}

// Handle visibility change to pause/resume audio
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        audioManager.pause();
    } else {
        audioManager.resume();
    }
});
