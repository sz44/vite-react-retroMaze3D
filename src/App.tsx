import { useEffect, useRef } from 'react'
import { RainAnimation } from './rainAnimation';
import { RetroMaze3D } from './retroMaze3D';

function Rain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return

    const rain = new RainAnimation(canvas);
    rain.start();

    return () => {
      rain.stop();
    }

  }, []);

  return <canvas ref={canvasRef} style={{display:'block'}}/>;
}

function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return
    }
    const game = new RetroMaze3D(canvas);
    game.start();
  }, []);

  return <canvas ref={canvasRef} />;
}

function App() {
  return (
    <>
      <Game/>
    </>    
  )
}

export default App
