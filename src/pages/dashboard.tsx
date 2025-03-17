import React from 'react';
import PDFUploader from '~/components/PDFUploader';
import TransactionList from '~/components/transactions';

const Dashboard: React.FC = () => {
    return (
        <>
            <PDFUploader />
            <TransactionList />
        </>
    )
}

export default Dashboard;