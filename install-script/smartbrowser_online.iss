﻿; Script generated by the Inno Script Studio Wizard.
; SEE THE DOCUMENTATION FOR DETAILS ON CREATING INNO SETUP SCRIPT FILES!

#define MyAppName "Smart Browser"
#define MyAppVersion "2.10.8"
#define MyAppPublisher "TripeOneTech"
#define MyAppURL "http://www.tripleonetech.com/"
#define MyAppExeName "smart.exe"
#define ProjectHomeBase "E:\Code\SmartBrowsering"
#define FlashInstall "flashplayer21pp_ha_install.exe"
#define CertInstall "install_root_cert.bat"
#define PluginFile "safe_admin_plugin.crx"

#define OnlineDownloadFile "https://systemadmin.smartbackend.com/browser/smartbrowserbin.7z"
#define OnlineFilename "smartbrowserbin.7z"
#define PasswordForDownloadFile "e1003d53ea80484118c4906c"
#define UnzipFilename "7za.exe"

[Setup]
; NOTE: The value of AppId uniquely identifies this application.
; Do not use the same AppId value in installers for other applications.
; (To generate a new GUID, click Tools | Generate GUID inside the IDE.)
AppId={{073A7E5D-2867-44CB-AD2D-85FD1A69D3CB}
AppName={cm:SmartBrowserName}
AppVersion={#MyAppVersion}
;AppVerName={#MyAppName} {#MyAppVersion}

AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName={pf32}\SmartBrowser
DefaultGroupName={cm:SmartBrowserName}
OutputDir={#ProjectHomeBase}
OutputBaseFilename=smartbrowser-online-setup
Compression=lzma
SolidCompression=yes
PrivilegesRequired=admin
SetupIconFile=smartbrowser.ico

SignTool=signsdk sign /f "{#ProjectHomeBase}\install-script\smartbrowser.pfx" /t http://timestamp.comodoca.com/authenticode /p 12345678 $f

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"
Name: "chinesesimplified"; MessagesFile: "compiler:Languages\ChineseSimplified.isl"
; Name: "chinesetraditional"; MessagesFile: "compiler:Languages\ChineseTraditional.isl"

;[Components]
;Name: main; Description: "SmartBrowser"; Types: full compact; Flags: fixed
;Name: online_package; Description: "Online Package"; Types: full compact; Flags: fixed

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"

[Files]
; Source: "{#ProjectHomeBase}\bin-release\smartbrowsering.exe"; DestDir: "{app}"; Flags: ignoreversion
; Source: "{#ProjectHomeBase}\bin-release\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

Source: "{#ProjectHomeBase}\install-script\{#UnzipFilename}"; DestDir: "{app}"; Flags: ignoreversion

Source: "{tmp}\{#OnlineFilename}"; DestDir: "{app}"; \
  Flags: external; Check: DwinsHs_Check(ExpandConstant('{tmp}\{#OnlineFilename}'), \
    '{#OnlineDownloadFile}', 'SmartInstaller', 'get', 0);

; NOTE: Don't use "Flags: ignoreversion" on any shared system files

[Registry]
Root: "HKLM"; Subkey: "Software\Policies\Chromium\ExtensionInstallForcelist"; ValueType: string; ValueName: "1"; ValueData: "gknnednfaaodhgfpigmlaahknkckgcii;http://systemadmin.smartbackend.com/browser/plugins/update.xml"
Root: "HKLM"; Subkey: "Software\Policies\Chromium\ExtensionInstallForcelist"; ValueType: string; ValueName: "2"; ValueData: "ngaojpmmjmcjnfkiiggfdkapcenmalfc;https://clients2.google.com/service/update2/crx"

Root: "HKLM"; Subkey: "Software\Policies\Chromium\ExtensionInstallSources"; ValueType: string; ValueName: "1"; ValueData: "http://systemadmin.smartbackend.com/*"
Root: "HKLM"; Subkey: "Software\Policies\Chromium\ExtensionInstallSources"; ValueType: string; ValueName: "2"; ValueData: "http://systemadmin.tripleonetech.com/*"
Root: "HKLM"; Subkey: "Software\Policies\Chromium\ExtensionInstallSources"; ValueType: string; ValueName: "3"; ValueData: "file:///*/SmartBrowser/*"

;Root: "HKCU"; Subkey: "Software\Policies\Chromium\ExtensionInstallSources"; ValueType: string; ValueName: "1"; ValueData: "http://systemadmin.smartbackend.com/*"
;Root: "HKCU"; Subkey: "Software\Policies\Chromium\ExtensionInstallSources"; ValueType: string; ValueName: "2"; ValueData: "http://systemadmin.tripleonetech.com/*"

Root: "HKLM"; Subkey: "Software\Policies\Chromium\ExtensionInstallWhitelist"; ValueType: string; ValueName: "1"; ValueData: "gknnednfaaodhgfpigmlaahknkckgcii"
Root: "HKLM"; Subkey: "Software\Policies\Chromium\ExtensionInstallWhitelist"; ValueType: string; ValueName: "2"; ValueData: "ngaojpmmjmcjnfkiiggfdkapcenmalfc"

;===theme====================
Root: "HKLM"; Subkey: "Software\Google\Chrome\Extensions\ngaojpmmjmcjnfkiiggfdkapcenmalfc"; ValueType: string; ValueName: "Path"; ValueData: "{app}\main_theme_plugin.crx"
Root: "HKLM"; Subkey: "Software\Google\Chrome\Extensions\ngaojpmmjmcjnfkiiggfdkapcenmalfc"; ValueType: string; ValueName: "Version"; ValueData: "2.9.12"
Root: "HKLM"; Subkey: "Software\Google\Chrome\Extensions\ngaojpmmjmcjnfkiiggfdkapcenmalfc"; ValueType: string; ValueName: "update_url"; ValueData: "https://clients2.google.com/service/update2/crx"

Root: "HKLM"; Subkey: "Software\Chromium\Extensions\ngaojpmmjmcjnfkiiggfdkapcenmalfc"; ValueType: string; ValueName: "Path"; ValueData: "{app}\main_theme_plugin.crx"
Root: "HKLM"; Subkey: "Software\Chromium\Extensions\ngaojpmmjmcjnfkiiggfdkapcenmalfc"; ValueType: string; ValueName: "Version"; ValueData: "2.9.12"
Root: "HKLM"; Subkey: "Software\Chromium\Extensions\ngaojpmmjmcjnfkiiggfdkapcenmalfc"; ValueType: string; ValueName: "update_url"; ValueData: "https://clients2.google.com/service/update2/crx"

Root: "HKLM"; Subkey: "Software\Wow6432Node\Google\Chrome\Extensions\ngaojpmmjmcjnfkiiggfdkapcenmalfc"; ValueType: string; ValueName: "Path"; ValueData: "{app}\main_theme_plugin.crx"
Root: "HKLM"; Subkey: "Software\Wow6432Node\Google\Chrome\Extensions\ngaojpmmjmcjnfkiiggfdkapcenmalfc"; ValueType: string; ValueName: "Version"; ValueData: "2.9.12"
Root: "HKLM"; Subkey: "Software\Wow6432Node\Google\Chrome\Extensions\ngaojpmmjmcjnfkiiggfdkapcenmalfc"; ValueType: string; ValueName: "update_url"; ValueData: "https://clients2.google.com/service/update2/crx"

Root: "HKLM"; Subkey: "Software\Wow6432Node\Chromium\Extensions\ngaojpmmjmcjnfkiiggfdkapcenmalfc"; ValueType: string; ValueName: "Path"; ValueData: "{app}\main_theme_plugin.crx"
Root: "HKLM"; Subkey: "Software\Wow6432Node\Chromium\Extensions\ngaojpmmjmcjnfkiiggfdkapcenmalfc"; ValueType: string; ValueName: "Version"; ValueData: "2.9.12"
Root: "HKLM"; Subkey: "Software\Wow6432Node\Chromium\Extensions\ngaojpmmjmcjnfkiiggfdkapcenmalfc"; ValueType: string; ValueName: "update_url"; ValueData: "https://clients2.google.com/service/update2/crx"

;===admin===============================
Root: "HKLM"; Subkey: "Software\Google\Chrome\Extensions\gknnednfaaodhgfpigmlaahknkckgcii"; ValueType: string; ValueName: "Path"; ValueData: "{app}\safe_admin_plugin.crx"
Root: "HKLM"; Subkey: "Software\Google\Chrome\Extensions\gknnednfaaodhgfpigmlaahknkckgcii"; ValueType: string; ValueName: "Version"; ValueData: "2.9.12"
Root: "HKLM"; Subkey: "Software\Google\Chrome\Extensions\gknnednfaaodhgfpigmlaahknkckgcii"; ValueType: string; ValueName: "update_url"; ValueData: "http://systemadmin.smartbackend.com/browser/plugins/update.xml"

Root: "HKLM"; Subkey: "Software\Chromium\Extensions\gknnednfaaodhgfpigmlaahknkckgcii"; ValueType: string; ValueName: "Path"; ValueData: "{app}\safe_admin_plugin.crx"
Root: "HKLM"; Subkey: "Software\Chromium\Extensions\gknnednfaaodhgfpigmlaahknkckgcii"; ValueType: string; ValueName: "Version"; ValueData: "2.9.12"
Root: "HKLM"; Subkey: "Software\Chromium\Extensions\gknnednfaaodhgfpigmlaahknkckgcii"; ValueType: string; ValueName: "update_url"; ValueData: "http://systemadmin.smartbackend.com/browser/plugins/update.xml"

Root: "HKLM"; Subkey: "Software\Wow6432Node\Google\Chrome\Extensions\gknnednfaaodhgfpigmlaahknkckgcii"; ValueType: string; ValueName: "Path"; ValueData: "{app}\safe_admin_plugin.crx"
Root: "HKLM"; Subkey: "Software\Wow6432Node\Google\Chrome\Extensions\gknnednfaaodhgfpigmlaahknkckgcii"; ValueType: string; ValueName: "Version"; ValueData: "2.9.12"
Root: "HKLM"; Subkey: "Software\Wow6432Node\Google\Chrome\Extensions\gknnednfaaodhgfpigmlaahknkckgcii"; ValueType: string; ValueName: "update_url"; ValueData: "http://systemadmin.smartbackend.com/browser/plugins/update.xml"

Root: "HKLM"; Subkey: "Software\Wow6432Node\Chromium\Extensions\gknnednfaaodhgfpigmlaahknkckgcii"; ValueType: string; ValueName: "Path"; ValueData: "{app}\safe_admin_plugin.crx"
Root: "HKLM"; Subkey: "Software\Wow6432Node\Chromium\Extensions\gknnednfaaodhgfpigmlaahknkckgcii"; ValueType: string; ValueName: "Version"; ValueData: "2.9.12"
Root: "HKLM"; Subkey: "Software\Wow6432Node\Chromium\Extensions\gknnednfaaodhgfpigmlaahknkckgcii"; ValueType: string; ValueName: "update_url"; ValueData: "http://systemadmin.smartbackend.com/browser/plugins/update.xml"

;Root: "HKLM"; Subkey: "Software\Policies\Chromium\Extensions\gknnednfaaodhgfpigmlaahknkckgcii\path"; ValueType: string; ValueData: "{app}\safe_admin_plugin.crx"
;Root: "HKLM"; Subkey: "Software\Policies\Chromium\Extensions\gknnednfaaodhgfpigmlaahknkckgcii\version"; ValueType: string; ValueData: "2.9.12"

;bookmark
Root: "HKLM"; Subkey: "Software\Policies\Chromium"; ValueType: string; ValueName: "ManagedBookmarks"; ValueData: "[{{""name"": ""TripleOneTech"", ""url"": ""http://portal.tripleonetech.com""}]"
Root: "HKLM"; Subkey: "Software\Policies\Chromium"; ValueType: dword; ValueName: "WelcomePageOnOSUpgradeEnabled"; ValueData: "$00000000"

;Root: "HKCU"; Subkey: "Software\Policies\Chromium"; ValueType: string; ValueName: "ManagedBookmarks"; ValueData: "[{{""name"": ""TripleOneTech"", ""url"": ""http://portal.tripleonetech.com""}]"
;Root: "HKCU"; Subkey: "Software\Policies\Chromium"; ValueType: dword; ValueName: "WelcomePageOnOSUpgradeEnabled"; ValueData: "$00000000"

Root: "HKLM"; Subkey: "Software\Policies\Chromium\AudioCaptureAllowedUrls"; ValueType: string; ValueName: "1"; ValueData: ".smartbackend.com"
Root: "HKLM"; Subkey: "Software\Policies\Chromium\AudioCaptureAllowedUrls"; ValueType: string; ValueName: "2"; ValueData: ".tripleonetech.com"

Root: "HKLM"; Subkey: "Software\Policies\Chromium\CookiesAllowedForUrls"; ValueType: string; ValueName: "1"; ValueData: ".smartbackend.com"
Root: "HKLM"; Subkey: "Software\Policies\Chromium\CookiesAllowedForUrls"; ValueType: string; ValueName: "2"; ValueData: ".tripleonetech.com"

Root: "HKLM"; Subkey: "Software\Policies\Chromium\ImagesAllowedForUrls"; ValueType: string; ValueName: "1"; ValueData: ".smartbackend.com"
Root: "HKLM"; Subkey: "Software\Policies\Chromium\ImagesAllowedForUrls"; ValueType: string; ValueName: "2"; ValueData: ".tripleonetech.com"

Root: "HKLM"; Subkey: "Software\Policies\Chromium\JavaScriptAllowedForUrls"; ValueType: string; ValueName: "1"; ValueData: ".smartbackend.com"
Root: "HKLM"; Subkey: "Software\Policies\Chromium\JavaScriptAllowedForUrls"; ValueType: string; ValueName: "2"; ValueData: ".tripleonetech.com"

Root: "HKLM"; Subkey: "Software\Policies\Chromium\KeygenAllowedForUrls"; ValueType: string; ValueName: "1"; ValueData: ".smartbackend.com"
Root: "HKLM"; Subkey: "Software\Policies\Chromium\KeygenAllowedForUrls"; ValueType: string; ValueName: "2"; ValueData: ".tripleonetech.com"

Root: "HKLM"; Subkey: "Software\Policies\Chromium\NotificationsAllowedForUrls"; ValueType: string; ValueName: "1"; ValueData: ".smartbackend.com"
Root: "HKLM"; Subkey: "Software\Policies\Chromium\NotificationsAllowedForUrls"; ValueType: string; ValueName: "2"; ValueData: ".tripleonetech.com"

Root: "HKLM"; Subkey: "Software\Policies\Chromium\PluginsAllowedForUrls"; ValueType: string; ValueName: "1"; ValueData: ".smartbackend.com"
Root: "HKLM"; Subkey: "Software\Policies\Chromium\PluginsAllowedForUrls"; ValueType: string; ValueName: "2"; ValueData: ".tripleonetech.com"

Root: "HKLM"; Subkey: "Software\Policies\Chromium\PopupsAllowedForUrls"; ValueType: string; ValueName: "1"; ValueData: ".smartbackend.com"
Root: "HKLM"; Subkey: "Software\Policies\Chromium\PopupsAllowedForUrls"; ValueType: string; ValueName: "2"; ValueData: ".tripleonetech.com"

Root: "HKLM"; Subkey: "Software\Policies\Chromium\URLWhitelist"; ValueType: string; ValueName: "1"; ValueData: ".smartbackend.com"
Root: "HKLM"; Subkey: "Software\Policies\Chromium\URLWhitelist"; ValueType: string; ValueName: "2"; ValueData: ".tripleonetech.com"

;Root: "HKLM"; Subkey: "Software\Policies\Chromium\ExtensionInstallForcelist"; ValueType: string; ValueName: "1"; ValueData: "gknnednfaaodhgfpigmlaahknkckgcii;http://systemadmin.smartbackend.com/browser/plugins/update.xml"

;Root: "HKLM"; Subkey: "Software\Policies\Chromium\ExtensionInstallSources"; ValueType: string; ValueName: "1"; ValueData: "http://systemadmin.smartbackend.com/*"
;Root: "HKLM"; Subkey: "Software\Policies\Chromium\ExtensionInstallSources"; ValueType: string; ValueName: "2"; ValueData: "http://systemadmin.tripleonetech.com/*"

;Root: "HKLM"; Subkey: "Software\Policies\Chromium\ExtensionInstallWhitelist"; ValueType: string; ValueName: "1"; ValueData: "gknnednfaaodhgfpigmlaahknkckgcii"

;Root: "HKLM"; Subkey: "Software\Policies\Chromium\NativeMessagingWhitelist"; ValueType: string; ValueName: "1"; ValueData: "com.native.messaging.smartbackend"
;Root: "HKLM"; Subkey: "Software\Policies\Chromium\NativeMessagingWhitelist"; ValueType: string; ValueName: "2"; ValueData: "com.native.messaging.tripleonetech"

;Root: "HKLM"; Subkey: "Software\Policies\Chromium\RestoreOnStartupURLs"; ValueType: string; ValueName: "1"; ValueData: "http://portal.tripleonetech.com"

;Root: "HKLM"; Subkey: "Software\Policies\Chromium\Recommended"; ValueType: dword; ValueName: "HomepageIsNewTabPage"; ValueData: "$00000001"
;Root: "HKLM"; Subkey: "Software\Policies\Chromium\Recommended"; ValueType: string; ValueName: "HomepageLocation"; ValueData: "http://portal.tripleonetech.com"

;Root: "HKLM"; Subkey: "Software\Policies\Chromium\Recommended\RestoreOnStartupURLs"; ValueType: string; ValueName: "1"; ValueData: "http://portal.tripleonetech.com"

;current user
;Root: "HKCU"; Subkey: "Software\Policies\Chromium"; ValueType: string; ValueName: "ManagedBookmarks"; ValueData: "[{{""name"": ""TripleOneTech"", ""url"": ""http://portal.tripleonetech.com""}]"
;Root: "HKCU"; Subkey: "Software\Policies\Chromium"; ValueType: dword; ValueName: "WelcomePageOnOSUpgradeEnabled"; ValueData: "$00000000"

;Root: "HKCU"; Subkey: "Software\Policies\Chromium\AudioCaptureAllowedUrls"; ValueType: string; ValueName: "1"; ValueData: ".smartbackend.com"
;Root: "HKCU"; Subkey: "Software\Policies\Chromium\AudioCaptureAllowedUrls"; ValueType: string; ValueName: "2"; ValueData: ".tripleonetech.com"

;Root: "HKCU"; Subkey: "Software\Policies\Chromium\CookiesAllowedForUrls"; ValueType: string; ValueName: "1"; ValueData: ".smartbackend.com"
;Root: "HKCU"; Subkey: "Software\Policies\Chromium\CookiesAllowedForUrls"; ValueType: string; ValueName: "2"; ValueData: ".tripleonetech.com"

;Root: "HKCU"; Subkey: "Software\Policies\Chromium\ImagesAllowedForUrls"; ValueType: string; ValueName: "1"; ValueData: ".smartbackend.com"
;Root: "HKCU"; Subkey: "Software\Policies\Chromium\ImagesAllowedForUrls"; ValueType: string; ValueName: "2"; ValueData: ".tripleonetech.com"

;Root: "HKCU"; Subkey: "Software\Policies\Chromium\JavaScriptAllowedForUrls"; ValueType: string; ValueName: "1"; ValueData: ".smartbackend.com"
;Root: "HKCU"; Subkey: "Software\Policies\Chromium\JavaScriptAllowedForUrls"; ValueType: string; ValueName: "2"; ValueData: ".tripleonetech.com"

;Root: "HKCU"; Subkey: "Software\Policies\Chromium\KeygenAllowedForUrls"; ValueType: string; ValueName: "1"; ValueData: ".smartbackend.com"
;Root: "HKCU"; Subkey: "Software\Policies\Chromium\KeygenAllowedForUrls"; ValueType: string; ValueName: "2"; ValueData: ".tripleonetech.com"

;Root: "HKCU"; Subkey: "Software\Policies\Chromium\NotificationsAllowedForUrls"; ValueType: string; ValueName: "1"; ValueData: ".smartbackend.com"
;Root: "HKCU"; Subkey: "Software\Policies\Chromium\NotificationsAllowedForUrls"; ValueType: string; ValueName: "2"; ValueData: ".tripleonetech.com"

;Root: "HKCU"; Subkey: "Software\Policies\Chromium\PluginsAllowedForUrls"; ValueType: string; ValueName: "1"; ValueData: ".smartbackend.com"
;Root: "HKCU"; Subkey: "Software\Policies\Chromium\PluginsAllowedForUrls"; ValueType: string; ValueName: "2"; ValueData: ".tripleonetech.com"

;Root: "HKCU"; Subkey: "Software\Policies\Chromium\PopupsAllowedForUrls"; ValueType: string; ValueName: "1"; ValueData: ".smartbackend.com"
;Root: "HKCU"; Subkey: "Software\Policies\Chromium\PopupsAllowedForUrls"; ValueType: string; ValueName: "2"; ValueData: ".tripleonetech.com"

;Root: "HKCU"; Subkey: "Software\Policies\Chromium\URLWhitelist"; ValueType: string; ValueName: "1"; ValueData: ".smartbackend.com"
;Root: "HKCU"; Subkey: "Software\Policies\Chromium\URLWhitelist"; ValueType: string; ValueName: "2"; ValueData: ".tripleonetech.com"

;Root: "HKCU"; Subkey: "Software\Policies\Chromium\ExtensionInstallForcelist"; ValueType: string; ValueName: "1"; ValueData: "gknnednfaaodhgfpigmlaahknkckgcii;http://systemadmin.smartbackend.com/browser/plugins/update.xml"

;Root: "HKCU"; Subkey: "Software\Policies\Chromium\ExtensionInstallSources"; ValueType: string; ValueName: "1"; ValueData: "http://systemadmin.smartbackend.com/*"
;Root: "HKCU"; Subkey: "Software\Policies\Chromium\ExtensionInstallSources"; ValueType: string; ValueName: "2"; ValueData: "http://systemadmin.tripleonetech.com/*"

;Root: "HKCU"; Subkey: "Software\Policies\Chromium\ExtensionInstallWhitelist"; ValueType: string; ValueName: "1"; ValueData: "gknnednfaaodhgfpigmlaahknkckgcii"

;Root: "HKCU"; Subkey: "Software\Policies\Chromium\NativeMessagingWhitelist"; ValueType: string; ValueName: "1"; ValueData: "com.native.messaging.smartbackend"
;Root: "HKCU"; Subkey: "Software\Policies\Chromium\NativeMessagingWhitelist"; ValueType: string; ValueName: "2"; ValueData: "com.native.messaging.tripleonetech"

;Root: "HKCU"; Subkey: "Software\Policies\Chromium\RestoreOnStartupURLs"; ValueType: string; ValueName: "1"; ValueData: "http://portal.tripleonetech.com"

;Root: "HKCU"; Subkey: "Software\Policies\Chromium\Recommended"; ValueType: dword; ValueName: "HomepageIsNewTabPage"; ValueData: "$00000001"
;Root: "HKCU"; Subkey: "Software\Policies\Chromium\Recommended"; ValueType: string; ValueName: "HomepageLocation"; ValueData: "http://portal.tripleonetech.com"

;Root: "HKCU"; Subkey: "Software\Policies\Chromium\Recommended\RestoreOnStartupURLs"; ValueType: string; ValueName: "1"; ValueData: "http://portal.tripleonetech.com"

[Icons]
Name: "{group}\{cm:SmartBrowserName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{group}\{cm:InstallPlugin}"; Filename: "{app}\{#MyAppExeName}"; WorkingDir: "{app}"; Parameters: """{app}\{#PluginFile}"""
Name: "{group}\{cm:InstallFlash}"; Filename: "{app}\{#FlashInstall}"; WorkingDir: "{app}"
Name: "{group}\{cm:InstallCert}"; Filename: "{app}\{#CertInstall}"; WorkingDir: "{app}"
;Name: "{group}\{cm:InstallPlugin}"; Filename: "{app}\{#CertInstall}"; WorkingDir: "{app}"
Name: "{commondesktop}\{cm:SmartBrowserName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon

[Run]
;Filename: "{app}\{#MyAppExeName}"; Flags: nowait postinstall skipifsilent; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"
Filename: "{app}\{#UnzipFilename}"; Parameters: "x -p{#PasswordForDownloadFile} -o""{app}"" ""{app}\{#OnlineFilename}"""; WorkingDir: "{app}"; StatusMsg: "{cm:UnzipFiles}"
;Filename: "{app}\{#FlashInstall}"; Flags: shellexec waituntilterminated; StatusMsg: "{cm:InstallFlash}"

Filename: "{app}\{#MyAppExeName}"; Parameters: """{app}\{#PluginFile}"""; Flags: nowait shellexec; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"
Filename: "{app}\CertMgr.exe"; Parameters: "-add -all -c .\root_smart.crt -s -r localMachine root"; WorkingDir: "{app}"; Flags: waituntilterminated; StatusMsg: "{cm:InstallSafeCert}"

[UninstallDelete]
Type: filesandordirs; Name: "{app}\*"

[Code]

#define DwinsHs_Use_Predefined_Downloading_WizardPage
#define DwinsHs_Auto_Continue
#include "./dwinshs/dwinshs.iss"

procedure InitializeWizard();
begin
  DwinsHs_InitializeWizard(wpPreparing);
  //DwinsHs_SetProxy(pmProxy, ppSocks, 'safeproxy.smartbackend.com', 1080, '', '');

end;

procedure CurPageChanged(CurPageID: Integer);
begin
  DwinsHs_CurPageChanged(CurPageID, nil, nil);
end;

function ShouldSkipPage(CurPageId: Integer): Boolean;
begin
  Result := False;
  DwinsHs_ShouldSkipPage(CurPageId, Result);
end;

function BackButtonClick(CurPageID: Integer): Boolean;
begin
  Result := True;
  DwinsHs_BackButtonClick(CurPageID);
end;

function NextButtonClick(CurPageID: Integer): Boolean;
begin
  Result := True;
  DwinsHs_NextButtonClick(CurPageID, Result);
end;

procedure CancelButtonClick(CurPageID: Integer; var Cancel, Confirm: Boolean);
begin
  DwinsHs_CancelButtonClick(CurPageID, Cancel, Confirm);
end;

[CustomMessages]
english.InstallingFlash=Installing Flash...
chinesesimplified.InstallingFlash=正在安装Flash...
english.InstallSafeCert=Installing Safe Certificate...
chinesesimplified.InstallFlash=正在安装安全证书...
english.InstallFlash=Install Flash
chinesesimplified.InstallFlash=安装Flash
english.SmartBrowserName=Smart Browser
chinesesimplified.SmartBrowserName=智能浏览器
english.InstallCert=Install Certificate
chinesesimplified.InstallCert=安装安全证书
english.InstallPlugin=Install Plugin
chinesesimplified.InstallPlugin=安装插件

english.UnzipFiles=Unzip Files...
chinesesimplified.UnzipFiles=正在解压...

chinesesimplified.DwinsHs_PageCaption =正在下载安装所需文件
chinesesimplified.DwinsHs_PageDescription =请等候下载安装所需文件...
chinesesimplified.DwinsHs_TotalProgress =总进度:
chinesesimplified.DwinsHs_CurrentFile =当前文件:
chinesesimplified.DwinsHs_File =文件:
chinesesimplified.DwinsHs_Speed =速度:
chinesesimplified.DwinsHs_Status =状态:
chinesesimplified.DwinsHs_ElapsedTime =经过时间:
chinesesimplified.DwinsHs_RemainingTime =预计剩余时间:
chinesesimplified.DwinsHs_Status_ButtonRetry =&R重试
chinesesimplified.DwinsHs_Status_ButtonNext =&N下一步 >

chinesesimplified.DwinsHs_SizeInBytes =%d 字节
chinesesimplified.DwinsHs_SizeInKB =%.2f KB
chinesesimplified.DwinsHs_SizeInMB =%.2f MB
chinesesimplified.DwinsHs_ProgressValue = %s of %s (%d%%%)
chinesesimplified.DwinsHs_SpeedInBytes =%d 字节/s
chinesesimplified.DwinsHs_SpeedInKB =%.2f KB/s
chinesesimplified.DwinsHs_SpeedInMB =%.2f MB/s
chinesesimplified.DwinsHs_TimeInHour =%d 小时, %d 分钟, %d 秒
chinesesimplified.DwinsHs_TimeInMinute =%d 分钟, %d 秒
chinesesimplified.DwinsHs_TimeInSecond =%d 秒

chinesesimplified.DwinsHs_Status_GetFileInformation =获取文件大小
chinesesimplified.DwinsHs_Status_StartingDownload =开始下载
chinesesimplified.DwinsHs_Status_Downloading =正在下载
chinesesimplified.DwinsHs_Status_DownlaodComplete =下载完成

chinesesimplified.DwinsHs_Error_Network =连不上互联网
chinesesimplified.DwinsHs_Error_Offline =电脑目前离线
chinesesimplified.DwinsHs_Error_Initialize =初始化安装失败
chinesesimplifiedDwinsHs_Error_OpenSession =无法打开FTP或HTTP会话
chinesesimplified.DwinsHs_Error_CreateRequest =无法创建HTTP请求
chinesesimplified.DwinsHs_Error_SendRequest =无法发送请求到服务器
chinesesimplified.DwinsHs_Error_DeleteFile =以前的文件不能被删除
chinesesimplified.DwinsHs_Error_SaveFile =保存文件失败
chinesesimplified.DwinsHs_Error_Canceled =取消下载
chinesesimplified.DwinsHs_Error_ReadData =读取数据失败

chinesesimplified.DwinsHs_Status_HTTPError =HTTP错误 %d: %s
chinesesimplified.DwinsHs_Status_HTTP400 =错误请求
chinesesimplified.DwinsHs_Status_HTTP401 =没有权限
chinesesimplified.DwinsHs_Status_HTTP404 =文件没找到
chinesesimplified.DwinsHs_Status_HTTP407 =代理请求身份验证
chinesesimplified.DwinsHs_Status_HTTP500 =服务器内部错误
chinesesimplified.DwinsHs_Status_HTTP502 =错误的网关
chinesesimplified.DwinsHs_Status_HTTP503 =服务不可用
chinesesimplified.DwinsHs_Status_HTTPxxx =其它错误

