require('dotenv').config();

const clear = require('clear');
const jira  = require('./lib/jira');
const toggl  = require('./lib/toggl');
const inquirer  = require('./lib/inquirer');
const { DateTime } = require("luxon");


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

    timeEntriesToTrack.forEach(async ({issueNumber, description, duration, start}) => {
        try {
            await jira.addWorklog(issueNumber, duration, description, start);    
        } catch (err) {
            console.error(err);
        }
    });

    console.log(timeEntriesToTrack);
};

run();

function extract(name) {
    const split = name.split('-').slice(0, 2);
    return split.join('-').trim();
}

function changeOffset(dateTime) {
    const split = dateTime.split('+');
    split[1] = split[1].replace(':', '');
    return split.join('+');
}