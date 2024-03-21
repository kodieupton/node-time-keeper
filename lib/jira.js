import JiraApi from 'jira-client';
import fetch from 'node-fetch';

// Jira API client config
const jira = () => { 
    return new JiraApi({
        protocol: 'https',
        host: process.env.JIRA_HOST,
        username: process.env.JIRA_USERNAME,
        password: process.env.JIRA_PASSWORD,
        apiVersion: '2',
        strictSSL: true
    });
};

const getBoardIssues = async () => {
    return await jira().getIssuesForBoard(process.env.JIRA_BOARD_ID, 0, 50, 'status in ("In Progress", "Selected for Development") ORDER BY priority DESC, due DESC, created DESC');
};

const getIssue = async (issueNumber) => {
    return await jira().findIssue(issueNumber);
};

const updateRemainingEstimateSeconds = async (issueNumber, seconds) => {
    
    const bodyData = {
        "fields": {
            "timetracking": {"remainingEstimate": (seconds / 60) + 'm'}
        }
    }

    return await jira().updateIssue(issueNumber, bodyData) ;
};

const addWorklog = async (issueNumber, time, comment, start) => {
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
                            "text": comment,
                            "type": "text"
                        }
                    ]
                }
            ]
        },
        "started": start
    };

    let result = await fetch(`https://${process.env.JIRA_HOST}/rest/api/3/issue/${issueNumber}/worklog`, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${Buffer.from(
                `${process.env.JIRA_USERNAME}:${process.env.JIRA_PASSWORD}`
            ).toString('base64')}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(bodyData)
    })

    let data = await result.json()
    if(data.errorMessages?.length > 0) throw new Error('Error from jira :: ' + data.errors[0])
    return data;
};

const validIssueNumber = (issueNumber) => {
    const pattern = new RegExp(/^[a-zA-Z1-9]{2,7}-[A-Z]?\d+$/);
    return pattern.test(issueNumber);
};

export { getBoardIssues, getIssue, updateRemainingEstimateSeconds, addWorklog, validIssueNumber };
export default { getBoardIssues, getIssue, updateRemainingEstimateSeconds, addWorklog, validIssueNumber };
