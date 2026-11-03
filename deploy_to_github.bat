@echo off
cd /d "%~dp0"
echo =======================================================
echo       Deploying FINN to GitHub (vivekm7891)
echo =======================================================
echo.
echo Pushing commits to https://github.com/vivekm7891/finn-investment-agent ...
echo.
git push -u origin main
echo.
if %errorlevel% equ 0 (
    echo =======================================================
    echo  SUCCESS: Code deployed to GitHub!
    echo  Repository: https://github.com/vivekm7891/finn-investment-agent
    echo =======================================================
) else (
    echo.
    echo If you saw 'Repository not found', please:
    echo 1. Go to https://github.com/new
    echo 2. Create a repository named: finn-investment-agent
    echo 3. Re-run this script!
)
echo.
pause
