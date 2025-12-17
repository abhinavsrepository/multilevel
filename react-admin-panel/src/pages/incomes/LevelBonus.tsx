import React from 'react';
import IncomeList from './IncomeList';

const LevelBonus: React.FC = () => {
    return (
        <IncomeList
            incomeType="LEVEL"
            title="Level Bonus"
            description="Manage multi-level commission payments based on downline levels"
        />
    );
};

export default LevelBonus;
