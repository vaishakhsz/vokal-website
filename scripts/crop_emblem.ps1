Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\vaish\.gemini\antigravity\scratch\vokal-website\assets\vokal_letterhead.png"
$src = [System.Drawing.Bitmap]::FromFile($srcPath)

$emblemRect = New-Object System.Drawing.Rectangle(45, 25, 285, 290)
$emblemBmp = $src.Clone($emblemRect, $src.PixelFormat)
$emblemBmp.Save("C:\Users\vaish\.gemini\antigravity\scratch\vokal-website\assets\vokal_logo_emblem.png", [System.Drawing.Imaging.ImageFormat]::Png)
$emblemBmp.Dispose()

$src.Dispose()
Write-Host "Emblem cropped full width"
