@echo off
cd /d "%~dp0"
echo =======================================================
echo   Starting FINN: Financial Investment Agent (ENAM AI)
echo =======================================================
echo.
echo Launching web browser at http://localhost:8080 ...
start http://localhost:8080
echo.
echo Starting Python backend server...
python backend/server.py 8080
if %errorlevel% neq 0 (
    echo Python command failed, trying py launcher...
    py backend/server.py 8080
)
pause
