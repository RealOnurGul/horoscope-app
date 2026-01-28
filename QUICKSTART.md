# How to Run the Horoscope App (First Time with Swift)

You need **Xcode** on your Mac (free from the App Store). Then you create a project once and add this code into it.

---

## 1. Install Xcode

- Open **App Store** on your Mac → search **Xcode** → Install.
- Open Xcode once and accept the license if asked.

---

## 2. Create a New App Project

1. Open **Xcode**.
2. **File → New → Project** (or welcome screen: “Create a new Xcode project”).
3. Choose **iOS → App** → Next.
4. Set:
   - **Product Name:** `HoroscopeApp`
   - **Team:** your Apple ID (or “Add Account” and sign in)
   - **Organization Identifier:** e.g. `com.yourname`
   - **Interface:** SwiftUI  
   - **Language:** Swift  
   - **Storage:** None  
   - Uncheck “Include Tests” if you want.
5. Click **Next**, choose the **horoscope-app** folder as the project location, then **Create**.

You now have a project with one target and a default `ContentView`.

---

## 3. Replace the Project with This Code

1. In the **left sidebar** (Project Navigator), find the **HoroscopeApp** folder and the file **ContentView.swift** (and any **HoroscopeAppApp.swift** or similar).
2. **Right‑click the HoroscopeApp group** (the yellow folder) → **Delete** → choose **“Remove Reference”** (we only remove it from the project; files stay on disk).
3. **File → Add Files to "HoroscopeApp"...**
4. Go to your **horoscope-app** folder** and select the **HoroscopeApp** folder (the one that contains `HoroscopeApp.swift`, `Models`, `Views`, etc.).
5. In the dialog:
   - **Copy items if needed:** off (files already there).
   - **Added folders:** “Create groups”.
   - **Add to targets:** check **HoroscopeApp** only.
6. Click **Add**.

7. In the left sidebar, find **HoroscopeApp.swift**.  
   If Xcode created a default app file (e.g. `HoroscopeAppApp.swift`), **delete** that default one so only **HoroscopeApp.swift** from our code is the app entry (it has `@main`).

8. **Entitlements:**
   - In the sidebar, select the blue **HoroscopeApp** project icon.
   - Select the **HoroscopeApp** target → **Signing & Capabilities**.
   - Click **+ Capability** → **App Groups** → double‑click the group and set it to: **group.com.horoscope.app**
   - If you see “No such file” for entitlements, Xcode will offer to create one; say **Create**.

9. **Info.plist:**  
   Our app has **HoroscopeApp/Info.plist**.  
   In target **HoroscopeApp** → **Build Settings** → search “Info.plist” → set **Info.plist File** to: **HoroscopeApp/Info.plist** (path relative to project).

---

## 4. Add the Widget Extension

1. **File → New → Target...**
2. Choose **iOS → Widget Extension** → Next.
3. **Product Name:** `HoroscopeWidget`  
   Uncheck **“Include Configuration Intent”**.
4. **Finish**. If asked “Activate HoroscopeWidget scheme?”, click **Activate**.

5. Delete the **auto‑generated** Swift files inside the new **HoroscopeWidget** group (e.g. one that says “Hello World” or similar).

6. **File → Add Files to "HoroscopeApp"...**
   - Select the **HoroscopeWidget** folder from your **horoscope-app** folder (the one with `HoroscopeWidget.swift`, `WidgetProvider.swift`, etc.).
   - **Copy items if needed:** off.
   - **Create groups.**
   - **Add to targets:** check **HoroscopeWidgetExtension** only.
   - Click **Add**.

7. **HoroscopeWidget** target → **Signing & Capabilities** → **+ Capability** → **App Groups** → same ID: **group.com.horoscope.app**.

8. **Share code with the widget** (so it can use models and constants):
   - In the Project Navigator, select these files (hold **Cmd** to multi‑select):
     - `ZodiacSign.swift`
     - `HoroscopeStyle.swift`
     - `HoroscopeSlot.swift`
     - `Horoscope.swift`
     - `Constants.swift`
     - `DateProvider.swift`
   - In the **right panel** (File Inspector), under **Target Membership**, check **HoroscopeWidgetExtension** for each of these files.

---

## 5. Add Firebase (So the App Can Load Horoscopes)

1. **File → Add Package Dependencies...**
2. In the search field paste: `https://github.com/firebase/firebase-ios-sdk`
3. Add the package; then add these two **products** to the **HoroscopeApp** target only:
   - **FirebaseAuth**
   - **FirebaseFirestore**

4. In [Firebase Console](https://console.firebase.google.com):
   - Create a project (or use existing).
   - Add an **iOS app** with the same **Bundle ID** as your HoroscopeApp target.
   - Download **GoogleService-Info.plist**.
   - Enable **Authentication → Anonymous** and **Firestore Database**.

5. In Xcode: drag **GoogleService-Info.plist** into the **HoroscopeApp** group; when asked, tick **HoroscopeApp** target only and **Copy items if needed**.

Without this, the app still runs but will show that Firebase isn’t configured (and you won’t see real horoscopes until you run the seeder with Firebase).

---

## 6. Run the App

1. At the **top of Xcode**, open the scheme dropdown (it usually says “HoroscopeApp”) and pick an **iPhone simulator** (e.g. “iPhone 16” or “iPhone 15”).
2. Press **⌘R** (or click the **Run** button).

The simulator will start and the app will open. You’ll see onboarding (pick sign and style), then the main screen.

---

## 7. (Optional) Generate Demo Horoscopes

1. Run the app (as above).
2. Complete onboarding (choose sign and style).
3. Open the **Admin** tab (only in Debug builds).
4. Tap **“Seed Today’s Horoscopes”** and wait for it to finish.
5. Go back to **Today** and pull to refresh; you should see a horoscope from Firestore.

---

## Troubleshooting

- **“No such module 'FirebaseCore'”**  
  Make sure Firebase packages are added to the **HoroscopeApp** target (step 5). Then **Product → Clean Build Folder** (⌘⇧K) and build again (⌘B).

- **Widget doesn’t show my data**  
  Finish onboarding in the app first. Ensure both app and widget targets use the same App Group: **group.com.horoscope.app**.

- **Build errors about missing types in the widget**  
  Ensure the 6 shared files are in **Target Membership** for **HoroscopeWidgetExtension** (step 4.8).

- **App Group errors**  
  Use the exact ID: **group.com.horoscope.app** in both targets, and the same in **Constants.swift** (`appGroupId`).

Once this is done, you “run it” every time by opening the project in Xcode and pressing **⌘R**.
