import { VideoDetector } from './video-detector';
import { Scroller } from './scroller';

let autoScrollEnabled = true;
let scrollDelay = 2000;
const detector = new VideoDetector();
const scroller = new Scroller();

/**
 * Main entry point for the content script.
 */
async function init() {
    console.log('Autro Scroller: Initializing...');

    // Load initial settings
    chrome.storage.local.get(['autoScrollEnabled', 'scrollDelay'], (result) => {
        autoScrollEnabled = (result.autoScrollEnabled as boolean) ?? true;
        scrollDelay = ((result.scrollDelay as number) ?? 2) * 1000;
        
        if (autoScrollEnabled) {
            startObserving();
        }
    });

    // Listen for setting changes
    chrome.storage.local.onChanged.addListener((changes) => {
        handleStorageChange(changes, scroller);
    });

    // Use MutationObserver to detect when the UI changes (e.g. scrolling to a new reel)
    const observer = new MutationObserver(() => {
        if (autoScrollEnabled) {
            startObserving();
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Refresh detection when tab becomes visible again
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && autoScrollEnabled) {
            console.log('Autro Scroller: Tab visible, refreshing detection');
            startObserving();
        }
    });

    // Fallback interval
    setInterval(() => {
        if (autoScrollEnabled) {
            startObserving();
        }
    }, 2000);
}

/**
 * Handles changes to the extension's settings.
 */
export function handleStorageChange(changes: { [key: string]: chrome.storage.StorageChange }, currentScroller: Scroller) {
    if (changes.autoScrollEnabled) {
        autoScrollEnabled = changes.autoScrollEnabled.newValue as boolean;
        if (!autoScrollEnabled) {
            currentScroller.cancelPendingScroll();
            detector.cleanup();
        }
    }
    if (changes.scrollDelay) {
        scrollDelay = (changes.scrollDelay.newValue as number) * 1000;
    }
}

function startObserving() {
    const video = detector.findActiveVideo();
    if (video) {
        detector.observeVideo(video, () => {
            console.log('Autro Scroller: Video ended, scrolling in', scrollDelay, 'ms');
            scroller.scrollNext(scrollDelay, video);
            
            // After scrolling, we wait for the transition
            setTimeout(() => {
                detector.cleanup();
                startObserving();
            }, scrollDelay + 800); // Reduced from 1500ms for snappier feel
        });
    }
}

// Start the script
if (typeof document !== 'undefined') {
    init();
}