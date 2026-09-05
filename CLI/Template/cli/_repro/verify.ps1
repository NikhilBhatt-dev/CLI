param([string]$Target = "my-backend")
$root = Resolve-Path (Join-Path $PWD $Target) -ErrorAction SilentlyContinue
if (-not $root) { Write-Host "FAIL - $Target directory missing"; exit 1 }
$names = (Get-ChildItem -Force $root | ForEach-Object Name)
Write-Host "Top-level entries in $Target :"
$names | Sort-Object | ForEach-Object { Write-Host "  $_" }
Write-Host ""

$results = [ordered]@{}
$results["$Target exists and non-empty"] = ($names.Count -gt 0)
$results["src/ present"] = ($names -contains "src")
$results["package.json present"] = ($names -contains "package.json")
$results["package-lock.json present"] = ($names -contains "package-lock.json")
$results[".env.example present"] = ($names -contains ".env.example")
$results["README.md present"] = ($names -contains "README.md")
$results[".gitignore present"] = ($names -contains ".gitignore")
$results["NO .env copied"] = (-not ($names -contains ".env"))
$results["NO node_modules copied"] = (-not ($names -contains "node_modules"))
$results["src/app.js"] = (Test-Path (Join-Path $root "src/app.js"))
$results["src/server.js"] = (Test-Path (Join-Path $root "src/server.js"))
$results["src/models/User.js"] = (Test-Path (Join-Path $root "src/models/User.js"))
$results["src/controllers/auth.controller.js"] = (Test-Path (Join-Path $root "src/controllers/auth.controller.js"))
$results["src/services/auth.service.js"] = (Test-Path (Join-Path $root "src/services/auth.service.js"))
$results["src/middleware/authMiddleware.js"] = (Test-Path (Join-Path $root "src/middleware/authMiddleware.js"))
$results["src/utils/ApiError.js"] = (Test-Path (Join-Path $root "src/utils/ApiError.js"))
$results["src/config/env.js"] = (Test-Path (Join-Path $root "src/config/env.js"))

$allPass = $true
foreach ($k in $results.Keys) {
  if ($results[$k]) { Write-Host ("PASS - " + $k) -ForegroundColor Green }
  else { Write-Host ("FAIL - " + $k) -ForegroundColor Red; $allPass = $false }
}
$total = (Get-ChildItem -Recurse -Force $root | Where-Object { -not $_.PSIsContainer }).Count
Write-Host ""
Write-Host "Total files generated (recursive): $total"
Write-Host ""
if ($allPass) { Write-Host "OVERALL: PASS" -ForegroundColor Green; exit 0 }
else { Write-Host "OVERALL: FAIL" -ForegroundColor Red; exit 1 }
