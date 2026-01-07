# This script requires PowerShell - https://learn.microsoft.com/en-us/powershell/entra-powershell/installation?view=entra-powershell&tabs=powershell%2Cv1
# Get Entra Module from https://learn.microsoft.com/en-us/powershell/entra-powershell/installation?view=entra-powershell&tabs=powershell%2Cv1

<#

.SYNOPSIS
Retrieves and displays Microsoft Entra license assignments for users specified in a CSV file.

.DESCRIPTION
This script connects to Microsoft Entra (formerly Azure AD) and retrieves all license assignments for users listed in a users.csv file located in the same directory as the script. It displays service plan information with provisioning status and supports exporting results to a CSV file for large-scale audits.

The script provides flexible output options:
- Console output with summary counts of active and pending plans
- Detailed console output showing all plan names and their provisioning statuses
- CSV export for processing large numbers of users without console clutter

Requirements:
- Microsoft.Entra PowerShell module
- User.Read.All permission in Entra
- users.csv file in the script directory with a UserPrincipalName column

.PARAMETER Plans
When specified, displays the full list of service plan names and their provisioning statuses. Without this parameter, only the count of active and pending plans is shown.

.PARAMETER ExportToCSV
When specified, exports license data to a CSV file (exported.csv) instead of printing to console. When combined with -Plans, includes detailed plan information in the CSV.


.NOTES
Script created by João Vitória Silva: https://www.linkedin.com/in/joao-v-silva/
Version 1.0 - GetLicensedUsers_v1.0-JVS-07-01-2026
Script changes:	1.0 - Initial version.

.EXAMPLE
.\GetLicensedUsers.ps1
.\GetLicensedUsers.ps1 -Plans
.\GetLicensedUsers.ps1 -ExportToCSV
.\GetLicensedUsers.ps1 -Plans -ExportToCSV

#>

param(
    [switch]$Plans = $false,
    [switch]$ExportToCSV = $false
)

Import-Module Microsoft.Entra
Connect-Entra -Scopes 'User.Read.All'

# Import CSV with users information
try{
    $users = Import-Csv "$PSScriptRoot\users.csv"
}catch{
    Write-Host "Unable to find the users CSV file. Aborting script!" -ForegroundColor "Red"
    Disconnect-Entra
    exit 1
}

# Initialize array for CSV export
$csvData = @()

$userCount = 0
foreach($user in $users){
    try{
        $userCount++
        $entraUser = Get-EntraUser -UserId $user.UserPrincipalName
        $userLicenses = Get-EntraUserLicenseDetail -UserId $entraUser.Id

        if(-not $ExportToCSV){
            # Add spacing between users
            if($userCount -gt 1) { Write-Host "" }
            Write-Host "USER: $($entraUser.UserPrincipalName)" -ForegroundColor "Cyan"
        }
        
        $licenseCount = 0
        foreach($license in $userLicenses){
            $licenseCount++
            
            # Categorize plans by status
            $servicePlans = $license.ServicePlans
            $successPlans = $servicePlans | Where-Object { $_.ProvisioningStatus -eq "Success" }
            $pendingPlans = $servicePlans | Where-Object { $_.ProvisioningStatus -ne "Success" }
            
            if($ExportToCSV){
                # Prepare CSV data
                if($Plans){
                    # Include plan details
                    $activePlanNames = ($successPlans | Select-Object -ExpandProperty ServicePlanName) -join ", "
                    $pendingPlanDetails = ($pendingPlans | ForEach-Object { "$($_.ServicePlanName) [$($_.ProvisioningStatus)]" }) -join ", "
                    
                    $csvData += [PSCustomObject]@{
                        UserEmail = $entraUser.UserPrincipalName
                        SKUPartNumber = $license.SkuPartNumber
                        SKUId = $license.SkuId
                        ActivePlansCount = $successPlans.Count
                        ActivePlans = $activePlanNames
                        PendingPlansCount = $pendingPlans.Count
                        PendingPlans = $pendingPlanDetails
                    }
                } else {
                    # Only include counts
                    $csvData += [PSCustomObject]@{
                        UserEmail = $entraUser.UserPrincipalName
                        SKUPartNumber = $license.SkuPartNumber
                        SKUId = $license.SkuId
                        ActivePlansCount = $successPlans.Count
                        PendingPlansCount = $pendingPlans.Count
                    }
                }
            } else {
                # Display in console
                Write-Host ""
                Write-Host "[$licenseCount] SKU: $($license.SkuPartNumber)" -ForegroundColor "Yellow"
                Write-Host "    SKU ID: $($license.SkuId)" -ForegroundColor "Gray"
                
                # Display successful plans
                if($successPlans){
                    if($Plans){
                        Write-Host "    ✓ Active Plans ($($successPlans.Count)):" -ForegroundColor "Green"
                        foreach($plan in $successPlans){
                            Write-Host "      • $($plan.ServicePlanName)" -ForegroundColor "Green"
                        }
                    } else {
                        Write-Host "    ✓ Active Plans: $($successPlans.Count)" -ForegroundColor "Green"
                    }
                }
                
                # Display pending plans
                if($pendingPlans){
                    if($Plans){
                        Write-Host "    ⧗ Pending Plans ($($pendingPlans.Count)):" -ForegroundColor "Yellow"
                        foreach($plan in $pendingPlans){
                            Write-Host "      • $($plan.ServicePlanName) [$($plan.ProvisioningStatus)]" -ForegroundColor "Yellow"
                        }
                    } else {
                        Write-Host "    ⧗ Pending Plans: $($pendingPlans.Count)" -ForegroundColor "Yellow"
                    }
                }
            }
        }
        
        if(-not $ExportToCSV){
            Write-Host ""
            Write-Host "Total licenses: $licenseCount" -ForegroundColor "Cyan"
            Write-Host "-------------------------"
            Write-Host ""
        }
    }catch{
        Write-Host "User not found: $($user.UserPrincipalName). Skipping to next user." -ForegroundColor "Red"
        continue
    }
}
Write-Host ""
Write-Host "SUMMARY: Processed $userCount user(s)" -ForegroundColor "Cyan"

# Export to CSV if requested
if($ExportToCSV){
    $csvPath = "$PSScriptRoot\exported.csv"
    $csvData | Export-Csv -Path $csvPath -NoTypeInformation
    Write-Host "Data exported to: $csvPath" -ForegroundColor "Green"
}