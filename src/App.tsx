import { useEffect, useRef } from 'react'

type Raindrop = {
  x: number
  y: number
  speed: number
  length: number
}

function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const raindrops: Raindrop[] = [];
  const numberOfDrops = 100;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return

    const ctx = canvas.getContext("2d");
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createRaindrops = () => {
      for (let i = 0; i < numberOfDrops; i++) {
        raindrops.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          speed: Math.random() * 5 + 2,
          length: Math.random() * 15 + 5
        });
      }
    }

    const drawRain = () => {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      ctx.strokeStyle = 'rgba(174, 194, 224, 0.5)';
      ctx.lineWidth = 1;
      ctx.lineCap = 'round';

      for (const drop of raindrops) {
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x, drop.y + drop.length);
        ctx.stroke();

        drop.y += drop.speed;

        if (drop.y > canvas.height) {
          drop.y  = -drop.length;
          drop.x = Math.random() * canvas.width;
        } 
      }

      requestAnimationFrame(drawRain);
    };

    resizeCanvas();
    createRaindrops();
    drawRain();

    window.addEventListener('resize', resizeCanvas); 

    return () => {
      window.removeEventListener('resize', resizeCanvas)
    }
  }, []);

  return <canvas ref={canvasRef} style={{display:'block'}}/>;
}

function App() {
  return (
    <>
      <Game/>
    </>    
  )
}

export default App
