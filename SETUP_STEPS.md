# Step-by-step: Create Xcode project and run the app

Do these in order. Your **horoscope-app** folder already has all the code.

---

## Part 1: Create the Xcode project

1. **Open Xcode** (from Applications or Spotlight).

2. **Create New Project**
   - Click **"Create New Project..."** (or **File → New → Project**).

3. **Choose template**
   - Select **iOS** at the top.
   - Click **App**.
   - Click **Next**.

4. **Project options**
   - **Product Name:** `HoroscopeApp`
   - **Team:** Pick your Apple ID, or **Add Account...** and sign in.
   - **Organization Identifier:** `com.yourname` (or anything you like, e.g. `com.onur`).
   - **Interface:** **SwiftUI**
   - **Language:** **Swift**
   - **Storage:** None.
   - Leave **Include Tests** unchecked.
   - Click **Next**.

5. **Where to save**
   - Click **Create**.
   - In the file picker, go to your **horoscope-app** folder (the one that has `HoroscopeApp`, `HoroscopeWidget`, `README.md` inside it).
   - **Do not** create a new folder. Save **inside** `horoscope-app`.
   - Uncheck **"Create Git repository"** if you already use git for this folder.
   - Click **Create**.

You now have an Xcode project **inside** horoscope-app, with a default app (ContentView, etc.). Next we replace that with our code.

---

## Part 2: Remove Xcode’s default app and add our app code

6. **Remove the default app**
   - In the **left sidebar** (Project Navigator), you’ll see a **HoroscopeApp** group (yellow folder) with things like `ContentView.swift`, `HoroscopeAppApp.swift`, maybe `Assets.xcassets`.
   - **Right‑click** the **HoroscopeApp** group → **Delete**.
   - Choose **"Remove Reference"** (we keep files on disk; we’re just removing them from the project).
   - If Xcode asks about the app entry point, that’s fine; we’ll add our own.

7. **Add our app folder**
   - **File → Add Files to "HoroscopeApp"...**
   - Navigate to your **horoscope-app** folder.
   - **Select the `HoroscopeApp` folder** (the one that contains `HoroscopeApp.swift`, `Models`, `Views`, `Debug`, etc.).
   - **Options:**
     - **Copy items if needed:** **unchecked**
     - **Create groups:** selected
     - **Add to targets:** check **HoroscopeApp** only
   - Click **Add**.

8. **Set the app entry point**
   - In the left sidebar, under the **HoroscopeApp** group, find **HoroscopeApp.swift**.
   - Open it. It should have `@main` and `struct HoroscopeApp: App`. That’s our main app — we’re using it.
   - If you still see a **HoroscopeAppApp.swift** (or similar) from the template, **delete** it: right‑click → Delete → **Move to Trash** (we don’t need it).

9. **Point the target at our Info.plist**
   - Click the **blue project icon** at the top of the sidebar (the one named "HoroscopeApp").
   - Under **TARGETS**, select **HoroscopeApp**.
   - Open the **Build Settings** tab.
   - Search for **"Info.plist"**.
   - Set **Info.plist File** to: `HoroscopeApp/Info.plist`

10. **App Groups (main app)**
    - Still in **TARGETS** → **HoroscopeApp**.
    - Go to **Signing & Capabilities**.
    - Click **+ Capability**.
    - Add **App Groups**.
    - Click the **+** under App Groups and add: **`group.com.horoscope.app`**
    - If Xcode creates an entitlements file, that’s fine.

---

## Part 3: Add the Widget

11. **Create Widget target**
    - **File → New → Target...**
    - Choose **iOS** → **Widget Extension**.
    - Click **Next**.

12. **Widget options**
    - **Product Name:** `HoroscopeWidget`
    - **Uncheck** "Include Configuration Intent".
    - Click **Finish**.
    - If it asks **"Activate HoroscopeWidget scheme?"** → **Cancel** (we want to run the main app).

13. **Remove the widget’s default code**
    - In the sidebar, find the **HoroscopeWidget** group (from the new target).
    - Delete the **default Swift file(s)** Xcode added (e.g. something like `HoroscopeWidget.swift` that says "Hello World"). Right‑click → Delete → **Move to Trash**.

14. **Add our widget code**
    - **File → Add Files to "HoroscopeApp"...**
    - Go to **horoscope-app** again.
    - **Select the `HoroscopeWidget` folder** (the one with `HoroscopeWidget.swift`, `WidgetProvider.swift`, `WidgetViews.swift`, etc.).
    - **Options:**
      - **Copy items if needed:** **unchecked**
      - **Create groups:** selected
      - **Add to targets:** check **HoroscopeWidgetExtension** only (not HoroscopeApp).
    - Click **Add**.

15. **App Groups (widget)**
    - **TARGETS** → **HoroscopeWidgetExtension**.
    - **Signing & Capabilities** → **+ Capability** → **App Groups**.
    - Add the same group: **`group.com.horoscope.app`**

16. **Share files with the widget**
    The widget needs some of the app’s models and helpers. We add those files to the **widget target** too.

    - In the **Project Navigator**, go into **HoroscopeApp** → **Models**.
    - **Select** `ZodiacSign.swift` (single click).
    - In the **right panel** (File Inspector), find **Target Membership**.
    - **Check** **HoroscopeWidgetExtension** for that file.

    Do the same for:
    - **Models:** `HoroscopeStyle.swift`, `HoroscopeSlot.swift`, `Horoscope.swift`
    - **Services:** `Constants.swift`, `DateProvider.swift`

    So each of these 6 files has **both** HoroscopeApp and HoroscopeWidgetExtension checked.

---

## Part 4: Add Firebase

17. **Add Firebase package**
    - **File → Add Package Dependencies...**
    - In the search box paste: `https://github.com/firebase/firebase-ios-sdk`
    - Add the package (default version is fine).
    - When it asks which products to add, select **FirebaseAuth** and **FirebaseFirestore**.
    - Add them to the **HoroscopeApp** target only. Click **Add Package**.

18. **Firebase config file (GoogleService-Info.plist)**
    - Go to [Firebase Console](https://console.firebase.google.com).
    - Create a project (or use existing).
    - **Add app** → **iOS**.
    - **Bundle ID:** must match your app. In Xcode: **TARGETS → HoroscopeApp → General → Bundle Identifier** (e.g. `com.yourname.HoroscopeApp`). Use that exact value in Firebase.
    - Download **GoogleService-Info.plist**.
    - In Xcode: **drag** that file into the **HoroscopeApp** group in the sidebar.
    - Check **"Copy items if needed"** and **HoroscopeApp** target. Click **Finish**.

19. **Enable Anonymous Auth and Firestore**
    - In Firebase Console: **Build → Authentication** → **Get started** → **Sign-in method** → enable **Anonymous**.
    - **Build → Firestore Database** → **Create database** → start in **test mode** for now.

---

## Part 5: Run the app

20. **Select scheme and device**
    - At the top of Xcode, next to the Run/Stop buttons, use the scheme dropdown.
    - Choose **HoroscopeApp** (not HoroscopeWidget).
    - Next to it, choose an **iPhone simulator** (e.g. **iPhone 16**).

21. **Build and run**
    - Press **⌘R** (or click the **Play** button).
    - The simulator will boot and the app will launch.

You should see onboarding (pick sign, pick style), then the main screen.  
To get real horoscopes: go to the **Admin** tab → **Seed Today’s Horoscopes** → then pull to refresh on **Today**.

---

## Quick checklist

- [ ] New App project created **inside** horoscope-app folder  
- [ ] Default app code removed, **HoroscopeApp** folder added to HoroscopeApp target  
- [ ] **HoroscopeApp** target: Info.plist, App Groups  
- [ ] Widget target created, default widget code removed, **HoroscopeWidget** folder added to widget target  
- [ ] **HoroscopeWidgetExtension** target: App Groups, 6 shared files  
- [ ] Firebase package (Auth + Firestore) added to HoroscopeApp  
- [ ] **GoogleService-Info.plist** added, Firebase Auth (Anonymous) and Firestore enabled  
- [ ] Run **HoroscopeApp** on iPhone simulator (⌘R)

---

## If something goes wrong

- **“No such module 'FirebaseCore'”**  
  Clean build: **Product → Clean Build Folder** (⌘⇧K), then **Product → Build** (⌘B). Ensure Firebase packages are added to **HoroscopeApp** only.

- **Widget build errors about `ZodiacSign` / `Horoscope` / etc.**  
  Check that those 6 files have **HoroscopeWidgetExtension** checked in Target Membership.

- **App crashes or “Firebase not configured”**  
  Confirm **GoogleService-Info.plist** is in the project and its Bundle ID matches the app.

- **Widget shows “Open app to set up”**  
  Complete onboarding in the app first. Both app and widget must use **group.com.horoscope.app**.
