import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";

function RecordList() {
    const [records, setRecords] = useState([]);
    const [playerStats, setPlayerStats] = useState({});  // プレイヤーごとの累積データ

    useEffect(() => {
        async function fetchRecords() {
            const querySnapshot = await getDocs(collection(db, "games"));
            const data = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setRecords(data);

            // プレイヤーごとの累積データを計算
            const stats = {};

            data.forEach(record => {
                record.players.forEach(player => {
                    if (!stats[player]) {
                        stats[player] = { score: 0, riichi: 0, houjuu: 0 };
                    }

                    stats[player].score += record.scores[player] || 0;
                    stats[player].riichi += record.riichi_count[player] || 0;
                    stats[player].houjuu += record.houjuu_count[player] || 0;
                });
            });

            setPlayerStats(stats);
        }

        fetchRecords();
    }, []);

    return (
        <div>
            <h2>成績一覧</h2>
            <table border="1">
                <thead>
                    <tr>
                        <th>プレイヤー</th>
                        <th>累積スコア</th>
                        <th>累積リーチ回数</th>
                        <th>累積放銃回数</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.keys(playerStats).map(player => (
                        <tr key={player}>
                            <td>{player}</td>
                            <td>{playerStats[player].score}</td>
                            <td>{playerStats[player].riichi}</td>
                            <td>{playerStats[player].houjuu}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default RecordList;
