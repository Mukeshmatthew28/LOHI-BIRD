# Lohi Bird - Flawless Edition 🐦

A polished, production-quality Flappy Bird clone built with HTML5 Canvas and pure JavaScript.

## Features ✨

- **Smooth Physics**: Realistic gravity and flapping mechanics
- **Pixel-Perfect Collision Detection**: Fair and accurate hit detection
- **Beautiful Graphics**: Hand-drawn style with animated clouds, ground, and particles
- **Particle Effects**: Explosion effects on game over, celebration particles on scoring
- **Responsive Design**: Works on desktop and mobile devices
- **Touch/Click/Keyboard Controls**: Multiple input methods
- **High Score Tracking**: Persistent high score saved in localStorage
- **Performance Optimized**: Smooth 60 FPS gameplay
- **Professional UI**: Polished start screen, game over screen, and HUD

## How to Play 🎮

1. Open `index.html` in any modern web browser
2. Press **SPACE**, **CLICK**, or **TAP** to start
3. Keep the bird flying by pressing SPACE, clicking, or tapping
4. Avoid the pipes!
5. Try to beat your high score

### Controls

- **Keyboard**: SPACE key
- **Mouse**: Left click anywhere
- **Touch**: Tap anywhere (mobile)

## Installation 📦

### Quick Start (No Installation Required)

Simply double-click `index.html` to play in your default browser!

### Local Web Server (Recommended for Development)

For the best experience during development:

```powershell
# Using Python 3
python -m http.server 8000

# Using Node.js (if you have http-server installed)
npx http-server -p 8000

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

## File Structure 📁

```
mygame/
├── index.html      # Main HTML file
├── style.css       # Styling and animations
├── game.js         # Complete game logic
└── README.md       # This file
```

## Technical Details 🔧

### Architecture

- **State Management**: Clean state machine (start → playing → gameOver)
- **Object-Oriented Design**: Separate classes for Bird, Pipe, Ground, Particle
- **Configuration Object**: Easy difficulty tuning via CONFIG object
- **Modular Code**: Well-organized, readable, and maintainable

### Performance

- Optimized canvas rendering
- Efficient collision detection
- Particle pooling and cleanup
- Smooth 60 FPS on modern hardware

### Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Full support

## Customization 🎨

Edit the `CONFIG` object in `game.js` to customize gameplay:

```javascript
const CONFIG = {
    gravity: 0.6,           // Gravity strength
    flapStrength: -11,      // Jump power
    pipeGap: 180,           // Gap between pipes
    pipeSpeed: 3,           // Game speed
    spawnInterval: 1800,    // Pipe spawn frequency (in frames)
    // ... and more!
};
```

## Future Enhancements 💡

Potential additions for future versions:
- Sound effects and background music
- Multiple difficulty modes
- Power-ups and special abilities
- Online leaderboards
- Skins and themes
- Achievements system

## Credits 👨‍💻

Built with ❤️ using vanilla JavaScript and HTML5 Canvas.
Inspired by the classic Flappy Bird game.

## License 📄

Free to use and modify for personal and educational purposes.

---

**Enjoy the game!** 🎮🐦
