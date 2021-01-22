const inquirer = require('inquirer');

module.exports = {
    askNotToTrack: (list) => {
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
    },
};