import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const BOARD_SIZE = 15; 

function Square({ value, onSquareClick }) {
  const getColor = (val) => {
    if (val === "X") return "#add8e6"; 
    if (val === "O") return "#f08080"; 
    return "white"; 
  };
  return (
    <button className="square" onClick={onSquareClick} style={{ backgroundColor: getColor(value) }}>
      {value}
    </button>
  );
}

function Board() {
  const navigate = useNavigate();
  const [xIsNext, setXIsNext] = useState(true);
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem("gomokuStateMulti");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.history && parsed.xIsNext !== undefined) {
          setXIsNext(parsed.xIsNext);
          return parsed.history;
        }
      } catch (e) {
        console.error("Failed to parse saved game state:", e);
      }
    }
    return [Array(BOARD_SIZE * BOARD_SIZE).fill(null)];
  });
  const currentSquares = history[history.length - 1];

  function handleClick(i) {
    if (calculateWinner(currentSquares) || currentSquares[i]) {
      return;
    }
    const nextSquares = currentSquares.slice();
    nextSquares[i] = xIsNext ? "X" : "O";

    setHistory((prevHistory) => [...prevHistory, nextSquares]);
    setXIsNext(!xIsNext);
  }

  function handleReset() {
    setHistory([Array(BOARD_SIZE * BOARD_SIZE).fill(null)]);
    setXIsNext(true);
    localStorage.removeItem("gomokuStateMulti");
  }

  function handleUndo() {
    if (history.length > 1) {
      setHistory((prevHistory) => prevHistory.slice(0, prevHistory.length - 1));
      setXIsNext(!xIsNext);
    }
  }

  const winner = calculateWinner(currentSquares);
  let status;
  if (winner) {
    status = <span style={{ color: "red" }}>Winner: {winner} !</span>;
  } else {
    status = <span>Next player: {xIsNext ? "X" : "O"}</span>;
  }
  const statusClass = winner ? "status status-large" : "status";

  useEffect(() => {
    const data = JSON.stringify({ history, xIsNext });
    localStorage.setItem("gomokuStateMulti", data);
  }, [history, xIsNext]);

  return (
    <div className="app-container">
      <div className={statusClass}>{status}</div>
      <div className="controls">
        <button className="control-button" onClick={handleUndo}>Undo</button>
        <button className="control-button" onClick={handleReset}>Reset</button>
        <button className="control-button" onClick={() => navigate("/")}>TOP</button>
      </div>
      <div className="board">
        {Array(BOARD_SIZE)
          .fill(null)
          .map((_, row) => (
            <div key={row} className="board-row">
              {Array(BOARD_SIZE)
                .fill(null)
                .map((_, col) => {
                  const index = row * BOARD_SIZE + col;
                  return (
                    <Square key={index} value={currentSquares[index]} onSquareClick={() => handleClick(index)} />
                  );
                })}
            </div>
          ))}
      </div>
    </div>
  );
}

function calculateWinner(squares) {
  const directions = [
    [1, 0], 
    [0, 1], 
    [1, 1], 
    [1, -1],
  ];

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const index = r * BOARD_SIZE + c;
      if (!squares[index]) continue;

      for (const [dr, dc] of directions) {
        let line = [index];
        for (let i = 1; i < 5; i++) {
          const nr = r + dr * i, nc = c + dc * i;
          if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE) break;
          const nextIndex = nr * BOARD_SIZE + nc;
          if (squares[nextIndex] !== squares[index]) break;
          line.push(nextIndex);
        }
        if (line.length === 5) return squares[index];
      }
    }
  }
  return null;
}

export default function App() {
  return <Board />;
}
