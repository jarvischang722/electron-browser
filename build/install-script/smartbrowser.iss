﻿; Script generated by the Inno Script Studio Wizard.
; SEE THE DOCUMENTATION FOR DETAILS ON CREATING INNO SETUP SCRIPT FILES!

#define MyAppName "Safety Browser"
#define MyAppPublisher "TripleOneTech"
#define MyAppURL "https://www.tripleonetech.com/"
#define MyAppExeName "safety-browser.exe"
#define CertInstall "install_root_cert.bat"

[Setup]
AppId={{#CLIENT_GUID}
AppVersion={#APP_VERSION}
DefaultGroupName={#APP_TITLE_CH}
AppName={cm:SmartBrowserName}
SetupIconFile={#APP_ICO}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DisableDirPage=yes
AlwaysShowDirOnReadyPage=no
DefaultDirName={pf32}\safetybrowser-{#CLIENT}
Compression=lzma
SolidCompression=yes
PrivilegesRequired=admin
ChangesEnvironment=true
DisableProgramGroupPage=yes
DisableWelcomePage=True
VersionInfoDescription={#APP_TITLE_CH}
VersionInfoProductName={#APP_TITLE_CH}
SignTool=tripleonesign "{#ProjectHomeBase}\build\install-script\signtool.exe" sign /f "{#ProjectHomeBase}\build\install-script\smartbrowser.pfx" /t http://timestamp.verisign.com/scripts/timstamp.dll /p 12345678 $f

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"
Name: "chinesesimplified"; MessagesFile: "compiler:Languages\ChineseSimplified.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"

[Files]
Source: "{#ProjectHomeBase}\dist\unpacked\*"; Excludes: "electron.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#ProjectHomeBase}\dist\unpacked\locales\*"; DestDir: "{app}\locales"; Flags: ignoreversion
Source: "{#ProjectHomeBase}\dist\unpacked\resources\*"; DestDir: "{app}\resources"; Flags: ignoreversion
Source: "{#ProjectHomeBase}\dist\unpacked\plugins\*"; DestDir: "{app}\resources\plugins"; Flags: ignoreversion

[Icons]
Name: "{group}\{#APP_TITLE_CH}"; Filename: "{app}\{#MyAppExeName}"; Parameters: """{app}\app""";
Name: "{group}\{cm:InstallCert}"; Filename: "{app}\{#CertInstall}"; WorkingDir: "{app}"
Name: "{commondesktop}\{#APP_TITLE_CH}"; Filename: "{app}\{#MyAppExeName}"; Parameters: """{app}\app"""; Tasks: desktopicon

[Run]
Filename: "{app}\{#MyAppExeName}"; Parameters: """{app}\app"""; Flags: nowait shellexec; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"

[CustomMessages]
english.InstallingFlash=Installing Flash...
chinesesimplified.InstallingFlash=正在安装Flash...
english.InstallSafeCert=Installing Safe Certificate...
chinesesimplified.InstallSafeCert=正在安装安全证书...
english.InstallFlash=Install Flash
chinesesimplified.InstallFlash=安装Flash
english.SmartBrowserName={#APP_TITLE_EN}
chinesesimplified.SmartBrowserName={#APP_TITLE_CH}
english.InstallCert=Install Certificate
chinesesimplified.InstallCert=安装安全证书
english.InstallSafeService=Install Safe Service
chinesesimplified.InstallSafeService=安装安全服务
english.InstallPlugin=Install Plugin
chinesesimplified.InstallPlugin=安装插件
english.UninstallSafeService=Uninstall Safe Service
chinesesimplified.UninstallSafeService=删除安全服务
