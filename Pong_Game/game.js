const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

// Paddle settings
const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 90;
const PADDLE_MARGIN = 20;
const PADDLE_SPEED = 5;

// Ball settings
const BALL_SIZE = 16;
let ball = {
    x: WIDTH / 2 - BALL_SIZE / 2,
    y: HEIGHT / 2 - BALL_SIZE / 2,
    vx: 5 * (Math.random() > 0.5 ? 1 : -1),
    vy: 3 * (Math.random() > 0.5 ? 1 : -1),
    size: BALL_SIZE
};

// Player paddle
let player = {
    x: PADDLE_MARGIN,
    y: HEIGHT / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT
};

// AI paddle
let ai = {
    x: WIDTH - PADDLE_MARGIN - PADDLE_WIDTH,
    y: HEIGHT / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    speed: 4
};

// Scores
let playerScore = 0;
let aiScore = 0;

// Mouse movement for player paddle
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    let mouseY = e.clientY - rect.top;
    player.y = mouseY - player.height / 2;
    // Clamp within canvas
    if (player.y < 0) player.y = 0;
    if (player.y + player.height > HEIGHT) player.y = HEIGHT - player.height;
});

// Draw everything
function draw() {
    // Clear
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // Draw net
    ctx.fillStyle = "#fff";
    for(let i = 0; i < HEIGHT; i += 30) {
        ctx.fillRect(WIDTH/2 - 2, i, 4, 20);
    }

    // Draw paddles
    ctx.fillStyle = "#fff";
    ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.fillRect(ai.x, ai.y, ai.width, ai.height);

    // Draw ball
    ctx.fillStyle = "#fff";
    ctx.fillRect(ball.x, ball.y, ball.size, ball.size);

    // Draw score
    ctx.font = "32px Arial";
    ctx.fillText(`${playerScore}`, WIDTH/4, 50);
    ctx.fillText(`${aiScore}`, WIDTH*3/4, 50);
}

// Collision detection between rects
function collision(r1, r2) {
    return r1.x < r2.x + r2.width &&
           r1.x + r1.width > r2.x &&
           r1.y < r2.y + r2.height &&
           r1.y + r1.height > r2.y;
}

// AI paddle movement (basic)
function moveAI() {
    let aiCenter = ai.y + ai.height / 2;
    if (ball.vx > 0) {
        if (aiCenter < ball.y + ball.size / 2 - 10) {
            ai.y += ai.speed;
        } else if (aiCenter > ball.y + ball.size / 2 + 10) {
            ai.y -= ai.speed;
        }
    }
    // Clamp AI paddle inside canvas
    if (ai.y < 0) ai.y = 0;
    if (ai.y + ai.height > HEIGHT) ai.y = HEIGHT - ai.height;
}

// Ball movement and collisions
function update() {
    // Move ball
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Top/bottom wall collision
    if (ball.y < 0) {
        ball.y = 0;
        ball.vy *= -1;
    }
    if (ball.y + ball.size > HEIGHT) {
        ball.y = HEIGHT - ball.size;
        ball.vy *= -1;
    }

    // Player paddle collision
    let playerRect = {
        x: player.x,
        y: player.y,
        width: player.width,
        height: player.height
    };
    let ballRect = {
        x: ball.x,
        y: ball.y,
        width: ball.size,
        height: ball.size
    };
    if (collision(playerRect, ballRect)) {
        ball.x = player.x + player.width;
        ball.vx *= -1;
        // Add a little randomness
        ball.vy += (Math.random() - 0.5) * 4;
    }

    // AI paddle collision
    let aiRect = {
        x: ai.x,
        y: ai.y,
        width: ai.width,
        height: ai.height
    };
    if (collision(aiRect, ballRect)) {
        ball.x = ai.x - ball.size;
        ball.vx *= -1;
        ball.vy += (Math.random() - 0.5) * 4;
    }

    // Score
    if (ball.x < 0) {
        aiScore++;
        resetBall();
    }
    if (ball.x + ball.size > WIDTH) {
        playerScore++;
        resetBall();
    }
}

// Reset ball to center
function resetBall() {
    ball.x = WIDTH / 2 - BALL_SIZE / 2;
    ball.y = HEIGHT / 2 - BALL_SIZE / 2;
    ball.vx = 5 * (Math.random() > 0.5 ? 1 : -1);
    ball.vy = 3 * (Math.random() > 0.5 ? 1 : -1);
}

// Main game loop
function loop() {
    update();
    moveAI();
    draw();
    requestAnimationFrame(loop);
}

loop();