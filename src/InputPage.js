import React, { useState } from "react";
import './styles.css'; 
import { db } from "./firebase";
import { collection, addDoc } from "firebase/firestore";

function InputPage() {
    const [date, setDate] = useState("");
    const [players, setPlayers] = useState(["", "", "", ""]);
    const [scores, setScores] = useState(["", "", "", ""]);
    const [riichiCounts, setRiichiCounts] = useState(["", "", "", ""]);
    const [houjuuCounts, setHoujuuCounts] = useState(["", "", "", ""]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const scoreData = {};
        const riichiData = {};
        const houjuuData = {};

        for (let i = 0; i < 4; i++) {
            scoreData[players[i]] = parseInt(scores[i]);
            riichiData[players[i]] = parseInt(riichiCounts[i]);
            houjuuData[players[i]] = parseInt(houjuuCounts[i]);
        }

        try {
            await addDoc(collection(db, "games"), {
                date,
                players,
                scores: scoreData,
                riichi_count: riichiData,
                houjuu_count: houjuuData
            });
            alert("成績を記録しました！");
        } catch (error) {
            console.error("エラー:", error);
        }
    };

    return (
        <div className="input-page">
            <h2>対局結果入力</h2>
            <form onSubmit={handleSubmit}>
                <label>日付: <input type="date" value={date} onChange={e => setDate(e.target.value)} required /></label><br />
                {players.map((player, index) => (
                    <div key={index}>
                        <label>プレイヤー{index + 1}: <input type="text" value={player} onChange={e => {
                            const newPlayers = [...players];
                            newPlayers[index] = e.target.value;
                            setPlayers(newPlayers);
                        }} required /></label>
                        <label>スコア: <input type="number" value={scores[index]} onChange={e => {
                            const newScores = [...scores];
                            newScores[index] = e.target.value;
                            setScores(newScores);
                        }} required /></label>
                        <label>リーチ回数: <input type="number" value={riichiCounts[index]} onChange={e => {
                            const newRiichiCounts = [...riichiCounts];
                            newRiichiCounts[index] = e.target.value;
                            setRiichiCounts(newRiichiCounts);
                        }} required /></label>
                        <label>放銃回数: <input type="number" value={houjuuCounts[index]} onChange={e => {
                            const newHoujuuCounts = [...houjuuCounts];
                            newHoujuuCounts[index] = e.target.value;
                            setHoujuuCounts(newHoujuuCounts);
                        }} required /></label><br />
                    </div>
                ))}
                <button type="submit">記録する</button>
            </form>
        </div>
    );
}

export default InputPage;
