import React, { useState, useEffect, useCallback } from "react";

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
  const [xIsNext, setXIsNext] = useState(true);
  const [history, setHistory] = useState([Array(BOARD_SIZE * BOARD_SIZE).fill(null)]);
  const currentSquares = history[history.length - 1];

  const handleClick = useCallback((i) => {
    setHistory((prevHistory) => {
      const current = prevHistory[prevHistory.length - 1];
      if (calculateWinner(current) || current[i]) return prevHistory;
  
      const nextSquares = current.slice();
      nextSquares[i] = xIsNext ? "X" : "O";
      setXIsNext(!xIsNext);
      return [...prevHistory, nextSquares];
    });
  }, [xIsNext]);

  function handleReset() {
    setHistory([Array(BOARD_SIZE * BOARD_SIZE).fill(null)]);
    setXIsNext(true);
  }

  function handleUndo() {
    if (history.length > 1) {
      setHistory((prevHistory) => prevHistory.slice(0, prevHistory.length - 1));
      setXIsNext(!xIsNext);
    }
  }
  

  const winner = calculateWinner(currentSquares);
  let status = winner ? `Winner: ${winner} !` : `Next player: ${xIsNext ? "X" : "O"}`;

  useEffect(() => {
    if (!xIsNext && !winner) {
      const timeout = setTimeout(() => {
        const aiMove = findBestMove(currentSquares, "O");
        if (aiMove !== null) handleClick(aiMove);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [xIsNext, winner, currentSquares, handleClick]);

  return (
    <div className="app-container">
      <div className="status">{status}</div>
      <div className="controls">
        <button className="control-button" onClick={handleUndo}>Undo</button>
        <button className="control-button" onClick={handleReset}>Reset</button>
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

// 簡易MCTS: ランダムに100回シミュレーションして最も勝率の高い手を選ぶ
function findBestMove(squares, player) {
  const opponent = player === "X" ? "O" : "X";

  // 1. 自分が勝てる手を探す
  const winMove = findThreatMove(squares, player, 4);
  if (winMove !== null) return winMove;
  const win3 = findThreatMove(squares, player, 3);
  if (win3 !== null) return win3;

  // 2. 相手が勝ちそうなら防ぐ
  const blockMove = findThreatMove(squares, opponent, 4);
  if (blockMove !== null) return blockMove;
  const block3 = findThreatMove(squares, opponent, 3);
  if (block3 !== null) return block3;

  // 3. シミュレーション（簡易MCTS）で選択
  const availableMoves = squares
    .map((val, idx) => (val === null ? idx : null))
    .filter((idx) => idx !== null);

  if (availableMoves.length === 0) return null;

  const simulations = 50; // 重すぎるなら数を調整
  let bestMove = null;
  let bestWinCount = -1;

  for (let move of availableMoves) {
    let winCount = 0;
    for (let i = 0; i < simulations; i++) {
      const result = simulateGame(squares.slice(), move, player);
      if (result === player) winCount++;
    }
    if (winCount > bestWinCount) {
      bestWinCount = winCount;
      bestMove = move;
    }
  }

  return bestMove;
}


  
function simulateGame(squares, firstMove, player) {
    const opponent = player === "X" ? "O" : "X";
    squares[firstMove] = player;
    let currentPlayer = opponent;

    while (true) {
        const winner = calculateWinner(squares);
        if (winner) return winner;
        const available = squares
        .map((v, i) => (v === null ? i : null))
        .filter((i) => i !== null);
        if (available.length === 0) return null;
        const randomMove =
        available[Math.floor(Math.random() * available.length)];
        squares[randomMove] = currentPlayer;
        currentPlayer = currentPlayer === "X" ? "O" : "X";
    }
}

function findThreatMove(squares, targetPlayer, count) {
  const directions = [
    [1, 0], // 横
    [0, 1], // 縦
    [1, 1], // 斜め
    [1, -1] // 逆斜め
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

        if (countTarget === count && countNull === 1) {
          const idx = line.find((i) => squares[i] === null);
          return idx;
        }
      }
    }
  }

  return null;
}


