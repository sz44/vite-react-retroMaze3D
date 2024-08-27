import { useEffect, useRef, useState } from "react";
import { RetroMaze3D } from "./retroMaze3D";

type GameProps = {
	onScoreUpdate: (playerName:string, playerScore: number) => void;
};

function Game({ onScoreUpdate }: GameProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const gameRef = useRef<RetroMaze3D | null>(null);
	const [isStarted, setIsStarted] = useState(false);
	const [isGameOver, setIsGameOver] = useState(false);
	const [name, setName] = useState("");
	const [time, setTime] = useState(0);

	const onTimeUpdate = (newTime: number) => {
		setTime(newTime);
	};

	const onGameOver = () => {
		setIsGameOver(true);
	}

	const handleStartGame = () => {
		if (gameRef.current) {
			gameRef.current.start();
			setIsStarted(true);
			setIsGameOver(false);
		}
	};

	const handleNameSubmit = (e:React.FormEvent) => {
		e.preventDefault();
		if (name.trim() && time) {
			onScoreUpdate(name.trim(), time)
			setName("");
			setTime(0);
		}	
	}

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) {
			return;
		}
		gameRef.current = new RetroMaze3D(canvas, onGameOver, onTimeUpdate);
	}, []);

	return (
		<>
			<div>
				time: <span id="time">{time}</span>
			</div>
			{!isStarted && <button onClick={handleStartGame}>START</button>}
			<canvas ref={canvasRef} />
			{isGameOver && (
				<div>
					<form onSubmit={handleNameSubmit}>
						<input type="text" value={name} onChange={(e) => setName(e.target.value)} />
						<button>SUBMIT</button>
					</form>
					<button onClick={handleStartGame}>RESTART</button>
				</div>
			)}
		</>
	);
}

type ScoreType = [string, number][];

function App() {
	const [localScores, setLocalScores] = useState<ScoreType>([]);

	const handleScoreUpdate = (playerName: string, playerScore: number) => {
		setLocalScores(p => [...p,[playerName, playerScore] ])
		// setScore(newScore);
		// setIsGameOver(true);
	};

	return (
		<>
			<h1>RetroMaze3D</h1>
			<div>
				<p>Find the light to win!</p>
				<p>Controls: w,a,s,d,q,e</p>
			</div>
			<Game onScoreUpdate={handleScoreUpdate} />
			<h2>Scores:</h2>
			<ul>
				{localScores.map((n, i) => {
					return <li key={i}>{n}</li>;
				})}
			</ul>
		</>
	);
}

export default App;