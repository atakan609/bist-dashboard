# Proje Durumu: BIST Portfolio & Market Intelligence Dashboard

## Son Güncelleme
2026-10-14 16:48

## Proje Künyesi
- **URL:** `https://atakan609.github.io/bist-dashboard/`
- **Konum:** `C:\Users\atkkr\Documents\bist-dashboard`
- **Teknoloji:** HTML5, Tailwind CSS, TradingView Lightweight Charts v4.2.1, Chart.js, Supabase Realtime JS v2, yfinance REST worker (`supabase_worker.py`).
- **Veritabanı / Realtime:** Supabase `BIST Analyze` (`uzythsdqpbzqcapepkdz`), `public.bist_quotes` tablosu, WebSocket `postgres_changes`.

## Mevcut Mimari ve Son Durum
1. **Canlı WebSocket Akışı ve Sürekli Daemon:** `scripts/supabase_worker.py` arka planda daemon olarak çalışıyor (PID takipli). BIST 30 + portföy varlıklarını çekip her 15 saniyede bir Supabase'e basıyor; istemci tarafında `app.js` anlık olarak dinleyip fiyatları milisaniyeler içinde ekrana yansıtıyor.
2. **Kullanıcı Kontrolü (Tek Tıkla Başlat / Durdur):**
   - `start_feeder.bat`: Daemonu arka planda başlatır.
   - `stop_feeder.bat`: Çalışan daemonu PID kütüğünden bularak anında sonlandırır.
   - CLI: `python scripts/supabase_worker.py --status` ve `--stop`.
3. **Canlı Mum Çubuğu (Candlestick Tick):** WebSocket'ten gelen canlı fiyat verisi (`newPrice`), TradingView Lightweight Charts `candleSeries.update()` motoruna bağlanarak ekrandaki grafiğin anlık olarak yukarı/aşağı canlı oynaması sağlandı.
4. **Canlı Dijital Borsa Saati:** Üst barda her saniye saniyesi saniyesine yerel saati güncelleyen `#live-clock` motoru devrede.
5. **2 Katmanlı Ferah Header:** Navbar tek satırlık yığılmadan kurtarıldı. 1. Katmanda marka, canlı saat, makrolar ve portföy masası; 2. Katmanda geniş aralıklı portföy & BIST 30 çipleri ve arama çubuğu yer alıyor. Statik eski zaman damgası (`⚡ 15:09`) temizlendi; yalnızca canlı WebSocket tick'i düştüğünde dinamik anlık saat basılıyor.
6. **İnteraktif Portföy Masası (Sandbox):** `localStorage` kalıcı hafızası, lot/maliyet inline düzenleme, anlık kâr/zarar ve AtakanOS `Portfolio.md` panoya kopyalama entegrasyonu aktif.

## Aktif Görev Kayıtları
- [Task_Realtime_Navbar_Fix.md](Task_Realtime_Navbar_Fix.md): Saat motoru, canlı mum tick entegrasyonu, 2 katmanlı navbar refaktörü, statik rozet temizliği ve daemon başlat/durdur mimarisi.
