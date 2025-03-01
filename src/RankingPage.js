import React, { useState, useEffect } from "react";
import "./styles.css";
import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";

function RankingPage() {
    const [rankings, setRankings] = useState({ totalScore: [], bestScore: [], fourthAvoidance: [] });

    useEffect(() => {
        async function fetchRecords() {
            try {
                const querySnapshot = await getDocs(collection(db, "games"));
                const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                const stats = {};

                data.forEach(record => {
                    if (!record.players || !record.scores || !record.rankings) return; // データが存在しない場合のガード処理
                    
                    record.players.forEach(player => {
                        if (!stats[player]) {
                            stats[player] = { totalScore: 0, bestScore: -Infinity, fourthCount: 0, games: 0 };
                        }

                        const score = record.scores[player] || 0;
                        stats[player].totalScore += score;
                        stats[player].bestScore = Math.max(stats[player].bestScore, score);
                        stats[player].games += 1;

                        if (record.rankings[player] === 4) {
                            stats[player].fourthCount += 1;
                        }
                    });
                });

                const totalScoreRanking = Object.entries(stats)
                    .sort((a, b) => b[1].totalScore - a[1].totalScore)
                    .map(([player, data], index) => ({ rank: index + 1, player, score: data.totalScore }));

                const bestScoreRanking = Object.entries(stats)
                    .sort((a, b) => b[1].bestScore - a[1].bestScore)
                    .map(([player, data], index) => ({ rank: index + 1, player, score: data.bestScore }));

                const fourthAvoidanceRanking = Object.entries(stats)
                    .map(([player, data]) => ({ player, rate: 1 - (data.fourthCount / data.games) }))
                    .sort((a, b) => b.rate - a.rate)
                    .map((entry, index) => ({ rank: index + 1, ...entry }));

                setRankings({ totalScore: totalScoreRanking, bestScore: bestScoreRanking, fourthAvoidance: fourthAvoidanceRanking });
            } catch (error) {
                console.error("Error fetching records:", error);
            }
        }

        fetchRecords();
    }, []);

    return (
        <div className="ranking-page">
            <h2>ランキング</h2>
            
            <h3>累計スコアランキング</h3>
            <table>
                <thead>
                    <tr><th>順位</th><th>プレイヤー</th><th>累計スコア</th></tr>
                </thead>
                <tbody>
                    {rankings.totalScore.map(({ rank, player, score }) => (
                        <tr key={player}><td>{rank}</td><td>{player}</td><td>{score}</td></tr>
                    ))}
                </tbody>
            </table>

            <h3>最高スコアランキング</h3>
            <table>
                <thead>
                    <tr><th>順位</th><th>プレイヤー</th><th>最高スコア</th></tr>
                </thead>
                <tbody>
                    {rankings.bestScore.map(({ rank, player, score }) => (
                        <tr key={player}><td>{rank}</td><td>{player}</td><td>{score}</td></tr>
                    ))}
                </tbody>
            </table>

            <h3>4着回避率ランキング</h3>
            <table>
                <thead>
                    <tr><th>順位</th><th>プレイヤー</th><th>4着回避率</th></tr>
                </thead>
                <tbody>
                    {rankings.fourthAvoidance.map(({ rank, player, rate }) => (
                        <tr key={player}><td>{rank}</td><td>{player}</td><td>{(rate * 100).toFixed(2)}%</td></tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default RankingPage;
