@echo off
:: This is a safe startup script for SEOAlex
:: Using only ASCII characters to prevent encoding issues

echo ======================================================
echo           SEOAlex Start Tool (Debug Mode)
echo ======================================================
echo.

:: Anchor to current directory
cd /d "%~dp0"

echo [DEBUG] Current Path: %CD%
echo [DEBUG] Testing Environment...

:: Check node
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found! Please install it from https://nodejs.org/
    pause
    exit /b
)

:: Check dependencies
if not exist node_modules (
    echo [INFO] Installing dependencies...
    call npm install
)

echo [INFO] Starting Dev Server...
echo.
call npm run dev

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Server failed to start.
    pause
)

pause
