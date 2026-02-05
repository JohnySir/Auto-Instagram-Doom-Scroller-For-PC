# 💀 AutoDoom Scroller
> *Your hands-free ticket to the infinite abyss.*

**AutoDoom Scroller** is the ultimate enabler for your content consumption habits. It blends the utility of an **Auto Scroller** with the relentless nature of **Doomscrolling**. Why lift a finger when you can let the machine do the work? This extension automates your Instagram Reels experience, ensuring the stream never stops.

---

## ✨ Features

### 🧠 Relentless Video Detection
*   **Locked On Target:** Automatically identifies and seizes the active video in your viewport.
*   **Zero Downtime:** Triggers the next hit exactly when a video ends.
*   **Loop Breaker:** Intelligently detects when a video is about to loop to keep the stream moving.

### 🛡️ Uninterrupted Consumption
*   **Overlay Bypass:** Pauses only for "Sensitive Content" gates, ensuring you don't miss context.
*   **Focus Enforcer:** Automatically blurs search bars so nothing stops the scroll.

### ⚙️ Control The Flow
*   **Toggle On/Off:** A master switch to start or stop the automated descent.
*   **Pacing Control:** Adjust the "digest time" between reels. Default is **2 seconds**.

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
