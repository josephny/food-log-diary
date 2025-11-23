# Installing Git on Windows

## Quick Install (Recommended)

### Option 1: Download Git for Windows (5 minutes)

1. **Download Git:**
   - Go to: https://git-scm.com/download/win
   - The download should start automatically
   - File name: `Git-2.x.x-64-bit.exe` (or similar)

2. **Install Git:**
   - Double-click the downloaded file
   - Click "Next" through all the prompts (default settings are fine)
   - **Important:** When you see "Choosing the default editor", you can keep "Nano" or choose "Notepad" if you prefer
   - Keep clicking "Next" until you see "Install"
   - Click "Install"
   - Wait for installation to complete
   - Click "Finish"

3. **Verify Installation:**
   - Close and reopen PowerShell/Command Prompt
   - Type: `git --version`
   - You should see something like: `git version 2.x.x`

4. **Configure Git (one-time setup):**
   ```bash
   git config --global user.name "Your Name"
   git config --global user.email "your.email@example.com"
   ```
   Replace with your actual name and email.

### Option 2: Install via Winget (if you have it)

If you have Windows Package Manager (winget), you can install Git from PowerShell:

```powershell
winget install --id Git.Git -e --source winget
```

Then restart PowerShell and verify:
```bash
git --version
```

## After Installation

1. **Close and reopen PowerShell** (important!)
2. Navigate to your project folder:
   ```bash
   cd "C:\Users\jrsko\OneDrive\Documents\Cursor-Projects"
   ```
3. Now try the git commands again!

## Troubleshooting

### "git is not recognized" after installation

**Fix:**
1. Close PowerShell completely
2. Reopen PowerShell
3. Try `git --version` again

If still not working:
1. Restart your computer
2. Open PowerShell again
3. Try `git --version`

### Need to add Git to PATH manually

If Git still isn't found:
1. Find where Git was installed (usually `C:\Program Files\Git\cmd`)
2. Add it to Windows PATH:
   - Press `Win + R`
   - Type: `sysdm.cpl` and press Enter
   - Go to "Advanced" tab
   - Click "Environment Variables"
   - Under "System variables", find "Path"
   - Click "Edit"
   - Click "New"
   - Add: `C:\Program Files\Git\cmd`
   - Click OK on all windows
   - Restart PowerShell

## Next Steps

Once Git is installed and working:

1. Verify: `git --version` should show a version number
2. Configure (one time):
   ```bash
   git config --global user.name "Your Name"
   git config --global user.email "your.email@example.com"
   ```
3. Then proceed with pushing to GitHub!


