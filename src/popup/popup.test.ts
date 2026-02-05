import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';

const html = fs.readFileSync(path.resolve(__dirname, './popup.html'), 'utf8');

describe('Popup UI', () => {
  beforeEach(() => {
    document.body.innerHTML = html;
  });

  it('should have an enable/disable toggle', () => {
    const toggle = document.querySelector('#autoScrollToggle');
    expect(toggle).not.toBeNull();
    expect(toggle?.getAttribute('type')).toBe('checkbox');
  });

  it('should have a scroll delay input', () => {
    const delayInput = document.querySelector('#scrollDelay');
    expect(delayInput).not.toBeNull();
    expect(delayInput?.getAttribute('type')).toBe('number');
  });

  it('should have a status indicator', () => {
    const status = document.querySelector('#status');
    expect(status).not.toBeNull();
  });
});
