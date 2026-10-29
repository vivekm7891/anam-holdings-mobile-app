@echo off
echo =======================================================
echo   Starting FINN: Financial Investment Agent (ENAM AI)
echo =======================================================
echo.
echo Opening server at http://localhost:8080 ...
echo Press Ctrl+C in this terminal to stop the server.
echo.
python backend/server.py 8080
pause
