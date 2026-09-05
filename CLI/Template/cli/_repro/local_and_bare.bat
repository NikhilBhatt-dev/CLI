@echo off
setlocal
echo ===== LAYOUT 1: local node src/index.js (from cli/) =====
cd /d c:\Project\CLI\Template\cli
if exist my-local-test rmdir /s /q my-local-test
echo n | node src/index.js my-local-test > local.log 2>&1
echo local-CLI-exit:%ERRORLEVEL% >> local.log
type local.log
echo --- verify ---
powershell -NoProfile -ExecutionPolicy Bypass -File _repro\verify.ps1 my-local-test
cd /d c:\Project\CLI\Template\cli
if exist my-local-test rmdir /s /q my-local-test
rmdir /s /q node_modules 2>nul
rmdir /s /q my-backend 2>nul
del package-lock.json 2>nul
echo.
echo ===== LAYOUT 2: bare npx ^<tgz^> on this npm (v%npmver%) =====
cd /d c:\Project\CLI\Template\cli\_repro
if exist my-backend rmdir /s /q my-backend
echo n | npx "c:\Project\CLI\Template\cli\nikhilbhatt-dev-1.0.0.tgz" my-backend > bare_npx.log 2>&1
echo bare-npx-exit:%ERRORLEVEL% >> bare_npx.log
type bare_npx.log
if exist my-backend (echo bare-npx-created-FOLDER: YES) else (echo bare-npx-created-FOLDER: NO)
if exist my-backend rmdir /s /q my-backend
echo DONE-LOCAL-BARE
