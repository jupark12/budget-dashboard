import React from 'react';
import PDFUploader from '~/components/PDFUploader';
import SummaryCard from '~/components/SummaryCard';
import TransactionList from '~/components/transactions';
import { useGlobalContext } from '~/context/GlobalContext';
import { formatCurrency } from '~/util/func';

const Dashboard: React.FC = () => {
    const { totalExpenses, totalIncome, totalBalance } = useGlobalContext();

    return (
        <>
            <div className='w-full flex justify-start max-w-[1026px] flex-col'>
                <h1 className='text-4xl font-bold'>Financial Overview</h1>
                <p className='text-l text-gray-500 mt-2'>Track your spending and manage your budget efficiently</p>
            </div>
            <div className='flex gap-8 max-w-[1026px] w-full py-4'>
                <SummaryCard title='INCOME' number={formatCurrency(totalIncome)} bgColor='bg-gradient-to-b from-[#0284C7] to-[#0EA5E9]' />
                <SummaryCard title='EXPENSES' number={formatCurrency(totalExpenses)} bgColor='bg-gradient-to-b from-[#BE123C] to-[#E11D48]' />
                <SummaryCard title='BALANCE' number={formatCurrency(totalBalance)} bgColor='bg-gradient-to-b from-[#047857] to-[#10B981]' />
            </div>
            <PDFUploader />
            <TransactionList />
        </>
    )
}

export default Dashboard;