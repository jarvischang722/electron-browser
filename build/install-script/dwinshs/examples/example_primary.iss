;-------------------------------------------------------------------------------
;  DwinsHs 3 - Example script
;  $Rev: 112 $   $Id: example_primary.iss 112 2015-07-05 06:43:28Z hanjy $
;  Copyright(C) 2001, 2015 Han-soft Software. All rights reserved.
;-------------------------------------------------------------------------------

[Setup]
AppID = My_App_1
AppName = My Application 1
OutputBaseFilename = My_App_1_Setup
AppVersion = 1.0
DefaultDirName = {pf}\My_App_1
DefaultGroupName = My Application 1

[Files]
Source: "../manual.chm"; DestDir: "{app}";

[Icons]
Name: {group}\My Application 1; Filename: "{app}\manual.chm"; WorkingDir: "{app}"

[Code]

#include "..\dwinshs.iss"

var
  DownloadIndicator: TNewProgressBar;
  BackClicked: Boolean;
  Downloaded: Boolean;

procedure InitializeWizard();
begin
  Downloaded := False;
  // Create the download progress indicator
  DownloadIndicator := TNewProgressBar.Create(PageFromId(wpReady));
  DownloadIndicator.Left := ScaleX(40);
  DownloadIndicator.Top := ScaleY(180);
  DownloadIndicator.Width := PageFromId(wpReady).SurfaceWidth - ScaleX(80);
  DownloadIndicator.Height:= ScaleY(20);
  DownloadIndicator.Min := 0;
  DownloadIndicator.Parent := PageFromId(wpReady).Surface;
end;

function OnRead(URL, Agent: AnsiString; Method: TReadMethod; Index, TotalSize, ReadSize,
  CurrentSize: LongInt; var ReadStr: AnsiString): Boolean;
begin
  if Index = 0 then DownloadIndicator.Max := TotalSize;
  DownloadIndicator.Position := ReadSize; // Update the download progress indicator
  Result := True; // Continue to download
  Result := not BackClicked; // Determine whether download was cancelled
end;

procedure CurPageChanged(CurPageID: Integer);
var
  Response: AnsiString;
  Size: LongInt;
begin
  if (CurPageId = wpReady) and (not Downloaded) then
  begin
    // Allow to download
    BackClicked := False;
    // Initialize download progress indicator
    DownloadIndicator.Position := 0;
    // Disbale to continue before download completes
    WizardForm.NextButton.Enabled := False;
    // Enable to continue after download successfully, save the remote file automatically
    WizardForm.NextButton.Enabled :=
      DwinsHs_ReadRemoteURL('http://www.han-soft.com/download/dwinshs.zip', 'My_App', rmGet,
      Response, Size, ExpandConstant('{tmp}') + '\App.zip', @OnRead) = READ_OK;
    Downloaded := WizardForm.NextButton.Enabled;
  end;
end;

function BackButtonClick(CurPageID: Integer): Boolean;
begin
  // Stop to download
  BackClicked := True;
  Result := True;
  WizardForm.NextButton.Enabled := True;
end;


