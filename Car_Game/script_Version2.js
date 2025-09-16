// F1 Racer - GSAP Car Racing Game
// Player car now moves forward (up) at constant speed, road/obstacles move down at slow speed.
// Play, Pause, Resume buttons in HUD and overlays.

const GAME_WIDTH = 480;
const GAME_HEIGHT = 800;
const ROAD_WIDTH = 300;
const ROAD_LANES = 4;
const ROAD_MARKER_WIDTH = 6;
const LANE_MARKER_COLOR = "#f2f2f2";
const CURB_WIDTH = 16;
const CURB_COLOR = "#e84c3d";
const ROAD_COLOR = "#232b36";
const PLAYER_CAR = {
  width: 44,
  height: 80,
  color: "#04d9ff",
  maxSpeed: 8,
  accel: 0.20,
  decel: 0.15,
  turnSpeed: 8,
  baseSpeed: 4.5 // new: constant forward movement
};
const OBSTACLE_TYPES = [
  { type: "car",    width: 44, height: 78, color: "#f5d442", minSpeed: 2.2, maxSpeed: 3.7, score: 10 },
  { type: "bus",    width: 54, height: 130, color: "#d7263d", minSpeed: 1.5, maxSpeed: 2.8, score: 22 },
  { type: "van",    width: 48, height: 94, color: "#b8b8b8", minSpeed: 1.7, maxSpeed: 2.9, score: 16 },
  { type: "lorry",  width: 54, height: 140, color: "#533a71", minSpeed: 1.4, maxSpeed: 2.3, score: 28 },
  { type: "tempo",  width: 44, height: 70, color: "#2ecc40", minSpeed: 2.2, maxSpeed: 3.2, score: 12 },
  { type: "bike",   width: 28, height: 58, color: "#f2b134", minSpeed: 2.4, maxSpeed: 3.9, score: 8 },
  { type: "stone",  width: 38, height: 30, color: "#90979a", minSpeed: 1.8, maxSpeed: 3.0, score: 20 }
];
const SPAWN_INTERVAL = 1300;
const DIFFICULTY_STEP = 15000;
const SPAWN_INTERVAL_MIN = 500;
const DIFFICULTY_SPEEDUP = 0.11;
const SCORE_PER_SECOND = 12;
const WORLD_SCROLL_SPEED = 2.2; // Constant speed road/obstacles move down

let canvas, ctx, scale, offsetX, offsetY;
let animationId = null;
let running = false, paused = false, gameover = false, started = false;
let score = 0, highScore = 0;
let lastSpawnTime = 0, spawnInterval = SPAWN_INTERVAL;
let roadSegments = [], obstacles = [], player, input;
let difficultyTime = 0, speedMult = 1;
let lastFrameTs = 0;

const $ = q => document.querySelector(q);
const overlay = $("#overlay");
const menu = $("#menu");
const gameoverScreen = $("#gameover");
const pausedScreen = $("#paused");
const startBtn = $("#start-btn");
const restartBtn = $("#restart-btn");
const resumeBtn = $("#resume-btn");
const pauseBtn = $("#pause-btn");
const playBtn = $("#play-btn");
const resumeBtnHud = $("#resume-btn-hud");
const scoreDiv = $("#score");
const highScoreDiv = $("#high-score");
const finalScoreDiv = $("#final-score");
const controlsDiv = $("#controls");
const playbackBtns = $("#playback-btns");

// Responsive scaling for canvas
function calcScale() {
  const w = window.innerWidth, h = window.innerHeight;
  scale = Math.min(w / GAME_WIDTH, h / GAME_HEIGHT);
  offsetX = (w - GAME_WIDTH * scale) / 2;
  offsetY = (h - GAME_HEIGHT * scale) / 2;
}
function clamp(val, min, max) { return Math.max(min, Math.min(val, max)); }
function rectsCollide(r1, r2) {
  return !(r1.x + r1.width < r2.x ||
           r1.x > r2.x + r2.width ||
           r1.y + r1.height < r2.y ||
           r1.y > r2.y + r2.height);
}

window.addEventListener("load", function() {
  canvas = $("#game-canvas");
  ctx = canvas.getContext("2d");
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  startBtn.onclick = startGame;
  restartBtn.onclick = () => { showMenu(true); };
  resumeBtn.onclick = resumeGame;
  playBtn.onclick = () => { if (!started) startGame(); };
  pauseBtn.onclick = pauseGame;
  resumeBtnHud.onclick = resumeGame;

  setupTouchControls();

  input = { left: false, right: false, up: false, down: false };
  window.addEventListener("keydown", e => {
    if (e.repeat) return;
    switch (e.key) {
      case "ArrowLeft": input.left = true; highlightBtn("btn-left"); break;
      case "ArrowRight": input.right = true; highlightBtn("btn-right"); break;
      case "ArrowUp": input.up = true; highlightBtn("btn-up"); break;
      case "ArrowDown": input.down = true; highlightBtn("btn-down"); break;
      case "p": case "P": if (running && !paused) pauseGame(); else if (paused) resumeGame(); break;
      case " ": if (!started) startGame(); break;
      default: break;
    }
  });
  window.addEventListener("keyup", e => {
    switch (e.key) {
      case "ArrowLeft": input.left = false; unhighlightBtn("btn-left"); break;
      case "ArrowRight": input.right = false; unhighlightBtn("btn-right"); break;
      case "ArrowUp": input.up = false; unhighlightBtn("btn-up"); break;
      case "ArrowDown": input.down = false; unhighlightBtn("btn-down"); break;
      default: break;
    }
  });

  window.addEventListener("blur", () => { if (running && !paused) pauseGame(); });
  highScore = parseInt(localStorage.getItem("f1racer_high"),10) || 0;
  highScoreDiv.textContent = "High: " + highScore;

  showMenu(true);
});

function resizeCanvas() {
  calcScale();
  canvas.width = GAME_WIDTH;
  canvas.height = GAME_HEIGHT;
  canvas.style.width = GAME_WIDTH * scale + "px";
  canvas.style.height = GAME_HEIGHT * scale + "px";
}

function showMenu(initialize=false) {
  running = false;
  paused = false;
  gameover = false;
  started = false;
  overlay.classList.remove("hidden");
  menu.classList.remove("hidden");
  gameoverScreen.classList.add("hidden");
  pausedScreen.classList.add("hidden");
  controlsDiv.style.opacity = "0.7";
  showHudBtns({play: true, pause: false, resume: false});
  if (initialize) {
    scoreDiv.textContent = "Score: 0";
    score = 0;
    highScoreDiv.textContent = "High: " + highScore;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    drawTrack(1);
    drawPlayerCar(GAME_WIDTH/2-PLAYER_CAR.width/2, GAME_HEIGHT-PLAYER_CAR.height*1.6, 0, PLAYER_CAR.color);
  }
}

function showGameOver() {
  running = false;
  gameover = true;
  overlay.classList.remove("hidden");
  menu.classList.add("hidden");
  pausedScreen.classList.add("hidden");
  gameoverScreen.classList.remove("hidden");
  finalScoreDiv.textContent = `Your Score: ${score}`;
  controlsDiv.style.opacity = "0.4";
  showHudBtns({play: true, pause: false, resume: false});
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("f1racer_high", String(highScore));
    highScoreDiv.textContent = "High: " + highScore;
  }
}

function pauseGame() {
  if (!running || paused) return;
  paused = true;
  overlay.classList.remove("hidden");
  menu.classList.add("hidden");
  gameoverScreen.classList.add("hidden");
  pausedScreen.classList.remove("hidden");
  controlsDiv.style.opacity = "0.45";
  showHudBtns({play: false, pause: false, resume: true});
  cancelAnimationFrame(animationId);
}

function resumeGame() {
  if (!paused) return;
  paused = false;
  overlay.classList.add("hidden");
  pausedScreen.classList.add("hidden");
  controlsDiv.style.opacity = "0.95";
  showHudBtns({play: false, pause: true, resume: false});
  lastFrameTs = performance.now();
  gameLoop(lastFrameTs);
}

function showHudBtns({play, pause, resume}) {
  playBtn.classList.toggle("active", !!play);
  pauseBtn.classList.toggle("active", !!pause);
  resumeBtnHud.classList.toggle("active", !!resume);
}

function setupTouchControls() {
  const ctrlMap = [
    { btn: "btn-up",    dir: "up" },
    { btn: "btn-down",  dir: "down" },
    { btn: "btn-left",  dir: "left" },
    { btn: "btn-right", dir: "right" }
  ];
  ctrlMap.forEach(({btn,dir}) => {
    const el = $("#" + btn);
    el.addEventListener("touchstart", e => {
      input[dir] = true;
      el.classList.add("pressed");
      e.preventDefault();
    });
    el.addEventListener("touchend", e => {
      input[dir] = false;
      el.classList.remove("pressed");
      e.preventDefault();
    });
    el.addEventListener("mousedown", e => {
      input[dir] = true;
      el.classList.add("pressed");
    });
    el.addEventListener("mouseup", e => {
      input[dir] = false;
      el.classList.remove("pressed");
    });
    el.addEventListener("mouseleave", e => {
      input[dir] = false;
      el.classList.remove("pressed");
    });
  });
}

function highlightBtn(btnId) {
  const el = $("#" + btnId);
  if (el) el.classList.add("pressed");
}
function unhighlightBtn(btnId) {
  const el = $("#" + btnId);
  if (el) el.classList.remove("pressed");
}

function startGame() {
  running = true;
  paused = false;
  started = true;
  gameover = false;
  overlay.classList.add("hidden");
  menu.classList.add("hidden");
  gameoverScreen.classList.add("hidden");
  pausedScreen.classList.add("hidden");
  controlsDiv.style.opacity = "0.9";
  showHudBtns({play: false, pause: true, resume: false});
  score = 0;
  lastSpawnTime = 0;
  spawnInterval = SPAWN_INTERVAL;
  difficultyTime = 0;
  speedMult = 1;
  obstacles = [];
  roadSegments = [];
  player = {
    lane: Math.floor(ROAD_LANES/2),
    x: getLaneX(Math.floor(ROAD_LANES/2)),
    y: GAME_HEIGHT - PLAYER_CAR.height*1.25,
    width: PLAYER_CAR.width,
    height: PLAYER_CAR.height,
    vx: 0,
    vy: 0,
    speed: PLAYER_CAR.baseSpeed,
    crashed: false
  };
  for (let i=0; i<10; ++i) {
    roadSegments.push({y: i*-160, curve: 0});
  }
  lastFrameTs = performance.now();
  gameLoop(lastFrameTs);
}

function gameLoop(ts) {
  if (!running) return;
  let dt = Math.min((ts - lastFrameTs) / 1000, 0.06);
  lastFrameTs = ts;
  update(dt);
  draw();
  if (!paused) animationId = requestAnimationFrame(gameLoop);
}

function update(dt) {
  difficultyTime += dt * 1000;
  if (difficultyTime > DIFFICULTY_STEP) {
    difficultyTime = 0;
    spawnInterval = Math.max(SPAWN_INTERVAL_MIN, spawnInterval-100);
    speedMult += DIFFICULTY_SPEEDUP;
  }

  // Player - only horizontal movement (forwards is now automatic)
  if (input.left) {
    player.x -= PLAYER_CAR.turnSpeed * scale * dt * 70;
  }
  if (input.right) {
    player.x += PLAYER_CAR.turnSpeed * scale * dt * 70;
  }
  // Clamp to road lanes
  const minX = (GAME_WIDTH-ROAD_WIDTH)/2 + 5;
  const maxX = (GAME_WIDTH+ROAD_WIDTH)/2 - player.width - 5;
  player.x = clamp(player.x, minX, maxX);

  // Player moves up automatically at constant speed
  player.y -= player.speed * 40 * dt;
  // Clamp vertical: if offscreen top, reset to lower third
  if (player.y < GAME_HEIGHT*0.3) player.y = GAME_HEIGHT*0.3;
  if (player.y > GAME_HEIGHT - player.height*1.1) player.y = GAME_HEIGHT - player.height*1.1;

  // Road and obstacles move down at fixed WORLD_SCROLL_SPEED
  let worldMove = WORLD_SCROLL_SPEED * 38 * dt;
  roadSegments.forEach(seg => seg.y += worldMove);
  obstacles.forEach(ob => ob.y += worldMove);

  // Obstacles also move up (relative to world) so they approach the player
  for (let ob of obstacles) {
    ob.y += ob.vy * 30 * dt * speedMult;
  }

  // Procedural new road segments
  if (roadSegments.length && roadSegments[roadSegments.length-1].y > -160) {
    roadSegments.push({y: roadSegments[roadSegments.length-1].y-160, curve: (Math.random()-0.5)*0.08 });
  }
  while (roadSegments.length && roadSegments[0].y > GAME_HEIGHT) roadSegments.shift();

  // Spawn obstacles
  if (performance.now() - lastSpawnTime > spawnInterval) {
    spawnObstacle();
    lastSpawnTime = performance.now();
  }
  obstacles = obstacles.filter(ob => ob.y < GAME_HEIGHT+ob.height);

  // Collision detection
  for (let ob of obstacles) {
    if (rectsCollide(player, ob)) {
      player.crashed = true;
      break;
    }
  }
  if (player.crashed) {
    setTimeout(() => showGameOver(), 600);
    running = false;
    gsap.to(player, { y: player.y+24, duration: 0.3, repeat: 2, yoyo: true, ease: "power2.in" });
    return;
  }

  // Scoring
  score += Math.floor(SCORE_PER_SECOND * dt);
  scoreDiv.textContent = "Score: " + score;

  for (let ob of obstacles) {
    if (!ob.passed && ob.y > player.y+player.height) {
      score += ob.score;
      ob.passed = true;
    }
  }
}

function spawnObstacle() {
  const obType = OBSTACLE_TYPES[Math.floor(Math.random()*OBSTACLE_TYPES.length)];
  let lane = Math.floor(Math.random() * ROAD_LANES);
  if (Math.abs(getLaneX(lane)-player.x) < 0.1 && Math.random()<0.7) {
    lane = (lane+1)%ROAD_LANES;
  }
  let ob = {
    ...obType,
    x: getLaneX(lane) + (ROAD_LANE_WIDTH()-obType.width)/2,
    y: -obType.height-12,
    vy: obType.minSpeed + Math.random()*(obType.maxSpeed-obType.minSpeed) + speedMult*0.23,
    lane,
    passed: false
  };
  obstacles.push(ob);
}

function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  drawTrack(1);
  for (let ob of obstacles) {
    drawObstacle(ob);
  }
  drawPlayerCar(player.x, player.y, 0, player.crashed ? "#ff3657" : PLAYER_CAR.color);
}

function drawTrack(perspective=1) {
  const centerX = GAME_WIDTH/2;
  ctx.save();
  ctx.fillStyle = CURB_COLOR;
  ctx.fillRect(centerX-ROAD_WIDTH/2-CURB_WIDTH,0,CURB_WIDTH,GAME_HEIGHT);
  ctx.fillRect(centerX+ROAD_WIDTH/2,0,CURB_WIDTH,GAME_HEIGHT);
  ctx.fillStyle = ROAD_COLOR;
  ctx.fillRect(centerX-ROAD_WIDTH/2,0,ROAD_WIDTH,GAME_HEIGHT);
  ctx.strokeStyle = LANE_MARKER_COLOR;
  ctx.lineWidth = ROAD_MARKER_WIDTH;
  ctx.setLineDash([38,30]);
  for (let i=1; i<ROAD_LANES; ++i) {
    let x = centerX-ROAD_WIDTH/2 + i*ROAD_LANE_WIDTH();
    ctx.beginPath();
    ctx.moveTo(x,0);
    ctx.lineTo(x,GAME_HEIGHT);
    ctx.stroke();
  }
  ctx.setLineDash([]);
  ctx.restore();
}

function ROAD_LANE_WIDTH() { return ROAD_WIDTH/ROAD_LANES; }
function getLaneX(lane) {
  return (GAME_WIDTH-ROAD_WIDTH)/2 + lane*ROAD_LANE_WIDTH();
}
function drawPlayerCar(x, y, angle=0, color=PLAYER_CAR.color) {
  ctx.save();
  ctx.translate(x+PLAYER_CAR.width/2, y+PLAYER_CAR.height/2);
  ctx.rotate(angle);
  ctx.fillStyle = color;
  ctx.fillRect(-PLAYER_CAR.width/2, -PLAYER_CAR.height/2, PLAYER_CAR.width, PLAYER_CAR.height);
  ctx.fillStyle = "#222";
  ctx.fillRect(-10, -PLAYER_CAR.height/2+8, 20, 18);
  ctx.fillStyle = "#fff";
  ctx.fillRect(-10, -16, 20, 18);
  ctx.fillStyle = "#333";
  ctx.fillRect(-PLAYER_CAR.width/2+2,-PLAYER_CAR.height/2+16,8,18);
  ctx.fillRect(PLAYER_CAR.width/2-10,-PLAYER_CAR.height/2+16,8,18);
  ctx.fillRect(-PLAYER_CAR.width/2+2,PLAYER_CAR.height/2-34,8,18);
  ctx.fillRect(PLAYER_CAR.width/2-10,PLAYER_CAR.height/2-34,8,18);
  ctx.restore();
}
function drawObstacle(ob) {
  ctx.save();
  ctx.translate(ob.x+ob.width/2, ob.y+ob.height/2);
  if (ob.type==="car") {
    ctx.fillStyle = ob.color;
    ctx.fillRect(-ob.width/2, -ob.height/2, ob.width, ob.height);
    ctx.fillStyle = "#666";
    ctx.fillRect(-10, -ob.height/2+8, 20, 16);
    ctx.fillStyle = "#fff";
    ctx.fillRect(-8, -ob.height/2+24, 16, 18);
    ctx.fillStyle = "#222";
    ctx.fillRect(-ob.width/2+2,-ob.height/2+14,8,18);
    ctx.fillRect(ob.width/2-10,-ob.height/2+14,8,18);
    ctx.fillRect(-ob.width/2+2,ob.height/2-32,8,18);
    ctx.fillRect(ob.width/2-10,ob.height/2-32,8,18);
  } else if (ob.type==="bus" || ob.type==="lorry") {
    ctx.fillStyle = ob.color;
    ctx.fillRect(-ob.width/2, -ob.height/2, ob.width, ob.height);
    ctx.fillStyle = "#fff";
    ctx.fillRect(-ob.width/2+8, -ob.height/2+20, ob.width-16, 22);
    ctx.fillStyle = "#222";
    ctx.fillRect(-ob.width/2+3, ob.height/2-32, 10, 18);
    ctx.fillRect(ob.width/2-13, ob.height/2-32, 10, 18);
  } else if (ob.type==="van" || ob.type==="tempo") {
    ctx.fillStyle = ob.color;
    ctx.fillRect(-ob.width/2, -ob.height/2, ob.width, ob.height-8);
    ctx.fillStyle = "#d2d2d2";
    ctx.fillRect(-ob.width/2+6, -ob.height/2+10, ob.width-12, 20);
    ctx.fillStyle = "#222";
    ctx.fillRect(-ob.width/2+3, ob.height/2-26, 10, 13);
    ctx.fillRect(ob.width/2-13, ob.height/2-26, 10, 13);
  } else if (ob.type==="bike") {
    ctx.fillStyle = ob.color;
    ctx.fillRect(-ob.width/2, -ob.height/2, ob.width, ob.height);
    ctx.fillStyle = "#222";
    ctx.beginPath();
    ctx.arc(-ob.width/2+6, ob.height/2-8, 6, 0, Math.PI*2);
    ctx.arc(ob.width/2-6, ob.height/2-8, 6, 0, Math.PI*2);
    ctx.fill();
  } else if (ob.type==="stone") {
    ctx.fillStyle = ob.color;
    ctx.beginPath();
    ctx.ellipse(0,0,ob.width/2,ob.height/2,0,0,Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = "#888";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0,0,ob.width/2-3,ob.height/2-3,0,0,Math.PI*2);
    ctx.stroke();
  }
  ctx.restore();
}

// Touch swipe support
let touchStartX = null, touchStartY = null;
canvas.addEventListener("touchstart", e => {
  if (e.touches.length!==1) return;
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
});
canvas.addEventListener("touchmove", e => {
  if (touchStartX==null || e.touches.length!==1) return;
  let dx = e.touches[0].clientX - touchStartX;
  let dy = e.touches[0].clientY - touchStartY;
  if (Math.abs(dx)>24 || Math.abs(dy)>24) {
    if (Math.abs(dx)>Math.abs(dy)) {
      if (dx>0) input.right = true;
      else input.left = true;
      setTimeout(()=>{input.right=false;input.left=false;}, 120);
    } else {
      if (dy<0) input.up = true;
      else input.down = true;
      setTimeout(()=>{input.up=false;input.down=false;}, 120);
    }
    touchStartX = null; touchStartY = null;
  }
});
canvas.addEventListener("touchend", e => {
  touchStartX = null; touchStartY = null;
});