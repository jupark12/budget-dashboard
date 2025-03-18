import React from 'react';
import Chart from '~/components/Chart';
import PDFUploader from '~/components/PDFUploader';
import SummaryCard from '~/components/SummaryCard';
import { useGlobalContext } from '~/context/GlobalContext';
import { formatCurrency } from '~/util/func';

const Analytics: React.FC = () => {
    const { totalTransactions, totalExpenses, totalIncome, totalBalance } = useGlobalContext();

    return (
        <>
            <div className='w-full flex justify-start max-w-[1026px] flex-col'>
                <h1 className='text-4xl font-bold'>Financial Analytics</h1>
                <p className='text-l text-gray-500 mt-2'>Visualize your financial data and trends</p>
            </div>
            <div className='flex gap-8 max-w-[1026px] w-full py-4'>
                <SummaryCard title='INCOME' number={formatCurrency(totalIncome)} bgColor='bg-gradient-to-b from-[#0284C7] to-[#0EA5E9]' />
                <SummaryCard title='EXPENSES' number={formatCurrency(totalExpenses)} bgColor='bg-gradient-to-b from-[#BE123C] to-[#E11D48]' />
                <SummaryCard title='BALANCE' number={formatCurrency(totalBalance)} bgColor='bg-gradient-to-b from-[#047857] to-[#10B981]' />
            </div>

            <Chart numMonths={5} />

            <div className='w-full max-w-[1026px] mt-8'>
                <h2 className='text-2xl font-bold mb-4'>Transaction Insights</h2>
                <p className='text-gray-700'>
                    You have a total of <span className='font-bold'>{totalTransactions}</span> transactions recorded in the system.
                </p>
                <p className='text-gray-700 mt-4'>
                    The chart above shows your monthly balance over the last three months,
                    helping you visualize your financial trends at a glance.
                </p>
            </div>
        </>
    );
};

export default Analytics;