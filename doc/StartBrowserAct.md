## Start Safety Browser 流程圖



```puml



start

:initialize;

:Listening:app:ready;

:openInfoPage();
note right
    打開初始畫面，避免網路原因連線問題畫面空白太久
end note

:loadModule();
note right
    Import相關模組
end note

:setBrowserSetting();
note right
    設定瀏覽器需用到的參數設定
end note

partition Flash_Plugin {
:Flash.checkExistFlashPlugin();
:Flash.enableFlashPlugin();
}

:AutoUpdater.checkUpdatesAndNotify();
note right
    檢查更新
end note


partition createWindow {
:app:createWindow();
note right
    打開主畫面
end note
  
:Browser.getHomeurl();
note right
    取得瀏覽器要打開的home url
end note
  
:Browser.writePacFile();
note right
    設定pac(Proxy Auto-Configuration)文件，pac決定哪些網域要透過SS連線出去
end note

  
if (SsUtils.checkEnabledSSProxy) then (yes)
  :SsUtils.startShadowSocksServer();
  note right
    打開SS的主程序
  end note
  
  :checkAvailableSS;
  
  if (isSSOk) then (true)
    :startLocalServer;
    
    note right
      打開ss local server 有兩種方式
      1. 直接用nodejs net起服務
      2. 透過SS applicaiton打開
    end note
  
    if( crypto.getCiphers() include ss method ) then (yes)
     :ssLocal.startServer();
    else(no)
     :checkExistPlugin();
     :writeSSConfig();
     :runWinSS();
    endif
  
    :檢查public IP是不是與SS server ip一致;
    
  
  endif
  

 
  
  :win.webContents.session.setProxy();
  
  note right
    網址透過proxy打開，參數 pacScript 讀入pac檔案
  end note
  
else (no)
  
endif
  
note right
    checkEnabledSSProxy決定這個瀏覽器需不需要打開SS
    規則:
      1. homeUrl 如果有包含"t1t.games"就不需要打開
      2. 透過enabledProxy決定要不要打開(可由後台設定)
end note

   :win.loadURL(homeUrl);

  
}



```