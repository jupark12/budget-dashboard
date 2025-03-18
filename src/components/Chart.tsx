import React, { useEffect, useState } from 'react';
import { useGlobalContext } from '~/context/GlobalContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '~/util/func';

interface MonthlyData {
    month: string;
    balance: number;
    tooltipType: string;
}

interface ChartProps {
    numMonths: number;
}

const Chart: React.FC<ChartProps> = ({ numMonths }) => {
    const { transactions } = useGlobalContext();
    const [chartData, setChartData] = useState<MonthlyData[]>([]);

    useEffect(() => {
        if (transactions?.length === 0) return;

        // Get the last 3 months
        const today = new Date();
        const last3Months: MonthlyData[] = [];

        for (let i = 0; i < numMonths; i++) {
            const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthName = monthDate.toLocaleString('default', { month: 'short' });
            const year = monthDate.getFullYear();
            last3Months.unshift({
                month: `${monthName} ${year}`,
                balance: 0,
                tooltipType: 'Neutral'
            });
        }

        // Process transactions
        const monthlyIncomeAndExpenses = last3Months.map(month => ({
            ...month,
            income: 0,
            expenses: 0
        }));

        transactions?.forEach(transaction => {
            const transactionDate = new Date(transaction.date);
            const monthName = transactionDate.toLocaleString('default', { month: 'short' });
            const year = transactionDate.getFullYear();
            const monthKey = `${monthName} ${year}`;

            // Find if this month is in our last 3 months
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
            const monthData = last3Months.find(m => m.month === month.month);
            if (monthData) {
                monthData.balance = balance;
            }
        });

        console.log(monthlyIncomeAndExpenses)

        // Set the tooltipType based on balance
        last3Months.forEach(month => {
            month.tooltipType = month.balance >= 0 ? 'Surplus' : 'Deficit';
        });

        setChartData(last3Months);
    }, [transactions]);

    // Custom bar shape that renders positive values above axis and negative below
    const renderCustomizedBar = (props: any) => {
        const { x, y, width, height, value } = props;
        const fill = value >= 0 ? '#0EA5E9' : '#E11D48';

        return (
            <g>
                <rect x={x} y={y} width={width} height={Math.abs(height)} fill={fill} rx={4} ry={4} />
            </g>
        );
    };

    return (
        <div className="w-full max-w-[1026px] h-[400px]">
            <h2 className="text-xl font-bold">Monthly Balance for {numMonths} Months</h2>
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
                        shape={renderCustomizedBar}
                        radius={[4, 4, 0, 0]}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default Chart;