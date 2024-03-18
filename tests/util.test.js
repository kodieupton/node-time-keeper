import { expect, test } from 'vitest';
import { extract, changeOffset, convertFromSeconds } from '../util';

test('extract', () => {
    expect(extract('TE-2 - Testing')).toBe('TE-2');
    expect(extract('TES-3 - Testing')).toBe('TES-3');
    expect(extract('TEST-4 - Testing')).toBe('TEST-4');
    expect(extract('TESTS-5 - Testing')).toBe('TESTS-5');
});

test('convertFromSeconds', () => {
    expect(convertFromSeconds(300)).toBe('5m');
    expect(convertFromSeconds(900)).toBe('15m');
    expect(convertFromSeconds(3600)).toBe('1h');
    expect(convertFromSeconds(16500)).toBe('4h, 35m');
});