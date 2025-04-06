import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Board from "./components/GameBoard";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/game" element={<Board />} />
    </Routes>
  );
};

export default App;
