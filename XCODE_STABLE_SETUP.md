# Xcode Stable Setup — No More HoroscopeApp 2, 3, 4

You’re seeing **HoroscopeApp 2**, **HoroscopeApp 3**, etc. because the **HoroscopeApp** folder was added to the project more than once. Each time you add it, Xcode creates a new group (with a number) instead of reusing the old one.

---

## Why “git pull” doesn’t update the app

You have **two** different folders:

| Folder | What it is | Updates when you `git pull`? |
|--------|------------|------------------------------|
| **horoscope-app** | The **git repo** (Theme, TodayView, Vela, etc.) | ✅ **Yes** |
| **HoroscopeApp** | Separate folder with your **Xcode project** + **HoroscopeApp 2**, **HoroscopeApp 3** (copies of the app) | ❌ **No** |

- You **pull** in **horoscope-app**. That’s where we edit and where the latest code lives.
- Xcode builds from **HoroscopeApp 2** or **HoroscopeApp 3** — **copies** inside the **HoroscopeApp** folder. Those copies are **not** in the repo, so they never change when you pull.

**Fix:** Xcode must reference the **horoscope-app** app code (the repo), not the copies in HoroscopeApp. See **“Point Xcode at the repo”** below.

---

## Where the code actually lives

- **On disk (repo):** `horoscope-app/HoroscopeApp/` (Theme, TodayView, Views, etc.).
- **In Xcode:** That folder is linked as a **group**. The group name can be "HoroscopeApp" or "HoroscopeApp 3" etc. The **build** uses the path you set (e.g. `HoroscopeApp 3/Info.plist`), so when the group name changes, the build breaks.

**Important:** All edits (Cursor, git) happen in **horoscope-app**. The Xcode project should *reference* those files, not copies elsewhere.

---

## 1. Point Xcode at the repo (so pull updates the app)

Your Xcode project lives in **HoroscopeApp**; the code we edit lives in **horoscope-app**. Do this once:

1. **Open** your Xcode project (in `HoroscopeApp`).
2. **Remove** all app source groups that point at copies:
   - In the Project Navigator, **right‑click** each of **HoroscopeApp 2**, **HoroscopeApp 3**, etc. → **Delete** → **"Remove Reference"**.
   - Also remove the default **HoroscopeApp** group if it only has `ContentView` / `HoroscopeAppApp` (template). We'll add the real app from the repo.
3. **Add the repo app folder** (reference only, no copy):
   - **File → Add Files to "HoroscopeApp"...**
   - Go to **Desktop → Code → horoscope-app** (the **repo** folder, with hyphen).
   - **Select** the **HoroscopeApp** folder **inside** horoscope-app (with `HoroscopeApp.swift`, `Models`, `Views`, `Theme`, etc.).
   - **Uncheck** "Copy items if needed".
   - **Add to targets:** HoroscopeApp.
   - Click **Add**.
4. **Build Settings → Info.plist:** Search "Info.plist" → set **Info.plist File** to **HoroscopeApp/Info.plist**.
5. **Product → Clean Build Folder** (⌘⇧K), then **Build** (⌘B).

After this, **git pull** in **horoscope-app** updates the files Xcode builds from. The app updates when you pull.

**Widget:** If you have a widget target, add **horoscope-app/HoroscopeWidget** the same way (reference, no copy) and fix its target membership / Info.plist as needed.

---

## 2. Use a stable Info.plist path

The build fails when “Info.plist File” points at a group that no longer exists (e.g. you deleted “HoroscopeApp 3”).

1. In Xcode, select the **HoroscopeApp** **project** (blue icon) in the sidebar.
2. Select the **HoroscopeApp** **target** (under TARGETS).
3. Open the **Build Settings** tab.
4. Search for **“Info.plist”**.
5. Set **Info.plist File** to the path that matches your **single** app group:
   - If the group is named **HoroscopeApp:**  
     `HoroscopeApp/Info.plist`
   - If you kept **HoroscopeApp 3** and nothing else:  
     `HoroscopeApp 3/Info.plist`

Use the **exact** group name you have. Same for Debug and Release.

6. **Product → Clean Build Folder** (⌘⇧K), then **Build** (⌘B).

---

## 3. “Pull and it updates automatically”

Yes. Once this is set up:

1. You **git pull** inside **horoscope-app** (e.g. in Terminal or in Cursor).
2. The files on disk (`horoscope-app/HoroscopeApp/`, etc.) update.
3. Xcode **references** those same files. It always builds what’s on disk.
4. You **do not** need to “re-add” the folder or “pull into Xcode.” Just build (⌘R).

So: **pull in the repo → build in Xcode.** No extra steps.

---

## 4. Keep the project and repo together

- **Best:** Create (or move) the Xcode project **inside** `horoscope-app`, e.g.:
  ```
  horoscope-app/
  ├── HoroscopeApp.xcodeproj   ← open this
  ├── HoroscopeApp/
  ├── HoroscopeWidget/
  └── ...
  ```
- When you **File → Add Files** and choose `HoroscopeApp`, use the `HoroscopeApp` folder **inside** this same repo. That way, when you pull, both the project and the app code update together.

---

## 5. Checklist

- [ ] Xcode references **horoscope-app/HoroscopeApp** (the repo), not **HoroscopeApp 2/3** (copies).
- [ ] Only **one** HoroscopeApp group in the Project Navigator (no 2, 3, 4).
- [ ] **Info.plist File** in Build Settings = **HoroscopeApp/Info.plist**.
- [ ] **HoroscopeApp** folder added with **Copy items** unchecked (references only).
- [ ] You **don't** add the HoroscopeApp folder again after setup.
- [ ] You always **git pull** in the **horoscope-app** folder (the repo), not in **HoroscopeApp**.

After this, **git pull** in **horoscope-app** updates the app; build in Xcode (⌘R) to see changes.
