# AtakanOS BIST Portfolio & Market Intelligence Dashboard

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live%20Demo-emerald?style=for-the-badge&logo=github)](https://atakan609.github.io/bist-dashboard/)
[![BIST 30](https://img.shields.io/badge/Borsa%20%C4%B0stanbul-BIST%2030-blue?style=for-the-badge)](https://atakan609.github.io/bist-dashboard/)
[![License](https://img.shields.io/badge/License-MIT-slate?style=for-the-badge)](LICENSE)

> **Canlı Web Adresi:** [https://atakan609.github.io/bist-dashboard/](https://atakan609.github.io/bist-dashboard/)

AtakanOS İkinci Beyin ekosisteminin Borsa İstanbul için geliştirdiği **BIST Finansal Zeka, Karar ve Portföy Yönetim Dashboard'u**. Sıfır harici API maliyetiyle yerel BIST verilerini işler, Boğa vs. Ayı epistemik sparring karar odası sunar, deterministik DCF duyarlılık matrisi hesaplar ve 9 varlıklı canlı portföy için **4+1 Konsolide Çekirdek Büyüme Modeli** sunar.

---

## 🌟 Öne Çıkan Özellikler

### 1. 📈 TradingView Lightweight Charts & Canlı OHLCV
- Kurumsal düzeyde, sıfır gecikmeli mum grafikleri ve hacim histogramları.
- Anlık dinamik legend (Açılış, Yüksek, Düşük, Kapanış, Hacim) takibi.
- BIST 30 lokomotifleri (`THYAO`, `ASELS`, `TUPRS`, `BIMAS`, `KCHOL`, `EREGL`, `SISE`) ve portföy hisseleri arasında tek tıkla pürüzsüz geçiş.

### 2. 🥊 Epistemik Sparring Odası (Boğa vs. Ayı)
- Halüsinasyon kalkanlı iki bağımsız analist perspektifi:
  - **Boğa Analisti:** Dövizli gelirler, pazar payı genişlemesi, ihracat sözleşmeleri, çarpan iskontoları.
  - **Ayı Analisti:** %50 TCMB faiz baskısı, işletme sermayesi daralması, borç çevrimi, regülasyon ve emtia riskleri.
- **Atlas Epistemik Konsensüs & Karar Rozeti:** Güvenlik marjı ağırlıklı nihai alım/satım/tut kararı.

### 3. 📊 Deterministik DCF Duyarlılık Matrisi ($WACC \times g$)
- TL Ağırlıklı Ortalama Sermaye Maliyeti ($WACC \in [\%32, \%44]$) ve Terminal Büyüme Oranı ($g \in [\%5, \%11]$) kombinasyonlarıyla iki boyutlu dinamik adil değer ve güvenlik marjı simülasyonu.
- Yeşil (iskontolu) ve Kırmızı (primli) anlık görselleştirme.

### 4. 🥧 4.842,13 TL Portföy Sağlık Teşhisi & 4+1 Hedef Modeli
- **Mevcut Durum Röntgeni:** 9 varlık (`ALTIN.S1`, `HRKET`, `HDFGS`, `AKBNK`, `SASA`, `INFO`, `GENIL`, `MANAS`, `PEKGY`) ve nakit dağılımı. $HHI = 0.1212 \implies N_{eff} = 8.25$ efektif varlık ile aşırı parçalanma ("diworsification") teşhisi.
- **Atlas 2 Aşamalı Rebalance Planı:**
  1. **5 Zayıf Halkanın Tasfiyesi:** `PEKGY` (394 TL), `MANAS` (437 TL), `SASA` (468 TL), `INFO` (467 TL), `HDFGS` (550 TL) satılarak **2.316,28 TL** nakde dönüştürülmesi.
  2. **4+1 Konsolide Çekirdeğe Dağıtım:**
     - **%30,0 ALTIN.S1 (1.452 TL):** Enflasyon & kur savunma zırhı (makas kontrolüyle).
     - **%25,0 AKBNK (1.210 TL):** 11,45 Mr TL temettü omurgası & %19,26 SYR.
     - **%18,0 HRKET (872 TL):** Nordex & Umman RES dövizli lojistik sözleşmeleri.
     - **%15,0 GENIL (726 TL):** Net nakit bilanço, Incyte lisansı & Kafkasya fabrikası.
     - **%12,0 PPF Nakit Fonu (582 TL):** %50 risksiz günlük faiz & taktik fırsat kurşunu.

### 5. 📁 Obsidian Araştırma Raporları Entegrasyonu
- Kasa içinde kayıtlı `400-Vault/Reports/BIST_PORTFOY_ANALIZI.md` ve derin hisse değerleme notlarının etkileşimli kartlarla sunumu.

---

## 🛠️ Mimari ve Teknolojiler

- **Arayüz & Stil:** HTML5, Tailwind CSS, JetBrains Mono font ailesi, Midnight/Slate koyu tema (`#0b1120`, `#131c31`).
- **Grafik Motorları:** 
  - [TradingView Lightweight Charts v4](https://tradingview.github.io/lightweight-charts/) (Finansal Kandil & Hacim)
  - [Chart.js v4](https://www.chartjs.org/) (Portföy Dağılım Doughnut Grafikleri)
- **Dağıtım:** GitHub Pages (Statik CDN mimarisi, sıfır harici API bağımlılığı ve yerel veri kalkanı).

---

## 🚀 Yerel Olarak Çalıştırma

Projeyi yerel makinenizde test etmek için herhangi bir statik HTTP sunucusu yeterlidir:

```bash
# Depoyu klonlayın
git clone https://github.com/atakan609/bist-dashboard.git
cd bist-dashboard

# Python yerel sunucusu ile başlatın
python -m http.server 8080
```

Tarayıcınızda `http://localhost:8080` adresini açarak inceleyebilirsiniz.

---

## 📜 Lisans & Telif

Bu proje **AtakanOS İkinci Beyin (V3 Engine)** mimarisinin bir parçasıdır. MIT Lisansı ile lisanslanmıştır.
