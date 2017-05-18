; *** Inno Setup version 5.5.3+ English messages ***
;			by March Fun (www.suma.tw)
;
; To download user-contributed translations of this file, go to:
;   http://www.jrsoftware.org/files/istrans/
;
; Note: When translating this text, do not add periods (.) to the end of
; messages that didn't have them already, because on those messages Inno
; Setup adds the periods automatically (appending a period would result in
; two periods being displayed).

[LangOptions]
; The following three entries are very important. Be sure to read and 
; understand the '[LangOptions] section' topic in the help file.
LanguageName=<7e41><9ad4><4e2d><6587>
LanguageID=$0404
LanguageCodePage=0
; If the language you are translating to requires special font faces or
; sizes, uncomment any of the following entries and change them accordingly.
DialogFontName=新細明體
DialogFontSize=9
TitleFontName=Arial
TitleFontSize=28
WelcomeFontName=新細明體
WelcomeFontSize=12
CopyrightFontName=新細明體
CopyrightFontSize=9

[Messages]

; *** Application titles
SetupAppTitle=安裝程式
SetupWindowTitle=安裝程式 - %1
UninstallAppTitle=解除安裝程式
UninstallAppFullTitle=%1 解除安裝程式

; *** Misc. common
InformationTitle=資訊
ConfirmTitle=確認
ErrorTitle=錯誤

; *** SetupLdr messages
SetupLdrStartupMessage=安裝程式將在你的電腦上安裝 %1。你確定要繼續嗎 ?
LdrCannotCreateTemp=無法建立暫存檔案。安裝放棄
LdrCannotExecTemp=無法執行暫存資料夾中的檔案。放棄安裝。

; *** Startup error messages
LastErrorMessage=%1.%n%n錯誤 %2: %3
SetupFileMissing=安裝資料夾缺少檔案 %1。請修正此問題或取得軟體的新版本。
SetupFileCorrupt=安裝檔案已損壞。請取得軟體的新版本。
SetupFileCorruptOrWrongVer=安裝檔案已損壞，或與本安裝程式的版本不相容。請修正此問題或取得軟體的新版本。
InvalidParameter=一個錯誤的參數被傳遞到了命令列: %n%n%1
SetupAlreadyRunning=安裝已經執行。
WindowsVersionNotSupported=本程式不支援您的電腦上執行的 Windows 版本。
WindowsServicePackRequired=本程式需要 %1 Service Pack %2 或更新的版本。
NotOnThisPlatform=本程式無法在 %1 上執行。
OnlyOnThisPlatform=本程式必須在 %1 上執行。
OnlyOnTheseArchitectures=本程式只能安裝在為下列處理器架構設計的 Windows 版本中: %n%n%1
MissingWOW64APIs=目前的 Windows 版本沒有包含執行 64 位元安裝程式所需的函數。若要修正此問題，請安裝 Service Pack %1。
WinVersionTooLowError=本程式需要 %1 v%2 或以上版本。
WinVersionTooHighError=本程式無法安裝在 %1 v%2 或以上版本。
AdminPrivilegesRequired=安裝本程式時你必須以管理員身份登入。
PowerUserPrivilegesRequired=安裝本程式時你必須以管理員或 Power Users 群組成員的身份登入。
SetupAppRunningError=安裝程式發現 %1 正在執行。%n%n請關閉其所有實例，然後按「確定」繼續，或按「取消」結束。
UninstallAppRunningError=解除安裝程式發現 %1 正在執行。%n%n請關閉其所有實例，然後按「確定」繼續，或按「取消」結束。

; *** Misc. errors
ErrorCreatingDir=安裝程式無法建立資料夾「%1」
ErrorTooManyFilesInDir=無法在資料夾「%1」中建立檔案，因為它包含了太多檔案

; *** Setup common messages
ExitSetupTitle=結束安裝
ExitSetupMessage=安裝尚未完成。如果你現在結束，軟體將不會安裝。%n%n你可以在其它時間重新執行安裝程式來完成安裝。%n%n現在結束安裝嗎 ?
AboutSetupMenuItem=關於安裝程式(&A)...
AboutSetupTitle=關於安裝程式
AboutSetupMessage=%1 版本 %2%n%3%n%n%1 首頁: %n%4
AboutSetupNote=
TranslatorNote=

; *** Buttons
ButtonBack=< 上一步(&B)
ButtonNext=下一步(&N) >
ButtonInstall=安裝(&I)
ButtonOK=確定
ButtonCancel=取消
ButtonYes=是(&Y)
ButtonYesToAll=皆是(&A)
ButtonNo=否(&N)
ButtonNoToAll=皆否(&O)
ButtonFinish=完成(&F)
ButtonBrowse=瀏覽(&B)...
ButtonWizardBrowse=瀏覽(&R)...
ButtonNewFolder=建立資料夾(&M)

; *** "Select Language" dialog messages
SelectLanguageTitle=選擇安裝語系
SelectLanguageLabel=選擇安裝期間要使用的語系: 

; *** Common wizard text
ClickNext=按「下一步」繼續，或按「取消」結束安裝。
BeveledLabel=
BrowseDialogTitle=瀏覽資料夾
BrowseDialogLabel=選擇一個資料夾，然後按「確定」。
NewFolderName=新增資料夾

; *** "Welcome" wizard page
WelcomeLabel1=歡迎使用 [name] 安裝程式
WelcomeLabel2=安裝程式將在你的電腦上安裝 [name/ver]。%n%n建議你在繼續之前關閉所有其它應用程式。

; *** "Password" wizard page
WizardPassword=密碼
PasswordLabel1=本安裝程式有密碼保護。
PasswordLabel3=請輸入密碼，然後按「下一步」進入下一步。密碼大小寫需相符。
PasswordEditLabel=密碼(&P): 
IncorrectPassword=你輸入的密碼不正確。請重試。

; *** "License Agreement" wizard page
WizardLicense=授權合約
LicenseLabel=請在繼續之前閱讀以下重要資訊。
LicenseLabel3=請閱讀以下授權合約。在繼續安裝之前，你必須接受此合約的條款。
LicenseAccepted=我接受合約(&A)
LicenseNotAccepted=我不接受合約(&D)

; *** "Information" wizard pages
WizardInfoBefore=資訊
InfoBeforeLabel=請在繼續之前閱讀以下重要資訊。
InfoBeforeClickLabel=當你準備好繼續安裝後，請按「下一步」。
WizardInfoAfter=資訊
InfoAfterLabel=請在繼續之前閱讀以下重要資訊。
InfoAfterClickLabel=當你準備好繼續安裝後，請按「下一步」。

; *** "User Information" wizard page
WizardUserInfo=使用者資訊
UserInfoDesc=請輸入你的資訊。
UserInfoName=使用者名稱(&U): 
UserInfoOrg=組織(&O): 
UserInfoSerial=序號(&S): 
UserInfoNameRequired=必須輸入使用者名稱。

; *** "Select Destination Location" wizard page
WizardSelectDir=選擇目標位置
SelectDirDesc=將 [name] 安裝到哪裡 ?
SelectDirLabel3=安裝程式將把 [name] 安裝到以下資料夾中。
SelectDirBrowseLabel=若要繼續，按「下一步」。如果你要選擇不同的資料夾，請按「瀏覽」。
DiskSpaceMBLabel=至少需要 [mb] MB 的可用磁碟空間。
CannotInstallToNetworkDrive=無法安裝到網路磁碟機。
CannotInstallToUNCPath=無法安裝到 UNC 路徑。
InvalidPath=你必須輸入含有磁碟機代號的完整路徑。例如: %n%nC:\APP%n%n或 UNC 路徑格式: %n%n\\server\share
InvalidDrive=你選擇的磁碟機或 UNC 共用不存在或無法瀏覽。請重新選擇。
DiskSpaceWarningTitle=沒有足夠的磁碟空間
DiskSpaceWarning=安裝需要至少 %1 KB 的剩餘空間，但是所選磁碟機只有 %2 KB 可用。%n%n你仍然要繼續嗎 ?
DirNameTooLong=資料夾名稱或路徑太長。
InvalidDirName=資料夾名稱無效。
BadDirName32=資料夾名稱不可包含下列字元: %n%n%1
DirExistsTitle=資料夾已存在
DirExists=資料夾: %n%n%1%n%n已存在。你確定要安裝到該資料夾嗎 ?
DirDoesntExistTitle=資料夾不存在
DirDoesntExist=資料夾: %n%n%1%n%n不存在。建立該資料夾嗎 ?

; *** "Select Components" wizard page
WizardSelectComponents=選擇元件
SelectComponentsDesc=要安裝哪些元件 ?
SelectComponentsLabel2=請選擇你要安裝的元件，清除你不想安裝的元件。準備好後點選「下一步」。
FullInstallation=完整安裝
; if possible don't translate 'Compact' as 'Minimal' (I mean 'Minimal' in your language)
CompactInstallation=簡潔安裝
CustomInstallation=自訂安裝
NoUninstallWarningTitle=元件已存在
NoUninstallWarning=安裝程式發現下列元件已經安裝: %n%n%1%n%n取消選取不會解除安裝這些元件。%n%n繼續安裝嗎 ?
ComponentSize1=%1 KB
ComponentSize2=%1 MB
ComponentsDiskSpaceMBLabel=目前的選擇至少需要 [mb] MB 磁碟空間。

; *** "Select Additional Tasks" wizard page
WizardSelectTasks=選擇附加工作
SelectTasksDesc=要執行哪些附加工作 ?
SelectTasksLabel2=請選擇在安裝 [name] 期間安裝程式要執行的附加工作，然後點選「下一步」。

; *** "Select Start Menu Folder" wizard page
WizardSelectProgramGroup=選擇開始功能表群組
SelectStartMenuFolderDesc=把程式捷徑放到哪裡 ?
SelectStartMenuFolderLabel3=安裝程式將在以下開始功能表群組中建立程式捷徑。
SelectStartMenuFolderBrowseLabel=點選「下一步」進入下一步。如果你要選擇不同的資料夾，請點選「瀏覽」。
MustEnterGroupName=你必須輸入資料夾名稱
GroupNameTooLong=資料夾名稱或路徑太長
InvalidGroupName=資料夾名稱無效
BadGroupName=資料夾名稱不可包含下列字元: %n%n%1
NoProgramGroupCheck2=不建立開始功能表群組(&D)

; *** "Ready to Install" wizard page
WizardReady=準備安裝
ReadyLabel1=安裝程式現在準備開始安裝 [name]。
ReadyLabel2a=點選「安裝」繼續安裝，如果你想要檢視或變更設定請點選「上一步」。
ReadyLabel2b=點選「安裝」繼續安裝。
ReadyMemoUserInfo=使用者資訊: 
ReadyMemoDir=目標位置: 
ReadyMemoType=安裝類型: 
ReadyMemoComponents=所選元件: 
ReadyMemoGroup=開始功能表群組: 
ReadyMemoTasks=附加工作: 

; *** "Preparing to Install" wizard page
WizardPreparing=正在準備安裝
PreparingDesc=安裝程式正在準備安裝 [name]。
PreviousInstallNotCompleted=先前程式的安裝/移除尚未完成。你需要重新啟動電腦來完成安裝。%n%n電腦重新啟動之後，請重新執行安裝程式來完成 [name] 的安裝。
CannotContinue=安裝無法繼續。請點選「取消」結束。
ApplicationsFound=安裝程式需要更新被下列應用程式佔用的檔案。建議你允許自動關閉這些應用程式。
ApplicationsFound2=安裝程式需要更新被下列應用程式佔用的檔案。建議你允許自動關閉這些應用程式。安裝完成後，安裝程式會嘗試重新啟動這些應用程式。
CloseApplications=自動關閉應用程式(&A)
DontCloseApplications=不自動關閉應用程式(&D)
ErrorCloseApplications=安裝精靈無法自動關閉所有的應用程式。在進入下一步之前，建議您關閉那些佔用安裝精靈需要更新檔案的應用程式。

; *** "Installing" wizard page
WizardInstalling=正在安裝
InstallingLabel=正在你的電腦中安裝 [name]，請稍候...

; *** "Setup Completed" wizard page
FinishedHeadingLabel=完成 [name] 安裝
FinishedLabelNoIcons=安裝程式已完成 [name] 的安裝。
FinishedLabel=安裝程式已完成 [name] 的安裝。可以透過選擇已安裝的圖示來執行應用程式。
ClickFinish=點選「完成」結束安裝。
FinishedRestartLabel=為了完成 [name] 的安裝，安裝程式必須重新啟動電腦。你要立即重新啟動嗎 ?
FinishedRestartMessage=為了完成 [name] 的安裝，安裝程式必須重新啟動電腦。%n%n你要立即重新啟動嗎 ?
ShowReadmeCheck=是，我要檢視讀我檔案
YesRadio=是，立即重新啟動電腦(&Y)
NoRadio=否，稍後重新啟動電腦(&N)
; used for example as 'Run MyProg.exe'
RunEntryExec=執行 %1
; used for example as 'View Readme.txt'
RunEntryShellExec=檢視 %1

; *** "Setup Needs the Next Disk" stuff
ChangeDiskTitle=安裝程式需要下一個磁碟
SelectDiskLabel2=請插入磁碟 %1 並點選「確定」。%n%n如果在除了下面顯示的資料夾以外的資料夾中找不到該磁碟上的檔案，就請輸入正確的路徑或點選「瀏覽」。
PathLabel=路徑(&P): 
FileNotInDir2=檔案「%1」不在「%2」中。請插入正確的磁碟或選擇其他資料夾。
SelectDirectoryLabel=請指定下一個磁碟的位置。

; *** Installation phase messages
SetupAborted=安裝尚未完成。%n%n請修正問題並重新執行安裝程式。
EntryAbortRetryIgnore=點選「重試」重新嘗試，點選「忽略」繼續安裝，或點選「放棄」取消安裝。

; *** Installation status messages
StatusClosingApplications=正在關閉應用程式...
StatusCreateDirs=正在建立資料夾...
StatusExtractFiles=正在展開檔案...
StatusCreateIcons=正在建立捷徑...
StatusCreateIniEntries=正在建立 INI 項目...
StatusCreateRegistryEntries=正在建立登錄資料機碼項目...
StatusRegisterFiles=正在註冊檔案...
StatusSavingUninstall=正在儲存解除安裝資訊...
StatusRunProgram=正在完成安裝...
StatusRestartingApplications=正在重新啟動應用程式...
StatusRollback=正在回溯變更...

; *** Misc. errors
ErrorInternal2=內部錯誤: %1
ErrorFunctionFailedNoCode=%1 失敗
ErrorFunctionFailed=%1 失敗。代碼 %2
ErrorFunctionFailedWithMessage=%1 失敗。代碼 %2。%n%3
ErrorExecutingProgram=無法執行檔案: %n%1

; *** Registry errors
ErrorRegOpenKey=開啟登錄資料機碼時發生錯誤: %n%1\%2
ErrorRegCreateKey=建立登錄資料機碼時發生錯誤: %n%1\%2
ErrorRegWriteKey=寫入登錄資料機碼時發生錯誤: %n%1\%2

; *** INI errors
ErrorIniEntry=在檔案「%1」中建立 INI 項目時發生錯誤。

; *** File copying errors
FileAbortRetryIgnore=點選「重試」重新嘗試，點選「忽略」略過此檔案 (不建議)，或點選「放棄」取消安裝。
FileAbortRetryIgnore2=點選「重試」重新嘗試，點選「忽略」繼續安裝 (不建議)，或點選「放棄」取消安裝。
SourceIsCorrupted=原始檔案已損壞
SourceDoesntExist=原始檔案「%1」不存在
ExistingFileReadOnly=現有檔案為唯讀。%n%n點選「重試」移除唯讀內容並重試，點選「忽略」略過此檔案，或點選「放棄」取消安裝。
ErrorReadingExistingDest=讀取現有檔案時發生錯誤: 
FileExists=檔案已存在。%n%n你要覆寫它嗎 ?
ExistingFileNewer=現有檔案比安裝程式要安裝的還新。建議你保留現有檔案。%n%n保留現有檔案嗎 ?
ErrorChangingAttr=變更現有檔案的內容時發生錯誤: 
ErrorCreatingTemp=在目的資料夾中建立檔案時發生錯誤: 
ErrorReadingSource=讀取原始檔案時發生錯誤: 
ErrorCopying=複製檔案時發生錯誤: 
ErrorReplacingExistingFile=取代現有檔案時發生錯誤: 
ErrorRestartReplace=重新啟動後取代失敗: 
ErrorRenamingTemp=重新命名目的資料夾中的檔案時發生錯誤: 
ErrorRegisterServer=無法註冊 DLL/OCX: %1
ErrorRegSvr32Failed=RegSvr32 失敗。回傳值: %1
ErrorRegisterTypeLib=無法註冊類型函式庫: %1

; *** Post-installation errors
ErrorOpeningReadme=開啟讀我檔案時發生錯誤。
ErrorRestartingComputer=安裝程式無法重新啟動電腦。請手動重新啟動。

; *** Uninstaller messages
UninstallNotFound=檔案「%1」不存在。無法解除安裝。
UninstallOpenError=檔案「%1」無法開啟。無法解除安裝
UninstallUnsupportedVer=解除安裝記錄檔案「%1」的格式無法此版本的解除安裝程式識別。無法解除安裝
UninstallUnknownEntry=解除安裝記錄中遇到一個不明的項目 (%1)
ConfirmUninstall=你是否確定要完全移除 %1 及其所有元件 ?
UninstallOnlyOnWin64=此安裝程式只能在 64 位元 Windows 上解除安裝。
OnlyAdminCanUninstall=此安裝程式只能由具有管理員權限的使用者解除安裝。
UninstallStatusLabel=正在移除 %1，請稍候...
UninstalledAll=%1 已成功移除。
UninstalledMost=%1 解除安裝完成。%n%n某些項目無法移除，可以手動移除。
UninstalledAndNeedsRestart=若要完成 %1 的解除安裝，必須重新啟動電腦。%n%n你要立即重新啟動嗎 ?
UninstallDataCorrupted=檔案「%1」已損壞。無法解除安裝

; *** Uninstallation phase messages
ConfirmDeleteSharedFileTitle=移除共用的檔案嗎 ?
ConfirmDeleteSharedFile2=下列共用的檔案不再被任何程式使用。你要移除該共用的檔案嗎 ? %n%n如果還有程式使用該檔案而它已被移除，這些程式可能無法正常執行。如果你不確定，請選擇「否」。留下該檔案不會對系統造成任何危害。
SharedFileNameLabel=檔案名稱: 
SharedFileLocationLabel=位置: 
WizardUninstalling=解除安裝狀態
StatusUninstalling=正在解除安裝 %1...

; *** Shutdown block reasons
ShutdownBlockReasonInstallingApp=正在安裝 %1。
ShutdownBlockReasonUninstallingApp=正在解除安裝 %1。

; The custom messages below aren't used by Setup itself, but if you make
; use of them in your scripts, you'll want to translate them.

[CustomMessages]

NameAndVersion=%1 版本 %2
AdditionalIcons=附加圖示: 
CreateDesktopIcon=建立桌面圖示(&D)
CreateQuickLaunchIcon=建立快速啟動列圖示(&Q)
ProgramOnTheWeb=%1 網站
UninstallProgram=解除安裝 %1
LaunchProgram=執行 %1
AssocFileExtension=將 %1 與 %2 檔案副檔名關聯(&A)
AssocingFileExtension=正在將 %1 與 %2 檔案副檔名關聯...
AutoStartProgramGroupDescription=啟動: 
AutoStartProgram=自動啟動 %1
AddonHostProgramNotFound=在你選擇的資料夾中找不到 %1。%n%n是否仍要繼續 ?
