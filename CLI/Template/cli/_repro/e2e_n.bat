@echo off
setlocal
set CWD=%CD%
cd /d c:\Project\CLI\Template\cli\_repro
if exist my-backend rmdir /s /q my-backend
echo n | npm exec --package="c:\Project\CLI\Template\cli\nikhilbhatt-dev-1.0.0.tgz" -- nikhilbhatt-dev my-backend > e2e_n.log 2>&1
echo === EXIT: %ERRORLEVEL% >> e2e_n.log
cd /d %CWD%
echo ===== E2E 'n' LOG =====
type c:\Project\CLI\Template\cli\_repro\e2e_n.log
echo.
echo ===== VERIFICATION =====
cd /d c:\Project\CLI\Template\cli\_repro
powershell -NoProfile -Command "^
$ok = $true; ^
$mb = 'my-backend'; ^
function chk($label,$cond){ if($cond){ Write-Host ('PASS - '+$label) } else { Write-Host ('FAIL - '+$label); $ok=$false } }; ^
$exists = Test-Path $mb; ^
chk 'my-backend EXISTS', $exists; ^
if($exists){ ^
  $items = Get-ChildItem -Force $mb; ^
  $names = $items | ForEach-Object Name; ^
  chk 'src/ directory present', ($names -contains 'src'); ^
  chk 'package.json present', ($names -contains 'package.json'); ^
  chk 'package-lock.json present', ($names -contains 'package-lock.json'); ^
  chk '.env.example present', ($names -contains '.env.example'); ^
  chk 'README.md present', ($names -contains 'README.md'); ^
  chk '.gitignore present', ($names -contains '.gitignore'); ^
  chk 'NO .env file', -not ($names -contains '.env'); ^
  chk 'NO node_modules', -not ($names -contains 'node_modules'); ^
  chk 'src/app.js present', (Test-Path (Join-Path $mb 'src/app.js')); ^
  chk 'src/server.js present', (Test-Path (Join-Path $mb 'src/server.js')); ^
  chk 'src/models/User.js present', (Test-Path (Join-Path $mb 'src/models/User.js')); ^
  chk 'src/controllers/auth.controller.js present', (Test-Path (Join-Path $mb 'src/controllers/auth.controller.js')); ^
  chk 'src/services present', ($names -contains 'src' -and (Get-ChildItem (Join-Path $mb 'src') | ForEach-Object Name) -contains 'services'); ^
}; ^
Write-Host (''); ^
if($ok){ Write-Host 'OVERALL: PASS' } else { Write-Host 'OVERALL: FAIL' }; ^
exit (if($ok){0}else{1})
"
echo === VERIFY EXIT: %ERRORLEVEL%
