"use strict";
(() => {
  // src/content/video-detector.ts
  var VideoDetector = class {
    constructor() {
      this.currentVideo = null;
      this.onEndCallback = null;
      this.hasTriggeredForCurrentVideo = false;
      this.handleVideoEnd = () => {
        if (!this.hasTriggeredForCurrentVideo && this.onEndCallback) {
          this.hasTriggeredForCurrentVideo = true;
          this.onEndCallback();
        }
      };
      this.handleTimeUpdate = () => {
        if (!this.currentVideo || !this.onEndCallback || this.hasTriggeredForCurrentVideo) {
          return;
        }
        if (this.currentVideo.paused) {
          return;
        }
        if (this.isOverlayPresent()) {
          console.log("Autro Scroller: Overlay detected, pausing auto-scroll");
          return;
        }
        const video = this.currentVideo;
        if (video.duration > 0 && video.currentTime > video.duration - 0.25) {
          console.log("Autro Scroller: Video nearing end (loop detection)");
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
     */
    scrollNext(delayMs = 0) {
      this.cancelPendingScroll();
      if (delayMs > 0) {
        this.timeoutId = window.setTimeout(() => {
          this.performScroll();
        }, delayMs);
      } else {
        this.performScroll();
      }
    }
    performScroll() {
      console.log("Autro Scroller: Performing scroll action (Aggressive Search)...");
      if (document.activeElement instanceof HTMLInputElement || document.activeElement instanceof HTMLTextAreaElement) {
        console.log("Autro Scroller: Input focused, blurring to allow scroll");
        document.activeElement.blur();
      }
      window.focus();
      document.body.focus();
      if (this.clickNextButton()) {
        console.log("Autro Scroller: Clicked next button");
        return;
      }
      const allDivs = document.querySelectorAll("div");
      let scrolled = false;
      for (let i = 0; i < allDivs.length; i++) {
        const el = allDivs[i];
        if (el.scrollHeight > el.clientHeight && el.clientHeight > 0) {
          const style = window.getComputedStyle(el);
          if (style.overflowY === "auto" || style.overflowY === "scroll" || style.overflowY === "visible") {
            if (el.clientHeight > window.innerHeight * 0.5) {
              console.log("Autro Scroller: Found likely scroll container:", el.className);
              el.scrollBy({ top: el.clientHeight, behavior: "smooth" });
              el.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", code: "ArrowDown", bubbles: true }));
              scrolled = true;
            }
          }
        }
      }
      if (!scrolled) {
        console.log("Autro Scroller: No scrollable divs found, forcing window scroll");
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
        scroller.scrollNext(scrollDelay);
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
