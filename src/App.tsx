import { useEffect, useRef } from 'react'
import { RainAnimation } from './rainAnimation';

function Game() {
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

function App() {
  return (
    <>
      <Game/>
    </>    
  )
}

export default App
