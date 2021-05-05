const {validIssueNumber} = require('../lib/jira');

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