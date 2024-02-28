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

        case 'lastweek':
            togglEntries = await toggl.getLastWeek();
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
        return !dontTrack.dontTrack.includes(entry.togglId) && entry.duration > 0;
    });

    if(timeEntriesToTrack.length === 0) {
        return false;
    }

    const progress = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

    progress.start(timeEntriesToTrack.length, 0);

    const errors = [];

    for({togglId, issueNumber, description, duration, start} of timeEntriesToTrack) {
        try {
            try{
                await jira.addWorklog(issueNumber, duration, description, start);    
            }catch(e){
                errors.push(issueNumber + ' ' + e.message)
                continue;
            }
            await toggl.updateTag(togglId);
            let issue = await jira.getIssue(issueNumber);
            let remainingEstimateSeconds = issue.fields.timetracking.remainingEstimateSeconds;

            if(remainingEstimateSeconds - duration >= 0) {
                // we are ok to update the remaining estimate
                await jira.updateRemainingEstimateSeconds(remainingEstimateSeconds - duration);
            }else {
                // zero this out and alert the user
                await jira.updateRemainingEstimateSeconds(0);
                errors.push(issueNumber + " WARNING - Remaining Estimate is less than 0");
            }

        } catch (err) {
            //progress.stop();
            console.error(err);
            //return;
        }

        progress.increment();
        await sleep(500);
    }

    progress.stop();


    errors.forEach(x => console.error(x?.toString().trim()));
};

run();