import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";
import { useParams } from "react-router-dom";
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

// Chart.js の登録
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function PlayerResultsPage() {
    const { playerName: initialPlayerName } = useParams(); // プレイヤー名をURLパラメータから取得
    const [playerName, setPlayerName] = useState(initialPlayerName || ""); // setPlayerNameを定義
    const [playerData, setPlayerData] = useState([]);
    const [allPlayers, setAllPlayers] = useState([]);
    const [totalStats, setTotalStats] = useState({});
    const [rankHistory, setRankHistory] = useState([]); // 順位の履歴
    const [rankChartData, setRankChartData] = useState({}); // 順位推移グラフのデータ

    // プレイヤー名のリストを取得
    useEffect(() => {
        async function fetchPlayers() {
            const querySnapshot = await getDocs(collection(db, "games"));
            const data = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            const players = new Set();
            data.forEach(record => {
                record.players.forEach(player => {
                    players.add(player);
                });
            });

            setAllPlayers([...players]);
        }

        fetchPlayers();
    }, []);

    // 選択したプレイヤーの成績データを取得
    useEffect(() => {
        if (playerName) {
            async function fetchPlayerResults() {
                const querySnapshot = await getDocs(collection(db, "games"));
                const data = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                // プレイヤーごとの成績を取得
                const playerResults = data.filter(record => record.players.includes(playerName))
                    .map(record => ({
                        date: record.date,
                        score: record.scores[playerName],
                        riichi: record.riichi_count[playerName],  // リーチ回数
                        houjuu: record.houjuu_count[playerName],  // 放銃回数
                        players: record.players,
                        scores: record.scores,
                    }));

                // 半荘ごとの順位計算
                const halfGameRankings = playerResults.map((record) => {
                    const playerScores = record.players.map(player => ({
                        player,
                        score: record.scores[player] || 0,
                    }));

                    // スコア順で並べ替え
                    playerScores.sort((a, b) => b.score - a.score);

                    let currentRank = 1;
                    const rankedPlayers = playerScores.map((player, index) => {
                        if (index > 0 && player.score === playerScores[index - 1].score) {
                            return { ...player, rank: currentRank };
                        } else {
                            currentRank = index + 1;
                            return { ...player, rank: currentRank };
                        }
                    });

                    return rankedPlayers;
                });

                // 半荘ごとの順位履歴
                setRankHistory(halfGameRankings);

                // プレイヤーごとの累積成績
                const cumulativeStats = { score: 0, riichi: 0, houjuu: 0 , firstPlace:0, nonFourthPlace:0, totalGames: playerResults.length};
                playerResults.forEach((result,index) => {
                    cumulativeStats.score += result.score;
                    cumulativeStats.riichi += result.riichi;
                    cumulativeStats.houjuu += result.houjuu;
                    const playerRank = halfGameRankings[index]?.find(player => player.player === playerName)?.rank;
                    if (playerRank === 1) cumulativeStats.firstPlace += 1;
                    if (playerRank !== 4) cumulativeStats.nonFourthPlace += 1;
                });

                setPlayerData(playerResults);
                setTotalStats(cumulativeStats);

                // 順位推移のグラフデータを作成
                const rankData = playerResults.map((record, index) => {
                    const playerRank = halfGameRankings[index]?.find(player => player.player === playerName)?.rank || 0;
                    return playerRank;
                });

                setRankChartData({
                    labels: playerResults.map(result => result.date), // 日付をラベルとして使用
                    datasets: [
                        {
                            label: `${playerName}の順位推移`,
                            data: rankData,
                            fill: false,
                            borderColor: 'rgba(75,192,192,1)',
                            tension: 0.1,
                        }
                    ]
                });
            }

            fetchPlayerResults();
        }
    }, [playerName]);

    return (
        <div className="player-results-page">
            <h2>{playerName} の成績</h2>

            {/* プレイヤー選択 */}
            <select onChange={(e) => setPlayerName(e.target.value)} value={playerName}>
                <option value="">プレイヤーを選択</option>
                {allPlayers.map(player => (
                    <option key={player} value={player}>{player}</option>
                ))}
            </select>

            {playerName && playerData.length > 0 ? (
                <div>
                    {/* 累計成績 */}
                    <div className="total-stats">
                        <h3>累計成績</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>項目</th>
                                    <th>値</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>累積スコア</td>
                                    <td>{totalStats.score}</td>
                                </tr>
                                <tr>
                                    <td>累積リーチ回数</td>
                                    <td>{totalStats.riichi}</td>
                                </tr>
                                <tr>
                                    <td>累積放銃回数</td>
                                    <td>{totalStats.houjuu}</td>
                                </tr>
                                <tr>
                                    <td>累計対局回数</td>
                                    <td>{totalStats.totalGames}</td>
                                </tr>
                                <tr><td>トップ率</td>
                                    <td>{(totalStats.firstPlace / totalStats.totalGames * 100).toFixed(2)}%</td>
                                </tr>
                                <tr><td>ラス回避率</td>
                                    <td>{(totalStats.nonFourthPlace / totalStats.totalGames * 100).toFixed(2)}%</td>
                                    </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* 順位推移グラフ */}
                    <div className="chart-container">
                        <h3>順位推移</h3>
                        <Line data={rankChartData} options={{
                            scales: {
                                y: {
                                    // 順位の縦軸を逆順に設定（1位が高い位置に来る）
                                    reverse: true, 
                                    beginAtZero: false,
                                    ticks: {
                                        min: 1,
                                        max: 4,
                                        stepSize: 1 // 1ステップごとに順位が増える
                                    },
                                    title: {
                                        display: true,
                                        text: '順位'
                                    }
                                }
                            }
                        }} />
                    </div>

                </div>
            ) : (
                <p>選択したプレイヤーの成績がまだありません。</p>
            )}
        </div>
    );
}

export default PlayerResultsPage;
