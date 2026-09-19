Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\vaish\.gemini\antigravity\scratch\vokal-website\assets\vokal_letterhead.png"
$src = [System.Drawing.Bitmap]::FromFile($srcPath)
Write-Host "Source image size: $($src.Width) x $($src.Height)"

# 1. Header strip: crop top 250px
$headerRect = New-Object System.Drawing.Rectangle(0, 0, $src.Width, [int]($src.Height * 0.13))
$headerBmp = $src.Clone($headerRect, $src.PixelFormat)
$headerBmp.Save("C:\Users\vaish\.gemini\antigravity\scratch\vokal-website\assets\vokal_header_title.png", [System.Drawing.Imaging.ImageFormat]::Png)
$headerBmp.Dispose()
Write-Host "Saved vokal_header_title.png"

# 2. Logo emblem: crop around (40, 20) to (270, 250) roughly
$logoRect = New-Object System.Drawing.Rectangle(45, 20, 240, 220)
$logoBmp = $src.Clone($logoRect, $src.PixelFormat)
$logoBmp.Save("C:\Users\vaish\.gemini\antigravity\scratch\vokal-website\assets\vokal_logo_round.png", [System.Drawing.Imaging.ImageFormat]::Png)
$logoBmp.Dispose()
Write-Host "Saved vokal_logo_round.png"

# 3. Logo + Title (no Reg No): crop (40, 20) to (950, 220)
$brandRect = New-Object System.Drawing.Rectangle(45, 20, 880, 220)
$brandBmp = $src.Clone($brandRect, $src.PixelFormat)
$brandBmp.Save("C:\Users\vaish\.gemini\antigravity\scratch\vokal-website\assets\vokal_brand_header.png", [System.Drawing.Imaging.ImageFormat]::Png)
$brandBmp.Dispose()
Write-Host "Saved vokal_brand_header.png"

$src.Dispose()
