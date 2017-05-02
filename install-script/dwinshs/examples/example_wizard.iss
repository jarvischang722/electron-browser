;-------------------------------------------------------------------------------
;  DwinsHs 3 - Example script
;  $Rev: 113 $   $Id: example_wizard.iss 113 2015-07-23 07:30:14Z hanjy $
;  Copyright(C) 2001, 2015 Han-soft Software. All rights reserved.
;-------------------------------------------------------------------------------

[Setup]
AppID = My_App_2
AppName = My Application 2
OutputBaseFilename = My_App_2_Setup
AppVersion = 1.0
DefaultDirName = {pf}\My_App_2
DefaultGroupName = My Application 2

[Languages]
Name: "en"; MessagesFile: "compiler:Default.isl"
Name: "fr"; MessagesFile: "compiler:Languages\French.isl"

[Components]
Name: main; Description: "Manual"; Types: full compact custom; Flags: fixed
Name: ext_uninshs; Description: "UninsHs Extension"; Types: full compact;
Name: ext_dwinshs; Description: "DwinsHs Extension"; Types: full compact;

[Files]
Source: "../manual.chm"; DestDir: "{app}"; Components: main;
Source: "{tmp}\uninshs.zip"; DestDir: "{app}"; Components: ext_uninshs; \
  Flags: external; Check: DwinsHs_Check(ExpandConstant('{tmp}\uninshs.zip'), \
    'http://www.han-soft.com/download/uninshs.zip', 'My_App_2', 'get', 0);
Source: "{tmp}\dwinshs.zip"; DestDir: "{app}"; Components: ext_dwinshs; \
  Flags: external; Check: DwinsHs_Check(ExpandConstant('{tmp}\dwinshs.zip'), \
    'http://www.han-soft.com/download/dwinshs.zip', 'My_App_2', 'get', 0 );

[Icons]
Name: {group}\My Application 2; Filename: "{app}\manual.chm"; WorkingDir: "{app}"

[Code]

#define DwinsHs_Use_Predefined_Downloading_WizardPage
#define DwinsHs_Auto_Continue
#include "../dwinshs.iss"

procedure InitializeWizard();
begin
  DwinsHs_InitializeWizard(wpPreparing);
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
fr.DwinsHs_PageCaption =Le téléchargement de fichiers supplémentaires
fr.DwinsHs_PageDescription =Se il vous plaît patienter pendant configuration \
  télécharge des fichiers supplémentaires...
fr.DwinsHs_TotalProgress =Cours Total:
fr.DwinsHs_CurrentFile =Fichier actuel:
fr.DwinsHs_File =Fichier:
fr.DwinsHs_Speed =Speed:
fr.DwinsHs_Status =Vitesse:
fr.DwinsHs_ElapsedTime =Temps écoulé:
fr.DwinsHs_RemainingTime =Temps restant:
fr.DwinsHs_Status_ButtonRetry =&Refaire
fr.DwinsHs_Status_ButtonNext =&Suivant >
fr.DwinsHs_SizeInBytes =%d Octets
fr.DwinsHs_SizeInKB =%.2f Ko
fr.DwinsHs_SizeInMB =%.2f Mo
fr.DwinsHs_ProgressValue = %s of %s (%d%%%)
fr.DwinsHs_SpeedInBytes =%d Octets/s
fr.DwinsHs_SpeedInKB =%.2f Ko/s
fr.DwinsHs_SpeedInMB =%.2f Mo/s
fr.DwinsHs_TimeInHour =%d heure(s), %d minute(s), %d seconde(s)
fr.DwinsHs_TimeInMinute =%d minute(s), %d seconde(s)
fr.DwinsHs_TimeInSecond =%d seconde(s)
fr.DwinsHs_Status_GetFileInformation =Fetch taille du fichier
fr.DwinsHs_Status_StartingDownload =Commencer à télécharger
fr.DwinsHs_Status_Downloading =Téléchargement
fr.DwinsHs_Status_DownlaodComplete =Téléchargement terminé
fr.DwinsHs_Error_Network =Pas de connexion Internet active
fr.DwinsHs_Error_Offline =L'ordinateur est en mode déconnecté
fr.DwinsHs_Error_Initialize =Échec d'initialisation de la configuration
fr.DwinsHs_Error_OpenSession =Impossible d'ouvrir la session FTP ou HTTP
fr.DwinsHs_Error_CreateRequest =Impossible de créer une poignée de requête HTTP
fr.DwinsHs_Error_SendRequest =Échec de l'envoi requête au serveur HTTP
fr.DwinsHs_Error_DeleteFile =L'ancien fichier ne peut être supprimé
fr.DwinsHs_Error_SaveFile =Impossible d'enregistrer des données
fr.DwinsHs_Error_Canceled =Télécharger annulé
fr.DwinsHs_Error_ReadData =Impossible de lire les données
fr.DwinsHs_Status_HTTPError =Erreur HTTP %d: %s
fr.DwinsHs_Status_HTTP400 =Mauvaise demande
fr.DwinsHs_Status_HTTP401 =Non autorisé
fr.DwinsHs_Status_HTTP404 =Non trouvé
fr.DwinsHs_Status_HTTP407 =Authentification proxy requise
fr.DwinsHs_Status_HTTP500 =Erreur interne
fr.DwinsHs_Status_HTTP502 =Mauvaise passerelle
fr.DwinsHs_Status_HTTP503 =Service indisponible
fr.DwinsHs_Status_HTTPxxx =Autre erreur

