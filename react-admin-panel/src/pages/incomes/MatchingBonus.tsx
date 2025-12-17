import React from 'react';
import IncomeList from './IncomeList';

const MatchingBonus: React.FC = () => {
    return (
        <IncomeList
            incomeType="MATCHING"
            title="Matching Bonus"
            description="Manage binary matching bonus from left and right leg balance"
        />
    );
};

export default MatchingBonus;
