import inquirer from 'inquirer';

const askNotToTrack = (list) => {
    const questions = [
        {
            name: `dontTrack`,
            type: 'checkbox',
            default: null,
            message: 'Do you want to prioritise any boards? (Enter board key. If multiple comma separate keys.)',
            choices: list
        }
    ];

    return inquirer.prompt(questions);
};

const whatToTrack = () => {
    return inquirer.prompt([
        {
            name: `whatToTrack`,
            type: 'list',
            default: 'today',
            message: 'What day would you like to track?',
            choices: [
                {
                    name: 'Today',
                    value: 'today'
                },
                {
                    name: 'Yesterday',
                    value: 'yesterday'
                },
                {
                    name: 'This Week',
                    value: 'week'
                },
                {
                    name: 'Last Week',
                    value: 'lastweek'
                },
                {
                    name: 'Last Month',
                    value: 'lastmonth'
                }
            ]
        }
    ]);
};

export { askNotToTrack, whatToTrack };
export default { askNotToTrack, whatToTrack };
