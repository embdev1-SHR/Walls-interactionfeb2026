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
            'index': 'menu',
            'intro': 'menu',
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
            'puzzle-balance': 'puzzle',
            'room-sorter': 'Daily life scenarios',
            'number-explorer': 'Learning',
            'arithmetica-multi': 'Learning',
            'arithmetica': 'Learning',
            'number-crunch': 'Learning',
            'number-crunch-multi': 'Learning',
            'fruit-math': 'Learning',
            'fruit-math-multi': 'Learning',
            'alphabet-explorer': 'Learning',
            'alphabet-explorer-multi': 'Learning',
            'word-explorer': 'Learning',
            'word-creator': 'Learning',
            'memory-match': 'Learning',
            '3d-viewer': 'idoberg-space-chords-loop',
            'video-360-player': 'jyproject-endless-shore-part2',
            'fruit-ninja': 'Learning',
            'rhythm-dance': 'Learning'
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

        if (!audioFile) {
            console.warn(`No audio mapping found for page: ${pageName}`);
            return;
        }

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

        this.audio = document.createElement('audio');
        this.audio.id = 'game-audio';
        this.audio.src = `../assets/Audio/${audioFile}.mp3`;
        this.audio.volume = this.volume;
        this.audio.preload = 'auto';
        this.audio.crossOrigin = 'anonymous';
        
        document.body.appendChild(this.audio);

        // Error handling
        this.audio.addEventListener('error', (e) => {
            console.error(`Failed to load audio: ${audioFile}`, e);
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

        const playPromise = this.audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(err => {
                console.warn('Audio playback failed:', err);
                // Fallback: Try again on user interaction
                document.addEventListener('click', () => {
                    this.audio.play().catch(() => {});
                }, { once: true });
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

// Helper function to get page name from current file
function getPageName() {
    const pathname = window.location.pathname;
    let pageName = pathname.split('/').pop().split('.')[0];
    if (!pageName || pageName === '' || pageName === 'index') {
        pageName = 'index';
    }
    return pageName;
}

// Auto-initialize audio when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const pageName = getPageName();
    audioManager.initialize(pageName, 0.5);
});

// Handle visibility change to pause/resume audio
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        audioManager.pause();
    } else {
        audioManager.resume();
    }
});
