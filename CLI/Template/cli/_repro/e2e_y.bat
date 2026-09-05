@echo off
set CWD=%CD%
cd /d c:\Project\CLI\Template\cli\_repro
if exist my-backend rmdir /s /q my-backend
echo === running CLI with 'y' (npm install) ===
echo y | npm exec --package="c:\Project\CLI\Template\cli\nikhilbhatt-dev-1.0.0.tgz" -- nikhilbhatt-dev my-backend > e2e_y.log 2>&1
echo === CLI EXIT: %ERRORLEVEL% >> e2e_y.log
cd /d %CWD%
echo DONE-Y-STEP1
