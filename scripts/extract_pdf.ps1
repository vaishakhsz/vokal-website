$pdfPath = "C:\Users\vaish\Downloads\A4 lETTER HEAD new-1.pdf"
$bytes = [System.IO.File]::ReadAllBytes($pdfPath)
Write-Host "PDF size: $($bytes.Length)"

# Look for JPEG markers: FF D8 FF
$jpegStarts = @()
for ($i = 0; $i -lt $bytes.Length - 3; $i++) {
    if ($bytes[$i] -eq 0xFF -and $bytes[$i+1] -eq 0xD8 -and $bytes[$i+2] -eq 0xFF) {
        $jpegStarts += $i
    }
}
Write-Host "Found JPEG starts: $($jpegStarts.Count)"

$count = 0
foreach ($start in $jpegStarts) {
    # Find matching FF D9
    for ($j = $start + 2; $j -lt $bytes.Length - 1; $j++) {
        if ($bytes[$j] -eq 0xFF -and $bytes[$j+1] -eq 0xD9) {
            $end = $j + 2
            $len = $end - $start
            if ($len -gt 1000) { # filter tiny thumbnails
                $imgBytes = New-Object byte[] $len
                [System.Array]::Copy($bytes, $start, $imgBytes, 0, $len)
                $outPath = "C:\Users\vaish\.gemini\antigravity\scratch\vokal-website\assets\extracted_img_$count.jpg"
                [System.IO.File]::WriteAllBytes($outPath, $imgBytes)
                Write-Host "Saved JPEG $count (size: $len) to $outPath"
                $count++
            }
            break
        }
    }
}

if ($count -eq 0) {
    Write-Host "No raw JPEGs found, checking PDF text / XObject streams..."
}
