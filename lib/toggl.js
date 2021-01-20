
const axiosClient = require('axios');
const { DateTime } = require("luxon");

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

    getToday: async () => {
        const dt = DateTime.local();
        const startOfDay = dt.startOf('day').toISO();

        const timeEntries = await module.exports.request(startOfDay);

        return timeEntries.data;
    }
}