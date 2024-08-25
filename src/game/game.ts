const endMenu = document.querySelector("#endMenu");
const submit = document.querySelector(".menu #submit");
const start = document.querySelector("#start");
const retry = document.querySelector(".menu #retry");
const timeDisplay = document.querySelector("#time");

retry.onclick = (e) => {
    startGame();
};

start.onclick = (e) => {
    start.classList.toggle("hide");
    startGame();
};

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 600;

const screenCellSize = 5;

let screenWidth = canvas.width / screenCellSize;
let screenHeight = canvas.height / screenCellSize;

let screen = Array(screenHeight * screenWidth).fill(0);

let mapHeight = 16;
let mapWidth = 16;

let map = map1;

let mapTileSize = 10;

let depth = 16;

let playerX = 4;
let playerY = 1;
let playerA = 0;

let enemyX = 4;
let enemyY = 1;
let enemySpeed = 0.05;

let bulletSpeed = 0.01;
let bulletZ = 0;
// let bulletSize = 10;

let orbReached = false;

let playerSize = 1;

let FOV = Math.PI / 4;

let keys = new Set();

let speed = 0.1;

window.addEventListener("keydown", (e) => {
    keys.add(e.key);
});

window.addEventListener("keyup", (e) => {
    keys.delete(e.key);
});

function update() {
    if (keys.has("a")) {
        playerA -= 0.04;
    }
    if (keys.has("d")) {
        playerA += 0.04;
    }
    if (keys.has("w")) {
        playerX += Math.cos(playerA) * speed;
        playerY += Math.sin(playerA) * speed;
        let offSetX = Math.cos(playerA) * 0.5;
        let offSetY = Math.sin(playerA) * 0.5;

        if (map[Math.floor(playerY + offSetY) * mapWidth + Math.floor(playerX + offSetX)] === "#") {
            playerX -= Math.cos(playerA) * speed;
            playerY -= Math.sin(playerA) * speed;
        }

        if (map[Math.floor(playerY + offSetY) * mapWidth + Math.floor(playerX + offSetX)] === "o") {
            orbReached = true;
        }
    }
    if (keys.has("s")) {
        playerX -= Math.cos(playerA) * speed;
        playerY -= Math.sin(playerA) * speed;
        let offSetX = -Math.cos(playerA) * 0.5;
        let offSetY = -Math.sin(playerA) * 0.5;

        if (map[Math.floor(playerY + offSetY) * mapWidth + Math.floor(playerX + offSetX)] === "#") {
            playerX += Math.cos(playerA) * speed;
            playerY += Math.sin(playerA) * speed;
        }
    }
    if (keys.has("q")) {
        playerX += Math.sin(playerA) * speed;
        playerY -= Math.cos(playerA) * speed;
        let offSetX = +Math.sin(playerA) * 0.5;
        let offSetY = -Math.cos(playerA) * 0.5;

        if (map[Math.floor(playerY + offSetY) * mapWidth + Math.floor(playerX + offSetX)] === "#") {
            playerX -= Math.sin(playerA) * speed;
            playerY += Math.cos(playerA) * speed;
        }
    }
    if (keys.has("e")) {
        playerX -= Math.sin(playerA) * speed;
        playerY += Math.cos(playerA) * speed;
        let offSetX = -Math.sin(playerA) * 0.5;
        let offSetY = +Math.cos(playerA) * 0.5;

        if (map[Math.floor(playerY + offSetY) * mapWidth + Math.floor(playerX + offSetX)] === "#") {
            playerX += Math.sin(playerA) * speed;
            playerY -= Math.cos(playerA) * speed;
        }
    }
    for (let x = 0; x < screenWidth; x++) {
        let rayAngle = playerA - FOV / 2 + (x / screenWidth) * FOV;
        // debugger

        let distanceToWall = 0;
        let hitWall = false;
        let boundry = false;
        let orb = false;

        let unitX = Math.cos(rayAngle);
        let unitY = Math.sin(rayAngle);

        while (!hitWall && distanceToWall < depth) {
            distanceToWall += 0.1;
            let rayX = Math.floor(playerX + unitX * distanceToWall);
            let rayY = Math.floor(playerY + unitY * distanceToWall);

            // Test if ray is out of bounds
            if (rayX < 0 || rayX >= mapWidth || rayY < 0 || rayY >= mapHeight) {
                hitWall = true;
                distanceToWall = depth;
                // debugger
            } else {
                // Ray is in bounds so test to see if ray cell is a wall block
                if (map[rayY * mapWidth + rayX] === "#") {
                    hitWall = true;

                    p = []; // (distance, dot)

                    for (let tx = 0; tx < 2; tx++) {
                        for (let ty = 0; ty < 2; ty++) {
                            let vy = rayY + ty - playerY;
                            let vx = rayX + tx - playerX;
                            let d = Math.sqrt(vx * vx + vy * vy);
                            let dot = (unitX * vx) / d + (unitY * vy) / d;
                            let dot2 = (unitX * vx) / d + (unitY * vy) / d;
                            p.push([d, dot]);
                        }
                    }

                    p.sort((a, b) => a[0] - b[0]);

                    let bound = 0.005;
                    if (Math.acos(p[0][1]) < bound) {
                        boundry = true;
                    }
                    if (Math.acos(p[1][1]) < bound) {
                        boundry = true;
                    }
                    // debugger
                } else if (map[rayY * mapWidth + rayX] === "o") {
                    hitWall = true;
                    orb = true;
                }
            }
        }

        let ceiling = screenHeight / 2 - screenHeight / distanceToWall;
        let floor = screenHeight - ceiling;

        for (let y = 0; y < screenHeight; y++) {
            let l = shadesWall.length;
            let m = shadesFloor.length;
            let loc = y * screenWidth + x;
            if (y <= ceiling) {
                let div = ceiling / 10;
                if (y <= div * 1) {
                    screen[loc] = l + 9;
                } else if (y <= div * 2) {
                    screen[loc] = l + 8;
                } else if (y <= div * 3) {
                    screen[loc] = l + 7;
                } else if (y <= div * 4) {
                    screen[loc] = l + 6;
                } else if (y <= div * 5) {
                    screen[loc] = l + 5;
                } else if (y <= div * 6) {
                    screen[loc] = l + 4;
                } else if (y <= div * 7) {
                    screen[loc] = l + 3;
                } else if (y <= div * 8) {
                    screen[loc] = l + 2;
                } else if (y <= div * 9) {
                    screen[loc] = l + 1;
                } else if (y <= div * 10) {
                    screen[loc] = l + 0;
                }
            } else if (y > ceiling && y <= floor) {
                if (distanceToWall <= depth / 7) {
                    screen[loc] = 7;
                } else if (distanceToWall <= depth / 6) {
                    screen[loc] = 6;
                } else if (distanceToWall <= depth / 5) {
                    screen[loc] = 5;
                } else if (distanceToWall <= depth / 4) {
                    screen[loc] = 4;
                } else if (distanceToWall <= depth / 3) {
                    screen[loc] = 3;
                } else if (distanceToWall <= depth / 2) {
                    screen[loc] = 2;
                } else if (distanceToWall <= depth) {
                    screen[loc] = 1;
                }

                if (boundry) {
                    screen[loc] = 0;
                }
                if (orb) {
                    screen[loc] = l + m;
                }
            } else {
                // let b = 1 - (y - gridWidth/2) / gridWidth/2;
                let div = ceiling / 10;
                if (y <= floor + div * 1) {
                    screen[loc] = l + 0;
                } else if (y <= floor + div * 2) {
                    screen[loc] = l + 1;
                } else if (y <= floor + div * 3) {
                    screen[loc] = l + 2;
                } else if (y <= floor + div * 4) {
                    screen[loc] = l + 3;
                } else if (y <= floor + div * 5) {
                    screen[loc] = l + 4;
                } else if (y <= floor + div * 6) {
                    screen[loc] = l + 5;
                } else if (y <= floor + div * 7) {
                    screen[loc] = l + 6;
                } else if (y <= floor + div * 8) {
                    screen[loc] = l + 7;
                } else if (y <= floor + div * 9) {
                    screen[loc] = l + 8;
                } else if (y <= floor + div * 10) {
                    screen[loc] = l + 9;
                }
            }
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw screen: first person view
    for (let y = 0; y < screenHeight; y++) {
        for (let x = 0; x < screenWidth; x++) {
            let n = screen[y * screenWidth + x];
            if (n < shadesWall.length) {
                ctx.fillStyle = shadesWall[n];
            } else if (n < shadesWall.length + shadesFloor.length) {
                ctx.fillStyle = shadesFloor[n - shadesWall.length];
            } else {
                ctx.fillStyle = shadeOrb;
            }
            ctx.fillRect(x * screenCellSize, y * screenCellSize, screenCellSize, screenCellSize);
        }
    }

    // Draw mini map
    for (let y = 0; y < mapHeight; y++) {
        for (let x = 0; x < mapWidth; x++) {
            let n = map[y * mapWidth + x];
            switch (n) {
                case "#":
                    ctx.fillStyle = "#000000";
                    break;
                case ".":
                    ctx.fillStyle = "#ffffff";
                    break;
            }
            ctx.fillRect(x * mapTileSize, y * mapTileSize, mapTileSize, mapTileSize);
        }
    }

    // draw player on mini map
    ctx.save();
    ctx.translate(playerX * mapTileSize, playerY * mapTileSize);
    ctx.rotate(playerA);
    ctx.fillStyle = "#0000ff";
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
    // draw vision cone
    ctx.beginPath();
    ctx.fillStyle = "#ffff0077";
    // ctx.arc(0, 0, 50, (Math.PI * 3) / 8, (Math.PI * 5) / 8);
    ctx.arc(0, 0, 50, -FOV / 2, FOV / 2);
    ctx.lineTo(0, 0);
    ctx.fill();
    ctx.restore();
}

const FPS = 30;
const frameTime = 1000 / FPS;

let lastRun = 0;

let run = true;

function gameLoop(time) {
    if (orbReached) {
        endMenu.classList.toggle("hide");
        run = false;
        stopTimer();
    }
    if (run) {
        let timeElapsed = time - lastRun;
        requestAnimationFrame(gameLoop);
        draw();
        // update at specified fps
        if (timeElapsed >= frameTime) {
            update();
            lastRun = time - (timeElapsed % frameTime);
        }
    }
}

let startTime = 0;
let i;

function startTimer() {
    startTime = Date.now();
    i = setInterval(() => {
        const timeInSeconds = Math.round((Date.now() - startTime) / 1000);
        timeDisplay.innerHTML = timeInSeconds;
    }, 100);
}

function stopTimer() {
    clearInterval(i);
}

function startGame() {
    playerX = 7;
    playerY = 14;
    playerA = 0;
    run = true;
    orbReached = false;
    endMenu.classList.add("hide");
    lastRun = document.timeline.currentTime;
    startTimer();
    requestAnimationFrame(gameLoop);
}
