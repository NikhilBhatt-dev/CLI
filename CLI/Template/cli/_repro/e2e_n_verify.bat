@echo off
set CWD=%CD%
cd /d c:\Project\CLI\Template\cli\_repro
if exist my-backend rmdir /s /q my-backend
echo n | npm exec --package="c:\Project\CLI\Template\cli\nikhilbhatt-dev-1.0.0.tgz" -- nikhilbhatt-dev my-backend > e2e_n.log 2>&1
echo === CLI EXIT: %ERRORLEVEL% >> e2e_n.log
cd /d %CWD%
echo ===== CLI RUN LOG =====
type c:\Project\CLI\Template\cli\_repro\e2e_n.log
echo.
echo ===== VERIFICATION =====
cd /d c:\Project\CLI\Template\cli\_repro
powershell -NoProfile -ExecutionPolicy Bypass -File verify.ps1 my-backend
echo === FINAL EXIT: %ERRORLEVEL%
