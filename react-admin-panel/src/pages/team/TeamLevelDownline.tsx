import React from 'react';
import TeamList from './TeamList';

const TeamLevelDownline: React.FC = () => {
    return (
        <TeamList
            type="level"
            title="Team Level Downline"
            description="View team members organized by levels"
        />
    );
};

export default TeamLevelDownline;
