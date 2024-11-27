const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

app.use(express.static('public'));

const players = new Map();
const mazeSize = 35;
const maze = generateMaze(mazeSize);

io.on('connection', (socket) => {
    socket.emit('maze', maze);

    socket.on('newPlayer', (playerData) => {
        players.set(socket.id, {
            x: 1,
            y: 1,
            color: playerData.color,
            name: playerData.name
        });
        io.emit('players', Array.from(players));
    });

    socket.on('move', (direction) => {
        const player = players.get(socket.id);
        if (!player) return;

        let newX = player.x;
        let newY = player.y;

        switch(direction) {
            case 'up':
                if (isValidMove(player.x, player.y - 1)) newY--;
                break;
            case 'down':
                if (isValidMove(player.x, player.y + 1)) newY++;
                break;
            case 'left':
                if (isValidMove(player.x - 1, player.y)) newX--;
                break;
            case 'right':
                if (isValidMove(player.x + 1, player.y)) newX++;
                break;
        }

        player.x = newX;
        player.y = newY;

        if (player.x === mazeSize - 2 && player.y === mazeSize - 2) {
            io.emit('winner', {
                name: player.name,
                color: player.color
            });
        }

        io.emit('players', Array.from(players));
    });

    socket.on('disconnect', () => {
        players.delete(socket.id);
        io.emit('players', Array.from(players));
    });
});

function isValidMove(x, y) {
    return x >= 0 && x < mazeSize && y >= 0 && y < mazeSize && maze[y][x] === 0;
}

function generateMaze(size) {
    const maze = Array(size).fill().map(() => Array(size).fill(1));
    const stack = [];
    const start = { x: 1, y: 1 };
    maze[start.y][start.x] = 0;
    stack.push(start);

    while (stack.length > 0) {
        const current = stack[stack.length - 1];
        const neighbors = [];

        [[0, -2], [0, 2], [-2, 0], [2, 0]].forEach(([dx, dy]) => {
            const newX = current.x + dx;
            const newY = current.y + dy;
            if (newX > 0 && newX < size - 1 && newY > 0 && newY < size - 1 && maze[newY][newX] === 1) {
                neighbors.push({ x: newX, y: newY, dx: dx/2, dy: dy/2 });
            }
        });

        if (neighbors.length > 0) {
            const next = neighbors[Math.floor(Math.random() * neighbors.length)];
            maze[next.y][next.x] = 0;
            maze[current.y + next.dy][current.x + next.dx] = 0;
            stack.push(next);
        } else {
            stack.pop();
        }
    }

    maze[size - 2][size - 2] = 0;
    maze[size - 3][size - 2] = 0;
    maze[size - 2][size - 3] = 0;

    return maze;
}

const PORT = process.env.PORT || 3000;
const os = require('os');

http.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    if (process.env.RENDER) {
        console.log(`Application deployed on Render`);
    } else {
        console.log(`Local: http://localhost:${PORT}`);
        const networkInterfaces = os.networkInterfaces();
        Object.keys(networkInterfaces).forEach((interfaceName) => {
            networkInterfaces[interfaceName].forEach((interface) => {
                if (interface.family === 'IPv4' && !interface.internal) {
                    console.log(`Network: http://${interface.address}:${PORT}`);
                }
            });
        });
    }
});
