$ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
$mastersDir = "C:\Users\vaish\.gemini\antigravity\scratch\vokal-website\assets\masters"

# 1. Jesus Christ (The Good Shepherd caring for sheep/lamb)
$jesusUrl = "https://upload.wikimedia.org/wikipedia/commons/5/5e/Bernhard_Plockhorst_-_The_Good_Shepherd.jpg"
try {
    Invoke-WebRequest -Uri $jesusUrl -UserAgent $ua -OutFile "$mastersDir\jesus_christ.jpg" -TimeoutSec 15
    Write-Host "Jesus Christ downloaded successfully"
} catch {
    Write-Host "Jesus download error: $_"
}

# 2. Gautama Buddha (Classic serene Buddha statue)
$buddhaUrl = "https://upload.wikimedia.org/wikipedia/commons/4/4e/Buddha_in_the_Art_Institute_of_Chicago.jpg"
try {
    Invoke-WebRequest -Uri $buddhaUrl -UserAgent $ua -OutFile "$mastersDir\gautama_buddha.jpg" -TimeoutSec 15
    Write-Host "Buddha downloaded successfully"
} catch {
    Write-Host "Buddha download error: $_"
}

# 3. Prophet Muhammad (Sacred Calligraphy)
$prophetUrl = "https://upload.wikimedia.org/wikipedia/commons/7/77/Muhammad2.png"
try {
    Invoke-WebRequest -Uri $prophetUrl -UserAgent $ua -OutFile "$mastersDir\prophet_muhammad.png" -TimeoutSec 15
    Write-Host "Prophet Muhammad downloaded successfully"
} catch {
    Write-Host "Prophet Muhammad download error: $_"
}

# 4. Mata Amritanandamayi (Amma)
$ammaUrl = "https://upload.wikimedia.org/wikipedia/commons/5/53/Mata_Amritanandamayi_Devi.jpg"
try {
    Invoke-WebRequest -Uri $ammaUrl -UserAgent $ua -OutFile "$mastersDir\mata_amritanandamayi.jpg" -TimeoutSec 15
    Write-Host "Mata Amritanandamayi downloaded successfully"
} catch {
    Write-Host "Amma download error: $_"
}
