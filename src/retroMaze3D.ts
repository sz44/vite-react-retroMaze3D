import { shadesWall, shadesFloor, shadeOrb } from "./game/shades";
import { map1 } from "./game/maps";
import { Timer } from "./timer";

export class RetroMaze3D {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D | null;
    private screen: Array<number>;
    private screenCellSize: number;
    private screenHeight: number;
    private screenWidth: number;
    private playerX: number;
    private playerY: number;
    private playerA: number;
    private lastRun: number;
    private timer: Timer;
    private FPS: number;
    private map: string;
    private mapHeight: number;
    private mapWidth: number;
    private mapTileSize: number;
    private depth: number;
    private FOV: number;
    private speed: number;
    private keys: Set<string>;
    private orbReached: boolean;
    private onGameOver: ()=>void;
    private onTimeUpdate: (n:number)=>void;

    constructor(canvas: HTMLCanvasElement, onGameOver: ()=>void, onTimeUpdate: (n:number)=>void) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        if (!this.ctx) {
            throw Error("unable to get 2D context");
        }

        canvas.width = 800;
        canvas.height = 600;

        this.timer = new Timer();
        this.FPS = 30;
        this.screenCellSize = 10;
        this.screenHeight = canvas.height / this.screenCellSize;
        this.screenWidth = canvas.width / this.screenCellSize;
        this.screen = Array(this.screenHeight * this.screenWidth).fill(0);
        this.playerX = 7;
        this.playerY = 8;
        this.playerA = 0;
        this.FOV = Math.PI / 4;
        this.speed = 0.1;
        this.lastRun = 0;
        this.map = map1;
        this.mapHeight = 16;
        this.mapWidth = 16;
        this.mapTileSize = 10;
        this.depth = 16;
        this.keys = new Set();
        this.orbReached = false;
        this.onGameOver = onGameOver;
        this.onTimeUpdate = onTimeUpdate;
        this.init();
    }

    private init = () => {
        window.addEventListener("keydown", (e) => {
           this.keys.add(e.key);
        });

        window.addEventListener("keyup", (e) => {
            this.keys.delete(e.key);
        });
    }

    private update = () => {
        if (this.keys.has("a")) {
            this.playerA -= 0.04;
        }
        if (this.keys.has("d")) {
            this.playerA += 0.04;
        }
        if (this.keys.has("w")) {
            this.playerX += Math.cos(this.playerA) * this.speed;
            this.playerY += Math.sin(this.playerA) * this.speed;
            const offSetX = Math.cos(this.playerA) * 0.5;
            const offSetY = Math.sin(this.playerA) * 0.5;

            if (this.map[Math.floor(this.playerY + offSetY) * this.mapWidth + Math.floor(this.playerX + offSetX)] === "#") {
                this.playerX -= Math.cos(this.playerA) * this.speed;
                this.playerY -= Math.sin(this.playerA) * this.speed;
            }

            if (this.map[Math.floor(this.playerY + offSetY) * this.mapWidth + Math.floor(this.playerX + offSetX)] === "o") {
                this.orbReached = true;
            }
        }
        if (this.keys.has("s")) {
            this.playerX -= Math.cos(this.playerA) * this.speed;
            this.playerY -= Math.sin(this.playerA) * this.speed;
            const offSetX = -Math.cos(this.playerA) * 0.5;
            const offSetY = -Math.sin(this.playerA) * 0.5;

            if (this.map[Math.floor(this.playerY + offSetY) * this.mapWidth + Math.floor(this.playerX + offSetX)] === "#") {
                this.playerX += Math.cos(this.playerA) * this.speed;
                this.playerY += Math.sin(this.playerA) * this.speed;
            }
        }
        if (this.keys.has("q")) {
            this.playerX += Math.sin(this.playerA) * this.speed;
            this.playerY -= Math.cos(this.playerA) * this.speed;
            const offSetX = +Math.sin(this.playerA) * 0.5;
            const offSetY = -Math.cos(this.playerA) * 0.5;

            if (this.map[Math.floor(this.playerY + offSetY) * this.mapWidth + Math.floor(this.playerX + offSetX)] === "#") {
                this.playerX -= Math.sin(this.playerA) * this.speed;
                this.playerY += Math.cos(this.playerA) * this.speed;
            }
        }
        if (this.keys.has("e")) {
            this.playerX -= Math.sin(this.playerA) * this.speed;
            this.playerY += Math.cos(this.playerA) * this.speed;
            const offSetX = -Math.sin(this.playerA) * 0.5;
            const offSetY = +Math.cos(this.playerA) * 0.5;

            if (this.map[Math.floor(this.playerY + offSetY) * this.mapWidth + Math.floor(this.playerX + offSetX)] === "#") {
                this.playerX += Math.sin(this.playerA) * this.speed;
                this.playerY -= Math.cos(this.playerA) * this.speed;
            }
        }
        for (let x = 0; x < this.screenWidth; x++) {
            const rayAngle = this.playerA - this.FOV / 2 + (x / this.screenWidth) * this.FOV;

            let distanceToWall = 0;
            let hitWall = false;
            let boundry = false;
            let orb = false;

            const unitX = Math.cos(rayAngle);
            const unitY = Math.sin(rayAngle);

            while (!hitWall && distanceToWall < this.depth) {
                distanceToWall += 0.1;
                const rayX = Math.floor(this.playerX + unitX * distanceToWall);
                const rayY = Math.floor(this.playerY + unitY * distanceToWall);

                // Test if ray is out of bounds
                if (rayX < 0 || rayX >= this.mapWidth || rayY < 0 || rayY >= this.mapHeight) {
                    hitWall = true;
                    distanceToWall = this.depth;
                } else {
                    // Ray is in bounds so test to see if ray cell is a wall block
                    if (this.map[rayY * this.mapWidth + rayX] === "#") {
                        hitWall = true;

                        const p: [number, number][] = []; // [distance, dotproduct]

                        for (let tx = 0; tx < 2; tx++) {
                            for (let ty = 0; ty < 2; ty++) {
                                const vy = rayY + ty - this.playerY;
                                const vx = rayX + tx - this.playerX;
                                const d = Math.sqrt(vx * vx + vy * vy);
                                const dot = (unitX * vx) / d + (unitY * vy) / d;
                                // const dot2 = (unitX * vx) / d + (unitY * vy) / d;
                                p.push([d, dot]);
                            }
                        }

                        p.sort((a, b) => a[0] - b[0]);

                        const bound = 0.005;
                        if (Math.acos(p[0][1]) < bound) {
                            boundry = true;
                        }
                        if (Math.acos(p[1][1]) < bound) {
                            boundry = true;
                        }
                    } else if (this.map[rayY * this.mapWidth + rayX] === "o") {
                        hitWall = true;
                        orb = true;
                    }
                }
            }

            const ceiling = this.screenHeight / 2 - this.screenHeight / distanceToWall;
            const floor = this.screenHeight - ceiling;

            for (let y = 0; y < this.screenHeight; y++) {
                const l = shadesWall.length;
                const m = shadesFloor.length;
                const loc = y * this.screenWidth + x;
                if (y <= ceiling) {
                    const div = ceiling / 10;
                    if (y <= div * 1) {
                        this.screen[loc] = l + 9;
                    } else if (y <= div * 2) {
                        this.screen[loc] = l + 8;
                    } else if (y <= div * 3) {
                        this.screen[loc] = l + 7;
                    } else if (y <= div * 4) {
                        this.screen[loc] = l + 6;
                    } else if (y <= div * 5) {
                        this.screen[loc] = l + 5;
                    } else if (y <= div * 6) {
                        this.screen[loc] = l + 4;
                    } else if (y <= div * 7) {
                        this.screen[loc] = l + 3;
                    } else if (y <= div * 8) {
                        this.screen[loc] = l + 2;
                    } else if (y <= div * 9) {
                        this.screen[loc] = l + 1;
                    } else if (y <= div * 10) {
                        this.screen[loc] = l + 0;
                    }
                } else if (y > ceiling && y <= floor) {
                    if (distanceToWall <= this.depth / 7) {
                        this.screen[loc] = 7;
                    } else if (distanceToWall <= this.depth / 6) {
                        this.screen[loc] = 6;
                    } else if (distanceToWall <= this.depth / 5) {
                        this.screen[loc] = 5;
                    } else if (distanceToWall <= this.depth / 4) {
                        this.screen[loc] = 4;
                    } else if (distanceToWall <= this.depth / 3) {
                        this.screen[loc] = 3;
                    } else if (distanceToWall <= this.depth / 2) {
                        this.screen[loc] = 2;
                    } else if (distanceToWall <= this.depth) {
                        this.screen[loc] = 1;
                    }

                    if (boundry) {
                        this.screen[loc] = 0;
                    }
                    if (orb) {
                        this.screen[loc] = l + m;
                    }
                } else {
                    // let b = 1 - (y - gridWidth/2) / gridWidth/2;
                    const div = ceiling / 10;
                    if (y <= floor + div * 1) {
                        this.screen[loc] = l + 0;
                    } else if (y <= floor + div * 2) {
                        this.screen[loc] = l + 1;
                    } else if (y <= floor + div * 3) {
                        this.screen[loc] = l + 2;
                    } else if (y <= floor + div * 4) {
                        this.screen[loc] = l + 3;
                    } else if (y <= floor + div * 5) {
                        this.screen[loc] = l + 4;
                    } else if (y <= floor + div * 6) {
                        this.screen[loc] = l + 5;
                    } else if (y <= floor + div * 7) {
                        this.screen[loc] = l + 6;
                    } else if (y <= floor + div * 8) {
                        this.screen[loc] = l + 7;
                    } else if (y <= floor + div * 9) {
                        this.screen[loc] = l + 8;
                    } else if (y <= floor + div * 10) {
                        this.screen[loc] = l + 9;
                    }
                }
            }
        }
    };

    private draw = () => {
        if (!this.ctx) {
            return;
        }
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw screen: first person view
        for (let y = 0; y < this.screenHeight; y++) {
            for (let x = 0; x < this.screenWidth; x++) {
                const n = this.screen[y * this.screenWidth + x];
                if (n < shadesWall.length) {
                    this.ctx.fillStyle = shadesWall[n];
                } else if (n < shadesWall.length + shadesFloor.length) {
                    this.ctx.fillStyle = shadesFloor[n - shadesWall.length];
                } else {
                    this.ctx.fillStyle = shadeOrb;
                }
                this.ctx.fillRect(x * this.screenCellSize, y * this.screenCellSize, this.screenCellSize, this.screenCellSize);
            }
        }

        // Draw mini map
        for (let y = 0; y < this.mapHeight; y++) {
            for (let x = 0; x < this.mapWidth; x++) {
                const n = this.map[y * this.mapWidth + x];
                switch (n) {
                    case "#":
                        this.ctx.fillStyle = "#000000";
                        break;
                    case ".":
                        this.ctx.fillStyle = "#ffffff";
                        break;
                }
                this.ctx.fillRect(x * this.mapTileSize, y * this.mapTileSize, this.mapTileSize, this.mapTileSize);
            }
        }

        // draw player on mini map
        this.ctx.save();
        this.ctx.translate(this.playerX * this.mapTileSize, this.playerY * this.mapTileSize);
        this.ctx.rotate(this.playerA);
        this.ctx.fillStyle = "#0000ff";
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 5, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.closePath();
        // draw vision cone
        this.ctx.beginPath();
        this.ctx.fillStyle = "#ffff0077";
        // ctx.arc(0, 0, 50, (Math.PI * 3) / 8, (Math.PI * 5) / 8);
        this.ctx.arc(0, 0, 50, -this.FOV / 2, this.FOV / 2);
        this.ctx.lineTo(0, 0);
        this.ctx.fill();
        this.ctx.restore();
    };

    private animate = (time: number) => {
        this.onTimeUpdate(this.timer.time);

        if (this.orbReached) {
            // this.onScoreUpdate(this.timer.time);
            this.timer.stop();
            this.onGameOver();
            return;
        }

        const timeElapsed = time - this.lastRun;
        const frameTime = 1000 / this.FPS;

        requestAnimationFrame(this.animate);
        this.draw();
        if (timeElapsed >= frameTime) {
            this.update();
            this.lastRun = time - (timeElapsed % frameTime);
        }
    };

    public start = () => {
        this.playerX = 14;
        this.playerY = 2;
        this.playerA = Math.PI/2;
        this.lastRun = 0;
        this.orbReached = false;
        this.timer.start();
        requestAnimationFrame(this.animate);
    };
}
