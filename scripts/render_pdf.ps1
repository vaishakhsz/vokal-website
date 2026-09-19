param(
    [string]$PdfPath = "C:\Users\vaish\Downloads\A4 lETTER HEAD new-1.pdf",
    [string]$OutputPath = "C:\Users\vaish\.gemini\antigravity\scratch\vokal-website\assets\vokal_letterhead.png"
)

try {
    Add-Type -AssemblyName System.Runtime.WindowsRuntime
    $asTaskGeneric = [System.WindowsRuntimeSystemExtensions].GetMethods() | ? { $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' }
    $asTaskAction = [System.WindowsRuntimeSystemExtensions].GetMethods() | ? { $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncAction' }

    [Windows.Storage.StorageFile, Windows.Storage, ContentType = WindowsRuntime] | Out-Null
    [Windows.Data.Pdf.PdfDocument, Windows.Data.Pdf, ContentType = WindowsRuntime] | Out-Null

    $fileTask = [Windows.Storage.StorageFile]::GetFileFromPathAsync($PdfPath)
    $file = $asTaskGeneric[0].MakeGenericMethod([Windows.Storage.StorageFile]).Invoke($null, @($fileTask)).Result

    $docTask = [Windows.Data.Pdf.PdfDocument]::LoadFromFileAsync($file)
    $doc = $asTaskGeneric[0].MakeGenericMethod([Windows.Data.Pdf.PdfDocument]).Invoke($null, @($docTask)).Result

    Write-Host "PDF Pages: $($doc.PageCount)"
    $page = $doc.GetPage(0)

    New-Item -Path $OutputPath -Force | Out-Null
    $outStorageFileTask = [Windows.Storage.StorageFile]::GetFileFromPathAsync($OutputPath)
    $outFile = $asTaskGeneric[0].MakeGenericMethod([Windows.Storage.StorageFile]).Invoke($null, @($outStorageFileTask)).Result

    $streamTask = $outFile.OpenAsync([Windows.Storage.FileAccessMode]::ReadWrite)
    $stream = $asTaskGeneric[0].MakeGenericMethod([Windows.Storage.Streams.IRandomAccessStream]).Invoke($null, @($streamTask)).Result

    $renderOptions = New-Object Windows.Data.Pdf.PdfPageRenderOptions
    $renderOptions.DestinationWidth = 1600

    $renderOp = $page.RenderToStreamAsync($stream, $renderOptions)
    
    # Wait using AsTask or get result
    $asTaskMethod = [System.WindowsRuntimeSystemExtensions].GetMethods() | ? { $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 }
    $task = $null
    foreach ($m in $asTaskMethod) {
        try {
            $task = $m.Invoke($null, @($renderOp))
            if ($task) { break }
        } catch {}
    }
    if ($task) {
        $task.Wait()
    } else {
        # Fallback polling
        while ($renderOp.Status -eq 0) { Start-Sleep -Milliseconds 50 }
    }

    $stream.Dispose()
    Write-Host "Successfully rendered high-res letterhead to $OutputPath"
} catch {
    Write-Host "Error: $_"
}
