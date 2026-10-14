@echo off
chcp 65001 >nul
echo [AtakanOS BIST] Canlı Veri Besleyici Başlatılıyor...
start /b python scripts\supabase_worker.py --stream --interval 15
echo.
echo [AtakanOS BIST] Worker arka planda çalışmaya başladı (15s döngü).
echo [AtakanOS BIST] Durdurmak istediğinizde 'stop_feeder.bat' dosyasını çalıştırmanız yeterlidir.
timeout /t 3 >nul
