import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VideoDetector } from './video-detector';

describe('VideoDetector - Persistence', () => {
  let detector: VideoDetector;
  let mockVideo: HTMLVideoElement;

  beforeEach(() => {
    document.body.innerHTML = '<video src="video1.mp4"></video>';
    mockVideo = document.querySelector('video')!;
    
    mockVideo.getBoundingClientRect = vi.fn().mockReturnValue({
        top: 100, height: 500, width: 300, left: 100
    });
    
    detector = new VideoDetector();
  });

  it('should continue observing even if the page is hidden', () => {
    const onEnd = vi.fn();
    detector.observeVideo(mockVideo, onEnd);

    // Mock document.visibilityState
    Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));

    // Video ends while hidden
    mockVideo.dispatchEvent(new Event('ended'));

    expect(onEnd).toHaveBeenCalled();
  });
});
