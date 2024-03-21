dotenv.config();

import clear from 'clear';
import jira from './lib/jira.js';
import toggl from './lib/toggl.js';
import inquirer from './lib/inquirer.js';
import { extract, changeOffset, convertFromSeconds, sleep } from './util.js';
import { DateTime } from "luxon";
import cliProgress from 'cli-progress';
import dotenv from 'dotenv';

clear();

const run = async () => {
    let togglEntries = [];
    const whatToTrack = await inquirer.whatToTrack();

    try {
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
                
            case 'lastmonth':
                togglEntries = await toggl.getLastMonth();
                break;              
        }
    } catch (err) {
        console.error(err.message);
        return; 
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

    for({togglId, issueNumber, description, duration, start} of timeEntriesToTrack) {
        try {
            await jira.addWorklog(issueNumber, duration, description, start);    
            await toggl.updateTag(togglId);
            await jira.getIssue(issueNumber);
        } catch (err) {
            progress.stop();
            console.error(err);
            return;
        }

        progress.increment();
        await sleep(500);
    }

    progress.stop();
};

run();