
const axiosClient = require('axios');
const { DateTime } = require("luxon");
const { sleep } = require('../util');

const axios = axiosClient.create({
    'auth': {
        'username': process.env.TOGGL_API_TOKEN,
        'password': 'api_token',
    }
});

module.exports = {
    request: async (datetime = null) => {
        let startDate = datetime ? `?start_date=${encodeURIComponent(datetime)}` : '';

        return await axios.get(`https://api.track.toggl.com/api/v8/time_entries${startDate}`);
    },

    getCurrentWeek: async () => {
        const dt = DateTime.local();
        const startOfWeek = dt.startOf('week').toISO();
        
        const timeEntries = await module.exports.request(startOfWeek);

        return timeEntries.data;
    },

    getLastWeek: async () => {
        const dt = DateTime.local();
        const startOfWeek = dt.startOf('week').minus({ days: 7 }).toISO();
        
        const timeEntries = await module.exports.request(startOfWeek);

        return timeEntries.data;
    },

    getLastMonth: async () => {
        const dt = DateTime.local();
        const start = dt.startOf('month').minus({ months: 1 }).toISO();
        
        const timeEntries = await module.exports.request(start);

        return timeEntries.data;
    },

    getYesterday: async () => {
        const dt = DateTime.local();
        const startOfYesterday = dt.startOf('day').minus({days: 1}).toISO();
        
        const timeEntries = await module.exports.request(startOfYesterday);

        return timeEntries.data;
    },

    getToday: async () => {
        const dt = DateTime.local();
        const startOfDay = dt.startOf('day').toISO();

        const timeEntries = await module.exports.request(startOfDay);

        return timeEntries.data;
    },

    updateTag: async (id) => {
        await module.exports.addTag(id, 'Not Sync');
        
        await sleep(2000);
        
        await module.exports.removeTag(id, 'Not Tracked');

        return true;
    },

    addTag: async (id, tag) => {
        return await axios.put(`https://api.track.toggl.com/api/v8/time_entries/${id}`, {
            time_entry: {
                tag_action: 'add',
                tags: [tag]
            }
        });
    },

    removeTag: async (id, tag) => {
        return await axios.put(`https://api.track.toggl.com/api/v8/time_entries/${id}`, {
            time_entry: {
                tag_action: 'remove',
                tags: [tag]
            }
        });
    }
}