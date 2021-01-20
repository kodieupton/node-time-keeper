require('dotenv').config();

const clear = require('clear');
const jira  = require('./lib/jira');
const toggl  = require('./lib/toggl');

clear();

const run = async () => {
    const timeEntries = await toggl.getToday();

    if(timeEntries.length === 0) {
        return false;
    }

    // Extract

    // console.log(await jira.addWorklog('T3-1', 300, 'first test'));
};

run();