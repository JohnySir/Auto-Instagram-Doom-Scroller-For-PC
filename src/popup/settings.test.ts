import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';

// Mock chrome API
const chromeMock = {
  storage: {
    local: {
      get: vi.fn(),
      set: vi.fn(),
    },
  },
};

global.chrome = chromeMock as any;

const html = fs.readFileSync(path.resolve(__dirname, './popup.html'), 'utf8');

describe('Settings Persistence', () => {
  beforeEach(async () => {
    document.body.innerHTML = html;
    vi.clearAllMocks();
    
    // We'll import the script dynamically in the test or simulate its execution
    // For now, let's just assume the logic will be in popup.ts
  });

  it('should load settings from storage on initialization', async () => {
    chromeMock.storage.local.get.mockImplementation((keys, callback) => {
      callback({ autoScrollEnabled: true, scrollDelay: 3.5 });
    });

    // Manually trigger the load logic we expect to implement
    const { initPopup } = await import('./popup');
    await initPopup();

    const toggle = document.querySelector('#autoScrollToggle') as HTMLInputElement;
    const delayInput = document.querySelector('#scrollDelay') as HTMLInputElement;

    expect(toggle.checked).toBe(true);
    expect(delayInput.value).toBe('3.5');
  });

  it('should save settings to storage when toggle changes', async () => {
    const { initPopup } = await import('./popup');
    await initPopup();

    const toggle = document.querySelector('#autoScrollToggle') as HTMLInputElement;
    toggle.checked = false;
    toggle.dispatchEvent(new Event('change'));

    expect(chromeMock.storage.local.set).toHaveBeenCalledWith(
      expect.objectContaining({ autoScrollEnabled: false }),
      expect.any(Function)
    );
  });

  it('should save settings to storage when delay changes', async () => {
    const { initPopup } = await import('./popup');
    await initPopup();

    const delayInput = document.querySelector('#scrollDelay') as HTMLInputElement;
    delayInput.value = '5';
    delayInput.dispatchEvent(new Event('change'));

    expect(chromeMock.storage.local.set).toHaveBeenCalledWith(
      expect.objectContaining({ scrollDelay: 5 }),
      expect.any(Function)
    );
  });

  it('should handle missing settings by defaulting to enabled', async () => {
    chromeMock.storage.local.get.mockImplementation((keys, callback) => {
      callback({}); // Empty storage
    });

    const { initPopup } = await import('./popup');
    await initPopup();

    const toggle = document.querySelector('#autoScrollToggle') as HTMLInputElement;
    const status = document.querySelector('#status') as HTMLElement;

    expect(toggle.checked).toBe(true);
    expect(status.classList.contains('active')).toBe(true);
  });

  it('should remove active class when disabled', async () => {
    chromeMock.storage.local.get.mockImplementation((keys, callback) => {
      callback({ autoScrollEnabled: false });
    });

    const { initPopup } = await import('./popup');
    await initPopup();

    const status = document.querySelector('#status') as HTMLElement;
    expect(status.classList.contains('active')).toBe(false);
  });
});
