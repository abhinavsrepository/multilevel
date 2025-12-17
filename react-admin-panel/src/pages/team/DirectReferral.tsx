import React from 'react';
import TeamList from './TeamList';

const DirectReferral: React.FC = () => {
    return (
        <TeamList
            type="direct"
            title="Direct Referrals"
            description="Manage all direct referrals and their performance"
        />
    );
};

export default DirectReferral;
