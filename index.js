require('dotenv').config();

const clear = require('clear');
const jira  = require('./lib/jira');
const toggl  = require('./lib/toggl');
const inquirer  = require('./lib/inquirer');


clear();

const run = async () => {
    const togglEntries = await toggl.getToday();

    if(togglEntries.length === 0) {
        return false;
    }

    const nonTracked = togglEntries.filter(({tags, description}) => {
        const issueNumber = extract(description);

        if(!jira.validIssueNumber(issueNumber)) {
            return false;
        }
        
        return !tags || !tags.includes('Tracked');
    });

    if(nonTracked.length === 0) {
        return false;
    }

    const timeEntries = nonTracked.map((entry) => {
        const {id, start, description, duration} = entry;

        const issueNumber = extract(description);

        return {
            'togglId': id,
            'issueNumber': issueNumber,
            'description': description,
            'duration': duration,
            'start': start,
        };
    });

    // console.log(timeEntries);

    await inquirer.askNotToTrack(timeEntries.map(({description}) => { return description; }));

    // console.log(await jira.addWorklog('T3-1', 300, 'first test'));
};

run();

function extract(name) {
    const split = name.split('-').slice(0, 2);
    return split.join('-').trim();
}