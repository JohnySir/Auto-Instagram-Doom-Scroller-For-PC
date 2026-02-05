export class Scroller {
    private timeoutId: number | null = null;

    /**
     * Executes a scroll to the next Reel.
     * @param delayMs Optional delay in milliseconds before scrolling.
     * @param contextElement Optional element (e.g. the video) to use as a context for finding the scroll container.
     */
    scrollNext(delayMs: number = 0, contextElement?: HTMLElement) {
        this.cancelPendingScroll();

        if (delayMs > 0) {
            this.timeoutId = window.setTimeout(() => {
                this.performScroll(contextElement);
            }, delayMs);
        } else {
            this.performScroll(contextElement);
        }
    }

    private performScroll(contextElement?: HTMLElement) {
        console.log('Autro Scroller: Performing scroll action...');
        
        // Step 0: Focus Management
        if (document.activeElement instanceof HTMLInputElement || document.activeElement instanceof HTMLTextAreaElement) {
             console.log('Autro Scroller: Input focused, blurring to allow scroll');
             document.activeElement.blur();
        }
        
        // Force focus to body
        window.focus();
        if (document.body) {
            document.body.focus();
        }

        let actionTaken = false;
        
        // Method 1: Dispatch ArrowDown (Global)
        // This is the "Native" way Instagram expects navigation.
        const keyOptions = {
            key: 'ArrowDown',
            code: 'ArrowDown',
            keyCode: 40,
            which: 40,
            bubbles: true,
            cancelable: true,
            composed: true,
            view: window
        };
        document.dispatchEvent(new KeyboardEvent('keydown', keyOptions));
        document.dispatchEvent(new KeyboardEvent('keyup', keyOptions));

        // Method 2: Find the Scroll Container
        // We need to find the specific div that has "overflow-y: scroll"
        
        // Strategy A: Use the video element context
        let startNode: HTMLElement | null = null;
        if (contextElement && contextElement.isConnected) {
            startNode = contextElement;
        } else {
            // Strategy B: Use the center of the screen
            const centerElement = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2);
            startNode = centerElement as HTMLElement;
        }

        if (startNode) {
            let el: HTMLElement | null = startNode;
            while (el && el !== document.body) {
                const style = window.getComputedStyle(el);
                const overflowY = style.overflowY;
                const isScrollable = (overflowY === 'auto' || overflowY === 'scroll') && el.scrollHeight > el.clientHeight;

                if (isScrollable) {
                    console.log('Autro Scroller: Found scroll container:', el.className);
                    
                    // 1. Programmatic Scroll
                    // We use 'smooth' for UX, but if the system is overloaded, it might lag.
                    el.scrollBy({ top: el.clientHeight, behavior: 'smooth' });
                    
                    // 2. Focused Key Dispatch (Backup for programmatic)
                    // Some frameworks listen to keys ON the container
                    el.focus({ preventScroll: true }); 
                    el.dispatchEvent(new KeyboardEvent('keydown', keyOptions));
                    el.dispatchEvent(new KeyboardEvent('keyup', keyOptions));
                    
                    actionTaken = true;
                    break; 
                }
                el = el.parentElement;
            }
        }

        // Method 3: Click "Next" button (Fallback)
        // If we didn't find a container, OR if we want to be double sure.
        // We only do this if we haven't scrolled a container yet, to avoid double-jumping.
        if (!actionTaken) {
            if (this.clickNextButton()) {
                console.log('Autro Scroller: Clicked next button');
                actionTaken = true;
            }
        }
        
        // Method 4: Last Resort - Window Scroll
        if (!actionTaken) {
             console.log('Autro Scroller: No specific container found, using window scroll');
             window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
        }
    }

    private clickNextButton(): boolean {
        // Instagram Reels "Next" button selectors
        // These are based on common ARIA labels and SVG paths found in the Reels UI
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
                // Determine if this element is likely the button (e.g., clickable parent)
                // Often the SVG is inside the button div
                const element = elements[i];
                const clickable = element.closest('[role="button"]') as HTMLElement || element.closest('button') as HTMLElement || element as HTMLElement;
                
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
}
