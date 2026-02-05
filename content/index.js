"use strict";
(() => {
  // src/content/video-detector.ts
  var VideoDetector = class {
    constructor() {
      this.currentVideo = null;
      this.onEndCallback = null;
      this.hasTriggeredForCurrentVideo = false;
      this.handleVideoEnd = (event) => {
        if (event.target !== this.currentVideo) {
          return;
        }
        if (!this.hasTriggeredForCurrentVideo && this.onEndCallback) {
          console.log("Autro Scroller: Video ended (event)");
          this.hasTriggeredForCurrentVideo = true;
          this.onEndCallback();
        }
      };
      this.handleTimeUpdate = (event) => {
        if (event.target !== this.currentVideo) {
          return;
        }
        if (!this.currentVideo || !this.onEndCallback || this.hasTriggeredForCurrentVideo) {
          return;
        }
        if (this.currentVideo.paused) {
          return;
        }
        if (this.isOverlayPresent()) {
          return;
        }
        const video = this.currentVideo;
        if (video.duration > 0 && video.currentTime > video.duration - 0.75) {
          console.log("Autro Scroller: Video nearing end (loop detection)", video.currentTime.toFixed(2), "/", video.duration.toFixed(2));
          this.hasTriggeredForCurrentVideo = true;
          this.onEndCallback();
        }
      };
    }
    /**
     * Finds the active video element on the page.
     * Selects the video that is closest to the center of the viewport.
     */
    findActiveVideo() {
      const videos = Array.from(document.querySelectorAll("video"));
      if (videos.length === 0) return null;
      const centerY = window.innerHeight / 2;
      const centerX = window.innerWidth / 2;
      let closestVideo = null;
      let minDistance = Infinity;
      for (const video of videos) {
        const rect = video.getBoundingClientRect();
        if (rect.height === 0 || rect.width === 0) continue;
        const videoY = rect.top + rect.height / 2;
        const videoX = rect.left + rect.width / 2;
        const distance = Math.sqrt(
          Math.pow(videoY - centerY, 2) + Math.pow(videoX - centerX, 2)
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
    observeVideo(video, callback) {
      if (this.currentVideo === video) {
        return;
      }
      this.cleanup();
      console.log("Autro Scroller: locking onto new video", video);
      this.currentVideo = video;
      this.onEndCallback = callback;
      this.hasTriggeredForCurrentVideo = false;
      video.addEventListener("ended", this.handleVideoEnd);
      video.addEventListener("timeupdate", this.handleTimeUpdate);
    }
    isOverlayPresent() {
      const keywords = ["Sensitive Content", "Content Warning", "Sensitive content"];
      const bodyText = document.body.innerText || "";
      const hasKeyword = keywords.some((kw) => bodyText.includes(kw));
      const watchReelButton = Array.from(document.querySelectorAll("button")).some((btn) => btn.innerText.includes("Watch Reel"));
      return hasKeyword || watchReelButton;
    }
    /**
     * Cleans up listeners from the current video.
     */
    cleanup() {
      if (this.currentVideo) {
        this.currentVideo.removeEventListener("ended", this.handleVideoEnd);
        this.currentVideo.removeEventListener("timeupdate", this.handleTimeUpdate);
      }
      this.currentVideo = null;
      this.onEndCallback = null;
    }
  };

  // src/content/scroller.ts
  var Scroller = class {
    constructor() {
      this.timeoutId = null;
    }
    /**
     * Executes a scroll to the next Reel.
     * @param delayMs Optional delay in milliseconds before scrolling.
     * @param contextElement Optional element (e.g. the video) to use as a context for finding the scroll container.
     */
    scrollNext(delayMs = 0, contextElement) {
      this.cancelPendingScroll();
      if (delayMs > 0) {
        this.timeoutId = window.setTimeout(() => {
          this.performScroll(contextElement);
        }, delayMs);
      } else {
        this.performScroll(contextElement);
      }
    }
    performScroll(contextElement) {
      console.log("Autro Scroller: Performing scroll action...");
      if (document.activeElement instanceof HTMLInputElement || document.activeElement instanceof HTMLTextAreaElement) {
        console.log("Autro Scroller: Input focused, blurring to allow scroll");
        document.activeElement.blur();
      }
      window.focus();
      if (document.body) {
        document.body.focus();
      }
      let actionTaken = false;
      const keyOptions = {
        key: "ArrowDown",
        code: "ArrowDown",
        keyCode: 40,
        which: 40,
        bubbles: true,
        cancelable: true,
        composed: true,
        view: window
      };
      document.dispatchEvent(new KeyboardEvent("keydown", keyOptions));
      document.dispatchEvent(new KeyboardEvent("keyup", keyOptions));
      let startNode = null;
      if (contextElement && contextElement.isConnected) {
        startNode = contextElement;
      } else {
        const centerElement = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2);
        startNode = centerElement;
      }
      if (startNode) {
        let el = startNode;
        while (el && el !== document.body) {
          const style = window.getComputedStyle(el);
          const overflowY = style.overflowY;
          const isScrollable = (overflowY === "auto" || overflowY === "scroll") && el.scrollHeight > el.clientHeight;
          if (isScrollable) {
            console.log("Autro Scroller: Found scroll container:", el.className);
            el.scrollBy({ top: el.clientHeight, behavior: "smooth" });
            el.focus({ preventScroll: true });
            el.dispatchEvent(new KeyboardEvent("keydown", keyOptions));
            el.dispatchEvent(new KeyboardEvent("keyup", keyOptions));
            actionTaken = true;
            break;
          }
          el = el.parentElement;
        }
      }
      if (!actionTaken) {
        if (this.clickNextButton()) {
          console.log("Autro Scroller: Clicked next button");
          actionTaken = true;
        }
      }
      if (!actionTaken) {
        console.log("Autro Scroller: No specific container found, using window scroll");
        window.scrollBy({ top: window.innerHeight, behavior: "smooth" });
      }
    }
    clickNextButton() {
      const selectors = [
        'div[role="button"][aria-label="Next"]',
        'button[aria-label="Next"]',
        'button[aria-label="Next Reel"]',
        'svg[aria-label="Next"]',
        'svg[aria-label="Next Reel"]'
      ];
      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        for (let i = 0; i < elements.length; i++) {
          const element = elements[i];
          const clickable = element.closest('[role="button"]') || element.closest("button") || element;
          if (clickable) {
            clickable.click();
            return true;
          }
        }
      }
      return false;
    }
    /**
     * Cancels any pending scroll timeout.
     */
    cancelPendingScroll() {
      if (this.timeoutId !== null) {
        window.clearTimeout(this.timeoutId);
        this.timeoutId = null;
      }
    }
  };

  // src/content/index.ts
  var autoScrollEnabled = true;
  var scrollDelay = 2e3;
  var detector = new VideoDetector();
  var scroller = new Scroller();
  async function init() {
    console.log("Autro Scroller: Initializing...");
    chrome.storage.local.get(["autoScrollEnabled", "scrollDelay"], (result) => {
      autoScrollEnabled = result.autoScrollEnabled ?? true;
      scrollDelay = (result.scrollDelay ?? 2) * 1e3;
      if (autoScrollEnabled) {
        startObserving();
      }
    });
    chrome.storage.local.onChanged.addListener((changes) => {
      handleStorageChange(changes, scroller);
    });
    const observer = new MutationObserver(() => {
      if (autoScrollEnabled) {
        startObserving();
      }
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible" && autoScrollEnabled) {
        console.log("Autro Scroller: Tab visible, refreshing detection");
        startObserving();
      }
    });
    setInterval(() => {
      if (autoScrollEnabled) {
        startObserving();
      }
    }, 2e3);
  }
  function handleStorageChange(changes, currentScroller) {
    if (changes.autoScrollEnabled) {
      autoScrollEnabled = changes.autoScrollEnabled.newValue;
      if (!autoScrollEnabled) {
        currentScroller.cancelPendingScroll();
        detector.cleanup();
      }
    }
    if (changes.scrollDelay) {
      scrollDelay = changes.scrollDelay.newValue * 1e3;
    }
  }
  function startObserving() {
    const video = detector.findActiveVideo();
    if (video) {
      detector.observeVideo(video, () => {
        console.log("Autro Scroller: Video ended, scrolling in", scrollDelay, "ms");
        scroller.scrollNext(scrollDelay, video);
        setTimeout(() => {
          detector.cleanup();
          startObserving();
        }, scrollDelay + 800);
      });
    }
  }
  if (typeof document !== "undefined") {
    init();
  }
})();
