@echo off
setlocal
set CWD=%CD%
cd /d c:\Project\CLI\Template\cli\_repro
if exist my-backend rmdir /s /q my-backend
echo === npm exec --package=file:tgz -- nikhilbhatt-dev my-backend ===
echo n | npm exec --package="c:\Project\CLI\Template\cli\nikhilbhatt-dev-1.0.0.tgz" -- nikhilbhatt-dev my-backend > exec.log 2>&1
echo === EXIT: %ERRORLEVEL% >> exec.log
type exec.log
echo === FOLDER CHECK ===
if exist my-backend (
  echo EXISTS
  dir /s /b my-backend
  echo === file count ===
  dir /s /b /a-d my-backend ^| find /c /v ""
) else (
  echo my-backend MISSING
)
cd /d %CWD%
