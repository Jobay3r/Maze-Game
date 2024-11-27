const socket = io();
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const mazeSize = 35;
let maze = null;
let gameActive = true;

function calculateCellSize() {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const padding = 40;
    
    const maxCellWidth = (screenWidth - padding * 2) / mazeSize;
    const maxCellHeight = (screenHeight - padding * 2) / mazeSize;
    
    return Math.floor(Math.min(maxCellWidth, maxCellHeight));
}

let cellSize = calculateCellSize();
canvas.width = mazeSize * cellSize;
canvas.height = mazeSize * cellSize;

canvas.style.position = 'absolute';
canvas.style.left = '50%';
canvas.style.top = '50%';
canvas.style.transform = 'translate(-50%, -50%)';

window.addEventListener('resize', () => {
    const newCellSize = calculateCellSize();
    if (newCellSize !== cellSize) {
        cellSize = newCellSize;
        canvas.width = mazeSize * cellSize;
        canvas.height = mazeSize * cellSize;
        drawGame();
    }
});

const loginScreen = document.getElementById('login-screen');
const gameScreen = document.getElementById('game-screen');
const playerNameInput = document.getElementById('player-name');
const playerColorInput = document.getElementById('player-color');
const startButton = document.getElementById('start-button');

startButton.addEventListener('click', () => {
    const playerName = playerNameInput.value.trim();
    if (playerName) {
        playerData = {
            name: playerName,
            color: playerColorInput.value
        };
        socket.emit('newPlayer', playerData);
        loginScreen.style.display = 'none';
        gameScreen.style.display = 'block';
    }
});

let players = new Map();

socket.on('players', (serverPlayers) => {
    players = new Map(serverPlayers);
    drawGame();
    updatePlayersList();
});

socket.on('winner', (winner) => {
    gameActive = false;
    const announcement = document.createElement('div');
    announcement.style.position = 'fixed';
    announcement.style.top = '50%';
    announcement.style.left = '50%';
    announcement.style.transform = 'translate(-50%, -50%)';
    announcement.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
    announcement.style.padding = '20px';
    announcement.style.borderRadius = '10px';
    announcement.style.textAlign = 'center';
    announcement.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
    announcement.style.zIndex = '1000';
    announcement.innerHTML = `
        <h2 style="color: ${winner.color}"> ${winner.name} Won! </h2>
        <p>${winner.name} successfully escaped the maze!</p>
        <button onclick="location.reload()" style="padding: 10px 20px; margin-top: 10px; cursor: pointer;">Play Again</button>
    `;
    document.getElementById('game-container').appendChild(announcement);
});

socket.on('maze', (mazeData) => {
    maze = mazeData;
    drawGame();
});

let playerData = null;

function drawGame() {
    if (!maze) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let y = 0; y < mazeSize; y++) {
        for (let x = 0; x < mazeSize; x++) {
            if (maze[y][x] === 1) {
                ctx.fillStyle = '#808080';
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            } else {
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            }
        }
    }
    
    ctx.fillStyle = '#2ecc71';
    ctx.fillRect(cellSize, cellSize, cellSize, cellSize);
    
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect((mazeSize-2) * cellSize, (mazeSize-2) * cellSize, cellSize, cellSize);
    
    players.forEach((player, id) => {
        ctx.fillStyle = player.color;
        ctx.beginPath();
        ctx.arc(
            player.x * cellSize + cellSize/2,
            player.y * cellSize + cellSize/2,
            cellSize/3,
            0,
            Math.PI * 2
        );
        ctx.fill();
        
        ctx.fillStyle = '#000';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(
            player.name,
            player.x * cellSize + cellSize/2,
            player.y * cellSize - 5
        );
    });
}

function updatePlayersList() {
    const playersList = document.getElementById('players');
    playersList.innerHTML = '';
    players.forEach((player) => {
        const li = document.createElement('li');
        li.style.color = player.color;
        li.textContent = player.name;
        playersList.appendChild(li);
    });
}

document.addEventListener('keydown', (e) => {
    if (!playerData || !gameActive) return;
    
    switch(e.key) {
        case 'ArrowUp':
            socket.emit('move', 'up');
            break;
        case 'ArrowDown':
            socket.emit('move', 'down');
            break;
        case 'ArrowLeft':
            socket.emit('move', 'left');
            break;
        case 'ArrowRight':
            socket.emit('move', 'right');
            break;
    }
});
