const {validIssueNumber, getIssue, updateRemainingEstimateSeconds} = require('../lib/jira');

test('Valid issue number', () => {
    expect(validIssueNumber('TE-2')).toBe(true);
    expect(validIssueNumber('TES-3')).toBe(true);
    expect(validIssueNumber('TEST-4')).toBe(true);
    expect(validIssueNumber('TESTS-5')).toBe(true);
});

test('Not Valid issue number', () => {
    expect(validIssueNumber('T-1')).toBe(false);
    expect(validIssueNumber('TE-2 - Testing')).toBe(false);
    expect(validIssueNumber('TEST')).toBe(false);
});

test('Update Remaining Estimate', async () => {

    const issueNumber = 'MI-129';

    await updateRemainingEstimateSeconds(issueNumber, 3600)
    let issue = await getIssue(issueNumber);
    let remainingEstimateSeconds = issue.fields.timetracking.remainingEstimateSeconds;
    expect(remainingEstimateSeconds).toBe(3600);

    await updateRemainingEstimateSeconds(issueNumber, 1800)
    issue = await getIssue(issueNumber);
    remainingEstimateSeconds = issue.fields.timetracking.remainingEstimateSeconds;
    expect(remainingEstimateSeconds).toBe(1800);
});