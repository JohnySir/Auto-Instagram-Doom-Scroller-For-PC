/**
 * Initializes the popup UI and sets up event listeners for settings persistence.
 */
export async function initPopup() {
    const toggle = document.getElementById('autoScrollToggle') as HTMLInputElement;
    const delayInput = document.getElementById('scrollDelay') as HTMLInputElement;
    const statusIndicator = document.getElementById('status');
    const footerStatus = document.getElementById('footerStatus');

    if (!toggle || !delayInput || !statusIndicator || !footerStatus) {
        return;
    }

    // Load settings from storage
    chrome.storage.local.get(['autoScrollEnabled', 'scrollDelay'], (result) => {
        if (result.autoScrollEnabled !== undefined && result.autoScrollEnabled !== null) {
            const enabled = result.autoScrollEnabled as boolean;
            toggle.checked = enabled;
            updateStatusUI(enabled, statusIndicator, footerStatus);
        } else {
            // Default to enabled if not set
            toggle.checked = true;
            updateStatusUI(true, statusIndicator, footerStatus);
        }

        if (result.scrollDelay !== undefined && result.scrollDelay !== null) {
            const delay = result.scrollDelay as number;
            delayInput.value = delay.toString();
        }
    });

    // Save settings when they change
    toggle.addEventListener('change', () => {
        const enabled = toggle.checked;
        chrome.storage.local.set({ autoScrollEnabled: enabled }, () => {
            updateStatusUI(enabled, statusIndicator, footerStatus);
        });
    });

    delayInput.addEventListener('change', () => {
        const delay = parseFloat(delayInput.value);
        if (!isNaN(delay)) {
            chrome.storage.local.set({ scrollDelay: delay }, () => {
                console.log('Scroll delay updated to:', delay);
            });
        }
    });
}

function updateStatusUI(enabled: boolean, indicator: HTMLElement, footer: HTMLElement) {
    if (enabled) {
        indicator.classList.add('active');
        footer.textContent = "It's Scrolling Time..";
        footer.className = 'active';
    } else {
        indicator.classList.remove('active');
        footer.textContent = "Auto-Scroll Disabled";
        footer.className = 'disabled';
    }
}

// Auto-initialize if running in a browser environment (not in a test that calls initPopup manually)
if (typeof document !== 'undefined' && (window as any).process?.env?.NODE_ENV !== 'test') {
    document.addEventListener('DOMContentLoaded', initPopup);
}
