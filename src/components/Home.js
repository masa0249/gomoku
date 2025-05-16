import React from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <h1>五目並べ</h1>
      <p>モードを選択してください</p>
      <button onClick={() => navigate("/cpu")}>一人用（CPU戦）</button>
      <button onClick={() => navigate("/game")}>二人用（対人戦）</button>

      <div className="rules">
        <h2>ルール説明</h2>
        <p>
          プレイヤーは交互に「X」または「O」を1マスずつ置きます。<br />
          先に縦・横・斜めのいずれかに5つ並べた方が勝ちです。<br />
          15×15のマス目で対戦します。
        </p>
      </div>
    </div>
  );
};

export default Home;
