type Raindrop = {
    x: number;
    y: number;
    speed: number;
    length: number;
};

export class RainAnimation {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private raindrops: Raindrop[] = [];
    private numberOfDrops: number = 100;
    private animationFrameId: number | null = null;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        const ctx = this.canvas.getContext("2d")!;
        if (!ctx) throw new Error("Could not get 2D context");
        this.ctx = ctx;
        this.resizeCanvas();
        this.createRaindrops();
    }

    public start = () => {
        this.animate();
        window.addEventListener("resize", this.resizeCanvas);
    }

    public stop = () => {
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
        }

        window.removeEventListener("resize", this.resizeCanvas);
    }

    private resizeCanvas = () => {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    private createRaindrops = () => {
        for (let i = 0; i < this.numberOfDrops; i++) {
            this.raindrops.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                speed: Math.random() * 5 + 2,
                length: Math.random() * 15 + 5,
            });
        }
    }

    private animate = () => {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.strokeStyle = "rgba(174, 194, 224, 0.5)";
        this.ctx.lineWidth = 1;
        this.ctx.lineCap = "round";
        
        for (const drop of this.raindrops) {
            this.ctx.beginPath();
            this.ctx.moveTo(drop.x, drop.y);
            this.ctx.lineTo(drop.x, drop.y + drop.length);
            this.ctx.stroke();

            drop.y += drop.speed;

            if (drop.y > this.canvas.height) {
                drop.y = -drop.length;
                drop.x = Math.random() * this.canvas.width;
            }
        }

        this.animationFrameId = requestAnimationFrame(this.animate);
    }
}