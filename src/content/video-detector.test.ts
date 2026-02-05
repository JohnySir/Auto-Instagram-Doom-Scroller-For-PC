import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VideoDetector } from './video-detector';

describe('VideoDetector', () => {
  let detector: VideoDetector;
  let mockVideo: HTMLVideoElement;

  beforeEach(() => {
    document.body.innerHTML = `
      <div class="reels-container">
        <video src="video1.mp4"></video>
      </div>
    `;
    mockVideo = document.querySelector('video')!;
    
    // Mock getBoundingClientRect for Happy DOM
    mockVideo.getBoundingClientRect = vi.fn().mockReturnValue({
        top: 100,
        left: 100,
        height: 500,
        width: 300,
        bottom: 600,
        right: 400
    });

    // Ensure video is not paused
    Object.defineProperty(mockVideo, 'paused', { value: false, configurable: true });

    detector = new VideoDetector();
  });

  it('should detect when a video is present', () => {
    const video = detector.findActiveVideo();
    expect(video).toBe(mockVideo);
  });

  it('should trigger a callback when the video ends', () => {
    const onEnd = vi.fn();
    detector.observeVideo(mockVideo, onEnd);

    // Simulate video ended event
    mockVideo.dispatchEvent(new Event('ended'));

    expect(onEnd).toHaveBeenCalled();
  });

    it('should handle videos that loop by monitoring timeupdate', () => {
        const video = document.createElement('video');
        Object.defineProperty(video, 'duration', { value: 10, writable: true });
        Object.defineProperty(video, 'currentTime', { value: 8.0, writable: true }); // 2.0s from end (safe)
        Object.defineProperty(video, 'paused', { value: false }); // Ensure not paused
        
        const onEnd = vi.fn();
        detector.observeVideo(video, onEnd);

        // Simulate timeupdate at 8.0s (Should NOT trigger)
        video.dispatchEvent(new Event('timeupdate'));
        expect(onEnd).not.toHaveBeenCalled();

        // Simulate timeupdate at 9.9s (0.1s from end -> Should trigger)
        Object.defineProperty(video, 'currentTime', { value: 9.9, writable: true });
        video.dispatchEvent(new Event('timeupdate'));

        expect(onEnd).toHaveBeenCalled();
    });

    it('should ignore events from previously observed videos', () => {
        const video1 = document.createElement('video');
        const video2 = document.createElement('video');
        const callback = vi.fn();

        detector.observeVideo(video1, callback);
        
        // Switch to video 2 without waiting for video 1
        detector.observeVideo(video2, callback);

        // Fire event on video 1 (should be ignored)
        video1.dispatchEvent(new Event('ended'));
        expect(callback).not.toHaveBeenCalled();

        // Fire event on video 2 (should work)
        video2.dispatchEvent(new Event('ended'));
        expect(callback).toHaveBeenCalled();
    });

    it('should not re-attach listeners if observing the same video', () => {
        const video = document.createElement('video');
        const callback = vi.fn();
        const addListenerSpy = vi.spyOn(video, 'addEventListener');

        detector.observeVideo(video, callback);
        expect(addListenerSpy).toHaveBeenCalledTimes(2); // ended, timeupdate

        detector.observeVideo(video, callback);
        expect(addListenerSpy).toHaveBeenCalledTimes(2); // No new listeners
    });
});
