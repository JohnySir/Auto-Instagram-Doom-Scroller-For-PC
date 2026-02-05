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

## 📦 How to Install (The Noob-Friendly Guide)

Follow these simple steps to get the **AutoDoom Scroller** running on your browser. You don't need to be a coder!

### Step 1: Get the Code
You have two options. Choose the one that sounds easier:

*   **Option A: The "Download" Method (Easiest)**
    1.  Scroll to the top of this GitHub page.
    2.  Click the green **<> Code** button.
    3.  Select **Download ZIP**.
    4.  Find the downloaded file on your computer and **Unzip/Extract** it to a folder you can easily find (like your Desktop or Documents).

*   **Option B: The "Hacker" Method (Git)**
    1.  Open your terminal or command prompt.
    2.  Run this command:
        ```bash
        git clone https://github.com/JohnySir/Auto-Instagram-Doom-Scroller-For-PC.git
        ```

### Step 2: Load into Chrome
1.  Open the Google Chrome browser.
2.  In the address bar, type `chrome://extensions` and hit Enter.
3.  **Crucial Step:** Look at the top-right corner and turn on the switch that says **Developer mode**.
4.  A new menu will appear. Click the button that says **Load unpacked**.
5.  Navigate to the folder you just downloaded (or unzipped).
    *   *Note:* Select the **`dist`** folder inside if you see one. If not, select the main folder containing `manifest.json`.
6.  **Success!** You should now see "AutoDoom Scroller" in your list of extensions.

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
