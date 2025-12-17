import React from 'react';
import IncomeList from './IncomeList';

const ROIBonus: React.FC = () => {
    return (
        <IncomeList
            incomeType="ROI"
            title="ROI Bonus"
            description="Manage Return on Investment bonus from property investments"
        />
    );
};

export default ROIBonus;
