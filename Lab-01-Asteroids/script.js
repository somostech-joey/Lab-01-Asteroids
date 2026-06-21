// Get the canvas and the drawing context.
// This is where the game is painted each frame.
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Connect the score display and game over panel.
const scoreEl = document.getElementById('score');
const overlay = document.getElementById('overlay');
const finalScoreEl = document.getElementById('finalScore');
const restartButton = document.getElementById('restartButton');

// Track which keys are currently being pressed.
const keys = {};

// Store the game state so the loop can update and draw it.
let ship;
let asteroids = [];
let bullets = [];
let stars = [];
let score = 0;
let gameOver = false;
let lastFrameTime = 0;
let shootCooldown = 0;
let difficultyTimer = 0;
let difficulty = 1;

// Make the canvas fill the whole browser window.
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);

// Keyboard controls.
window.addEventListener('keydown', (event) => {
  keys[event.key] = true;

  // Prevent the page from scrolling when pressing the spacebar.
  if (event.code === 'Space') {
    event.preventDefault();
  }
});

window.addEventListener('keyup', (event) => {
  keys[event.key] = false;
});

// Create a fresh game state.
function resetGame() {
  resizeCanvas();
  ship = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 18,
    angle: -Math.PI / 2,
    vx: 0,
    vy: 0,
    thrust: 260,
    rotationSpeed: 3.4,
    maxSpeed: 360,
  };

  asteroids = [];
  bullets = [];
  score = 0;
  gameOver = false;
  shootCooldown = 0;
  difficultyTimer = 0;
  difficulty = 1;
  stars = createStars(140);
  overlay.classList.add('hidden');
  updateScore();

  // Start with a few asteroids so the game feels active right away.
  for (let i = 0; i < 4; i += 1) {
    spawnAsteroid();
  }
}

// Generate a starfield for the background.
function createStars(count) {
  const result = [];
  for (let i = 0; i < count; i += 1) {
    result.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 1.6 + 0.4,
      alpha: Math.random() * 0.8 + 0.2,
    });
  }
  return result;
}

// Spawn an asteroid from the edge of the screen.
function spawnAsteroid() {
  const size = 24 + Math.random() * 26;
  let x = 0;
  let y = 0;

  if (Math.random() < 0.5) {
    x = Math.random() < 0.5 ? -size : canvas.width + size;
    y = Math.random() * canvas.height;
  } else {
    x = Math.random() * canvas.width;
    y = Math.random() < 0.5 ? -size : canvas.height + size;
  }

  const angle = Math.random() * Math.PI * 2;
  const speed = 70 + Math.random() * 60 + difficulty * 15;

  asteroids.push({
    x,
    y,
    size,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    rotation: Math.random() * 0.04 - 0.02,
  });
}

function updateScore() {
  scoreEl.textContent = `Score: ${score}`;
}

function showGameOver() {
  gameOver = true;
  finalScoreEl.textContent = score;
  overlay.classList.remove('hidden');
}

// Main game loop.
function gameLoop(timestamp) {
  const delta = Math.min((timestamp - lastFrameTime) / 1000, 0.03);
  lastFrameTime = timestamp;

  if (!gameOver) {
    updateGame(delta);
  }

  drawGame();
  requestAnimationFrame(gameLoop);
}

function updateGame(delta) {
  // Let the player rotate and thrust.
  if (keys.ArrowLeft) {
    ship.angle -= ship.rotationSpeed * delta;
  }
  if (keys.ArrowRight) {
    ship.angle += ship.rotationSpeed * delta;
  }
  if (keys.ArrowUp) {
    ship.vx += Math.cos(ship.angle) * ship.thrust * delta;
    ship.vy += Math.sin(ship.angle) * ship.thrust * delta;
  }

  // Apply a small drag so the ship does not accelerate forever.
  ship.vx *= 0.98;
  ship.vy *= 0.98;

  // Move the ship.
  ship.x += ship.vx * delta;
  ship.y += ship.vy * delta;

  // Wrap the ship around the screen edges.
  if (ship.x < -30) ship.x = canvas.width + 30;
  if (ship.x > canvas.width + 30) ship.x = -30;
  if (ship.y < -30) ship.y = canvas.height + 30;
  if (ship.y > canvas.height + 30) ship.y = -30;

  // Keep the ship speed under the maximum.
  const speed = Math.hypot(ship.vx, ship.vy);
  if (speed > ship.maxSpeed) {
    const scale = ship.maxSpeed / speed;
    ship.vx *= scale;
    ship.vy *= scale;
  }

  // Fire bullets when the space bar is held.
  if (keys[' ']) {
    if (shootCooldown <= 0) {
      bullets.push({
        x: ship.x + Math.cos(ship.angle) * (ship.radius + 8),
        y: ship.y + Math.sin(ship.angle) * (ship.radius + 8),
        vx: Math.cos(ship.angle) * 420,
        vy: Math.sin(ship.angle) * 420,
        life: 1.0,
      });
      shootCooldown = 0.18;
    }
  }
  shootCooldown = Math.max(0, shootCooldown - delta);

  // Update bullets.
  for (let i = bullets.length - 1; i >= 0; i -= 1) {
    const bullet = bullets[i];
    bullet.x += bullet.vx * delta;
    bullet.y += bullet.vy * delta;
    bullet.life -= delta;

    if (bullet.life <= 0 || bullet.x < -20 || bullet.x > canvas.width + 20 || bullet.y < -20 || bullet.y > canvas.height + 20) {
      bullets.splice(i, 1);
    }
  }

  // Increase difficulty over time.
  difficultyTimer += delta;
  if (difficultyTimer > 5) {
    difficulty += 0.15;
    difficultyTimer = 0;
  }

  // Spawn new asteroids as the game gets harder.
  if (Math.random() < 0.02 + difficulty * 0.004) {
    spawnAsteroid();
  }

  // Update asteroid positions.
  for (let i = asteroids.length - 1; i >= 0; i -= 1) {
    const asteroid = asteroids[i];
    asteroid.x += asteroid.vx * delta;
    asteroid.y += asteroid.vy * delta;
    asteroid.rotation += asteroid.rotation * 0.1;

    if (asteroid.x < -80) asteroid.x = canvas.width + 80;
    if (asteroid.x > canvas.width + 80) asteroid.x = -80;
    if (asteroid.y < -80) asteroid.y = canvas.height + 80;
    if (asteroid.y > canvas.height + 80) asteroid.y = -80;

    // Check bullet hits.
    for (let j = bullets.length - 1; j >= 0; j -= 1) {
      const bullet = bullets[j];
      if (Math.hypot(asteroid.x - bullet.x, asteroid.y - bullet.y) < asteroid.size + 4) {
        bullets.splice(j, 1);
        asteroids.splice(i, 1);
        score += 10;
        updateScore();
        break;
      }
    }

    // Check ship collision.
    if (!gameOver && Math.hypot(asteroid.x - ship.x, asteroid.y - ship.y) < asteroid.size + ship.radius) {
      showGameOver();
      break;
    }
  }
}

function drawGame() {
  // Draw a dark space background.
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#040611';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw stars.
  ctx.save();
  stars.forEach((star) => {
    ctx.beginPath();
    ctx.fillStyle = `rgba(255,255,255,${star.alpha})`;
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();

  // Draw asteroids.
  asteroids.forEach((asteroid) => {
    ctx.save();
    ctx.translate(asteroid.x, asteroid.y);
    ctx.rotate(asteroid.rotation);
    ctx.beginPath();
    ctx.fillStyle = '#6d5a4b';
    ctx.strokeStyle = '#bfa78a';
    ctx.lineWidth = 2;

    // A simple asteroid shape made from a few points.
    const points = 8;
    for (let i = 0; i <= points; i += 1) {
      const angle = (i / points) * Math.PI * 2;
      const radius = asteroid.size + Math.sin(i * 0.7) * 7;
      const xPoint = Math.cos(angle) * radius;
      const yPoint = Math.sin(angle) * radius;
      if (i === 0) {
        ctx.moveTo(xPoint, yPoint);
      } else {
        ctx.lineTo(xPoint, yPoint);
      }
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  });

  // Draw bullets.
  bullets.forEach((bullet) => {
    ctx.beginPath();
    ctx.fillStyle = '#ffd66b';
    ctx.arc(bullet.x, bullet.y, 2.5, 0, Math.PI * 2);
    ctx.fill();
  });

  // Draw the ship.
  ctx.save();
  ctx.translate(ship.x, ship.y);
  ctx.rotate(ship.angle);
  ctx.beginPath();
  ctx.fillStyle = '#7ed6ff';
  ctx.strokeStyle = '#f5f7ff';
  ctx.lineWidth = 2;
  ctx.moveTo(ship.radius, 0);
  ctx.lineTo(-ship.radius * 0.8, ship.radius * 0.6);
  ctx.lineTo(-ship.radius * 0.4, 0);
  ctx.lineTo(-ship.radius * 0.8, -ship.radius * 0.6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

// Start the game when the page loads.
restartButton.addEventListener('click', resetGame);
resetGame();
requestAnimationFrame(gameLoop);
