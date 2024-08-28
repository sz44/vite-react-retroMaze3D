import { useEffect, useRef, useState } from "react";
import { RetroMaze3D } from "./game/retroMaze3D";

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
		<div>
			<div className="time">
				time: <span id="time">{time}</span>
			</div>
			{!isStarted && <button className="menu" onClick={handleStartGame}>START</button>}
			<canvas ref={canvasRef} />
			{isGameOver && (
				<div className="menu">
					<form onSubmit={handleNameSubmit}>
						<input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="enter name" />
						<button>SUBMIT</button>
					</form>
					<button onClick={handleStartGame}>RESTART</button>
				</div>
			)}
		</div>
	);
}

type ScoreType = [string, number][];

function App() {
	const [localScores, setLocalScores] = useState<ScoreType>([]);

	const handleScoreUpdate = (playerName: string, playerScore: number) => {
		setLocalScores(p => [...p,[playerName, playerScore] ])
	};

	return (
		<>
			<h1>RetroMaze3D</h1>
			<div>
				<p>Find the light to win!</p>
				<p>Controls: w,a,s,d,q,e</p>
			</div>
			<Game onScoreUpdate={handleScoreUpdate} />
			<h2>High Scores:</h2>
			<ul>
				{localScores.sort((a,b)=>a[1]-b[1]).map((n, i) => {
					return <li key={i}>{`${n[0]} ..... ${n[1]}`}</li>;
				})}
			</ul>
		</>
	);
}

export default App;