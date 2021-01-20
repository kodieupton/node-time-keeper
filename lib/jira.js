var JiraApi = require('jira-client');

// Jira API client config
var jira = new JiraApi({
    protocol: 'https',
    host: process.env.JIRA_HOST,
    username: process.env.JIRA_USERNAME,
    password: process.env.JIRA_PASSWORD,
    apiVersion: '2',
    strictSSL: true
});

// Which Jira board want to get tasks from
const jiraBoardId = process.env.JIRA_BOARD_ID;

module.exports = {
    getBoardIssues: async () => {
        return await jira.getIssuesForBoard(jiraBoardId, 0, 50, 'status in ("In Progress", "Selected for Development") ORDER BY priority DESC, due DESC, created DESC');
    },

    getIssue: async (issueNumber) => {
        return await jira.findIssue(issueNumber);
    },

    addWorklog: async (issueNumber, time, comment) => {
        const bodyData = {
            "timeSpentSeconds": time,
            "comment": {
                "type": "doc",
                "version": 1,
                "content": [
                    {
                        "type": "paragraph",
                        "content": [
                            {
                                "text": time,
                                "type": "text"
                            }
                            ]
                    }
                ]
            },
            "started": "2021-01-20T01:43:03.653+0000"
        };

        return await jira.addWorklog(issueNumber, bodyData);
    }
}