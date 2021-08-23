// Canvas
const gameCanvas = document.getElementById("canvas");
const ctx = gameCanvas.getContext("2d");

const gameOverScreen = document.getElementById('game-over-screen');
gameOverScreen.style.display = 'none';

const options = {
    score: 0,
    speed: 200, // the closer to zero, the speeder the game is
    startTouchX: 0,
    startTouchY: 0,
    endTouchX: 0,
    endTouchY: 0,
    isGameOver: false
}
const canvas = {
    width: 320,
    height: 320,
    bckgrdColor: 'white',
    borderColor: '#161616'
};
const snake = {
    posX: gameCanvas.width/2,
    posY: gameCanvas.height,
    color: ['tomato', '#161616', 'forestgreen'],
    trail: [],
    tail: 5,
    speedX: 0,
    speedY: 0, 
    changingDirection: false
};
let food = {
    posX: 0,
    posY: 0
};

const rangePos = (start, size) => { return [...Array(size).keys()].map(i => i + start) };
const getScore = () => document.getElementById('score').innerHTML = options.score;

const growSnake = () => {
    options.score += 10;
    snake.tail ++;
    options.speed -= 2;
    getScore();
};

const clearCanvas = () => {
    gameCanvas.width = canvas.width;
    gameCanvas.height = canvas.height;
    ctx.fillStyle = canvas.bckgrdColor;
    ctx.strokeStyle = canvas.borderColor;

    ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
    ctx.strokeRect(0, 0, gameCanvas.width, gameCanvas.height);
}

const drawSnake = () => {
    for(let i = 0; i < snake.tail; i++) {
        if (i === 0) {
            ctx.fillStyle = snake.color[0];
        } else if (i != 0 && i % 2 === 0) {
            ctx.fillStyle = snake.color[1];
        } else {
            ctx.fillStyle = snake.color[2];
        }

        snake.trail.push({ x: snake.posX, y: snake.posY });
        ctx.fillRect(snake.trail[i].x, snake.trail[i].y, gameCanvas.width/33, gameCanvas.height/33);
        snake.posX -= gameCanvas.width/33;
    };
}

const advanceSnake = () => {
    const newHead = { x: Math.round(snake.trail[0].x + snake.speedX), y: Math.round(snake.trail[0].y + snake.speedY) };
    snake.trail.unshift(newHead);
    snake.trail.pop();

    if(rangePos(food.posX - 2, 5).includes(snake.trail[0].x) && rangePos(food.posY - 2, 5).includes(snake.trail[0].y)) {
        growSnake();
        drawSnake();
        createFood();
    };
}

const getActualDirection = () => {
    const actualDirection = {
        left: snake.speedX === -gameCanvas.width/33,
        up: snake.speedY === -gameCanvas.height/33,
        right: snake.speedX === gameCanvas.width/33,
        down: snake.speedY === gameCanvas.height/33
    }

    return actualDirection;
}

const changeDirection = e => {
    if(snake.changingDirection) return;
    snake.changingDirection = true;

   let key = e.keyCode;

    const keys = {
        left: [37, 65, 81],
        up: [38, 87, 90],
        right: [39, 68],
        down: [40, 83]
    }

    const actualDirection = getActualDirection();

    if( keys.left.includes(key) && !actualDirection.right ) { snake.speedX = -gameCanvas.width/33; snake.speedY = 0 }; // Left
    if( keys.up.includes(key) && !actualDirection.down ) { snake.speedX = 0; snake.speedY = -gameCanvas.height/33 }; // Up
    if( keys.right.includes(key) && !actualDirection.left ) { snake.speedX = gameCanvas.width/33; snake.speedY = 0 }; // Right
    if( keys.down.includes(key) && !actualDirection.up ) { snake.speedX = 0; snake.speedY = gameCanvas.height/33 }; // Down

}

const handleTouchStart = e => {
    if(!options.isGameOver) {
        e.preventDefault();
    };
    options.startTouchX = e.touches[0].clientX;
    options.startTouchY = e.touches[0].clientY;
};

const handleTouchMove = e => {
    if(!options.isGameOver) {
        e.preventDefault();
    };
    options.endTouchX = e.touches[0].clientX;
    options.endTouchY = e.touches[0].clientY;
    handleSwipe();
}

function handleSwipe() {
    if(snake.changingDirection) return;
    snake.changingDirection = true;

    const diff = {
        touchX: Math.abs(options.endTouchX - options.startTouchX),
        touchY: Math.abs(options.endTouchY - options.startTouchY)
    }

    const actualDirection = getActualDirection();

    const direction = {
        left: options.startTouchX > options.endTouchX,
        up: options.startTouchY > options.endTouchY,
        right: options.startTouchX < options.endTouchX,
        down: options.startTouchY < options.endTouchY
    }

    if (direction.left && !actualDirection.right && diff.touchX > diff.touchY ) { snake.speedX = -gameCanvas.width/33; snake.speedY = 0 }; // Left;
    if (direction.up && !actualDirection.down && diff.touchX < diff.touchY ) { snake.speedX = 0; snake.speedY = -gameCanvas.height/33 }; // Up
    if (direction.right && !actualDirection.left && diff.touchX > diff.touchY ) { snake.speedX = gameCanvas.width/33; snake.speedY = 0 }; // Right
    if (direction.down && !actualDirection.up && diff.touchX < diff.touchY) { snake.speedX = 0; snake.speedY = gameCanvas.height/33 }; // Down

}

const createFood = () => {
    const randomCoord = size => Math.floor((Math.random() * size) / 10) * 10;

    food.posX = randomCoord(gameCanvas.width - gameCanvas.width/33);
    food.posY = randomCoord(gameCanvas.height - gameCanvas.height/33);

    snake.trail.forEach( snakePart => (snakePart.x === food.posX && snakePart.y === food.posY) ?? createFood());
};

function drawFood() { ctx.fillStyle = 'red'; ctx.fillRect(food.posX, food.posY , gameCanvas.width/33, gameCanvas.height/33)}

const gameOver = () => {
    for (i = 4; i < snake.tail; i++) {
        if ( snake.trail[i].x === snake.trail[0].x && snake.trail[i].y === snake.trail[0].y) return true;
    }

    const hitWall = {
        left: snake.trail[0].x < 0 - gameCanvas.width/33,
        up: snake.trail[0].y < 0 - gameCanvas.height/33,
        right: snake.trail[0].x >= gameCanvas.width,
        down: snake.trail[0].y >= gameCanvas.height 
    }

    return Object.values(hitWall).includes(true) ?? false;
}
const onGameOver = () => {
    options.isGameOver = false;
    location.reload();
}
document.getElementById('reload-btn').onclick = onGameOver;

// Launch game
const main = () => {
    getScore();
    drawSnake();

    if (gameOver()) {
        options.isGameOver = true;
        gameOverScreen.style.display = 'flex';
        return
    };

    setTimeout(() => {
        snake.changingDirection = false;
        clearCanvas();
        drawFood();
        advanceSnake();
        main();
    }, options.speed);
};
clearCanvas();
createFood();
snake.speedX = gameCanvas.width/33;
main();
document.addEventListener("keydown", changeDirection);
document.addEventListener("touchstart", handleTouchStart, {passive: false});
document.addEventListener("touchmove", handleTouchMove, {passive: false});
