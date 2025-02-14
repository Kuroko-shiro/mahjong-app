import React, { useState, useEffect } from "react";
import './styles.css'; 
import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";

function AllResultsPage() {
    const [playerStats, setPlayerStats] = useState({});

    useEffect(() => {
        async function fetchRecords() {
            const querySnapshot = await getDocs(collection(db, "games"));
            const data = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            const stats = {};
            data.forEach(record => {
                record.players.forEach(player => {
                    if (!stats[player]) {
                        stats[player] = { score: 0, riichi: 0, houjuu: 0, games: 0 };
                    }

                    stats[player].score += record.scores[player] || 0;
                    stats[player].riichi += record.riichi_count[player] || 0;
                    stats[player].houjuu += record.houjuu_count[player] || 0;
                    stats[player].games += 1; // 対局回数をカウント
                });
            });
            setPlayerStats(stats);
        }

        fetchRecords();
    }, []);

    return (
        <div className="all-results-page">
            <h2>全体成績</h2>
            <table>
                <thead>
                    <tr>
                        <th>プレイヤー</th>
                        <th>累積スコア</th>
                        <th>リーチ回数</th>
                        <th>放銃回数</th>
                        <th>対局回数</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.keys(playerStats).map(player => (
                        <tr key={player}>
                            <td>{player}</td>
                            <td>{playerStats[player].score}</td>
                            <td>{playerStats[player].riichi}</td>
                            <td>{playerStats[player].houjuu}</td>
                            <td>{playerStats[player].games}</td> {/* 対局回数を表示 */}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default AllResultsPage;
