# Task: Realtime Saat, Grafik Canlı Mum Tick ve Navbar 2-Katmanlı Refactor

## Tarih
2026-10-14 16:28

## Kapsam ve Problem Tespiti
1. **Navbardaki Saat:** Sayfa ilk açıldığında `updated_at` statik damgası basılıp duruyordu. Canlı çalışan bir saat motoru yoktu.
2. **Grafikler:** Supabase Realtime WebSocket'ten gelen canlı fiyatlar ekranda metinsel olarak güncelleniyor ancak TradingView Lightweight Charts mum grafiğine (`candleSeries`) canlı tick gönderilmiyordu.
3. **Navbar Sıkışıklığı:** Tek satırlık header üzerinde 10 adet hisse çipi, arama kutusu, 3 makro gösterge, portföy değeri ve butonlar daralıp üst üste biniyordu.

## Yapılan Değişiklikler
1. **`index.html` Navbar 2 Katmanlı Mimarisi:**
   - **Katman 1 (Ana Bar):** Marka kimliği + Canlı Borsa Saati (`#live-clock`, `HH:MM:SS`), Portföy toplamı (`#header-portfolio-val`), USD/BIST100 makroları, Supabase Realtime rozeti (`#market-status`) ve "⚙️ Portföy Masası" butonu (`#open-sandbox-btn`).
   - **Katman 2 (Gözlem ve Arama Bandı):** Portföy ve BIST 30 çipleri ferah yatay kaydırma ve dolgu ile ayrıldı. Genişletilmiş arama çubuğu sağa hizalandı.
2. **`app.js` Canlı Saat Motoru:**
   - `startLiveClock()` fonksiyonu eklendi. `setInterval(tick, 1000)` ile yerel saat saniyesi saniyesine `#live-clock` elementine basılıyor.
   - `DOMContentLoaded` aşamasında başlatıldı.
3. **`app.js` Canlı Mum Çubuğu (Candlestick) Tick Beslemesi:**
   - `activeCandleData` ve `activeVolumeData` hafıza dizileri tanımlandı. `loadChartData()` içinde güncel seriler saklanıyor.
   - `handleRealtimeQuoteUpdate(newQuote)` içinde gelen canlı fiyat (`newPrice`) son mumun (`lastCandle`) `high`, `low`, `close` değerleriyle harmanlanarak `candleSeries.update(updatedCandle)` çağrısıyla grafiğe anında aktarılıyor.
   - Hacim ve lejant değerleri (`#legend-open`, `#legend-high`, `#legend-low`, `#legend-close`) eş zamanlı güncelleniyor.
