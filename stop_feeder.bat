@echo off
chcp 65001 >nul
echo [AtakanOS BIST] Canlı Veri Besleyici Durduruluyor...
python scripts\supabase_worker.py --stop
echo.
echo [AtakanOS BIST] Veri akışı durduruldu.
pause
