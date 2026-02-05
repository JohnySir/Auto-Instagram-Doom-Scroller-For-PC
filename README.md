# 💀 AutoDoom Scroller

---

## 📦 Installation (Developer Guide)

Follow these steps to build and run the **AutoDoom Scroller** from source.

### Step 1: Clone the Repository
Open your terminal and run:
```bash
git clone https://github.com/JohnySir/Auto-Instagram-Doom-Scroller-For-PC.git
cd Auto-Instagram-Doom-Scroller-For-PC
```

### Step 2: Install Dependencies & Build
You will need [Node.js](https://nodejs.org/) installed on your system.
1.  **Install the necessary packages:**
    ```bash
    npm install
    ```
2.  **Compile the extension:**
    ```bash
    npm run build
    ```
    This command generates a `dist` folder containing the bundled code and assets.

### Step 3: Load into Chrome
1.  Open Google Chrome and navigate to `chrome://extensions`.
2.  In the top-right corner, toggle **Developer mode** to **ON**.
3.  Click the **Load unpacked** button.
4.  Navigate to your project directory and select the **`dist`** folder.
5.  **Success!** "AutoDoom Scroller" is now active in your browser.

---

## 🎮 How to Use

1.  **Enter the Void:** Go to `instagram.com/reels`.
2.  **Initiate:** Click on any reel to open the viewer.
3.  **Hands-Free:** The extension takes over. It will scroll. You will watch.
4.  **Tweak the Machine:** Click the puzzle piece icon 🧩 in your Chrome toolbar, find **AutoDoom Scroller**, and pin it. Click the icon to:
    *   Pause the scrolling.
    *   Change the speed (faster for chaos, slower for comfort).

---

## 🛠️ The Mechanism

Under the hood, **AutoDoom Scroller** employs aggressive heuristics to maintain the flow:
*   **Video Observer:** Hooks into `ended` and `timeupdate` events.
*   **Aggressive Scrolling:** Uses a multi-tiered approach (Button clicks -> Scroll container -> Window scroll).
*   **State Persistence:** Remembers your preferences.
