# Simple Checklist — Do These In Order

You’ve already added the app code. Just work through this list. One thing at a time.

---

## ✅ Step 1: Fix Info.plist

1. In the **left sidebar**, click the **blue "HoroscopeApp"** project icon at the very top.
2. In the middle, under **TARGETS**, click **HoroscopeApp**.
3. Click the **Build Settings** tab (in the row with General, Signing & Capabilities, etc.).
4. In the **search box** (top right of that area), type: **Info.plist**
5. Find the row **"Info.plist File"**.
6. Double‑click the value (it might say "HoroscopeApp" or something else).
7. Type: **HoroscopeApp/Info.plist**
8. Press **Enter**.

---

## ✅ Step 2: Add App Groups (main app)

1. Stay on **TARGETS → HoroscopeApp**.
2. Click the **Signing & Capabilities** tab.
3. Click **+ Capability**.
4. In the list, double‑click **App Groups**.
5. Under "App Groups", click the **+** button.
6. Type: **group.com.horoscope.app**
7. Press **Enter**.

---

## ✅ Step 3: Add the Widget

1. **File** (top menu) → **New** → **Target...**
2. Choose **Widget Extension** (under iOS) → **Next**.
3. **Product Name:** `HoroscopeWidget`
4. **Uncheck** "Include Configuration Intent".
5. **Finish**. If it says "Activate HoroscopeWidget scheme?" → click **Cancel**.
6. In the **left sidebar**, find **HoroscopeWidget**. Open it.
7. **Right‑click** the file that says something like "Hello World" or similar → **Delete** → **Move to Trash**.
8. **File** → **Add Files to "HoroscopeApp"...**
9. Go to your **horoscope-app** folder (Desktop → Code → horoscope-app).
10. **Click** the **HoroscopeWidget** folder (the one with our widget code).
11. At the bottom: **Add to targets** → check **HoroscopeWidgetExtension** only. Leave **HoroscopeApp** unchecked.
12. **Add**.
13. In the left sidebar, click the **blue "HoroscopeApp"** project icon.
14. Under **TARGETS**, click **HoroscopeWidgetExtension**.
15. Open **Signing & Capabilities** → **+ Capability** → **App Groups**.
16. **+** → type **group.com.horoscope.app** → **Enter**.

---

## ✅ Step 4: Share 6 Files With the Widget

1. In the **left sidebar**, go into **HoroscopeApp 2** → **Models**.
2. **Click** `ZodiacSign.swift`.
3. Hold **⌘** (Command) and **click** these too: `HoroscopeStyle.swift`, `HoroscopeSlot.swift`, `Horoscope.swift`.
4. Now go to **HoroscopeApp 2** → **Services**. Hold **⌘** and **click** `Constants.swift` and `DateProvider.swift`.
5. You should have **6 files** selected.
6. Look at the **right sidebar**. If you don’t see it: **View** → **Inspectors** → **Show File Inspector** (or **⌘⌥1**).
7. Find **"Target Membership"**.
8. **Check** the box for **HoroscopeWidgetExtension** for all 6 files (HoroscopeApp can stay checked too).

---

## ✅ Step 5: Add Firebase

1. **File** → **Add Package Dependencies...**
2. In the search box (top right), paste: **https://github.com/firebase/firebase-ios-sdk**
3. Click **Add Package** (bottom right).
4. When it shows a list, **check** **FirebaseAuth** and **FirebaseFirestore**.
5. Make sure **HoroscopeApp** is selected under "Add to Target". **Don’t** add to the widget.
6. **Add Package**.
7. Go to [Firebase Console](https://console.firebase.google.com) in your browser.
8. Create a project (or use one you have).
9. **Add app** → **iOS**.
10. **Bundle ID:** **com.onurgul.HoroscopeApp** (exactly that).
11. Download **GoogleService-Info.plist**.
12. In Xcode: **drag** that file from Finder into the **HoroscopeApp 2** group in the left sidebar. When the dialog appears, check **HoroscopeApp** only → **Finish**.

---

## ✅ Step 6: Run the App

1. At the **top** of Xcode, next to the Play button, you’ll see **"HoroscopeApp"** and **"iPhone 17 Pro"**.
2. Click that if you need to change it. Make sure it says **HoroscopeApp** (not HoroscopeWidget) and **iPhone 17 Pro** (or any iPhone simulator).
3. Press **⌘R** (or click the **Play** ▶️ button).
4. The simulator will open and the app will launch.

---

## If Something Breaks

- **Red errors about Firebase:** Make sure you added the Firebase package (Step 5) and **GoogleService-Info.plist**.
- **Widget errors about ZodiacSign / Horoscope / etc.:** Redo Step 4 — those 6 files must have **HoroscopeWidgetExtension** checked.
- **"No such module"**: **Product** → **Clean Build Folder** (⌘⇧K), then **Product** → **Build** (⌘B).

---

**You’re not lost — you’re on Step 1.** Do that, then Step 2, and so on. Ignore everything else until you’ve run the app (Step 6).
