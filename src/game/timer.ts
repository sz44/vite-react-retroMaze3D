export class Timer {
    private timerID: number | undefined;
    private startTime: number;
    private isRunning: boolean;
    public time: number;
    constructor() {
        this.startTime = 0;
        this.timerID = undefined;
        this.time = 0;
        this.isRunning = false;
    }

    public start = () => {
        if (this.isRunning) {
            return;
        }
        this.startTime = Date.now();
        this.timerID = setInterval(() => {
            const timeInSeconds = Math.round((Date.now() - this.startTime) / 1000);
            this.time = timeInSeconds;
            // timeDisplay.innerHTML = timeInSeconds;
        }, 100);
        this.isRunning = true;
    };

    public stop = () => {
        if (this.timerID === undefined) {
            return;
        }
        clearInterval(this.timerID);
        this.startTime = 0;
        this.timerID = undefined;
        this.time = 0;
        this.isRunning = false;
    };
}