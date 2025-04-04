// script.js

const canvas = document.getElementById('game-board');
const context = canvas.getContext('2d');
const nextCanvas = document.getElementById('next-piece');
const nextContext = nextCanvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const levelDisplay = document.getElementById('level');
const linesDisplay = document.getElementById('lines');

const bricklanding = document.getElementById('bricklanding')

const grid = [];
const gridSize = 20; // Size of each grid cell in pixels
const gridWidth = canvas.width / gridSize;
const gridHeight = canvas.height / gridSize;

let currentPiece;
let nextPiece;
let score = 0;
let level = 1;
let lines = 0;
let dropInterval = 50; // Initial drop interval (1 second)
let lastDropTime = 0;


const pieces = [
    // I piece
    {
        shape: [
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0]
        ],
        color: 'cyan'
    },
    // J piece
    {
        shape: [
            [0, 1, 0],
            [0, 1, 0],
            [1, 1, 0]
        ],
        color: 'blue'
    },
    // L piece
    {
        shape: [
            [0, 1, 0],
            [0, 1, 0],
            [0, 1, 1]
        ],
        color: 'orange'
    },
    // O piece
    {
        shape: [
            [1, 1],
            [1, 1]
        ],
        color: 'yellow'
    },
    // S piece
    {
        shape: [
            [0, 1, 1],
            [1, 1, 0],
            [0, 0, 0]
        ],
        color: 'green'
    },
    // T piece
    {
        shape: [
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        color: 'purple'
    },
    // Z piece
    {
        shape: [
            [1, 1, 0],
            [0, 1, 1],
            [0, 0, 0]
        ],
        color: 'red'
    }
];

function initGrid() {
    for (let y = 0; y < gridHeight; y++) {
        grid[y] = [];
        for (let x = 0; x < gridWidth; x++) {
            grid[y][x] = 0;
        }
    }
}

function getRandomPiece() {
    return pieces[Math.floor(Math.random() * pieces.length)];
}

function createPiece() {
    currentPiece = nextPiece || getRandomPiece();
    nextPiece = getRandomPiece();
    currentPiece.x = Math.floor(gridWidth / 2) - Math.floor(currentPiece.shape[0].length / 2);
    currentPiece.y = 0;

    // Check for game over
    if (checkCollision()) {
        gameOver();
        return; // Stop creating new pieces
    }
}

function drawPiece(piece, context, x = 0, y = 0) {
    piece.shape.forEach((row, rowIndex) => {
        row.forEach((value, colIndex) => {
            if (value) {
                context.fillStyle = piece.color;
                context.fillRect((colIndex + x) * gridSize, (rowIndex + y) * gridSize, gridSize, gridSize);
                context.strokeStyle = 'black';
                context.strokeRect((colIndex + x) * gridSize, (rowIndex + y) * gridSize, gridSize, gridSize);
            }
        });
    });
}

function drawGrid() {
    for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
            if (grid[y][x]) {
                context.fillStyle = grid[y][x];
                context.fillRect(x * gridSize, y * gridSize, gridSize, gridSize);
                context.strokeStyle = 'black';
                context.strokeRect(x * gridSize, y * gridSize, gridSize, gridSize);
            }
        }
    }
}

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    nextContext.clearRect(0, 0, nextCanvas.width, nextCanvas.height);

    drawGrid();
    drawPiece(currentPiece, context, currentPiece.x, currentPiece.y);

    // Draw next piece in the center of the next canvas
    const nextPieceX = Math.floor((nextCanvas.width / gridSize - nextPiece.shape[0].length) / 2);
    const nextPieceY = Math.floor((nextCanvas.height / gridSize - nextPiece.shape.length) / 2);
    drawPiece(nextPiece, nextContext, nextPieceX, nextPieceY);

    scoreDisplay.textContent = score;
    levelDisplay.textContent = level;
    linesDisplay.textContent = lines;
}

function gameOver() {
    alert('Game Over! Score: ' + score);
    initGrid();
    createPiece();
    score = 0;
    level = 1;
    lines = 0;
    dropInterval = 1000;
    updateGameSpeed();
}


// move piece and collision detection

function movePieceDown() {
    currentPiece.y++;
    if (checkCollision()) {
        currentPiece.y--;
        freezePiece();
    }
}

function checkCollision() {
    const shape = currentPiece.shape;
    const x = currentPiece.x;
    const y = currentPiece.y;

    for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
            if (shape[row][col]) {
                const nextY = y + row;
                const nextX = x + col;

                if (nextY >= gridHeight || nextX < 0 || nextX >= gridWidth || grid[nextY][nextX]) {
                    return true; // Collision detected
                }
            }
        }
    }
    return false; // No collision
}

function freezePiece() {
    const shape = currentPiece.shape;
    const x = currentPiece.x;
    const y = currentPiece.y;

    shape.forEach((row, rowIndex) => {
        row.forEach((value, colIndex) => {
            if (value) {
                grid[y + rowIndex][x + colIndex] = currentPiece.color;
            }
        });
    });

    bricklanding.currentTime = 0;
    bricklanding.play();
    checkRows();
    createPiece();
}

function checkRows() {
    for (let y = gridHeight - 1; y >= 0; y--) {
        if (grid[y].every(value => value)) {
            clearRow(y);
            y++; // Check the same row again after shifting down
        }
    }
}

function clearRow(row) {
    for (let y = row; y > 0; y--) {
        grid[y] = [...grid[y - 1]];
    }
    grid[0].fill(0);

    lines++;
    score += 100 * level; // Increase score based on level
    if (lines % 10 === 0) {
        level++;
        updateGameSpeed();
    }
}


// input handling

document.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') {
        movePieceHorizontal(-1);
    } else if (event.key === 'ArrowRight') {
        movePieceHorizontal(1);
    } else if (event.key === 'ArrowDown') {
        movePieceDown();
    } else if (event.key === 'ArrowUp') {
        rotatePiece();
    }
});

function movePieceHorizontal(direction) {
    currentPiece.x += direction;
    if (checkCollision()) {
        currentPiece.x -= direction;
    }
}

// rotate piece

function rotatePiece() {
    const originalShape = currentPiece.shape;
    const rotatedShape = originalShape[0].map((val, index) => originalShape.map(row => row[index]).reverse());

    currentPiece.shape = rotatedShape;
    if (checkCollision()) {
        currentPiece.shape = originalShape; // Revert rotation if collision
    }
}

// game speed and game loop



function gameLoop(time = 0) {
    const deltaTime = time - lastDropTime;

    if (deltaTime > dropInterval) {
        movePieceDown();
        lastDropTime = time;
    }

    draw();
    requestAnimationFrame(gameLoop);
}

// Update game speed based on level
function updateGameSpeed() {
    dropInterval = 1000 - (level * 100);
    dropInterval = Math.max(dropInterval, 100); // Minimum drop interval
}



initGrid();
createPiece();
updateGameSpeed();
gameLoop();