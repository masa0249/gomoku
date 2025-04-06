import React from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <h1>五目並べ</h1>
      <p>モードを選択してください</p>
      <button onClick={() => alert("現在、一人用モードは準備中です")}>
        一人用（CPU対戦）
      </button>
      <button onClick={() => navigate("/game")}>二人用（対人戦）</button>
    </div>
  );
};

export default Home;
