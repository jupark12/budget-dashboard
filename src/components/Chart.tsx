import React, { useEffect, useState } from 'react';
import { useGlobalContext } from '~/context/GlobalContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer, Cell } from 'recharts';
import { formatCurrency } from '~/util/func';

interface MonthlyData {
    month: string;
    balance: number;
    tooltipType: string;
}

interface ChartProps {
    numMonths?: number;
}

const Chart: React.FC<ChartProps> = ({ numMonths: initialNumMonths = 3 }) => {
    const { transactions } = useGlobalContext();
    const [chartData, setChartData] = useState<MonthlyData[]>([]);
    const [numMonths, setNumMonths] = useState(initialNumMonths);

    useEffect(() => {
        if (transactions?.length === 0) return;

        // Get the last X months
        const today = new Date();
        const lastMonths: MonthlyData[] = [];

        for (let i = 0; i < numMonths; i++) {
            const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthName = monthDate.toLocaleString('default', { month: 'short' });
            const year = monthDate.getFullYear();
            lastMonths.unshift({
                month: `${monthName} ${year}`,
                balance: 0,
                tooltipType: 'Neutral'
            });
        }

        // Process transactions
        const monthlyIncomeAndExpenses = lastMonths.map(month => ({
            ...month,
            income: 0,
            expenses: 0
        }));

        transactions?.forEach(transaction => {
            const transactionDate = new Date(transaction.date);
            const monthName = transactionDate.toLocaleString('default', { month: 'short' });
            const year = transactionDate.getFullYear();
            const monthKey = `${monthName} ${year}`;

            // Find if this month is in our last X months
            const monthData = monthlyIncomeAndExpenses.find(m => m.month === monthKey);
            if (monthData) {
                if (transaction.type === 'credit') {
                    monthData.income += transaction.amount;
                } else {
                    monthData.expenses += transaction.amount;
                }
            }
        });

        // Calculate balance (income - expenses)
        monthlyIncomeAndExpenses.forEach(month => {
            const balance = month.income + month.expenses;
            const monthData = lastMonths.find(m => m.month === month.month);
            if (monthData) {
                monthData.balance = balance;
            }
        });

        // Set the tooltipType based on balance
        lastMonths.forEach(month => {
            month.tooltipType = month.balance >= 0 ? 'Surplus' : 'Deficit';
        });

        setChartData(lastMonths);
    }, [transactions, numMonths]);

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Monthly Balance</h2>
                <div className="flex items-center">
                    <label htmlFor="monthSelector" className="mr-2 text-gray-700">Months to display:</label>
                    <input
                        id="monthSelector"
                        type="number"
                        min="1"
                        max="144"
                        value={numMonths}
                        onChange={(e) => setNumMonths(Math.min(144, Math.max(1, Number(e.target.value))))}
                        className="border border-gray-300 rounded-md py-1 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-16 text-center"
                    />
                </div>
            </div>

            <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis tickFormatter={(value) => `$${Math.abs(value)}`} />
                        <Tooltip
                            formatter={(value) => [`${formatCurrency(Number(value))}`, `${Number(value) >= 0 ? 'Surplus' : 'Deficit'}`]}
                            labelFormatter={(label) => `Month: ${label}`}
                        />
                        <Legend />
                        <ReferenceLine y={0} stroke="#000" />
                        <Bar
                            dataKey="balance"
                            name="Balance"
                            fill="black"
                            radius={[4, 4, 0, 0]}
                        >
                            {chartData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.balance >= 0 ? '#0EA5E9' : '#E11D48'}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default Chart;