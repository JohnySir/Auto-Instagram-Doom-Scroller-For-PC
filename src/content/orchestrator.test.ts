import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock chrome API
const chromeMock = {
  storage: {
    local: {
      get: vi.fn(),
      onChanged: {
        addListener: vi.fn(),
      },
    },
  },
};
global.chrome = chromeMock as any;

// Mock dependencies
vi.mock('./video-detector', () => {
  return {
    VideoDetector: vi.fn().mockImplementation(function() {
      return {
        findActiveVideo: vi.fn(),
        observeVideo: vi.fn(),
        cleanup: vi.fn(),
      };
    }),
  };
});

vi.mock('./scroller', () => {
  return {
    Scroller: vi.fn().mockImplementation(function() {
      return {
        scrollNext: vi.fn(),
        cancelPendingScroll: vi.fn(),
      };
    }),
  };
});

describe('Content Script Orchestration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize and fetch settings', async () => {
    chromeMock.storage.local.get.mockImplementation((keys, cb) => cb({ autoScrollEnabled: true, scrollDelay: 2 }));
    
    // Trigger initialization
    await import('./index');

    expect(chromeMock.storage.local.get).toHaveBeenCalledWith(['autoScrollEnabled', 'scrollDelay'], expect.any(Function));
  });

  it('should react to storage changes', async () => {
    const { handleStorageChange } = await import('./index');
    const mockScroller = { cancelPendingScroll: vi.fn(), scrollNext: vi.fn() };
    
    // Simulate disabling auto-scroll
    handleStorageChange({ autoScrollEnabled: { newValue: false } }, mockScroller as any);
    expect(mockScroller.cancelPendingScroll).toHaveBeenCalled();

    // Simulate updating delay
    handleStorageChange({ scrollDelay: { newValue: 5 } }, mockScroller as any);
  });

  it('should start observing when auto-scroll is re-enabled', async () => {
    const { handleStorageChange } = await import('./index');
    const mockScroller = { cancelPendingScroll: vi.fn(), scrollNext: vi.fn() };
    
    handleStorageChange({ autoScrollEnabled: { newValue: true } }, mockScroller as any);
  });
});
