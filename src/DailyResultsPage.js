import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";

function DailyResultsPage() {
    const [selectedDate, setSelectedDate] = useState(""); // 日付の選択
    const [dailyResults, setDailyResults] = useState([]); // 選択された日の成績
    const [totalStats, setTotalStats] = useState({}); // 累積成績

    // 日付選択時に結果を取得
    const handleDateChange = async (event) => {
        const date = event.target.value;
        setSelectedDate(date);

        if (date) {
            const querySnapshot = await getDocs(collection(db, "games"));
            const data = querySnapshot.docs.map(doc => doc.data());
            
            const resultsForDate = data.filter(record => record.date === date);
            setDailyResults(resultsForDate);

            // プレイヤーごとの累積成績計算
            const playerStats = {};
            resultsForDate.forEach(record => {
                record.players.forEach(player => {
                    if (!playerStats[player]) {
                        playerStats[player] = { score: 0, count: 0 }; // スコアと対戦回数を初期化
                    }
                    playerStats[player].score += record.scores[player] || 0;
                    playerStats[player].count += 1; // 対戦回数をカウント
                });
            });

            setTotalStats(playerStats);
        } else {
            setDailyResults([]);
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
                            {/* 日々の成績 */}
                            {Array.from({ length: dailyResults.length }).map((_, rowIndex) => (
                                <tr key={rowIndex}>
                                    <td>{rowIndex + 1}</td>
                                    {Object.keys(totalStats).map((player, colIndex) => {
                                        const score = dailyResults[rowIndex]?.scores[player] || 0;
                                        return <td key={colIndex}>{score}</td>;
                                    })}
                                </tr>
                            ))}
                            
                            {/* 累計スコア */}
                            <tr>
                                <td>累計</td>
                                {Object.keys(totalStats).map((player, index) => (
                                    <td key={index}>{totalStats[player].score}</td>
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
