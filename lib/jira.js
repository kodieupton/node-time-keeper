var JiraApi = require('jira-client');
const fetch = require('node-fetch');

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

    addWorklog: async (issueNumber, time, comment, start) => {
        const bodyData = `{
            "timeSpentSeconds": ${time},
            "comment": {
                "type": "doc",
                "version": 1,
                "content": [
                    {
                        "type": "paragraph",
                        "content": [
                            {
                                "text": "${comment}",
                                "type": "text"
                            }
                        ]
                    }
                ]
            },
            "started": "${start}"
        }`;

        return await fetch(`https://${process.env.JIRA_HOST}/rest/api/3/issue/${issueNumber}/worklog`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${Buffer.from(
                    `${process.env.JIRA_USERNAME}:${process.env.JIRA_PASSWORD}`
                ).toString('base64')}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: bodyData
        })
    },

    validIssueNumber: (issueNumber) => {
        const regex = /^[a-zA-Z1-9]{2,4}-\d+$/;
        return issueNumber.match(regex);
    }
}
