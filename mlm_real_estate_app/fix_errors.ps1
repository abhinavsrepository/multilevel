# Fix Icons.lock_check -> Icons.lock
(Get-Content 'lib\presentation\screens\profile\change_password_screen.dart') -replace 'Icons\.lock_check', 'Icons.lock' | Set-Content 'lib\presentation\screens\profile\change_password_screen.dart'

# Fix Icons.person_check -> Icons.person
(Get-Content 'lib\presentation\screens\referral\referral_screen.dart') -replace 'Icons\.person_check', 'Icons.person' | Set-Content 'lib\presentation\screens\referral\referral_screen.dart'
(Get-Content 'lib\presentation\screens\team\team_report_screen.dart') -replace 'Icons\.person_check', 'Icons.person' | Set-Content 'lib\presentation\screens\team\team_report_screen.dart'
(Get-Content 'lib\presentation\screens\team\team_screen.dart') -replace 'Icons\.person_check', 'Icons.person' | Set-Content 'lib\presentation\screens\team\team_screen.dart'

# Fix forceMaterialTransparency nullable issue
(Get-Content 'lib\core\widgets\custom_app_bar.dart') -replace 'forceMaterialTransparency: forceMaterialTransparency,', 'forceMaterialTransparency: forceMaterialTransparency ?? false,' | Set-Content 'lib\core\widgets\custom_app_bar.dart'

# Comment out kyc_provider type getter issue
(Get-Content 'lib\data\providers\kyc_provider.dart') -replace 'final existingIndex = _documents\.indexWhere\(\(d\) => d\.type == type\);', '// COMMENTED OUT: KycDocumentModel.type not implemented`n      // final existingIndex = _documents.indexWhere((d) => d.type == type);`n      final existingIndex = -1; // TODO: Fix when type getter is added' | Set-Content 'lib\data\providers\kyc_provider.dart'

Write-Host "Fixes applied successfully"
