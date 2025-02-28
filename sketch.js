// Game variables
let gameState = "start";
let score = 0;
let bed, monkey, bananas, obstacles, lastBananaTime, lastObstacleTime;
let leaderboard = [];
let gravity = 0.5;

// Setup function
function setup() {
  createCanvas(800, 600);
  resetGame();
  loadLeaderboard();
}

// Draw function
function draw() {
  background(200, 230, 255); // Light blue background

  if (gameState === "start") {
    drawStartScreen();
  } else if (gameState === "playing") {
    drawPlayingScreen();
  } else if (gameState === "gameOver") {
    drawGameOverScreen();
  }
}

// Draw start screen
function drawStartScreen() {
  textAlign(CENTER);
  fill(50);
  textSize(40);
  textStyle(BOLD);
  text("Monkey's Bed", width / 2, height / 2 - 80);
  textSize(20);
  textStyle(NORMAL);
  text("Move the bed with your mouse to bounce the monkey.", width / 2, height / 2 - 20);
  text("Collect bananas for points, avoid red obstacles!", width / 2, height / 2 + 10);
  fill(0, 150, 0);
  rect(width / 2 - 100, height / 2 + 40, 200, 50, 10);
  fill(255);
  text("Click to Start", width / 2, height / 2 + 70);

  // Display leaderboard
  fill(50);
  textSize(18);
  text("Leaderboard", width / 2, height / 2 + 130);
  textSize(14);
  if (leaderboard.length > 0) {
    let y = height / 2 + 150;
    for (let i = 0; i < leaderboard.length; i++) {
      let entry = leaderboard[i];
      text(`${i + 1}. ${entry.email} - ${entry.score}`, width / 2, y);
      y += 20;
    }
  } else {
    text("Loading leaderboard...", width / 2, height / 2 + 150);
  }
}

// Draw playing screen
function drawPlayingScreen() {
  // Update bed position
  bed.x = constrain(mouseX, bed.width / 2, width - bed.width / 2);

  // Update monkey physics
  monkey.vy += gravity;
  monkey.y += monkey.vy;
  monkey.x += monkey.vx;
  monkey.rotation += monkey.rotationSpeed;

  // Bounce off bed
  if (monkey.y + monkey.size / 2 > bed.y && 
      monkey.x > bed.x - bed.width / 2 && 
      monkey.x < bed.x + bed.width / 2) {
    monkey.vy = -abs(monkey.vy) * 0.85;
    monkey.y = bed.y - monkey.size / 2;
    monkey.rotationSpeed = random(-0.2, 0.2);
  }

  // Check game over conditions
  if (monkey.y + monkey.size / 2 > bed.y && 
      (monkey.x < bed.x - bed.width / 2 || monkey.x > bed.x + bed.width / 2)) {
    gameOver();
  }

  // Spawn bananas and obstacles
  let currentTime = millis();
  if (currentTime - lastBananaTime > 2500) {
    bananas.push({ x: random(width), y: -20, vy: random(3, 6), size: 20 });
    lastBananaTime = currentTime;
  }
  if (currentTime - lastObstacleTime > 4000) {
    obstacles.push({ x: random(width), y: -20, vy: random(2, 5), size: 25 });
    lastObstacleTime = currentTime;
  }

  // Update and draw bananas
  for (let i = bananas.length - 1; i >= 0; i--) {
    let banana = bananas[i];
    banana.y += banana.vy;
    let d = dist(monkey.x, monkey.y, banana.x, banana.y);
    if (d < monkey.size / 2 + banana.size / 2) {
      score += 10;
      bananas.splice(i, 1);
    } else if (banana.y > height + 20) {
      bananas.splice(i, 1);
    } else {
      drawBanana(banana.x, banana.y, banana.size);
    }
  }

  // Update and draw obstacles
  for (let i = obstacles.length - 1; i >= 0; i--) {
    let obstacle = obstacles[i];
    obstacle.y += obstacle.vy;
    let d = dist(monkey.x, monkey.y, obstacle.x, obstacle.y);
    if (d < monkey.size / 2 + obstacle.size / 2) {
      gameOver();
    } else if (obstacle.y > height + 20) {
      obstacles.splice(i, 1);
    } else {
      drawObstacle(obstacle.x, obstacle.y, obstacle.size);
    }
  }

  // Draw game elements
  drawBed(bed.x, bed.y, bed.width, bed.height);
  drawMonkey(monkey.x, monkey.y, monkey.size, monkey.rotation);

  // Draw score
  textAlign(LEFT);
  fill(0);
  textSize(20);
  textStyle(BOLD);
  text(`Score: ${score}`, 10, 30);
}

// Draw game over screen
function drawGameOverScreen() {
  textAlign(CENTER);
  fill(50);
  textSize(40);
  textStyle(BOLD);
  text("Game Over", width / 2, height / 2 - 80);
  textSize(20);
  textStyle(NORMAL);
  text(`Your Score: ${score}`, width / 2, height / 2 - 20);
  fill(0, 150, 0);
  rect(width / 2 - 100, height / 2 + 10, 200, 50, 10);
  fill(255);
  text("Play Again", width / 2, height / 2 + 40);

  // Display leaderboard
  fill(50);
  textSize(18);
  text("Leaderboard", width / 2, height / 2 + 100);
  textSize(14);
  let y = height / 2 + 120;
  for (let i = 0; i < leaderboard.length; i++) {
    let entry = leaderboard[i];
    text(`${i + 1}. ${entry.email} - ${entry.score}`, width / 2, y);
    y += 20;
  }
}

// Custom sprite drawing functions
function drawBed(x, y, w, h) {
  fill(100, 100, 255); // Blue mattress
  rect(x - w / 2, y, w, h, 5);
  fill(139, 69, 19); // Brown legs
  rect(x - w / 2 + 5, y + h, 10, 15);
  rect(x + w / 2 - 15, y + h, 10, 15);
}

function drawMonkey(x, y, size, rotation) {
  push();
  translate(x, y);
  rotate(rotation);
  fill(150, 100, 50); // Brown fur
  ellipse(0, 0, size, size * 1.2);
  fill(200, 150, 100); // Face
  ellipse(0, -size / 4, size * 0.7, size * 0.6);
  fill(255); // Eyes
  ellipse(-size / 6, -size / 3, size / 6, size / 6);
  ellipse(size / 6, -size / 3, size / 6, size / 6);
  fill(0);
  ellipse(-size / 6, -size / 3, size / 12, size / 12);
  ellipse(size / 6, -size / 3, size / 12, size / 12);
  noFill();
  stroke(0);
  arc(0, 0, size / 3, size / 4, 0, PI); // Mouth
  noStroke();
  fill(150, 100, 50);
  rect(-size / 2, -size / 4, size / 10, size / 2); // Arms
  rect(size / 2 - size / 10, -size / 4, size / 10, size / 2);
  rect(-size / 4, size / 2 - size / 10, size / 10, size / 2); // Legs
  rect(size / 4 - size / 10, size / 2 - size / 10, size / 10, size / 2);
  stroke(150, 100, 50);
  strokeWeight(3);
  noFill();
  bezier(0, size / 2, -size, size, -size * 1.5, size / 2, -size, 0); // Tail
  noStroke();
  pop();
}

function drawBanana(x, y, size) {
  push();
  translate(x, y);
  rotate(PI / 4);
  fill(255, 255, 0);
  beginShape();
  vertex(-size / 2, size / 4);
  quadraticVertex(0, -size / 2, size / 2, size / 4);
  quadraticVertex(0, size / 2, -size / 2, size / 4);
  endShape(CLOSE);
  pop();
}

function drawObstacle(x, y, size) {
  push();
  translate(x, y);
  rotate(frameCount * 0.05);
  fill(255, 0, 0);
  triangle(0, -size / 2, -size / 2, size / 2, size / 2, size / 2);
  pop();
}

// Game over with Firebase integration
async function gameOver() {
  gameState = "gameOver";
  let email = prompt("Enter your email to save your score:");
  if (email) {
    let maskedEmail = maskEmail(email);
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

// Mask email function
function maskEmail(email) {
  if (!email || !email.includes("@")) return "Anonymous";
  let [local, domain] = email.split("@");
  if (local.length <= 2) return `${local}@${domain}`;
  return `${local[0]}${"*".repeat(local.length - 2)}${local[local.length - 1]}@${domain}`;
}

// Load leaderboard
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

// Reset game
function resetGame() {
  bed = { x: width / 2, y: height - 40, width: 120, height: 20 };
  monkey = { 
    x: width / 2, 
    y: height / 2, 
    vx: 0, 
    vy: -12, 
    size: 40, 
    rotation: 0, 
    rotationSpeed: 0.1 
  };
  bananas = [];
  obstacles = [];
  score = 0;
  lastBananaTime = millis();
  lastObstacleTime = millis();
}

// Mouse interaction
function mousePressed() {
  if (gameState === "start" || gameState === "gameOver") {
    resetGame();
    gameState = "playing";
  }
} 