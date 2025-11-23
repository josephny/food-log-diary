# Fix: Git Not Recognized After Installation

## Quick Fixes (Try in Order)

### Fix 1: Restart Your Computer
**This fixes it 90% of the time!**

1. Save any open work
2. Restart your computer
3. After restart, open PowerShell again
4. Try: `git --version`

### Fix 2: Close ALL Terminal Windows
Sometimes terminals cache the old PATH:

1. Close **ALL** PowerShell/Command Prompt windows
2. Close Cursor if it's open
3. Reopen everything fresh
4. Try: `git --version`

### Fix 3: Check if Git is Actually Installed

1. Press `Win + R`
2. Type: `C:\Program Files\Git\cmd\git.exe --version`
3. Press Enter

**If this works:** Git is installed, but PATH isn't set correctly (go to Fix 4)
**If this doesn't work:** Git isn't installed properly (reinstall)

### Fix 4: Add Git to PATH Manually

1. **Find Git installation path:**
   - Usually: `C:\Program Files\Git\cmd`
   - Or: `C:\Program Files (x86)\Git\cmd`

2. **Add to PATH:**
   - Press `Win + R`
   - Type: `sysdm.cpl` and press Enter
   - Click "Advanced" tab
   - Click "Environment Variables" button
   - Under "System variables" (bottom section), find "Path"
   - Click "Path" → Click "Edit"
   - Click "New"
   - Add: `C:\Program Files\Git\cmd`
   - Click "OK" on all windows
   - **Close and reopen PowerShell**
   - Try: `git --version`

### Fix 5: Reinstall Git with PATH Option

If nothing works, reinstall Git:

1. **Uninstall Git:**
   - Settings → Apps → Search "Git" → Uninstall

2. **Reinstall Git:**
   - Download from: https://git-scm.com/download/win
   - During installation, when you see "Adjusting your PATH environment":
     - **Select: "Git from the command line and also from 3rd-party software"**
     - This is the default, but make sure it's selected!
   - Complete installation
   - **Restart computer**
   - Try: `git --version`

### Fix 6: Use Git Bash Instead

If PowerShell still doesn't work, use Git Bash (comes with Git):

1. Press `Win` key
2. Type: `Git Bash`
3. Open "Git Bash"
4. Try: `git --version` (should work here)
5. Use Git Bash for all git commands

## Verify Installation Location

Check where Git was installed:

```powershell
# In PowerShell, try these paths:
Test-Path "C:\Program Files\Git\cmd\git.exe"
Test-Path "C:\Program Files (x86)\Git\cmd\git.exe"
```

If either returns `True`, that's where Git is installed.

## Quick Test

Try running Git with full path:

```powershell
& "C:\Program Files\Git\cmd\git.exe" --version
```

If this works, Git is installed but PATH needs fixing.

## Alternative: Use GitHub Desktop

If Git command line keeps giving you trouble:

1. Download GitHub Desktop: https://desktop.github.com/
2. It includes Git and handles everything for you
3. You can still use it with command line later

## Still Not Working?

Let me know:
1. What happens when you run: `C:\Program Files\Git\cmd\git.exe --version`
2. Did you restart your computer?
3. What version of Windows are you using?


