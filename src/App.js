import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import CpuBoard from "./components/CpuBoard";
import GameBoard from "./components/GameBoard";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/cpu" element={<CpuBoard />} />
      <Route path="/game" element={<GameBoard />} />
    </Routes>
  );
};

export default App;
