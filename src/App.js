import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import OneGameBoard from "./components/OneGameBoard";
import TwoGameBoard from "./components/TwoGameBoard";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/onegame" element={<OneGameBoard />} />
      <Route path="/twogame" element={<TwoGameBoard />} />
    </Routes>
  );
};

export default App;
