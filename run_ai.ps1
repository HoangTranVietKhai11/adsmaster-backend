# AdsMaster AI - Start AI Engine
# Requires Python 3.10+ and pip

echo "--- AdsMaster AI Engine Startup ---"

# Step 1: Find Python command
$PYTHON_CMD = ""
foreach ($cmd in "python", "py", "python3") {
    if (Get-Command $cmd -ErrorAction SilentlyContinue) {
        $PYTHON_CMD = $cmd
        break
    }
}

if ($PYTHON_CMD -eq "") {
    Write-Host "Error: Python is not installed or not in your PATH." -ForegroundColor Red
    Write-Host "Please install Python 3.10+ from python.org or the Microsoft Store."
    Write-Host "Note: If you installed it, you might need to disable 'App execution aliases' for Python in Windows Settings." -ForegroundColor Yellow
    exit 1
}

Write-Host "Using Python command: $PYTHON_CMD" -ForegroundColor Gray

$ENGINE_DIR = Join-Path $PSScriptRoot "ai-engine"
$VENV_DIR = Join-Path $ENGINE_DIR "venv"
$PYTHON_EXE = Join-Path $VENV_DIR "Scripts\python.exe"
$PIP_EXE = Join-Path $VENV_DIR "Scripts\pip.exe"

# Step 2: Set up virtual environment
if (!(Test-Path $VENV_DIR)) {
    Write-Host "Creating virtual environment in $VENV_DIR..."
    & $PYTHON_CMD -m venv $VENV_DIR
}

# Step 3: Install dependencies
Write-Host "Installing/Updating dependencies..."
& $PIP_EXE install -r (Join-Path $ENGINE_DIR "requirements.txt")

# Step 4: Run AI Engine
Write-Host "Starting AI Engine on http://localhost:8001..." -ForegroundColor Green
Set-Location $ENGINE_DIR
& $PYTHON_EXE -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload
