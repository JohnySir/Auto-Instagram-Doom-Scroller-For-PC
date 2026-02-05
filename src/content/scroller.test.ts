import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Scroller } from './scroller';

describe('Scroller', () => {
  let scroller: Scroller;

  beforeEach(() => {
    scroller = new Scroller();
    vi.clearAllMocks();
    document.body.innerHTML = '';
  });

  it('should dispatch ArrowDown keyboard events', () => {
    const dispatchSpy = vi.spyOn(document, 'dispatchEvent');

    scroller.scrollNext();

    const keydowns = dispatchSpy.mock.calls.filter(args => 
        args[0] instanceof KeyboardEvent && args[0].key === 'ArrowDown' && args[0].type === 'keydown'
    );
    const keyups = dispatchSpy.mock.calls.filter(args => 
        args[0] instanceof KeyboardEvent && args[0].key === 'ArrowDown' && args[0].type === 'keyup'
    );
    
    expect(keydowns.length).toBeGreaterThanOrEqual(1);
    expect(keyups.length).toBeGreaterThanOrEqual(1);
  });

  it('should scroll container of provided context element', () => {
    const container = document.createElement('div');
    Object.defineProperty(container, 'clientHeight', { value: 800 });
    Object.defineProperty(container, 'scrollHeight', { value: 2000 });
    vi.spyOn(window, 'getComputedStyle').mockImplementation((el) => {
        if (el === container) return { overflowY: 'scroll' } as CSSStyleDeclaration;
        return { overflowY: 'visible' } as CSSStyleDeclaration;
    });

    const video = document.createElement('video');
    container.appendChild(video);
    document.body.appendChild(container);

    const scrollSpy = vi.fn();
    container.scrollBy = scrollSpy;

    // Call scrollNext WITH the video element
    scroller.scrollNext(0, video);

    expect(scrollSpy).toHaveBeenCalledWith(expect.objectContaining({ top: 800, behavior: 'smooth' }));
  });

  it('should find scroll container via elementFromPoint and scroll it', () => {
    // Setup a mock DOM structure
    const container = document.createElement('div');
    Object.defineProperty(container, 'clientHeight', { value: 800 });
    Object.defineProperty(container, 'scrollHeight', { value: 2000 });
    // Mock getComputedStyle to return overflow-y: scroll
    vi.spyOn(window, 'getComputedStyle').mockImplementation((el) => {
        if (el === container) return { overflowY: 'scroll' } as CSSStyleDeclaration;
        return { overflowY: 'visible' } as CSSStyleDeclaration;
    });

    const child = document.createElement('div');
    container.appendChild(child);
    document.body.appendChild(container);

    // Mock elementFromPoint to return the child
    vi.spyOn(document, 'elementFromPoint').mockReturnValue(child);

    const scrollSpy = vi.fn();
    container.scrollBy = scrollSpy;

    scroller.scrollNext();

    expect(scrollSpy).toHaveBeenCalledWith(expect.objectContaining({ top: 800, behavior: 'smooth' }));
  });

  it('should use window scroll as fallback if no container found', () => {
    vi.spyOn(document, 'elementFromPoint').mockReturnValue(document.body);
    const windowScrollSpy = vi.fn();
    window.scrollBy = windowScrollSpy;

    scroller.scrollNext();

    expect(windowScrollSpy).toHaveBeenCalled();
  });

  it('should blur active elements if they are inputs', () => {
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();
    const blurSpy = vi.spyOn(input, 'blur');

    scroller.scrollNext();

    expect(blurSpy).toHaveBeenCalled();
  });

  it('should wait for the configured delay before scrolling', async () => {
    vi.useFakeTimers();
    const dispatchSpy = vi.spyOn(document, 'dispatchEvent');
    
    scroller.scrollNext(2000); // 2 seconds delay

    // Initial check - no keyboard events yet
    const initialCalls = dispatchSpy.mock.calls.filter(args => 
        args[0] instanceof KeyboardEvent && args[0].key === 'ArrowDown'
    );
    expect(initialCalls.length).toBe(0);
    
    vi.advanceTimersByTime(1900);
    const midCalls = dispatchSpy.mock.calls.filter(args => 
        args[0] instanceof KeyboardEvent && args[0].key === 'ArrowDown'
    );
    expect(midCalls.length).toBe(0);

    vi.advanceTimersByTime(200);
    const finalCalls = dispatchSpy.mock.calls.filter(args => 
        args[0] instanceof KeyboardEvent && args[0].key === 'ArrowDown'
    );
    expect(finalCalls.length).toBeGreaterThanOrEqual(2);
    
    vi.useRealTimers();
  });
});