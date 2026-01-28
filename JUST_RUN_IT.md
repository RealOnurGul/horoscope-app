# Just Run It — Minimal Steps

Get the app running in the simulator with the fewest steps. No widget, no Firebase backend for now. You’ll see onboarding, home screen, and settings.

---

## You need

- Mac with Xcode installed
- The **horoscope-app** folder (our code)
- An Xcode project with our **HoroscopeApp** folder added as the app target  
  (If you haven’t done that yet, see “Project setup” at the bottom.)

---

## Step 1: Add Firebase (required to build)

The app imports Firebase, so we have to add the package or it won’t compile.

1. In Xcode: **File → Add Package Dependencies...**
2. In the search box (top right), paste:
   ```
   https://github.com/firebase/firebase-ios-sdk
   ```
3. Click **Add Package**.
4. When the list appears, **check**:
   - **FirebaseAuth**
   - **FirebaseFirestore**
5. Under **Add to Target**, choose **HoroscopeApp** only. Do **not** add to any Widget target.
6. Click **Add Package**.

We’re **not** adding GoogleService-Info.plist yet. The app will run; it just won’t fetch horoscopes from a backend.

---

## Step 2: One `@main` only

The app must have exactly one `@main` entry point.

1. In the **left sidebar**, under your app group, look for **HoroscopeAppApp.swift** (or any extra “App” file from the Xcode template).
2. Our real entry point is **HoroscopeApp.swift** (it has `@main`).
3. If you see **HoroscopeAppApp.swift** (or similar): **right‑click → Delete → Move to Trash**.

---

## Step 3: Run

1. At the top of Xcode, set:
   - **Scheme:** **HoroscopeApp** (not a Widget scheme).
   - **Device:** **iPhone 16** or **iPhone 17 Pro** (any iPhone simulator).
2. Press **⌘R** (or click the **Play** ▶️ button).

The simulator will start and the app will open.

---

## What you’ll see

1. **Onboarding**  
   - Pick your zodiac sign → Pick style (Plain / Funny / Mystic) → Get Started.

2. **Home**  
   - “Today” screen.  
   - Message like: *“Your horoscope isn’t ready yet. Pull to refresh later.”*  
   - (That’s normal without Firebase/backend.)

3. **Settings**  
   - Change sign, style, etc.

4. **Admin** (only in Debug builds)  
   - Tab to seed horoscopes once you add Firebase later.

---

## If you get errors

- **“No such module 'FirebaseCore'”**  
  Add the Firebase package (Step 1) and add **FirebaseAuth** + **FirebaseFirestore** to the **HoroscopeApp** target. Then **Product → Clean Build Folder** (⌘⇧K), then **Product → Build** (⌘B).

- **“'@main' attribute cannot be applied to more than one type”**  
  You have two `@main` files. Delete the extra one (e.g. **HoroscopeAppApp.swift**) and keep **HoroscopeApp.swift**.

- **Red errors about missing files**  
  Ensure the **HoroscopeApp** folder (with **HoroscopeApp.swift**, **Models**, **Views**, etc.) is added to the **HoroscopeApp** target: select the folder → File Inspector → **Target Membership** → **HoroscopeApp** checked.

---

## Later: add backend + widget

When you want real horoscopes and the widget:

1. **Firebase:** Create a project → add iOS app (Bundle ID `com.onurgul.HoroscopeApp`) → download **GoogleService-Info.plist** → add it to the **HoroscopeApp** target. Enable Anonymous Auth and Firestore.
2. **Widget:** Follow **SIMPLE_CHECKLIST.md** (Widget target, App Groups, shared files).
3. **Seeder:** Run the app → **Admin** tab → **Seed Today’s Horoscopes** → then pull to refresh on **Today**.

---

## Project setup (if you haven’t created the Xcode project yet)

1. **File → New → Project** → **iOS → App** → Next.
2. **Product Name:** `HoroscopeApp`  
   **Interface:** SwiftUI  
   **Language:** Swift  
   **Organization Identifier:** e.g. `com.onurgul`
3. Create the project **inside** your **horoscope-app** folder (or in **Code** next to **horoscope-app**).
4. **Remove** the default app group (the one with `ContentView`, etc.): right‑click → Delete → **Remove Reference**.
5. **File → Add Files to "HoroscopeApp"...** → select the **HoroscopeApp** folder from **horoscope-app** → **Add to targets: HoroscopeApp** → Add.
6. Then do **Step 1** (Firebase) and **Step 2** (@main) above, and **Step 3** (Run).

That’s it. Run it, tap through onboarding and home, and you’ll see what it looks like.
