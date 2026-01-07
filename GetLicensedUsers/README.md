**🤖 AI-Assisted Project**

This project was created using AI assistance from **GitHub Copilot** powered by **Sonnet Haiku 4.5** models. The entire codebase, documentation, and implementation plan were generated through AI collaboration.

---

# GetLicensedUsers

A PowerShell script that retrieves and displays Microsoft Entra license assignments for users specified in a CSV file. This tool is useful for auditing license usage, verifying service plan provisioning status, and exporting license data for large-scale management.

## Features

- **License Retrieval**: Fetches detailed license information from Microsoft Entra for specified users
- **Service Plan Visibility**: Shows active and pending service plans with their provisioning status
- **Console Output**: Displays results with color-coded formatting for easy reading
- **CSV Export**: Exports license data to CSV for processing in external tools
- **Flexible Parameters**: Supports detailed or summary output, with optional CSV export
- **Error Handling**: Gracefully handles missing users and provides summary statistics

## Prerequisites

- **PowerShell**: PowerShell 7.0 or later (or Windows PowerShell 5.1+)
- **Microsoft Entra PowerShell Module**: Install using `Install-Module -Name Microsoft.Entra`
- **Permissions**: `User.Read.All` permission in Microsoft Entra
- **Input File**: A `users.csv` file in the script directory with user email addresses. Example file provided as `users.csv.example`.

For more information, see the [Microsoft Entra PowerShell documentation](https://learn.microsoft.com/en-us/powershell/entra-powershell/installation?view=entra-powershell).

## Installation

1. Ensure you have the Microsoft Entra PowerShell module installed:

    ```powershell
    Install-Module -Name Microsoft.Entra -Scope CurrentUser
    ```

2. Create a `users.csv` file in the same directory as the script with the following format:

    ```csv
    UserPrincipalName
    user1@example.com
    user2@example.com
    ```

    You can use the provided `users.csv.example` as a template.

## Usage

### Basic Usage

Display license counts (active and pending plans) for each user:

```powershell
.\GetLicensedUsers.ps1
```

### Show Detailed Plans

Display full service plan names and provisioning statuses:

```powershell
.\GetLicensedUsers.ps1 -Plans
```

### Export to CSV

Export license data to `exported.csv` in the script directory (summary only):

```powershell
.\GetLicensedUsers.ps1 -ExportToCSV
```

### Export Detailed Plans to CSV

Export license data with full plan details to CSV:

```powershell
.\GetLicensedUsers.ps1 -Plans -ExportToCSV
```

## Output Format

### Console Output (Default)

```
USER: user1@example.com

[1] SKU: O365_BUSINESS_PREMIUM
    SKU ID: 12345678-1234-1234-1234-123456789012
    ✓ Active Plans: 15
    ⧗ Pending Plans: 2

Total licenses: 1
```

### Console Output (With -Plans)

```
USER: user1@example.com

[1] SKU: O365_BUSINESS_PREMIUM
    SKU ID: 12345678-1234-1234-1234-123456789012
    ✓ Active Plans (15):
      • EXCHANGE_S_FOUNDATION
      • PROJECTWORKMANAGEMENT
      • TEAMS1
    ⧗ Pending Plans (2):
      • SHAREPOINTWAC [PendingProvisioning]
      • VISIO_CLIENT_SUBSCRIPTION [PendingActivation]

Total licenses: 1
```

### CSV Export

The exported CSV includes:
- **UserEmail**: User principal name
- **SKUPartNumber**: License SKU name
- **SKUId**: License SKU ID
- **ActivePlansCount**: Number of active service plans
- **PendingPlansCount**: Number of pending service plans
- **ActivePlans**: (with -Plans) Comma-separated list of active plan names
- **PendingPlans**: (with -Plans) Comma-separated list of pending plans with status

## Files

- **GetLicensedUsers.ps1**: Main script
- **users.csv**: Input file containing user principal names (create from `users.csv.example`)
- **users.csv.example**: Example template for the users.csv file
- **exported.csv**: Output file generated when using `-ExportToCSV` parameter

## Examples

### Audit all licenses for specific users

1. Create `users.csv` with target users
2. Run: `.\GetLicensedUsers.ps1 -Plans`

### Export license data for reporting

1. Create `users.csv` with target users
2. Run: `.\GetLicensedUsers.ps1 -Plans -ExportToCSV`
3. Open `exported.csv` in Excel or your preferred spreadsheet application

### Quick license count check

1. Create `users.csv` with target users
2. Run: `.\GetLicensedUsers.ps1`

## Troubleshooting

### "Unable to find the users CSV file"
- Ensure `users.csv` exists in the same directory as the script
- Check that the file is named exactly `users.csv` (case-sensitive on some systems)

### "User not found: user@example.com"
- The user doesn't exist in Entra or has a different UPN
- Verify the email address in `users.csv` is correct and matches the Entra directory

### Authentication errors
- Ensure you have the `User.Read.All` permission in Entra
- Run `Connect-Entra -Scopes 'User.Read.All'` manually to verify credentials
- Check that your Entra account has sufficient privileges
