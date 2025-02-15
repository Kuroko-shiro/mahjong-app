import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";

function DailyResultsPage() {
    const [selectedDate, setSelectedDate] = useState(""); // 日付の選択
    const [dailyResults, setDailyResults] = useState([]); // 選択された日の成績
    const [totalStats, setTotalStats] = useState({}); // 各プレイヤーの累積成績
    const [totalRiichi, setTotalRiichi] = useState({}); // 各プレイヤーの累計リーチ回数
    const [totalHoujuu, setTotalHoujuu] = useState({}); // 各プレイヤーの累計放銃回数

    // 日付選択時に結果を取得
    const handleDateChange = async (event) => {
        const date = event.target.value;
        setSelectedDate(date);

        if (date) {
            const querySnapshot = await getDocs(collection(db, "games"));
            const data = querySnapshot.docs.map(doc => doc.data());
            
            const resultsForDate = data.filter(record => record.date === date);
            setDailyResults(resultsForDate);

            // プレイヤーごとの成績を計算
            const playerStats = {};
            const riichiStats = {};
            const houjuuStats = {};

            resultsForDate.forEach(record => {
                record.players.forEach(player => {
                    if (!playerStats[player]) {
                        playerStats[player] = { score: 0, count: 0 };
                        riichiStats[player] = 0;
                        houjuuStats[player] = 0;
                    }
                    playerStats[player].score += record.scores[player] || 0;
                    playerStats[player].count += 1;
                    riichiStats[player] += record.riichi_count[player] || 0;
                    houjuuStats[player] += record.houjuu_count[player] || 0;
                });
            });

            setTotalStats(playerStats);
            setTotalRiichi(riichiStats);
            setTotalHoujuu(houjuuStats);
        } else {
            setDailyResults([]);
            setTotalStats({});
            setTotalRiichi({});
            setTotalHoujuu({});
        }
    };

    return (
        <div className="daily-results-page">
            <h2>日にちを選択して、その日の成績を見る</h2>
            <input 
                type="date" 
                value={selectedDate} 
                onChange={handleDateChange} 
            />
            {selectedDate && dailyResults.length > 0 ? (
                <div>
                    <h3>{selectedDate} の成績</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>対戦回数</th>
                                {Object.keys(totalStats).map((player, index) => (
                                    <th key={index}>{player}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {/* 各対局のスコアを表示 */}
                            {Array.from({ length: dailyResults.length }).map((_, rowIndex) => (
                                <tr key={rowIndex}>
                                    <td>{rowIndex + 1}</td>
                                    {Object.keys(totalStats).map((player, colIndex) => {
                                        const score = dailyResults[rowIndex]?.scores[player] || 0;
                                        return <td key={colIndex}>{score}</td>;
                                    })}
                                </tr>
                            ))}
                            
                            {/* 🔹 各プレイヤーの累計スコア行 */}
                            <tr style={{ fontWeight: "bold", backgroundColor: "#f0f0f0" }}>
                                <td>累計スコア</td>
                                {Object.keys(totalStats).map((player, index) => (
                                    <td key={index}>{totalStats[player].score}</td>
                                ))}
                            </tr>

                            {/* 🔹 各プレイヤーの累計リーチ回数行 */}
                            <tr style={{ fontWeight: "bold", backgroundColor: "#e0e0e0" }}>
                                <td>累計リーチ</td>
                                {Object.keys(totalRiichi).map((player, index) => (
                                    <td key={index}>{totalRiichi[player]}</td>
                                ))}
                            </tr>

                            {/* 🔹 各プレイヤーの累計放銃回数行 */}
                            <tr style={{ fontWeight: "bold", backgroundColor: "#e0e0e0" }}>
                                <td>累計放銃</td>
                                {Object.keys(totalHoujuu).map((player, index) => (
                                    <td key={index}>{totalHoujuu[player]}</td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            ) : (
                selectedDate && <p>この日にちはデータがありません。</p>
            )}
        </div>
    );
}

export default DailyResultsPage;
