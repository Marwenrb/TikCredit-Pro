@echo off
echo ========================================
echo TikCredit Pro - Git Push Script
echo ========================================
echo.

REM Check if Git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Git is not installed!
    echo Please install Git from: https://git-scm.com/downloads
    pause
    exit /b 1
)

echo [1/6] Initializing Git repository...
git init
if errorlevel 1 (
    echo ERROR: Failed to initialize Git
    echo Try using Git Bash or GitHub Desktop instead
    pause
    exit /b 1
)

echo [2/6] Adding all files...
git add .
if errorlevel 1 (
    echo ERROR: Failed to add files
    pause
    exit /b 1
)

echo [3/6] Creating initial commit...
git commit -m "Initial commit: TikCredit Pro Premium Edition - Ultra-professional financing platform with advanced animations, blue particle background, and ultra-compact footer"
if errorlevel 1 (
    echo ERROR: Failed to create commit
    pause
    exit /b 1
)

echo [4/6] Adding remote repository...
git remote add origin git@github.com:Marwenrb/TikCredit-Pro.git 2>nul
if errorlevel 1 (
    echo Remote might already exist, updating...
    git remote set-url origin git@github.com:Marwenrb/TikCredit-Pro.git
)

echo [5/6] Setting main branch...
git branch -M main

echo [6/6] Pushing to GitHub...
echo.
echo NOTE: If you get authentication errors, you may need to:
echo 1. Set up SSH keys (see GIT_PUSH_SOLUTION.md)
echo 2. Use GitHub Desktop instead
echo 3. Use HTTPS instead of SSH
echo.
git push -u origin main

if errorlevel 1 (
    echo.
    echo ========================================
    echo PUSH FAILED - Common Solutions:
    echo ========================================
    echo.
    echo 1. Use GitHub Desktop (easiest):
    echo    - Download: https://desktop.github.com/
    echo    - Open project in GitHub Desktop
    echo    - Click "Publish repository"
    echo.
    echo 2. Use Git Bash:
    echo    - Right-click folder -^> "Git Bash Here"
    echo    - Run the same commands
    echo.
    echo 3. Move project out of OneDrive:
    echo    - Copy to C:\Projects\TikCredit-Pro
    echo    - Run this script from there
    echo.
    echo See GIT_PUSH_SOLUTION.md for detailed help
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo SUCCESS! Project pushed to GitHub!
echo ========================================
echo.
echo Repository: https://github.com/Marwenrb/TikCredit-Pro
echo.
pause

