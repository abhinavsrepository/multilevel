const models = require('./src/models');

console.log('Available models:');
Object.keys(models)
    .filter(k => k !== 'sequelize' && k !== 'Sequelize')
    .forEach(model => console.log(' -', model));

console.log('\nChecking UserRank:', models.UserRank ? 'EXISTS' : 'MISSING');
console.log('Checking RankReward:', models.RankReward ? 'EXISTS' : 'MISSING');
console.log('Checking RankAchievement:', models.RankAchievement ? 'EXISTS' : 'MISSING');
console.log('Checking Rank:', models.Rank ? 'EXISTS' : 'MISSING');
