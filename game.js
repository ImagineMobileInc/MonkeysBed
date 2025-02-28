// Game setup
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 600;

let gameState = "start";
let score = 0;
let leaderboard = [];
const gravity = 0.5;
let initialBounceHeight = canvas.height * 0.75; // 3/4 screen height
let currentBounceHeight = initialBounceHeight;

// Game objects
let bed = {
  x: canvas.width / 2,
  y: canvas.height - 40,
  width: 120,
  height: 20,
  speed: 10
};

let monkey = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 20,
  vy: -Math.sqrt(2 * gravity * initialBounceHeight), // Initial velocity for 3/4 height
  vx: 0,
  rotation: 0,
  rotationSpeed: 0.1
};

let bananas = [];
let obstacles = [];
let lastBananaTime = 0;
let lastObstacleTime = 0;

// Event listeners
canvas.addEventListener("mousemove", (e) => {
  if (gameState === "playing") {
    const rect = canvas.getBoundingClientRect();
    bed.x = e.clientX - rect.left;
    bed.x = Math.max(bed.width / 2, Math.min(canvas.width - bed.width / 2, bed.x));
  }
});

canvas.addEventListener("click", () => {
  if (gameState === "start" || gameState === "gameOver") {
    resetGame();
    gameState = "playing";
  }
});

// Draw functions
function drawBed() {
  ctx.fillStyle = "#6464FF"; // Blue mattress
  ctx.fillRect(bed.x - bed.width / 2, bed.y, bed.width, bed.height);
  ctx.fillStyle = "#8B4513"; // Brown legs
  ctx.fillRect(bed.x - bed.width / 2 + 5, bed.y + bed.height, 10, 15);
  ctx.fillRect(bed.x + bed.width / 2 - 15, bed.y + bed.height, 10, 15);
}

function drawMonkey() {
  ctx.save();
  ctx.translate(monkey.x, monkey.y);
  ctx.rotate(monkey.rotation);
  ctx.fillStyle = "#966432"; // Brown fur
  ctx.beginPath();
  ctx.arc(0, 0, monkey.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#C8A064"; // Face
  ctx.beginPath();
  ctx.arc(0, -monkey.radius / 2, monkey.radius * 0.7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#FFFFFF"; // Eyes
  ctx.beginPath();
  ctx.arc(-monkey.radius / 3, -monkey.radius / 1.5, monkey.radius / 4, 0, Math.PI * 2);
  ctx.arc(monkey.radius / 3, -monkey.radius / 1.5, monkey.radius / 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#000000"; // Pupils
  ctx.beginPath();
  ctx.arc(-monkey.radius / 3, -monkey.radius / 1.5, monkey.radius / 8, 0, Math.PI * 2);
  ctx.arc(monkey.radius / 3, -monkey.radius / 1.5, monkey.radius / 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#000000"; // Mouth
  ctx.beginPath();
  ctx.arc(0, 0, monkey.radius / 2, 0, Math.PI);
  ctx.stroke();
  ctx.fillStyle = "#966432"; // Limbs
  ctx.fillRect(-monkey.radius * 0.8, -monkey.radius / 2, 5, monkey.radius);
  ctx.fillRect(monkey.radius * 0.6, -monkey.radius / 2, 5, monkey.radius);
  ctx.fillRect(-monkey.radius / 2, monkey.radius / 2, 5, monkey.radius);
  ctx.fillRect(monkey.radius / 4, monkey.radius / 2, 5, monkey.radius);
  ctx.strokeStyle = "#966432"; // Tail
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, monkey.radius);
  ctx.quadraticCurveTo(-monkey.radius * 1.5, monkey.radius * 1.5, -monkey.radius, 0);
  ctx.stroke();
  ctx.restore();
}

function drawBanana(x, y, size) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.PI / 4);
  ctx.fillStyle = "#FFFF00"; // Yellow
  ctx.beginPath();
  ctx.moveTo(-size / 2, size / 4);
  ctx.quadraticCurveTo(0, -size / 2, size / 2, size / 4);
  ctx.quadraticCurveTo(0, size / 2, -size / 2, size / 4);
  ctx.fill();
  ctx.restore();
}

function drawObstacle(x, y, size) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Date.now() * 0.005); // Spin effect
  ctx.fillStyle = "#FF0000"; // Red
  ctx.beginPath();
  ctx.moveTo(0, -size / 2);
  ctx.lineTo(-size / 2, size / 2);
  ctx.lineTo(size / 2, size / 2);
  ctx.fill();
  ctx.restore();
}

function drawText(text, x, y, size, bold = false) {
  ctx.fillStyle = "#333";
  ctx.font = `${bold ? "bold " : ""}${size}px Arial`;
  ctx.textAlign = "center";
  ctx.fillText(text, x, y);
}

// Game logic
function update() {
  if (gameState === "playing") {
    // Update monkey physics
    monkey.vy += gravity;
    monkey.y += monkey.vy;
    monkey.rotation += monkey.rotationSpeed;

    // Bounce off bed
    if (monkey.y + monkey.radius > bed.y && 
        monkey.x > bed.x - bed.width / 2 && 
        monkey.x < bed.x + bed.width / 2) {
      monkey.y = bed.y - monkey.radius;
      monkey.vy = -Math.sqrt(2 * gravity * currentBounceHeight); // Bounce to current height
      monkey.rotationSpeed = (Math.random() - 0.5) * 0.4;
    }

    // Check game over conditions
    if (monkey.y + monkey.radius > bed.y && 
        (monkey.x < bed.x - bed.width / 2 || monkey.x > bed.x + bed.width / 2)) {
      gameOver();
    } else if (monkey.y >= canvas.height - monkey.radius && monkey.vy >= 0) {
      gameOver(); // Monkey stopped without jumping
    }

    // Reduce bounce height if no banana collected
    if (monkey.y + monkey.radius > bed.y && monkey.vy > 0) {
      currentBounceHeight = Math.max(currentBounceHeight - canvas.height / 8, 0);
    }

    // Spawn bananas and obstacles
    const now = Date.now();
    if (now - lastBananaTime > 2500) {
      bananas.push({ x: Math.random() * canvas.width, y: -20, vy: 3 + Math.random() * 3, size: 20 });
      lastBananaTime = now;
    }
    if (now - lastObstacleTime > 4000) {
      obstacles.push({ x: Math.random() * canvas.width, y: -20, vy: 2 + Math.random() * 3, size: 25 });
      lastObstacleTime = now;
    }

    // Update bananas
    bananas = bananas.filter(b => {
      b.y += b.vy;
      const dx = monkey.x - b.x;
      const dy = monkey.y - b.y;
      if (Math.sqrt(dx * dx + dy * dy) < monkey.radius + b.size / 2) {
        score += 10;
        currentBounceHeight = initialBounceHeight; // Reset bounce height
        return false;
      }
      return b.y < canvas.height + 20;
    });

    // Update obstacles
    obstacles = obstacles.filter(o => {
      o.y += o.vy;
      const dx = monkey.x - o.x;
      const dy = monkey.y - o.y;
      if (Math.sqrt(dx * dx + dy * dy) < monkey.radius + o.size / 2) {
        gameOver();
        return false;
      }
      return o.y < canvas.height + 20;
    });
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (gameState === "start") {
    drawText("Monkey's Bed", canvas.width / 2, canvas.height / 2 - 80, 40, true);
    drawText("Move the bed with your mouse to bounce the monkey.", canvas.width / 2, canvas.height / 2 - 20, 20);
    drawText("Collect bananas, avoid obstacles!", canvas.width / 2, canvas.height / 2 + 10, 20);
    ctx.fillStyle = "#009600";
    ctx.fillRect(canvas.width / 2 - 100, canvas.height / 2 + 40, 200, 50);
    ctx.fillStyle = "#FFFFFF";
    drawText("Click to Start", canvas.width / 2, canvas.height / 2 + 70, 20);
    drawLeaderboard(canvas.height / 2 + 130);
  } else if (gameState === "playing") {
    drawBed();
    drawMonkey();
    bananas.forEach(b => drawBanana(b.x, b.y, b.size));
    obstacles.forEach(o => drawObstacle(o.x, o.y, o.size));
    drawText(`Score: ${score}`, 50, 30, 20, true);
  } else if (gameState === "gameOver") {
    drawText("Game Over", canvas.width / 2, canvas.height / 2 - 80, 40, true);
    drawText(`Your Score: ${score}`, canvas.width / 2, canvas.height / 2 - 20, 20);
    ctx.fillStyle = "#009600";
    ctx.fillRect(canvas.width / 2 - 100, canvas.height / 2 + 10, 200, 50);
    ctx.fillStyle = "#FFFFFF";
    drawText("Play Again", canvas.width / 2, canvas.height / 2 + 40, 20);
    drawLeaderboard(canvas.height / 2 + 100);
  }
}

function drawLeaderboard(yStart) {
  drawText("Leaderboard", canvas.width / 2, yStart, 18, true);
  ctx.textAlign = "center";
  leaderboard.forEach((entry, i) => {
    drawText(`${i + 1}. ${entry.email} - ${entry.score}`, canvas.width / 2, yStart + 20 + i * 20, 14);
  });
}

async function gameOver() {
  gameState = "gameOver";
  const email = prompt("Enter your email to save your score:");
  if (email) {
    const maskedEmail = maskEmail(email);
    try {
      const { collection, addDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js');
      await addDoc(collection(window.db, "scores"), {
        email: maskedEmail,
        score: score,
        timestamp: serverTimestamp()
      });
      await loadLeaderboard();
    } catch (err) {
      console.error("Error saving score:", err);
    }
  }
}

function maskEmail(email) {
  if (!email || !email.includes("@")) return "Anonymous";
  const [local, domain] = email.split("@");
  if (local.length <= 2) return `${local}@${domain}`;
  return `${local[0]}${"*".repeat(local.length - 2)}${local[local.length - 1]}@${domain}`;
}

async function loadLeaderboard() {
  try {
    const { collection, query, orderBy, limit, getDocs } = await import('https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js');
    const q = query(collection(window.db, "scores"), orderBy("score", "desc"), limit(10));
    const snapshot = await getDocs(q);
    leaderboard = snapshot.docs.map(doc => doc.data());
  } catch (err) {
    console.error("Error loading leaderboard:", err);
  }
}

function resetGame() {
  bed.x = canvas.width / 2;
  monkey.x = canvas.width / 2;
  monkey.y = canvas.height / 2;
  monkey.vy = -Math.sqrt(2 * gravity * initialBounceHeight);
  monkey.vx = 0;
  monkey.rotation = 0;
  monkey.rotationSpeed = 0.1;
  bananas = [];
  obstacles = [];
  score = 0;
  currentBounceHeight = initialBounceHeight;
  lastBananaTime = Date.now();
  lastObstacleTime = Date.now();
}

// Game loop
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

loadLeaderboard();
gameLoop();