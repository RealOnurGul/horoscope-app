# Fix: Undefined _main + SwiftUICore / CoreAudioTypes / UIUtilities

If you see:
- **Undefined symbol: _main**
- **SwiftUICore: "product being built is not an allowed client"**
- **CoreAudioTypes / UIUtilities framework not found**

follow these steps **in order**.

---

## 1. Confirm `HoroscopeApp.swift` is compiled (most common fix)

The `@main` entry point lives in **HoroscopeApp.swift**. If that file isn’t in the app target’s Compile Sources, you get `_main` undefined.

1. In Xcode, select the **HoroscopeApp** project (blue icon) → **HoroscopeApp** target.
2. Open **Build Phases**.
3. Expand **Compile Sources**.
4. Check that **HoroscopeApp.swift** is listed (path may be `HoroscopeApp/HoroscopeApp.swift` or `HoroscopeApp 3/HoroscopeApp.swift` depending on your setup).
5. If it’s **missing**: click **+** → navigate to **horoscope-app/HoroscopeApp/HoroscopeApp.swift** → Add. Ensure the **HoroscopeApp** target (the app) is checked, not only the widget.

---

## 2. Only one `@main` in the app target

The **app** must have exactly one `@main` (in **HoroscopeApp.swift**). The **widget** has its own `@main` in **HoroscopeWidget.swift**; that’s fine.

1. In the Project Navigator, search for `@main` (⌘⇧F).
2. You should see:
   - **HoroscopeApp.swift** — `@main` for the **app** (keep this).
   - **HoroscopeWidget.swift** — `@main` for the **widget** (keep this).
3. If you have **HoroscopeAppApp.swift**, **ContentView** with `@main`, or any **duplicate** app entry:
   - Remove that file from the **HoroscopeApp app** target (Target Membership), or delete the file if it’s template leftovers.

---

## 3. Clean Derived Data and rebuild

1. **Product → Clean Build Folder** (⌘⇧K).
2. Quit Xcode.
3. Delete DerivedData for this project:
   ```bash
   rm -rf ~/Library/Developer/Xcode/DerivedData/HoroscopeApp-*
   ```
4. Reopen the project, then **Product → Build** (⌘B).

---

## 4. Build Settings to check

**HoroscopeApp app target** (not the widget):

| Setting | Value |
|--------|--------|
| **Mach-O Type** | **Executable** |
| **Build Libraries for Distribution** | **No** |
| **iOS Deployment Target** | **17.0** or **18.0** (avoid very new betas like 26.x if you see SwiftUICore / SDK issues) |

---

## 5. Scheme

1. **Product → Scheme → Edit Scheme…**
2. Select **Run** on the left.
3. **Build Configuration**: **Debug**.
4. **Executable**: **HoroscopeApp** (the app), not a library or the widget.

---

## 6. CoreAudioTypes / UIUtilities warnings

These often come from **Firebase** / Google dependencies. They’re usually **warnings**, not the cause of `_main` failing.

- Try updating the **Firebase** Swift Package to the latest version.
- If the app builds and runs, you can ignore these for now.

---

## 7. SwiftUICore “not an allowed client”

This often appears when the **main product** is built as a **dynamic library** instead of an **executable** (e.g. `.debug.dylib`). Fix that first:

- **Mach-O Type** = **Executable** (step 4).
- **HoroscopeApp.swift** in **Compile Sources** (step 1).
- **Clean Derived Data** (step 3).

---

## Quick checklist

- [ ] **HoroscopeApp.swift** is in **Compile Sources** for the **HoroscopeApp** app target.
- [ ] Only one app `@main` (in **HoroscopeApp.swift**).
- [ ] **Mach-O Type** = **Executable**.
- [ ] **Build Libraries for Distribution** = **No**.
- [ ] Derived Data cleaned, then rebuild.
- [ ] Run scheme uses **HoroscopeApp** app as executable.

After that, build again. If `_main` persists, the next thing to verify is that **HoroscopeApp.swift** is the one from **horoscope-app** (the repo) and that the app target’s **Compile Sources** don’t still point at old paths (e.g. **HoroscopeApp 2**) that no longer exist.
