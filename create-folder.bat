@echo off
echo 🌳 SafeMate v2 Folder Creation Tool
echo.

echo 📋 Instructions:
echo 1. Get your JWT token from SafeMate app console
echo 2. Run: powershell -ExecutionPolicy Bypass -File "create-folder.ps1" -JwtToken "YOUR_TOKEN_HERE"
echo.

echo Example:
echo powershell -ExecutionPolicy Bypass -File "create-folder.ps1" -JwtToken "eyJraWQiOiJSSjlwaStibXlqVk81SjJsSEM5YnFPTlB..."
echo.

echo Or with custom folder name:
echo powershell -ExecutionPolicy Bypass -File "create-folder.ps1" -JwtToken "YOUR_TOKEN" -FolderName "My Folder"
echo.

pause
