mkdir  "C:\MVQS_Database"
mkdir  "C:\MVQS_Database\Backup"

xcopy "D:\MVQS_Database\Upgrade_MVQS_Database.bat" "C:\MVQS_Database" /y
xcopy "D:\MVQS_Database\MVQS_DC_FrontEnd.accde" "C:\MVQS_Database" /y

xcopy "D:\MVQS_Database\Upgrade MVQS Database.lnk" "C:\Documents and Settings\All Users\Desktop" /y
xcopy "D:\MVQS_Database\MVQS Database.lnk" "C:\Documents and Settings\All Users\Desktop" /y

pause
