export class VideoDetector {
    private currentVideo: HTMLVideoElement | null = null;
    private onEndCallback: (() => void) | null = null;
    private hasTriggeredForCurrentVideo = false;

    /**
     * Finds the active video element on the page.
     * Selects the video that is closest to the center of the viewport.
     */
    findActiveVideo(): HTMLVideoElement | null {
        const videos = Array.from(document.querySelectorAll('video'));
        
        if (videos.length === 0) return null;

        // Find the video closest to the center of the screen
        const centerY = window.innerHeight / 2;
        const centerX = window.innerWidth / 2;

        let closestVideo: HTMLVideoElement | null = null;
        let minDistance = Infinity;

        for (const video of videos) {
            const rect = video.getBoundingClientRect();
            
            // Skip videos that are essentially hidden or off-screen
            if (rect.height === 0 || rect.width === 0) continue;

            // Calculate distance from center of video to center of viewport
            const videoY = rect.top + (rect.height / 2);
            const videoX = rect.left + (rect.width / 2);
            
            const distance = Math.sqrt(
                Math.pow(videoY - centerY, 2) + 
                Math.pow(videoX - centerX, 2)
            );

            if (distance < minDistance) {
                minDistance = distance;
                closestVideo = video;
            }
        }

        return closestVideo;
    }

    /**
     * Observes a video element for the end of playback.
     */
    observeVideo(video: HTMLVideoElement, callback: () => void) {
        // Prevent redundant observation
        if (this.currentVideo === video) {
            return;
        }

        // Clean up previous listeners if switching videos (e.g. user manual scroll)
        this.cleanup();

        console.log('Autro Scroller: locking onto new video', video);
        this.currentVideo = video;
        this.onEndCallback = callback;
        this.hasTriggeredForCurrentVideo = false;

        // Listen for the standard 'ended' event
        video.addEventListener('ended', this.handleVideoEnd);

        // Fallback for looping videos: monitor timeupdate
        video.addEventListener('timeupdate', this.handleTimeUpdate);
    }

    private handleVideoEnd = (event: Event) => {
        // Safety check: Ensure the event comes from the currently observed video
        if (event.target !== this.currentVideo) {
            return;
        }

        if (!this.hasTriggeredForCurrentVideo && this.onEndCallback) {
            console.log('Autro Scroller: Video ended (event)');
            this.hasTriggeredForCurrentVideo = true;
            this.onEndCallback();
        }
    };

    private handleTimeUpdate = (event: Event) => {
        // Safety check: Ensure the event comes from the currently observed video
        if (event.target !== this.currentVideo) {
            return;
        }

        if (!this.currentVideo || !this.onEndCallback || this.hasTriggeredForCurrentVideo) {
            return;
        }

        // Don't trigger if the video is paused (user intervention)
        if (this.currentVideo.paused) {
            return;
        }

        // Don't trigger if a content warning/overlay is detected
        if (this.isOverlayPresent()) {
            // Only log once to avoid spam
            // console.log('Autro Scroller: Overlay detected, pausing auto-scroll');
            return;
        }

        const video = this.currentVideo;
        // If we are within 750ms of the end, consider it finished.
        // Increased from 250ms to ensure we catch fast loops or sparse timeupdate events.
        if (video.duration > 0 && video.currentTime > video.duration - 0.75) {
            console.log('Autro Scroller: Video nearing end (loop detection)', video.currentTime.toFixed(2), '/', video.duration.toFixed(2));
            this.hasTriggeredForCurrentVideo = true;
            this.onEndCallback();
        }
    };

    private isOverlayPresent(): boolean {
        // Search for keywords associated with Instagram's "Sensitive Content" or "Content Warning"
        const keywords = ['Sensitive Content', 'Content Warning', 'Sensitive content'];
        const bodyText = document.body.innerText || '';
        
        // Check for keywords
        const hasKeyword = keywords.some(kw => bodyText.includes(kw));
        
        // Also check for 'Watch Reel' button which often appears on paused/overlayed reels
        const watchReelButton = Array.from(document.querySelectorAll('button'))
            .some(btn => btn.innerText.includes('Watch Reel'));
        
        return hasKeyword || watchReelButton;
    }

    /**
     * Cleans up listeners from the current video.
     */
    cleanup() {
        if (this.currentVideo) {
            this.currentVideo.removeEventListener('ended', this.handleVideoEnd);
            this.currentVideo.removeEventListener('timeupdate', this.handleTimeUpdate);
        }
        this.currentVideo = null;
        this.onEndCallback = null;
    }
}
