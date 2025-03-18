import React from 'react';

interface SummaryCardProps {
    title: string;
    number: string;
    bgColor: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, number, bgColor }) => {
    return (
        <div className={bgColor + " rounded-2xl shadow-lg p-6 text-white w-[200px] flex-1"}>
            <h2 className="text-l font-semibold mb-4">
                {title}
            </h2>
            <p className="text-white text-2xl font-extrabold">{number}</p>
        </div>
    );
};

export default SummaryCard;