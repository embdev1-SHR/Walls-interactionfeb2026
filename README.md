# Interactive Wall Games

An interactive wall gaming system for kids using projectors, lights, and camera sensors. Built with Electron for high-performance rendering.

## Features

- **Epic 3D Loading Intro** - Ready Player One inspired loading animation with particles and geometric shapes
- **6 Game Scenarios**:
  1. **Free Canvas** - Draw and paint with multiple magical brushes
  2. **Solar System Explorer** - Interactive 3D space exploration
  3. **Music Maker** - Create sounds and beats (Coming Soon)
  4. **Particle Playground** - Interactive particle effects (Coming Soon)
  5. **Rhythm Dance** - Motion tracking dance game (Coming Soon)
  6. **Creature Creator** - Design custom creatures (Coming Soon)

## Installation

```bash
npm install
```

## Running the Application

```bash
npm start
```

This will launch the Electron app in fullscreen mode.

## Controls

- **Mouse/Touch** - Interact with games and menus
- **ESC Key** - Exit fullscreen or return to menu
- **Touch Gestures** - Full multi-touch support for interactive walls

## Technical Details

- Built with Electron for desktop deployment
- Three.js for high-quality 3D graphics
- WebGL rendering for maximum performance
- Multi-touch and gesture support
- Optimized for projector displays

## Building for Production

```bash
npm run build
```

This will create distributable packages in the `dist` folder.

## Project Structure

```
project/
├── index.html              # Main menu with 3D intro
├── main.js                 # Electron main process
├── FreeCanvas.html         # Drawing game
├── Solar System            # Solar system explorer
├── js/
│   ├── loading-animation.js    # 3D loading intro
│   ├── menu-background.js      # Animated menu background
│   └── game-loader.js          # Game loading system
└── games/
    ├── music-maker.html
    ├── particle-playground.html
    ├── rhythm-dance.html
    └── creature-creator.html
```

## Camera Sensor Integration

For camera sensor integration, you can extend the games to use:
- WebRTC for camera access
- TensorFlow.js for gesture recognition
- MediaPipe for body tracking

## Display Recommendations

- Resolution: 1920x1080 or higher
- Refresh Rate: 60Hz minimum
- Multiple projectors can be synchronized for larger walls

## License

MIT
