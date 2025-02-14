import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import InputPage from "./InputPage";
import AllResultsPage from "./AllResultsPage";
import PlayerResultsPage from "./PlayerResultsPage";
import DailyResultsPage from "./DailyResultsPage";  // 追加したページのインポート
import './styles.css'; // CSSをインポート

function App() {
    return (
        <Router>
            {/* ナビゲーションバー */}
            <div className="navbar">
                <nav>
                    <ul>
                        <li><Link to="/">入力ページ</Link></li>
                        <li><Link to="/all-results">全体成績</Link></li>
                        <li><Link to="/player">個人成績</Link></li>
                        <li><Link to="/daily-results">日別成績</Link></li> {/* 新しいリンク追加 */}
                    </ul>
                </nav>
            </div>

            {/* ルート定義 */}
            <Routes>
                <Route path="/" element={<InputPage />} />
                <Route path="/all-results" element={<AllResultsPage />} />
                <Route path="/player" element={<PlayerResultsPage />} />
                <Route path="/player/:playerName" element={<PlayerResultsPage />} /> {/* 個人ページのパラメータ追加 */}
                <Route path="/daily-results" element={<DailyResultsPage />} /> {/* 日別成績ページ */}
            </Routes>
        </Router>
    );
}

export default App;
