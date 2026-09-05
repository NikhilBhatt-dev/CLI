@echo off
cd /d c:\Project\CLI\Template\cli\_repro
if exist my-backend rmdir /s /q my-backend
echo n | npx --verbose c:\Project\CLI\Template\cli\nikhilbhatt-dev-1.0.0.tgz my-backend > npx_verbose.log 2>&1
echo === EXIT: %ERRORLEVEL% >> npx_verbose.log
echo n | npx c:\Project\CLI\Template\cli\nikhilbhatt-dev-1.0.0.tgz my-backend > npx_plain.log 2>&1
echo === EXIT: %ERRORLEVEL% >> npx_plain.log
echo DONE
