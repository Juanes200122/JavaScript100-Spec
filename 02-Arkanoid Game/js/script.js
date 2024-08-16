const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const $sprite = document.querySelector('#sprite');
const $bricks = document.querySelector('#bricks');
const $paddleAnim1 = document.querySelector('#paddleAnim1');
const $paddleAnim2 = document.querySelector('#paddleAnim2');
const $paddleAnim3 = document.querySelector('#paddleAnim3');
const $paddleAnim4 = document.querySelector('#paddleAnim4');
const $paddleAnim5 = document.querySelector('#paddleAnim5');

const $gameOverScreen = document.querySelector('#game-over-screen');
const $restartButton = document.querySelector('#restart-button');

canvas.width = 448;
canvas.height = 400;

let score = 0;
const PADDLE_sensitivity = 4;
const ballRadius = 3;
let x, y, dx, dy;
const paddleHeight = 10;
const paddleWidth = 50;
let paddleX, paddleY;
let rightPressed = false;
let leftPressed = false;
const brickWidth = 32;
const brickHeight = 16;
const brickOffsetTop = 80;
const brickOffsetLeft = 17;
let currentLevel = 1;
const levels = [
    [
        [0, 0, 0, 4, 0, 0, 0, 0, 0, 4, 0, 0, 0],
        [1, 0, 0, 4, 0, 0, 0, 0, 0, 4, 0, 0, 1],
        [0, 0, 0, 0, 4, 0, 0, 0, 4, 0, 0, 0, 0],
        [1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1],
        [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
        [1, 0, 1, 1, 4, 1, 1, 1, 4, 1, 1, 0, 1],
        [0, 0, 1, 1, 4, 1, 1, 1, 4, 1, 1, 0, 0],
        [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
        [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
        [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
        [0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0],
        [1, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 1],
        [1, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 1]

    ],
    [
        [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
        [0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
        [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0],
        [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
        [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
        [0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
        [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0],
        [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
        [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1]
    ]
];

const brick = [];
const BRICK_STATUS = {
    ACTIVE: 1,
    DESTROYED: 0
};

// Cargar los sonidos
const collisionSound = new Audio('Arkanoid SFX (1).wav');
const deadSound = new Audio('Arkanoid SFX (11).wav');

function resetGame() {
    score = 0;
    x = canvas.width / 2;
    y = canvas.height - 30;
    dx = 3;
    dy = -2;
    paddleX = (canvas.width - paddleWidth) / 2;
    paddleY = canvas.height - paddleHeight - 10;
    rightPressed = false;
    leftPressed = false;

    loadLevel();
    $gameOverScreen.style.display = 'none';
    draw();
}

function loadLevel() {
    const currentBricksLayout = levels[currentLevel - 1];
    for (let r = 0; r < currentBricksLayout.length; r++) {
        brick[r] = [];
        for (let c = 0; c < currentBricksLayout[r].length; c++) {
            if (currentBricksLayout[r][c] !== 0) {
                const brickX = c * brickWidth + brickOffsetLeft;
                const brickY = r * brickHeight + brickOffsetTop;
                const color = currentBricksLayout[r][c];
                brick[r][c] = {
                    x: brickX,
                    y: brickY,
                    status: BRICK_STATUS.ACTIVE,
                    color: color
                };
            } else {
                brick[r][c] = null;
            }
        }
    }
}

let animationFrame = 0;
const animationFrames = [
    $paddleAnim1,
    $paddleAnim2,
    $paddleAnim3,
    $paddleAnim4,
    $paddleAnim5
];

function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.closePath();
}

function drawPaddle() {
    ctx.drawImage(
        animationFrames[animationFrame],
        0,
        0,
        paddleWidth,
        paddleHeight,
        paddleX,
        paddleY,
        paddleWidth,
        paddleHeight
    );
}

function drawBricks() {
    for (let r = 0; r < brick.length; r++) {
        for (let c = 0; c < brick[r].length; c++) {
            const currentBrick = brick[r][c];
            if (currentBrick && currentBrick.status === BRICK_STATUS.ACTIVE) {
                const clipX = currentBrick.color * 32;

                ctx.drawImage(
                    $bricks,
                    clipX,
                    0,
                    brickWidth,
                    brickHeight,
                    currentBrick.x,
                    currentBrick.y,
                    brickWidth,
                    brickHeight
                );
            }
        }
    }
}

function collisionDetection() {
    for (let r = 0; r < brick.length; r++) {
        for (let c = 0; c < brick[r].length; c++) {
            const currentBrick = brick[r][c];
            if (currentBrick && currentBrick.status === BRICK_STATUS.ACTIVE) {
                if (x > currentBrick.x && x < currentBrick.x + brickWidth && y + ballRadius > currentBrick.y && y - ballRadius < currentBrick.y + brickHeight) {
                    dy = -dy;
                    currentBrick.status = BRICK_STATUS.DESTROYED;
                    score += 10; // Aumenta el puntaje en 10 por cada ladrillo destruido
                    playCollisionSound();
                    checkLevelCompletion(); // Verificar si se ha completado el nivel
                }
                if (y > currentBrick.y && y < currentBrick.y + brickHeight && x + ballRadius > currentBrick.x && x - ballRadius < currentBrick.x + brickWidth) {
                    dx = -dx;
                    currentBrick.status = BRICK_STATUS.DESTROYED;
                    score += 10; // Aumenta el puntaje en 10 por cada ladrillo destruido
                    playCollisionSound();
                    checkLevelCompletion(); // Verificar si se ha completado el nivel
                }
            }
        }
    }
}

function drawScore() {
    ctx.font = '16px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText('Score: ' + score, 8, 20);
}

function ballMovement() {
    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
        dx = -dx;
        playCollisionSound();
    }
    if (y + dy < ballRadius) {
        dy = -dy;
        playCollisionSound();
    }

    const idBallSameAsPaddle = x > paddleX && x < paddleX + paddleWidth;
    const idBallTouchingPaddle = y + dy > paddleY && y < paddleY + paddleHeight;

    if (idBallSameAsPaddle && idBallTouchingPaddle) {
        dy = -dy;
        playCollisionSound();
    } else if (y + dy > canvas.height - ballRadius) {
        startPaddleAnimation().then(() => {
            gameOver();
        });
    }

    x += dx;
    y += dy;
}

function startPaddleAnimation() {
    return new Promise((resolve) => {
        animationFrame = 0;
        const interval = setInterval(() => {
            animationFrame = (animationFrame + 1) % animationFrames.length;
            if (animationFrame === 0) {
                clearInterval(interval);
                resolve();
            }
        }, 10);
    });
}

function gameOver() {
    $gameOverScreen.style.display = 'flex';
    deadSound.play();
    cancelAnimationFrame(animationId);
}

function playCollisionSound() {
    collisionSound.currentTime = 0;
    collisionSound.play();
}

function paddleMovement() {
    if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += PADDLE_sensitivity;
    } else if (leftPressed && paddleX > 0) {
        paddleX -= PADDLE_sensitivity;
    }
}

function cleanCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function initEvents() {
    document.addEventListener('keydown', keyDownHandler);
    document.addEventListener('keyup', keyUpHandler);

    $restartButton.addEventListener('click', resetGame);

    function keyDownHandler(event) {
        const { key } = event;
        if (key === 'Right' || key === 'ArrowRight' || key.toLowerCase() === 'd') {
            rightPressed = true;
        } else if (key === 'Left' || key === 'ArrowLeft' || key.toLowerCase() === 'a') {
            leftPressed = true;
        }
    }

    function keyUpHandler(event) {
        const { key } = event;
        if (key === 'Right' || key === 'ArrowRight' || key.toLowerCase() === 'd') {
            rightPressed = false;
        } else if (key === 'Left' || key === 'ArrowLeft' || key.toLowerCase() === 'a') {
            leftPressed = false;
        }
    }
}

function checkLevelCompletion() {
    let allBricksDestroyed = true;
    for (let r = 0; r < brick.length; r++) {
        for (let c = 0; c < brick[r].length; c++) {
            if (brick[r][c] && brick[r][c].status === BRICK_STATUS.ACTIVE) {
                allBricksDestroyed = false;
                break;
            }
        }
    }
    if (allBricksDestroyed) {
        if (currentLevel < levels.length) {
            currentLevel++;
            resetGame(); // Cargar el siguiente nivel
        } else {
            alert('¡Ganaste!'); // Mostrar mensaje de victoria
            currentLevel = 1; // Reiniciar al primer nivel
            resetGame();
        }
    }
}

let animationId;
function draw() {
    cleanCanvas();
    drawBall();
    drawPaddle();
    drawBricks();
    drawScore();
    collisionDetection();
    ballMovement();
    paddleMovement();
    animationId = window.requestAnimationFrame(draw);
}

resetGame();
initEvents();
