import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VideoDetector } from './video-detector';

describe('VideoDetector - Edge Cases', () => {
  let detector: VideoDetector;
  let mockVideo: HTMLVideoElement;

  beforeEach(() => {
    document.body.innerHTML = `
      <div class="reels-container">
        <video src="video1.mp4"></video>
        <div id="overlay">Sensitive Content</div>
      </div>
    `;
    mockVideo = document.querySelector('video')!;
    detector = new VideoDetector();
  });

  it('should NOT trigger callback if video is paused', () => {
    const onEnd = vi.fn();
    detector.observeVideo(mockVideo, onEnd);

    // Simulate video nearing end but PAUSED
    Object.defineProperty(mockVideo, 'duration', { value: 10, configurable: true });
    Object.defineProperty(mockVideo, 'currentTime', { value: 9.9, configurable: true });
    Object.defineProperty(mockVideo, 'paused', { value: true, configurable: true });
    
    mockVideo.dispatchEvent(new Event('timeupdate'));
    
    expect(onEnd).not.toHaveBeenCalled();
  });

  it('should NOT trigger callback if sensitive content overlay is detected', () => {
    const onEnd = vi.fn();
    detector.observeVideo(mockVideo, onEnd);

    // Mock document.body.innerText
    Object.defineProperty(document.body, 'innerText', {
        value: 'Some text including Sensitive Content warning',
        configurable: true
    });
    
    // Simulate video reaching end
    Object.defineProperty(mockVideo, 'duration', { value: 10, configurable: true });
    Object.defineProperty(mockVideo, 'currentTime', { value: 9.9, configurable: true });
    Object.defineProperty(mockVideo, 'paused', { value: false, configurable: true });
    
    mockVideo.dispatchEvent(new Event('timeupdate'));
    
    expect(onEnd).not.toHaveBeenCalled();
  });
});
