# TikCredit Pro - Git Push Script (PowerShell)
# Handles OneDrive path issues

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TikCredit Pro - Git Push Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Git is installed
try {
    $gitVersion = git --version 2>&1
    Write-Host "[✓] Git found: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "[✗] ERROR: Git is not installed!" -ForegroundColor Red
    Write-Host "Please install Git from: https://git-scm.com/downloads" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Try to initialize Git
Write-Host "[1/6] Initializing Git repository..." -ForegroundColor Yellow
try {
    git init 2>&1 | Out-Null
    Write-Host "[✓] Git initialized" -ForegroundColor Green
} catch {
    Write-Host "[✗] ERROR: Failed to initialize Git" -ForegroundColor Red
    Write-Host ""
    Write-Host "OneDrive path issue detected!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "SOLUTIONS:" -ForegroundColor Cyan
    Write-Host "1. Use GitHub Desktop (recommended):" -ForegroundColor White
    Write-Host "   - Download: https://desktop.github.com/" -ForegroundColor Gray
    Write-Host "   - Open project in GitHub Desktop" -ForegroundColor Gray
    Write-Host "   - Click 'Publish repository'" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Use Git Bash:" -ForegroundColor White
    Write-Host "   - Right-click folder -> 'Git Bash Here'" -ForegroundColor Gray
    Write-Host "   - Run: git init && git add . && git commit -m 'Initial commit'" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. Move project out of OneDrive:" -ForegroundColor White
    Write-Host "   - Copy to C:\Projects\TikCredit-Pro" -ForegroundColor Gray
    Write-Host "   - Run this script from there" -ForegroundColor Gray
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

# Add all files
Write-Host "[2/6] Adding all files..." -ForegroundColor Yellow
try {
    git add . 2>&1 | Out-Null
    Write-Host "[✓] Files added" -ForegroundColor Green
} catch {
    Write-Host "[✗] ERROR: Failed to add files" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Create commit
Write-Host "[3/6] Creating initial commit..." -ForegroundColor Yellow
$commitMessage = "Initial commit: TikCredit Pro Premium Edition - Ultra-professional financing platform with advanced animations, blue particle background, and ultra-compact footer"
try {
    git commit -m $commitMessage 2>&1 | Out-Null
    Write-Host "[✓] Commit created" -ForegroundColor Green
} catch {
    Write-Host "[✗] ERROR: Failed to create commit" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Add remote
Write-Host "[4/6] Adding remote repository..." -ForegroundColor Yellow
try {
    git remote add origin git@github.com:Marwenrb/TikCredit-Pro.git 2>&1 | Out-Null
    Write-Host "[✓] Remote added" -ForegroundColor Green
} catch {
    Write-Host "[!] Remote might already exist, updating..." -ForegroundColor Yellow
    git remote set-url origin git@github.com:Marwenrb/TikCredit-Pro.git 2>&1 | Out-Null
    Write-Host "[✓] Remote updated" -ForegroundColor Green
}

# Set main branch
Write-Host "[5/6] Setting main branch..." -ForegroundColor Yellow
git branch -M main 2>&1 | Out-Null
Write-Host "[✓] Branch set to main" -ForegroundColor Green

# Push to GitHub
Write-Host "[6/6] Pushing to GitHub..." -ForegroundColor Yellow
Write-Host ""
Write-Host "NOTE: If you get authentication errors:" -ForegroundColor Yellow
Write-Host "1. Set up SSH keys (see GIT_PUSH_SOLUTION.md)" -ForegroundColor Gray
Write-Host "2. Use GitHub Desktop instead" -ForegroundColor Gray
Write-Host "3. Use HTTPS: git remote set-url origin https://github.com/Marwenrb/TikCredit-Pro.git" -ForegroundColor Gray
Write-Host ""

try {
    git push -u origin main 2>&1
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "SUCCESS! Project pushed to GitHub!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Repository: https://github.com/Marwenrb/TikCredit-Pro" -ForegroundColor Cyan
    Write-Host ""
} catch {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "PUSH FAILED" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Common Solutions:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Use GitHub Desktop (easiest):" -ForegroundColor White
    Write-Host "   https://desktop.github.com/" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Use Git Bash:" -ForegroundColor White
    Write-Host "   Right-click folder -> 'Git Bash Here'" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. Move project out of OneDrive:" -ForegroundColor White
    Write-Host "   Copy to C:\Projects\TikCredit-Pro" -ForegroundColor Gray
    Write-Host ""
    Write-Host "See GIT_PUSH_SOLUTION.md for detailed help" -ForegroundColor Cyan
    Write-Host ""
}

Read-Host "Press Enter to exit"

