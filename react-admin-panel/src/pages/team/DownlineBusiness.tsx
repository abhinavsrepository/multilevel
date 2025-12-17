import React from 'react';
import TeamList from './TeamList';

const DownlineBusiness: React.FC = () => {
    return (
        <TeamList
            type="business"
            title="Downline Business"
            description="Track business volume and performance of your downline"
        />
    );
};

export default DownlineBusiness;
