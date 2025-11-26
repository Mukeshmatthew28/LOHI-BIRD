// Detect if mobile device
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// Game Configuration
const CONFIG = {
    width: 480,
    height: 640,
    gravity: isMobile ? 0.3 : 0.6,
    flapStrength: isMobile ? -7 : -11,
    pipeGap: isMobile ? 220 : 180,
    pipeWidth: 80,
    pipeSpeed: isMobile ? 1.5 : 3,
    spawnInterval: isMobile ? 150 : 90,
    birdSize: 45,
    groundHeight: 80,
    birdImage: null,
    sounds: {
        flap: null,
        score: null,
        hit: null
    },
    colors: {
        sky: '#4ec0ca',
        skyBottom: '#87ceeb',
        ground: '#ded895',
        groundDark: '#c4b87a',
        pipe: '#5cb85c',
        pipeDark: '#4a934a',
        pipeHighlight: '#7cd97c',
        bird: '#ffd700',
        birdDark: '#ffaa00',
        birdWing: '#ff8800'
    }
};

// Game State
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = CONFIG.width;
        this.canvas.height = CONFIG.height;

        // Load bird image
        this.loadBirdImage();

        this.state = 'start'; // 'start', 'playing', 'gameOver'
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('lohiHighScore') || '0');

        this.bird = new Bird();
        this.pipes = [];
        this.particles = [];
        this.ground = new Ground();

        this.lastPipeTime = 0;
        this.frameCount = 0;

        this.setupEventListeners();
        this.updateUI();
        this.gameLoop();
    }

    loadBirdImage() {
        CONFIG.birdImage = new Image();
        CONFIG.birdImage.onload = () => {
            console.log('Bird image loaded successfully!');
        };
        CONFIG.birdImage.onerror = () => {
            console.error('Failed to load bird image');
        };
        CONFIG.birdImage.src = 'assets/bird.png?' + Date.now();

        // Initialize sounds using Web Audio API
        this.initSounds();
    }

    initSounds() {
        // Load custom flap sound from file
        const flapAudio = new Audio();
        flapAudio.src = 'assets/flap.mp3';
        flapAudio.volume = 0.5;

        CONFIG.sounds.flap = () => {
            const sound = flapAudio.cloneNode();
            sound.play().catch(e => console.log('Audio play failed:', e));
        };

        // Create simple sound effects using Web Audio API
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const audioCtx = new AudioContext();

        // Score sound - pleasant ding
        CONFIG.sounds.score = () => {
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);

            oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
            oscillator.frequency.setValueAtTime(1000, audioCtx.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);

            oscillator.start(audioCtx.currentTime);
            oscillator.stop(audioCtx.currentTime + 0.3);
        };

        // Hit sound - low thud
        CONFIG.sounds.hit = () => {
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);

            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(100, audioCtx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.2);
            gainNode.gain.setValueAtTime(0.4, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);

            oscillator.start(audioCtx.currentTime);
            oscillator.stop(audioCtx.currentTime + 0.2);
        };
    }

    setupEventListeners() {
        const handleInput = (e) => {
            e.preventDefault();
            if (this.state === 'start') {
                this.startGame();
            } else if (this.state === 'playing') {
                this.bird.flap();
            } else if (this.state === 'gameOver') {
                this.resetGame();
            }
        };

        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                handleInput(e);
            }
        });

        this.canvas.addEventListener('click', handleInput);
        this.canvas.addEventListener('touchstart', handleInput);
    }

    startGame() {
        this.state = 'playing';
        document.getElementById('start-screen').classList.add('hidden');
        document.getElementById('hud').classList.remove('hidden');
    }

    resetGame() {
        this.state = 'start';
        this.score = 0;
        this.bird = new Bird();
        this.pipes = [];
        this.particles = [];
        this.lastPipeTime = 0;
        this.frameCount = 0;

        document.getElementById('game-over-screen').classList.add('hidden');
        document.getElementById('start-screen').classList.remove('hidden');
        document.getElementById('hud').classList.add('hidden');
        this.updateUI();
    }

    gameOver() {
        this.state = 'gameOver';

        // Play hit sound
        if (CONFIG.sounds.hit) CONFIG.sounds.hit();

        // Create explosion particles
        for (let i = 0; i < 20; i++) {
            this.particles.push(new Particle(
                this.bird.x + CONFIG.birdSize / 2,
                this.bird.y + CONFIG.birdSize / 2
            ));
        }

        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('lohiHighScore', this.highScore.toString());
        }

        document.getElementById('final-score').textContent = this.score;
        document.getElementById('high-score-display').textContent = this.highScore;
        document.getElementById('hud').classList.add('hidden');
        document.getElementById('game-over-screen').classList.remove('hidden');
    }

    updateUI() {
        document.getElementById('score').textContent = this.score;
    }

    spawnPipe() {
        const minHeight = 100;
        const maxHeight = CONFIG.height - CONFIG.groundHeight - CONFIG.pipeGap - 100;
        const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;
        this.pipes.push(new Pipe(topHeight));
    }

    update() {
        if (this.state !== 'playing') {
            if (this.state === 'start') {
                // Gentle bobbing animation
                this.bird.y = CONFIG.height / 3 + Math.sin(this.frameCount * 0.05) * 10;
            }
            this.ground.update();
            this.frameCount++;
            return;
        }

        this.frameCount++;
        this.bird.update();
        this.ground.update();

        // Spawn pipes
        if (this.frameCount - this.lastPipeTime > CONFIG.spawnInterval) {
            this.spawnPipe();
            this.lastPipeTime = this.frameCount;
        }

        // Update pipes
        for (let i = this.pipes.length - 1; i >= 0; i--) {
            const pipe = this.pipes[i];
            pipe.update();

            // Check collision
            if (this.checkCollision(pipe)) {
                this.gameOver();
                return;
            }

            // Score point
            if (!pipe.scored && pipe.x + CONFIG.pipeWidth < this.bird.x) {
                pipe.scored = true;
                this.score++;
                this.updateUI();
                this.createScoreParticles();
                if (CONFIG.sounds.score) CONFIG.sounds.score();
            }

            // Remove off-screen pipes
            if (pipe.x < -CONFIG.pipeWidth) {
                this.pipes.splice(i, 1);
            }
        }

        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update();
            if (this.particles[i].life <= 0) {
                this.particles.splice(i, 1);
            }
        }

        // Check ground/ceiling collision
        if (this.bird.y + CONFIG.birdSize > CONFIG.height - CONFIG.groundHeight ||
            this.bird.y < 0) {
            this.gameOver();
        }
    }

    checkCollision(pipe) {
        const birdLeft = this.bird.x;
        const birdRight = this.bird.x + CONFIG.birdSize;
        const birdTop = this.bird.y;
        const birdBottom = this.bird.y + CONFIG.birdSize;

        const pipeLeft = pipe.x;
        const pipeRight = pipe.x + CONFIG.pipeWidth;

        // Check horizontal overlap
        if (birdRight > pipeLeft && birdLeft < pipeRight) {
            // Check vertical collision (top or bottom pipe)
            if (birdTop < pipe.topHeight || birdBottom > pipe.topHeight + CONFIG.pipeGap) {
                return true;
            }
        }

        return false;
    }

    createScoreParticles() {
        for (let i = 0; i < 5; i++) {
            this.particles.push(new Particle(
                this.bird.x + CONFIG.birdSize / 2,
                this.bird.y + CONFIG.birdSize / 2,
                true
            ));
        }
    }

    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, CONFIG.width, CONFIG.height);

        // Draw sky gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, CONFIG.height);
        gradient.addColorStop(0, CONFIG.colors.sky);
        gradient.addColorStop(1, CONFIG.colors.skyBottom);
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);

        // Draw clouds
        this.drawClouds();

        // Draw pipes
        this.pipes.forEach(pipe => pipe.draw(this.ctx));

        // Draw bird (only if not game over or still visible)
        if (this.state !== 'gameOver' || this.particles.length === 0) {
            this.bird.draw(this.ctx);
        }

        // Draw particles
        this.particles.forEach(particle => particle.draw(this.ctx));

        // Draw ground
        this.ground.draw(this.ctx);
    }

    drawClouds() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        const cloudOffset = (this.frameCount * 0.2) % (CONFIG.width + 100);

        // Cloud 1
        this.ctx.beginPath();
        this.ctx.arc(100 - cloudOffset, 100, 30, 0, Math.PI * 2);
        this.ctx.arc(130 - cloudOffset, 100, 40, 0, Math.PI * 2);
        this.ctx.arc(160 - cloudOffset, 100, 30, 0, Math.PI * 2);
        this.ctx.fill();

        // Cloud 2
        this.ctx.beginPath();
        this.ctx.arc(300 - cloudOffset, 150, 25, 0, Math.PI * 2);
        this.ctx.arc(325 - cloudOffset, 150, 35, 0, Math.PI * 2);
        this.ctx.arc(350 - cloudOffset, 150, 25, 0, Math.PI * 2);
        this.ctx.fill();

        // Cloud 3
        this.ctx.beginPath();
        this.ctx.arc(500 - cloudOffset, 80, 20, 0, Math.PI * 2);
        this.ctx.arc(520 - cloudOffset, 80, 30, 0, Math.PI * 2);
        this.ctx.arc(540 - cloudOffset, 80, 20, 0, Math.PI * 2);
        this.ctx.fill();
    }

    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Bird Class
class Bird {
    constructor() {
        this.x = CONFIG.width / 4;
        this.y = CONFIG.height / 3;
        this.velocity = 0;
        this.rotation = 0;
    }

    flap() {
        this.velocity = CONFIG.flapStrength;
        if (CONFIG.sounds.flap) CONFIG.sounds.flap();
    }

    update() {
        this.velocity += CONFIG.gravity;
        this.y += this.velocity;

        // Update rotation based on velocity
        this.rotation = Math.min(Math.max(this.velocity * 3, -30), 90);
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + CONFIG.birdSize / 2, this.y + CONFIG.birdSize / 2);
        ctx.rotate((this.rotation * Math.PI) / 180);

        // Draw the face image if loaded
        if (CONFIG.birdImage && CONFIG.birdImage.complete) {
            ctx.drawImage(
                CONFIG.birdImage,
                -CONFIG.birdSize / 2,
                -CONFIG.birdSize / 2,
                CONFIG.birdSize,
                CONFIG.birdSize
            );
        } else {
            // Fallback: draw a simple circle if image not loaded
            ctx.fillStyle = CONFIG.colors.bird;
            ctx.beginPath();
            ctx.arc(0, 0, CONFIG.birdSize / 2, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}

// Pipe Class
class Pipe {
    constructor(topHeight) {
        this.x = CONFIG.width;
        this.topHeight = topHeight;
        this.scored = false;
    }

    update() {
        this.x -= CONFIG.pipeSpeed;
    }

    draw(ctx) {
        // Draw top pipe
        this.drawPipeSegment(ctx, this.x, 0, CONFIG.pipeWidth, this.topHeight, true);

        // Draw bottom pipe
        const bottomY = this.topHeight + CONFIG.pipeGap;
        const bottomHeight = CONFIG.height - CONFIG.groundHeight - bottomY;
        this.drawPipeSegment(ctx, this.x, bottomY, CONFIG.pipeWidth, bottomHeight, false);
    }

    drawPipeSegment(ctx, x, y, width, height, isTop) {
        // Pipe body
        ctx.fillStyle = CONFIG.colors.pipe;
        ctx.fillRect(x, y, width, height);

        // Pipe dark side
        ctx.fillStyle = CONFIG.colors.pipeDark;
        ctx.fillRect(x + width - 10, y, 10, height);

        // Pipe highlight
        ctx.fillStyle = CONFIG.colors.pipeHighlight;
        ctx.fillRect(x, y, 10, height);

        // Pipe cap
        const capHeight = 30;
        const capWidth = width + 10;
        const capX = x - 5;
        const capY = isTop ? y + height - capHeight : y;

        ctx.fillStyle = CONFIG.colors.pipe;
        ctx.fillRect(capX, capY, capWidth, capHeight);

        ctx.fillStyle = CONFIG.colors.pipeDark;
        ctx.fillRect(capX + capWidth - 12, capY, 12, capHeight);

        ctx.fillStyle = CONFIG.colors.pipeHighlight;
        ctx.fillRect(capX, capY, 12, capHeight);
    }
}

// Ground Class
class Ground {
    constructor() {
        this.x = 0;
        this.y = CONFIG.height - CONFIG.groundHeight;
    }

    update() {
        this.x -= CONFIG.pipeSpeed;
        if (this.x <= -50) {
            this.x = 0;
        }
    }

    draw(ctx) {
        ctx.fillStyle = CONFIG.colors.ground;
        ctx.fillRect(0, this.y, CONFIG.width, CONFIG.groundHeight);

        // Ground pattern
        ctx.fillStyle = CONFIG.colors.groundDark;
        for (let i = 0; i < CONFIG.width / 50 + 2; i++) {
            const x = i * 50 + this.x;
            ctx.fillRect(x, this.y, 40, 10);
            ctx.fillRect(x + 10, this.y + 15, 20, 10);
            ctx.fillRect(x + 5, this.y + 30, 30, 10);
        }

        // Grass
        ctx.strokeStyle = '#7cb342';
        ctx.lineWidth = 2;
        for (let i = 0; i < CONFIG.width / 20 + 2; i++) {
            const x = i * 20 + this.x;
            ctx.beginPath();
            ctx.moveTo(x, this.y);
            ctx.lineTo(x - 3, this.y - 8);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(x, this.y);
            ctx.lineTo(x + 3, this.y - 8);
            ctx.stroke();
        }
    }
}

// Particle Class
class Particle {
    constructor(x, y, isScore = false) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 8;
        this.vy = (Math.random() - 0.5) * 8 - 2;
        this.life = 60;
        this.maxLife = 60;
        this.size = Math.random() * 6 + 2;
        this.isScore = isScore;
        this.color = isScore
            ? `hsl(${Math.random() * 60 + 30}, 100%, 50%)`
            : `hsl(${Math.random() * 60}, 100%, 50%)`;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.3;
        this.life--;
        this.vx *= 0.98;
    }

    draw(ctx) {
        const alpha = this.life / this.maxLife;
        ctx.fillStyle = this.color;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * alpha, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    new Game();
});
