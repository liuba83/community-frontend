import { describe, it, expect } from 'vitest';
import { formatPhone, isValidURL, getSafeHref, getDomain } from './validation.js';

describe('formatPhone', () => {
  it('formats a plain 10-digit number', () => {
    expect(formatPhone('5125551234')).toBe('(512) 555-1234');
  });

  it('strips separators and formats', () => {
    expect(formatPhone('(512) 555-1234')).toBe('(512) 555-1234');
    expect(formatPhone('512-555-1234')).toBe('(512) 555-1234');
    expect(formatPhone('512.555.1234')).toBe('(512) 555-1234');
  });

  it('strips leading country code 1 from 11-digit number', () => {
    expect(formatPhone('15125551234')).toBe('(512) 555-1234');
    expect(formatPhone('+1 512 555 1234')).toBe('(512) 555-1234');
  });

  it('returns raw string for non-US-length numbers', () => {
    expect(formatPhone('512555')).toBe('512555');
    expect(formatPhone('512555123456789')).toBe('512555123456789');
  });

  it('returns the raw value for falsy input', () => {
    expect(formatPhone('')).toBe('');
    expect(formatPhone(null)).toBe(null);
    expect(formatPhone(undefined)).toBe(undefined);
  });
});

describe('isValidURL', () => {
  it('accepts valid https URLs', () => {
    expect(isValidURL('https://example.com')).toBe(true);
    expect(isValidURL('https://example.com/path?q=1')).toBe(true);
  });

  it('accepts valid http URLs', () => {
    expect(isValidURL('http://example.com')).toBe(true);
  });

  it('returns true for empty/falsy values (no URL is valid)', () => {
    expect(isValidURL('')).toBe(true);
    expect(isValidURL(null)).toBe(true);
    expect(isValidURL(undefined)).toBe(true);
  });

  it('rejects non-http/https protocols', () => {
    expect(isValidURL('ftp://example.com')).toBe(false);
    expect(isValidURL('javascript:alert(1)')).toBe(false);
  });

  it('rejects malformed strings', () => {
    expect(isValidURL('not a url')).toBe(false);
    expect(isValidURL('example.com')).toBe(false);
  });
});

describe('getSafeHref', () => {
  it('returns the URL for valid URLs', () => {
    expect(getSafeHref('https://example.com')).toBe('https://example.com');
  });

  it('returns # for invalid URLs', () => {
    expect(getSafeHref('javascript:alert(1)')).toBe('#');
    expect(getSafeHref('not a url')).toBe('#');
  });

  it('passes through falsy values (treated as valid/empty)', () => {
    expect(getSafeHref('')).toBe('');
    expect(getSafeHref(null)).toBe(null);
  });
});

describe('getDomain', () => {
  it('extracts the hostname from a URL', () => {
    expect(getDomain('https://example.com/path')).toBe('example.com');
  });

  it('strips www. prefix', () => {
    expect(getDomain('https://www.example.com')).toBe('example.com');
  });

  it('returns the raw string for a malformed URL', () => {
    expect(getDomain('not a url')).toBe('not a url');
  });
});
