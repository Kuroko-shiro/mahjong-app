import React, { useState, useEffect } from "react";
import './styles.css'; 
import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function AllResultsPage() {
    const [playerStats, setPlayerStats] = useState({});
    const [cumulativeScores, setCumulativeScores] = useState([]);
    const [rankChartData, setRankChartData] = useState({ labels: [], datasets: [] });

    useEffect(() => {
        async function fetchRecords() {
            const querySnapshot = await getDocs(collection(db, "games"));
            const data = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
    
            data.sort((a, b) => new Date(a.date) - new Date(b.date));
    
            const stats = {};
            const cumulativeData = {};
            const allPlayers = new Set();
            const firstAppearance = {}; // 各プレイヤーの初登場日を記録
    
            // すべてのプレイヤーを記録
            data.forEach(record => {
                record.players.forEach(player => {
                    allPlayers.add(player);
                    if (!stats[player]) {
                        stats[player] = { score: 0, riichi: 0, houjuu: 0, games: 0 };
                    }
                    if (!firstAppearance[player]) {
                        firstAppearance[player] = record.date; // 初めてスコアが記録された日
                    }
                });
            });
    
            // 累積スコアの計算
            data.forEach(record => {
                const date = record.date;
                if (!cumulativeData[date]) cumulativeData[date] = {};
    
                allPlayers.forEach(player => {
                    // まだ登場していないプレイヤーは記録しない
                    if (new Date(date) < new Date(firstAppearance[player])) {
                        cumulativeData[date][player] = null; // グラフに表示しない
                    } else {
                        // 前回のスコアを引き継ぐ
                        cumulativeData[date][player] = cumulativeData[date][player] || (stats[player]?.score || 0);
                    }
                });
    
                record.players.forEach(player => {
                    stats[player].score += record.scores[player] || 0;
                    stats[player].riichi += record.riichi_count[player] || 0;
                    stats[player].houjuu += record.houjuu_count[player] || 0;
                    stats[player].games += 1;
    
                    cumulativeData[date][player] = stats[player].score;
                });
            });
    
            setPlayerStats(stats);
    
            // ✨ 全プレイヤーの順位を計算（初登場前は除外）
            const dates = Object.keys(cumulativeData).sort();
            const rankHistory = dates.map(date => {
                // その時点で初登場しているプレイヤーのみを対象
                const rankedPlayers = Array.from(allPlayers)
                    .filter(player => new Date(date) >= new Date(firstAppearance[player])) // 初登場日以降のみ
                    .map(player => ({
                        player,
                        score: cumulativeData[date][player] || 0, // スコアが無い場合は0
                        date
                    }));
    
                rankedPlayers.sort((a, b) => b.score - a.score);
    
                return rankedPlayers.map((player, index) => ({
                    player: player.player,
                    rank: index + 1,
                    date
                }));
            });
    
            setCumulativeScores(rankHistory);
    
            if (rankHistory.length === 0) return;
    
            // 🎨 グラフ用データの作成
            const playerNames = Array.from(allPlayers);
            const datasets = playerNames.map(player => {
                return {
                    label: player,
                    data: rankHistory.map(entry => {
                        // 初登場日より前は null（グラフに表示しない）
                        if (new Date(entry[0]?.date) < new Date(firstAppearance[player])) return null;
                        return entry.find(p => p.player === player)?.rank || null;
                    }),
                    fill: false,
                    borderColor: `hsl(${Math.random() * 360}, 70%, 50%)`,
                    tension: 0.1,
                };
            });
    
            setRankChartData({
                labels: dates,
                datasets,
            });
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
                            <td>{playerStats[player].games}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="chart-container">
                <h3>順位推移</h3>
                {rankChartData.labels.length > 0 && (
                    <Line data={rankChartData} options={{
                        scales: {
                            y: {
                                reverse: true,
                                beginAtZero: false,
                                ticks: {
                                    stepSize: 1,
                                    max: Object.keys(playerStats).length,
                                    min: 1
                                },
                                title: {
                                    display: true,
                                    text: '順位'
                                }
                            }
                        }
                    }} />
                )}
            </div>
        </div>
    );
}

export default AllResultsPage;
