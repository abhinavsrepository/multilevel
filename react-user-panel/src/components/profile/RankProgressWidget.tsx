import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { rankApi, RankProgressData } from '../../api/rank.api';
import { FiTarget, FiTrendingUp, FiUsers, FiDollarSign } from 'react-icons/fi';

ChartJS.register(ArcElement, Tooltip, Legend);

const RankProgressWidget = () => {
    const [data, setData] = useState<RankProgressData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await rankApi.getRankProgress();
                if (response.data.success) {
                    setData(response.data.data);
                }
            } catch (error) {
                console.error('Failed to fetch rank progress:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="animate-pulse h-64 bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>;
    if (!data) return null;

    const chartData = {
        labels: ['Progress', 'Remaining'],
        datasets: [
            {
                data: [data.overallProgress, 100 - data.overallProgress],
                backgroundColor: ['#3B82F6', '#E5E7EB'],
                borderWidth: 0,
                circumference: 180,
                rotation: 270,
            },
        ],
    };

    const chartOptions = {
        cutout: '75%',
        plugins: {
            legend: { display: false },
            tooltip: { enabled: false },
        },
        maintainAspectRatio: false,
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-700"
        >
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <FiTarget className="text-blue-500" />
                        Rank Progress
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Current Rank: <span className="font-semibold text-blue-600 dark:text-blue-400">{data.currentRank.name}</span>
                    </p>
                </div>
                {data.nextRank && (
                    <div className="text-right">
                        <p className="text-xs text-gray-400 uppercase tracking-wider">Next Goal</p>
                        <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                            {data.nextRank.name}
                        </p>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Visual Circle Score */}
                <div className="relative h-48 w-full flex flex-col items-center justify-center">
                    <div style={{ width: '200px', height: '100%' }}>
                        <Doughnut data={chartData} options={chartOptions} />
                    </div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/3 text-center mt-8">
                        <span className="text-4xl font-bold text-gray-800 dark:text-white">{data.overallProgress}%</span>
                        <p className="text-xs text-gray-500">Completed</p>
                    </div>
                </div>

                {/* Progress Details */}
                <div className="space-y-4">
                    {/* Direct Referrals */}
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                <FiUsers className="w-4 h-4" /> Direct Referrals
                            </span>
                            <span className="font-semibold">{data.progress.directReferrals.current} / {data.progress.directReferrals.required}</span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${data.progress.directReferrals.percentage}%` }}
                                className="h-full bg-blue-500 rounded-full"
                            />
                        </div>
                    </div>

                    {/* Team Investment */}
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                <FiTrendingUp className="w-4 h-4" /> Team Investment
                            </span>
                            <span className="font-semibold">{data.progress.teamInvestment.current} / {data.progress.teamInvestment.required}</span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${data.progress.teamInvestment.percentage}%` }}
                                className="h-full bg-purple-500 rounded-full"
                            />
                        </div>
                    </div>

                    {/* Personal Investment */}
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                <FiDollarSign className="w-4 h-4" /> Personal Investment
                            </span>
                            <span className="font-semibold">{data.progress.personalInvestment.current} / {data.progress.personalInvestment.required}</span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${data.progress.personalInvestment.percentage}%` }}
                                className="h-full bg-green-500 rounded-full"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Guidance / Actionable Insights */}
            {data.guidance.length > 0 && (
                <div className="mt-6 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-900 rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
                        💡 How to Reach Next Rank
                    </h4>
                    <ul className="space-y-1">
                        {data.guidance.map((tip, idx) => (
                            <li key={idx} className="text-sm text-blue-700 dark:text-blue-400 flex items-start gap-2">
                                <span className="mt-1.5 w-1 h-1 bg-blue-500 rounded-full"></span>
                                {tip}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </motion.div>
    );
};

export default RankProgressWidget;
