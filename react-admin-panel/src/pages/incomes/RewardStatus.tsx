import React from 'react';
import IncomeList from './IncomeList';

const RewardStatus: React.FC = () => {
    return (
        <IncomeList
            incomeType="REWARD"
            title="Reward Status"
            description="Manage performance rewards and special incentives"
        />
    );
};

export default RewardStatus;
