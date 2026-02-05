"use strict";
(() => {
  // src/popup/popup.ts
  async function initPopup() {
    const toggle = document.getElementById("autoScrollToggle");
    const delayInput = document.getElementById("scrollDelay");
    const statusIndicator = document.getElementById("status");
    const footerStatus = document.getElementById("footerStatus");
    if (!toggle || !delayInput || !statusIndicator || !footerStatus) {
      return;
    }
    chrome.storage.local.get(["autoScrollEnabled", "scrollDelay"], (result) => {
      if (result.autoScrollEnabled !== void 0 && result.autoScrollEnabled !== null) {
        const enabled = result.autoScrollEnabled;
        toggle.checked = enabled;
        updateStatusUI(enabled, statusIndicator, footerStatus);
      } else {
        toggle.checked = true;
        updateStatusUI(true, statusIndicator, footerStatus);
      }
      if (result.scrollDelay !== void 0 && result.scrollDelay !== null) {
        const delay = result.scrollDelay;
        delayInput.value = delay.toString();
      }
    });
    toggle.addEventListener("change", () => {
      const enabled = toggle.checked;
      chrome.storage.local.set({ autoScrollEnabled: enabled }, () => {
        updateStatusUI(enabled, statusIndicator, footerStatus);
      });
    });
    delayInput.addEventListener("change", () => {
      const delay = parseFloat(delayInput.value);
      if (!isNaN(delay)) {
        chrome.storage.local.set({ scrollDelay: delay }, () => {
          console.log("Scroll delay updated to:", delay);
        });
      }
    });
  }
  function updateStatusUI(enabled, indicator, footer) {
    if (enabled) {
      indicator.classList.add("active");
      footer.textContent = "It's Scrolling Time..";
      footer.className = "active";
    } else {
      indicator.classList.remove("active");
      footer.textContent = "Auto-Scroll Disabled";
      footer.className = "disabled";
    }
  }
  if (typeof document !== "undefined" && window.process?.env?.NODE_ENV !== "test") {
    document.addEventListener("DOMContentLoaded", initPopup);
  }
})();
