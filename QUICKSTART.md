# Quick Start Guide

## Get Started in 3 Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Application
```bash
npm start
```

### 3. Interact!
- The app will launch in fullscreen with an epic 3D loading animation
- After 3 seconds, you'll see the main menu with 6 game cards
- Click or touch any game card to start playing
- Press ESC to exit or return to menu

## What You Get

### Main Menu Features
- **Stunning 3D Intro** - Particles, geometric shapes, and dynamic lighting
- **Animated Background** - Flowing particles with grid effects
- **6 Interactive Game Cards** - Each with unique animations and effects

### Available Games

1. **Free Canvas** ✅
   - Multi-touch drawing
   - 5 brush types: Pen, Soft, Marker, Spray, Ink
   - Instant color changes per pointer
   - Full-screen canvas

2. **Solar System Explorer** ✅
   - Realistic 3D planets with custom textures
   - Interactive planet selection
   - Educational information panels
   - Meteor animations
   - Multi-touch controls (rotate, zoom, pinch)

3. **Music Maker** 🔜
   - Placeholder ready for implementation

4. **Particle Playground** 🔜
   - Placeholder ready for implementation

5. **Rhythm Dance** 🔜
   - Placeholder ready for implementation

6. **Creature Creator** 🔜
   - Placeholder ready for implementation

## Customization

### Adding Camera Sensors
To integrate camera sensors for motion tracking:

1. Add camera access in `main.js`:
```javascript
webPreferences: {
  nodeIntegration: true,
  contextIsolation: false,
  enableWebcam: true  // Add this
}
```

2. Use getUserMedia in your games:
```javascript
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    // Process camera stream
  });
```

### Display Settings

For projector walls, you can adjust the resolution in `main.js`:
```javascript
width: 3840,  // 4K width
height: 2160, // 4K height
```

### Performance Settings

For maximum quality on powerful hardware, update renderer settings in the game files:
```javascript
renderer.setPixelRatio(window.devicePixelRatio * 2); // Super sampling
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
```

## Troubleshooting

**App won't start?**
- Make sure you have Node.js installed
- Run `npm install` first

**Performance issues?**
- Lower `renderer.setPixelRatio()` to 1
- Reduce particle counts in animation files

**Touch not working?**
- Ensure touch events are enabled in your OS
- Check that `touch-action: none` is set in CSS

## Next Steps

1. Implement the placeholder games
2. Add camera sensor integration
3. Customize colors and themes
4. Add more interactive elements
5. Deploy to your interactive wall hardware

Enjoy building your interactive wall experience!
