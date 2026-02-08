class Particle {
    constructor(canvas) {
        this.canvas = canvas;
        this.reset();
        this.maxSpeed = 1.0;
        this.maxForce = 0.1;
        this.particleSize = 10;
        this.isKilled = false;

        this.startColor = { r: 255, g: 255, b: 255 };
        this.targetColor = { r: 255, g: 255, b: 255 };
        this.colorWeight = 0;
        this.colorBlendRate = 0.01;

        this.speed = Math.random() * 8 + 4;
        this.z = Math.random() * 2000;
    }

    reset() {
        this.x = (Math.random() - 0.5) * this.canvas.width;
        this.y = (Math.random() - 0.5) * this.canvas.height;
        this.z = Math.random() * 2000;
        this.speed = Math.random() * 8 + 4;
    }

    update() {
        this.z -= this.speed;

        if (this.z <= 0) {
            this.reset();
            this.z = 2000;
        }
    }

    draw(ctx) {
        const cx = this.canvas.width / 2;
        const cy = this.canvas.height / 2;

        const k = 200 / this.z;
        const px = this.x * k + cx;
        const py = this.y * k + cy;

        const pz = 200 / (this.z + this.speed);
        const px2 = this.x * pz + cx;
        const py2 = this.y * pz + cy;

        if (this.colorWeight < 1.0) {
            this.colorWeight = Math.min(this.colorWeight + this.colorBlendRate, 1.0);
        }

        const currentColor = {
            r: Math.round(this.startColor.r + (this.targetColor.r - this.startColor.r) * this.colorWeight),
            g: Math.round(this.startColor.g + (this.targetColor.g - this.startColor.g) * this.colorWeight),
            b: Math.round(this.startColor.b + (this.targetColor.b - this.startColor.b) * this.colorWeight)
        };

        const size = (1 - this.z / 2000) * 4;
        const alpha = 1 - this.z / 2000;

        ctx.strokeStyle = `rgba(${currentColor.r}, ${currentColor.g}, ${currentColor.b}, ${alpha})`;
        ctx.lineWidth = size;
        ctx.beginPath();
        ctx.moveTo(px2, py2);
        ctx.lineTo(px, py);
        ctx.stroke();

        ctx.fillStyle = `rgba(${currentColor.r}, ${currentColor.g}, ${currentColor.b}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(px, py, size / 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const particles = [];
const particleCount = 800;

for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle(canvas));
}

const colors = [
    { r: 186, g: 225, b: 255 },
    { r: 255, g: 179, b: 186 },
    { r: 224, g: 187, b: 228 },
    { r: 186, g: 255, b: 201 },
    { r: 255, g: 249, b: 196 },
    { r: 255, g: 222, b: 186 }
];

let colorIndex = 0;
let frameCount = 0;

particles.forEach((particle, index) => {
    const color = colors[index % colors.length];
    particle.targetColor = color;
    particle.startColor = color;
});

function animate() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    particles.forEach(particle => {
        particle.update();
        particle.draw(ctx);
    });

    frameCount++;

    if (frameCount % 180 === 0) {
        colorIndex = (colorIndex + 1) % colors.length;
        particles.forEach(particle => {
            particle.startColor = {
                r: particle.startColor.r + (particle.targetColor.r - particle.startColor.r) * particle.colorWeight,
                g: particle.startColor.g + (particle.targetColor.g - particle.startColor.g) * particle.colorWeight,
                b: particle.startColor.b + (particle.targetColor.b - particle.startColor.b) * particle.colorWeight
            };
            particle.targetColor = colors[(colorIndex + Math.floor(Math.random() * 3)) % colors.length];
            particle.colorWeight = 0;
        });
    }

    requestAnimationFrame(animate);
}

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

animate();
