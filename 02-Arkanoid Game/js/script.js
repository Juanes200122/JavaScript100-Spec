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
const bricksLayout = [
    [1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1],
    [1, 1, 0, 0, 1, 4, 2, 4, 1, 0, 0, 1, 1],
    [1, 0, 0, 1, 1, 3, 2, 3, 1, 1, 0, 0, 1],
    [0, 0, 1, 1, 1, 3, 3, 3, 1, 1, 1, 0, 0],
    [1, 0, 0, 1, 1, 3, 2, 3, 1, 1, 0, 0, 1],
    [1, 1, 0, 0, 1, 4, 2, 4, 1, 0, 0, 1, 1],
    [1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1]
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
    x = canvas.width / 2;
    y = canvas.height - 30;
    dx = 2;
    dy = -2;
    paddleX = (canvas.width - paddleWidth) / 2;
    paddleY = canvas.height - paddleHeight - 10;
    rightPressed = false;
    leftPressed = false;
    for (let r = 0; r < bricksLayout.length; r++) {
        brick[r] = [];
        for (let c = 0; c < bricksLayout[r].length; c++) {
            if (bricksLayout[r][c] !== 0) {
                const brickX = c * brickWidth + brickOffsetLeft;
                const brickY = r * brickHeight + brickOffsetTop;
                const color = bricksLayout[r][c];
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
    $gameOverScreen.style.display = 'none';
    draw();
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
                    playCollisionSound(); // Reproducir sonido de colisión
                }
                if (y > currentBrick.y && y < currentBrick.y + brickHeight && x + ballRadius > currentBrick.x && x - ballRadius < currentBrick.x + brickWidth) {
                    dx = -dx;
                    currentBrick.status = BRICK_STATUS.DESTROYED;
                    playCollisionSound(); // Reproducir sonido de colisión
                }
            }
        }
    }
}

function ballMovement() {
    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
        dx = -dx;
        playCollisionSound(); // Reproducir sonido al cambiar dirección horizontal
    }
    if (y + dy < ballRadius) {
        dy = -dy;
        playCollisionSound(); // Reproducir sonido al cambiar dirección vertical
    }

    const idBallSameAsPaddle = x > paddleX && x < paddleX + paddleWidth;
    const idBallTouchingPaddle = y + dy > paddleY && y < paddleY + paddleHeight;

    if (idBallSameAsPaddle && idBallTouchingPaddle) {
        dy = -dy;
        playCollisionSound(); // Reproducir sonido al tocar el paddle
    } else if (y + dy > canvas.height - ballRadius) {
        // Ejecutar la animación y luego mostrar Game Over
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
                resolve(); // La animación ha terminado
            }
        }, 10); // Duración de cada frame en milisegundos
    });
}

function gameOver() {
    $gameOverScreen.style.display = 'flex';
    deadSound.play(); // Reproducir sonido de Game Over
    cancelAnimationFrame(animationId); // Detener el bucle de animación
}

function playCollisionSound() {
    collisionSound.currentTime = 0; // Reiniciar el sonido
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

let animationId;
function draw() {
    cleanCanvas();
    drawBall();
    drawPaddle();
    drawBricks();
    collisionDetection();
    ballMovement();
    paddleMovement();
    animationId = window.requestAnimationFrame(draw);
}

resetGame();
initEvents();
