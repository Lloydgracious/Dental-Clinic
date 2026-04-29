@echo off
echo ==================================================
echo      LUMIERE DENTAL - RESET & REBUILD SCRIPT
echo ==================================================
echo.
echo This script clears the local Next.js build cache and
echo refreshes dependencies to fix blank screens and stale builds.
echo.
echo 1. Clearing the .next cache...
call npm run clean
echo.
echo 2. Refreshing dependencies...
call npm install
echo.
echo.
echo ==================================================
echo DONE! Start the app again with: npm run dev
echo ==================================================
pause
