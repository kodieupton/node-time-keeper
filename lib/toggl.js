import axiosClient from 'axios';
import { DateTime } from "luxon";
import { sleep } from '../util.js';

const axios = () => {
    return axiosClient.create({
        'auth': {
            'username': process.env.TOGGL_API_TOKEN,
            'password': 'api_token',
        }
    });
};

const request = async (datetime = null) => {
    let startDate = datetime ? `?start_date=${encodeURIComponent(datetime)}` : '';

    return await axios().get(`https://api.track.toggl.com/api/v8/time_entries${startDate}`);
};

const getCurrentWeek = async () => {
    const dt = DateTime.local();
    const startOfWeek = dt.startOf('week').toISO();
    
    const timeEntries = await request(startOfWeek);

    return timeEntries.data;
};

const getLastWeek = async () => {
    const dt = DateTime.local();
    const startOfWeek = dt.startOf('week').minus({ days: 7 }).toISO();
    
    const timeEntries = await request(startOfWeek);

    return timeEntries.data;
};

const getLastMonth = async () => {
    const dt = DateTime.local();
    const start = dt.startOf('month').minus({ months: 1 }).toISO();
    
    const timeEntries = await request(start);

    return timeEntries.data;
};

const getYesterday = async () => {
    const dt = DateTime.local();
    const startOfYesterday = dt.startOf('day').minus({days: 1}).toISO();
    
    const timeEntries = await request(startOfYesterday);

    return timeEntries.data;
};

const getToday = async () => {
    const dt = DateTime.local();
    const startOfDay = dt.startOf('day').toISO();

    const timeEntries = await request(startOfDay);

    return timeEntries.data;
};

const updateTag = async (id) => {
    await addTag(id, 'Not Sync');
    
    await sleep(2000);
    
    await removeTag(id, 'Not Tracked');

    return true;
};

const addTag = async (id, tag) => {
    return await axios().put(`https://api.track.toggl.com/api/v8/time_entries/${id}`, {
        time_entry: {
            tag_action: 'add',
            tags: [tag]
        }
    });
};

const removeTag = async (id, tag) => {
    return await axios().put(`https://api.track.toggl.com/api/v8/time_entries/${id}`, {
        time_entry: {
            tag_action: 'remove',
            tags: [tag]
        }
    });
};

export {
    request,
    getCurrentWeek,
    getLastWeek,
    getLastMonth,
    getYesterday,
    getToday,
    updateTag,
    addTag,
    removeTag
};

export default {
    request,
    getCurrentWeek,
    getLastWeek,
    getLastMonth,
    getYesterday,
    getToday,
    updateTag,
    addTag,
    removeTag
};
