import React, { useState, useEffect, useCallback } from "react";
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
  const [difficulty, setDifficulty] = useState("normal");
  const [history, setHistory] = useState(() => {
    const savedState = localStorage.getItem("gomokuStateSingle");
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        if (Array.isArray(parsed.history) && parsed.history.length > 0) {
          return parsed.history;
        }
      } catch (err) {
        console.error("Failed to parse saved history:", err);
      }
    }
    return [Array(BOARD_SIZE * BOARD_SIZE).fill(null)];
  });
  
  const [xIsNext, setXIsNext] = useState(() => {
    const savedState = localStorage.getItem("gomokuStateSingle");
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        return parsed.xIsNext ?? true;
      } catch (err) {}
    }
    return true;
  });
  
  const [userMoves, setUserMoves] = useState(() => {
    const savedState = localStorage.getItem("gomokuStateSingle");
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        return parsed.userMoves || [];
      } catch (err) {}
    }
    return [];
  });
  
  const [aiMoves, setAiMoves] = useState(() => {
    const savedState = localStorage.getItem("gomokuStateSingle");
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        return parsed.aiMoves || [];
      } catch (err) {}
    }
    return [];
  });
  const currentSquares = history[history.length - 1];

  const handleClick = useCallback((i) => {
    const current = history[history.length - 1];
    if (calculateWinner(current) || current[i]) return;
  
    const nextSquares = current.slice();
    nextSquares[i] = xIsNext ? "X" : "O";
  
    setHistory([...history, nextSquares]);
    setXIsNext(!xIsNext);
    if (xIsNext) {
      setUserMoves([...userMoves, i]);
    } else {
      setAiMoves([...aiMoves, i]);
    }
  }, [history, xIsNext, userMoves, aiMoves]);

  function handleReset() {
    setHistory([Array(BOARD_SIZE * BOARD_SIZE).fill(null)]);
    setXIsNext(true);
    setUserMoves([]);
    setAiMoves([]);
    localStorage.removeItem("gomokuStateSingle");
  }

  function handleUndo() {
    if (history.length > 2) {
      setHistory(prev => prev.slice(0, prev.length - 2));
      setUserMoves(prev => prev.slice(0, -1));
      setAiMoves(prev => prev.slice(0, -1));
      setXIsNext(true); 
      const state = {
        history: history,
        xIsNext: xIsNext,
        userMoves: userMoves,
        aiMoves: aiMoves,
      };
      localStorage.setItem("gomokuStateSingle", JSON.stringify(state));
    }
  }

  const winner = calculateWinner(currentSquares);
  let status;
  if (winner) {
    if (winner === "X") {
      status = <span style={{ color: "red" }}>You Win!</span>;
    } else if (winner === "O") {
      status = <span style={{ color: "blue" }}>You Lose</span>;
    }
  } else {
    status = <span>Next player: {xIsNext ? "X" : "O"}</span>;
  }
  const statusClass = winner ? "status status-large" : "status";

  useEffect(() => {
    if (!xIsNext && !winner) {
      const timeout = setTimeout(() => {
        const aiMove = findBestMove(currentSquares, "O", userMoves, aiMoves, difficulty);
        if (aiMove !== null) handleClick(aiMove);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [xIsNext, winner, currentSquares, handleClick, userMoves, aiMoves, difficulty]);

  useEffect(() => {
    const state = {
      history,
      xIsNext,
      userMoves,
      aiMoves,
    };
    localStorage.setItem("gomokuStateSingle", JSON.stringify(state));
  }, [history, xIsNext, userMoves, aiMoves]);

  return (
    <div className="app-container">
      <div className="difficulty-selector">
        <label>CPU難易度: </label>
        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
          <option value="easy">弱い</option>
          <option value="normal">普通</option>
          <option value="hard">強い</option>
        </select>
      </div>
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


function findBestMove(squares, player, userMoves, aiMoves, difficulty = "normal") {
  const opponent = player === "X" ? "O" : "X";

  const winMove = findThreatMove(squares, player, 4);
  if (winMove !== null) return winMove;
  const blockMove = findThreatMove(squares, opponent, 4);
  if (blockMove !== null) return blockMove;
  if (difficulty !== "easy") {
    const win3 = findThreatMove(squares, player, 3);
    if (win3 !== null) return win3;
    const block3 = findThreatMove(squares, opponent, 3);
    if (block3 !== null) return block3;
  }

  const availableMoves = getCandidateMoves(squares, aiMoves, userMoves[userMoves.length - 1]);
  if (availableMoves.length === 0) return null;

  let bestMove = null;
  let bestScore = -Infinity;
  let simulations = 0;
  let maxSteps = 0;

  if (difficulty === "easy") {
    simulations = 10;
    maxSteps = 1;
  } else if (difficulty === "normal") {
    simulations = 50;
    maxSteps = 3;
  } else if (difficulty === "hard") {
    simulations = 200;
    maxSteps = 5;
  }

  for (let move of availableMoves) {
    let totalScore = 0;
    for (let i = 0; i < simulations; i++) {
      const score = simulateGameLimitedSteps(squares.slice(), move, player, maxSteps, userMoves.slice(), aiMoves.slice());
      totalScore += score;
    }
    if (totalScore > bestScore) {
      bestScore = totalScore;
      bestMove = move;
    }
  }
  return bestMove;
}


function simulateGameLimitedSteps(squares, firstMove, player, maxSteps, userMoves, aiMoves) {
  const opponent = player === "X" ? "O" : "X";
  squares[firstMove] = player;
  aiMoves.push(firstMove);

  let currentPlayer = opponent;
  let steps = 1;

  let opponentLastMove = firstMove;

  while (steps < maxSteps) {

    let candidates;
    let move;

    if (currentPlayer === player) {
      candidates = getCandidateMoves(squares, aiMoves, opponentLastMove);
      if (candidates.length === 0) break;
      move = candidates[Math.floor(Math.random() * candidates.length)];
      squares[move] = currentPlayer;
      aiMoves.push(move);
    } else {
      candidates = getCandidateMoves(squares, userMoves, opponentLastMove);
      if (candidates.length === 0) break;
      move = candidates[Math.floor(Math.random() * candidates.length)];
      squares[move] = currentPlayer;  
      userMoves.push(move);
    }
    
    opponentLastMove = move;
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    steps++;
  }

  const winner = calculateWinner(squares);
  let score = 0;
  if (winner === player) return 100;
  else if (winner === opponent) return -100;
  else {
    if (findThreatMove(squares, player, 4) !== null) {
      score += 50;
    } 
    if (findThreatMove(squares, opponent, 4) !== null) {
      score -= 50;
    }
    if (findThreatMove(squares, player, 3) !== null) {
      score += 30;
    }
    if (findThreatMove(squares, opponent, 3) !== null) {
      score -= 30;
    }
  }
  return score;
}


function getCandidateMoves(squares, myMoves, opponentLastMove) {
  const candidateSet = new Set();
  const directions = [-1, 0, 1];

  const addNeighbors = (idx) => {
    const row = Math.floor(idx / BOARD_SIZE);
    const col = idx % BOARD_SIZE;

    for (const dr of directions) {
      for (const dc of directions) {
        if (dr === 0 && dc === 0) continue;

        const nr = row + dr;
        const nc = col + dc;
        const ni = nr * BOARD_SIZE + nc;

        if (
          nr >= 0 && nr < BOARD_SIZE &&
          nc >= 0 && nc < BOARD_SIZE &&
          squares[ni] === null
        ) {
          candidateSet.add(ni);
        }
      }
    }
  };

  for (const move of myMoves) {
    addNeighbors(move);
  }

  if (opponentLastMove !== null && opponentLastMove !== undefined) {
    addNeighbors(opponentLastMove);
  }

  return Array.from(candidateSet);
}


function findThreatMove(squares, targetPlayer, count) {
  const directions = [
    [1, 0], 
    [0, 1], 
    [1, 1], 
    [1, -1] 
  ];

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      for (const [dr, dc] of directions) {
        let line = [];
        for (let i = 0; i < 5; i++) {
          const nr = r + dr * i;
          const nc = c + dc * i;
          if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE) break;
          line.push(nr * BOARD_SIZE + nc);
        }

        if (line.length !== 5) continue;

        const values = line.map((i) => squares[i]);
        const countTarget = values.filter((v) => v === targetPlayer).length;
        const countNull = values.filter((v) => v === null).length;

        if (countTarget === count && countNull === 5 - count) {
          if (count === 4) {
            const idx = line.find((i) => squares[i] === null);
            return idx;
          } else {
            const nullLineIndexes = line.map((i, idx) => squares[i] === null ? idx : -1).filter(idx => idx !== -1);
            if (nullLineIndexes.length === 2) {
              const line1 = nullLineIndexes[0];
              const line2 = nullLineIndexes[1];
              if (Math.abs(line2 - line1) !== 1) {
                return Math.abs(2 - line1) < Math.abs(2 - line2) ? line[line1] : line[line2];
              }
              
            }
          }
        }
      }
    }
  }
  return null;
}