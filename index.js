require('dotenv').config();

const clear = require('clear');
const jira  = require('./lib/jira');
const toggl  = require('./lib/toggl');
const inquirer  = require('./lib/inquirer');
const { extract, changeOffset, convertFromSeconds, sleep } = require('./util');
const { DateTime } = require("luxon");
const cliProgress = require('cli-progress');

clear();

const run = async () => {
    let togglEntries = [];
    const whatToTrack = await inquirer.whatToTrack();

    switch (whatToTrack.whatToTrack) {
        case 'today':
            togglEntries = await toggl.getToday();
            break;

        case 'yesterday':
            togglEntries = await toggl.getYesterday();
            break;

        case 'week':
            togglEntries = await toggl.getCurrentWeek();
            break;
    }

    if(togglEntries.length === 0) {
        return false;
    }

    const nonTracked = togglEntries.filter(({tags, description}) => {
        if(!description) return false;
        
        const issueNumber = extract(description);

        if(!jira.validIssueNumber(issueNumber)) {
            return false;
        }
        
        return !tags || (!tags.includes('Tracked') && !tags.includes('Not Sync'));
    });

    if(nonTracked.length === 0) {
        return false;
    }

    const timeEntries = nonTracked.map((entry) => {
        const {id, start, description, duration} = entry;

        const issueNumber = extract(description);

        let dt = DateTime.fromISO(start);
        const startTime = changeOffset(dt.toString());

        return {
            'togglId': id,
            'issueNumber': issueNumber,
            'description': description,
            'duration': duration,
            'start': startTime,
        };
    });

    const dontTrack = await inquirer.askNotToTrack(timeEntries.map(({togglId, description}) => {
        return {
            'name': description, 
            'value': togglId 
        }; 
    }));

    const timeEntriesToTrack = timeEntries.filter((entry) => {
        return !dontTrack.dontTrack.includes(entry.togglId);
    });

    if(timeEntriesToTrack.length === 0) {
        return false;
    }

    const progress = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

    progress.start(timeEntriesToTrack.length, 0);

    timeEntriesToTrack.forEach(async ({togglId, issueNumber, description, duration, start}) => {
        try {
            await jira.addWorklog(issueNumber, duration, description, start);    
            await toggl.updateTag(togglId);
            await jira.getIssue(issueNumber);
        } catch (err) {
            console.error(err);
        }

        progress.increment();
        await sleep(1000);
    });

    progress.stop();
};

run();