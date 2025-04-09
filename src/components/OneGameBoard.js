import React, { useState } from 'react';

const BOARD_SIZE = 15; // TwoGameBoard.js と同じボードサイズ

const OneGameBoard = () => {
    const [board, setBoard] = useState(Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null)));
    const [isPlayerTurn, setIsPlayerTurn] = useState(true);

    const checkWinner = (board) => {
        // 勝利条件をチェックするロジックをここに実装
        return null;
    };

    const handlePlayerMove = (row, col) => {
        if (!isPlayerTurn || board[row][col] !== null) return;

        const newBoard = board.map((r, i) => r.map((cell, j) => (i === row && j === col ? 'X' : cell)));
        setBoard(newBoard);
        setIsPlayerTurn(false);

        if (!checkWinner(newBoard)) {
            setTimeout(() => handleCPUMove(newBoard), 500); // CPUの手を少し遅らせる
        }
    };

    const handleCPUMove = (currentBoard) => {
        // CPUの手を決定するロジック（ランダムな空きマスを選択）
        const emptyCells = [];
        currentBoard.forEach((row, i) =>
            row.forEach((cell, j) => {
                if (cell === null) emptyCells.push([i, j]);
            })
        );

        if (emptyCells.length === 0) return;

        const [cpuRow, cpuCol] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const newBoard = currentBoard.map((r, i) =>
            r.map((cell, j) => (i === cpuRow && j === cpuCol ? 'O' : cell))
        );

        setBoard(newBoard);
        setIsPlayerTurn(true);
        checkWinner(newBoard);
    };

    return (
        <div>
            <h1>五目並べ</h1>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${BOARD_SIZE}, 30px)` }}>
                {board.map((row, rowIndex) =>
                    row.map((cell, colIndex) => (
                        <div
                            key={`${rowIndex}-${colIndex}`}
                            onClick={() => handlePlayerMove(rowIndex, colIndex)}
                            style={{
                                width: 30,
                                height: 30,
                                border: '1px solid black',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: cell === null && isPlayerTurn ? 'pointer' : 'default',
                                backgroundColor: cell === 'X' ? '#d1e7dd' : cell === 'O' ? '#f8d7da' : 'white',
                            }}
                        >
                            {cell}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default OneGameBoard;