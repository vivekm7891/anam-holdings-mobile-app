@echo off
cd /d "%~dp0"
echo =======================================================
echo     Deploying FINN to GitHub: anam-holdings-mobile-app
echo =======================================================
echo.
echo Pushing commits to https://github.com/vivekm7891/anam-holdings-mobile-app ...
echo.
git push -u origin main
echo.
if %errorlevel% equ 0 (
    echo =======================================================
    echo  SUCCESS: Code deployed to GitHub!
    echo  Repository: https://github.com/vivekm7891/anam-holdings-mobile-app
    echo =======================================================
) else (
    echo.
    echo If prompted, please sign in to GitHub in the popup window.
)
echo.
pause
