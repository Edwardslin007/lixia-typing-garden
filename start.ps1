param([switch]$ServeOnly)
$ErrorActionPreference = 'Stop'
$taskUrl = 'http://127.0.0.1:8878/'
$taskHealthUrl = 'http://127.0.0.1:8878/health'
$taskReady = $false
try {
    $taskHealth = Invoke-WebRequest -Uri $taskHealthUrl -UseBasicParsing -TimeoutSec 2
    if ($taskHealth.Content.Trim() -eq 'lixia-typing-garden-v1') { $taskReady = $true }
    else { throw 'Port 8878 is being used by another app.' }
} catch {
    if ($_.Exception.Message -eq 'Port 8878 is being used by another app.') { throw }
}
if (-not $taskReady) {
    $taskNodeCommand = Get-Command node -ErrorAction SilentlyContinue
    if (-not $taskNodeCommand) { throw 'Node.js was not found. Please open index.html in Chrome instead.' }
    $taskServerScript = Join-Path $PSScriptRoot 'server.cjs'
    Start-Process -FilePath $taskNodeCommand.Source -ArgumentList ('"' + $taskServerScript + '"') -WorkingDirectory $PSScriptRoot -WindowStyle Hidden
    for ($taskAttempt = 0; $taskAttempt -lt 20; $taskAttempt++) {
        Start-Sleep -Milliseconds 200
        try {
            $taskHealth = Invoke-WebRequest -Uri $taskHealthUrl -UseBasicParsing -TimeoutSec 1
            if ($taskHealth.Content.Trim() -eq 'lixia-typing-garden-v1') { $taskReady = $true; break }
        } catch {}
    }
}
if (-not $taskReady) { throw 'The local game server could not start on port 8878.' }
if ($ServeOnly) { Write-Output 'Typing garden server is ready at http://127.0.0.1:8878/'; exit 0 }
$taskChromePaths = @(
    (Join-Path $env:ProgramFiles 'Google\Chrome\Application\chrome.exe'),
    (Join-Path ${env:ProgramFiles(x86)} 'Google\Chrome\Application\chrome.exe'),
    (Join-Path $env:LOCALAPPDATA 'Google\Chrome\Application\chrome.exe')
)
$taskChromePath = $taskChromePaths | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
if ($taskChromePath) { Start-Process -FilePath $taskChromePath -ArgumentList $taskUrl -WindowStyle Normal }
else { Start-Process $taskUrl }
