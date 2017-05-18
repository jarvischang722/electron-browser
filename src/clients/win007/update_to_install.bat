rem change icon

copy ..\..\bin-release\electron.exe safety-browser.exe

rcedit "safety-browser.exe" --set-icon "safety-browser.ico" 
rcedit "safety-browser.exe" --set-version-string "CompanyName" "ÒÚ²©" 
rcedit "safety-browser.exe" --set-version-string "FileDescription" "ÒÚ²©ä¯ÀÀÆ÷"
rcedit "safety-browser.exe" --set-version-string "LegalCopyright" "Copyright 2017"
rcedit "safety-browser.exe" --set-version-string "ProductName" "ÒÚ²©ä¯ÀÀÆ÷"
rem rcedit "safety-browser.exe" --set-version-string "InternalName" "safety-browser"
rcedit "safety-browser.exe" --set-version-string "OriginalFilename" "safety-browser.exe"
rcedit "safety-browser.exe" --set-version-string "FileVersion" "2.8.88"
rcedit "safety-browser.exe" --set-version-string "ProductVersion" "2.8.88"

copy safety-browser.exe ..\..\bin-release\safety-browser.exe

del safety-browser.exe

rem copy lang
copy /Y app\lang\*.json ..\..\bin-release\app\lang

rem copy main file to bin-release
copy /Y app\lib\client.json ..\..\bin-release\app\lib\client.json

rem copy package.json
copy /Y app\package.json ..\..\bin-release\app\package.json

rem copy default.pac
copy /Y app\default.pac ..\..\bin-release\app\default.pac

rem copy client_info.iss
copy /Y client_info.iss ..\..\install-script\client_info.iss

rem copy icon
copy /Y safety-browser.ico ..\..\install-script\safety-browser.ico

call asar pack ..\..\bin-release\app ..\..\bin-release\resources\app.asar

cd ..\..\install-script

"C:\Program Files (x86)\Inno Setup 5\iscc.exe" /Sbyparam=$p smartbrowser.iss

pause
