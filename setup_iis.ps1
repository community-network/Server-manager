# https://learn.microsoft.com/en-us/powershell/module/webadministration/new-website?view=windowsserver2025-ps
$loc = Get-Location
# $sites | Select-Object -Property *
$has_site =  Get-Website | Select-Object PhysicalPath, Name | Where-Object PhysicalPath -eq $loc.path
if ($has_site -and $has_site.Name -ne "manager-gametools") {
    Write-Output "Removed old site with wrong naming"
    Remove-Website -Name $has_site.Name
}

$has_site =  Get-Website | Select-Object PhysicalPath, Name | Where-Object PhysicalPath -eq $loc.path
$has_site
if ( !$has_site )
{
    New-WebSite -Name "manager-gametools" -Port "80" -HostHeader "manager.localhost" -PhysicalPath $loc.path
}
