# Save this as check-structure.ps1 and run it
Write-Host "Checking Frontend Structure..." -ForegroundColor Green

$filesToCheck = @(
    "src\App.css",
    "src\components\common\Header.js",
    "src\components\common\Footer.js", 
    "src\components\common\Header.css",
    "src\components\common\Footer.css",
    "src\pages\Home.js",
    "src\pages\Home.css",
    "src\context\AuthContext.js"
)

foreach ($file in $filesToCheck) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file" -ForegroundColor Red
    }
}