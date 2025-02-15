import React, { useState } from "react";
import './styles.css'; 
import { db } from "./firebase";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";

function InputPage() {
    const [date, setDate] = useState("");
    const [players, setPlayers] = useState(["", "", "", ""]);
    const [scores, setScores] = useState(["", "", "", ""]);
    const [riichiCounts, setRiichiCounts] = useState(["", "", "", ""]);
    const [houjuuCounts, setHoujuuCounts] = useState(["", "", "", ""]);

    // 🔹 その日の対局回数を取得
    const getGameCount = async (formattedDate) => {
        const querySnapshot = await getDocs(collection(db, "games"));
        const existingGames = querySnapshot.docs
            .map(doc => doc.id)
            .filter(id => id.startsWith(formattedDate)); // 同じ日付のゲームをカウント

        return existingGames.length + 1;  // 既存のゲーム数 + 1
    };

    // 🔹 フォーム送信時の処理
    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!date) {
            alert("日付を選択してください");
            return;
        }

        // 🔹 その日の対局回数を取得し、ドキュメントIDを決定
        const gameNumber = await getGameCount(date);
        const documentId = `${date}-${gameNumber}`; // 例: 2025-02-17-1

        const scoreData = {};
        const riichiData = {};
        const houjuuData = {};

        for (let i = 0; i < 4; i++) {
            scoreData[players[i]] = parseInt(scores[i]) || 0;
            riichiData[players[i]] = parseInt(riichiCounts[i]) || 0;
            houjuuData[players[i]] = parseInt(houjuuCounts[i]) || 0;
        }

        try {
            await setDoc(doc(db, "games", documentId), { // 🔹 `games` 内に `YYYY-MM-DD-回数` のIDで保存
                date,
                players,
                scores: scoreData,
                riichi_count: riichiData,
                houjuu_count: houjuuData,
                gameNumber: gameNumber,
                timestamp: new Date()
            });
            alert(`成績を記録しました！ (${documentId})`);
        } catch (error) {
            console.error("データ保存エラー:", error);
        }
    };

    return (
        <div className="input-page">
            <h2>対局結果入力</h2>
            <form onSubmit={handleSubmit}>
                <label>日付: 
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
                </label><br />
                {players.map((player, index) => (
                    <div key={index}>
                        <label>プレイヤー{index + 1}: 
                            <input type="text" value={player} onChange={e => {
                                const newPlayers = [...players];
                                newPlayers[index] = e.target.value;
                                setPlayers(newPlayers);
                            }} required />
                        </label>
                        <label>スコア: 
                            <input type="number" value={scores[index]} onChange={e => {
                                const newScores = [...scores];
                                newScores[index] = e.target.value;
                                setScores(newScores);
                            }} required />
                        </label>
                        <label>リーチ回数: 
                            <input type="number" value={riichiCounts[index]} onChange={e => {
                                const newRiichiCounts = [...riichiCounts];
                                newRiichiCounts[index] = e.target.value;
                                setRiichiCounts(newRiichiCounts);
                            }} required />
                        </label>
                        <label>放銃回数: 
                            <input type="number" value={houjuuCounts[index]} onChange={e => {
                                const newHoujuuCounts = [...houjuuCounts];
                                newHoujuuCounts[index] = e.target.value;
                                setHoujuuCounts(newHoujuuCounts);
                            }} required />
                        </label><br />
                    </div>
                ))}
                <button type="submit">記録する</button>
            </form>
        </div>
    );
}

export default InputPage;
