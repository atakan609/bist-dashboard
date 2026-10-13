/**
 * AtakanOS BIST Portfolio & Market Intelligence Dashboard — İstemci Motoru
 * =========================================================================
 * TradingView Lightweight Charts, Chart.js ve Statik GitHub Pages Kalkanı.
 * Atakan'ın 9 Varlıklı Portföyü ve 4+1 Konsolide Çekirdek Modeli Entegre.
 */

// Global Değişkenler
let tvChart = null;
let candleSeries = null;
let volumeSeries = null;
let currentPortfolioDoughnut = null;
let targetPortfolioDoughnut = null;
let currentTicker = "THYAO";

// Portföy Varlıkları Kümesi (Tag kontrolü için)
const PORTFOLIO_TICKERS = new Set([
  "ALTIN.S1", "AKBNK", "HRKET", "GENIL", "SASA", "INFO", "MANAS", "PEKGY", "HDFGS"
]);

// 1. Zengin BIST & Portföy Veritabanı (Statik GitHub Pages Kalkanı)
const FALLBACK_DATA = {
  // --- BIST 30 HİSSELERİ ---
  "THYAO": {
    ticker: "THYAO",
    name: "Türk Hava Yolları A.O.",
    sector: "Havacılık & Lojistik",
    price: 314.50,
    change: 5.75,
    change_percent: 1.86,
    currency: "TRY",
    day_low: 308.25,
    day_high: 316.50,
    volume: 28450120,
    market_cap: 434010000000,
    pe_ratio: 4.82,
    pb_ratio: 1.15,
    ev_ebitda: 4.25,
    dividend_yield: 0.0,
    dcf_fair_value: 388.50,
    margin_of_safety: 23.53,
    wacc: 0.365,
    verdict: "Kuvvetli Al / Yüksek Güvenlik Marjı (%23.5)",
    bull_thesis: [
      "Gelirlerin %85+ döviz/euro/dolar bazlı olmasıyla güçlü kur koruması.",
      "İstanbul Havalimanı transfer merkezi avantajıyla artan küresel yolcu pazar payı.",
      "Turkish Cargo'nun e-ticaret lojistiğiyle çift haneli hacim büyümesi.",
      "Gelişmekte olan ülke emsallerine göre iskontolu F/K (4.82x) çarpanı."
    ],
    bear_thesis: [
      "Küresel jet yakıtı crack spread dalgalanmaları ve operasyonel gider baskısı.",
      "Jeopolitik çatışmalar ve hava sahası kısıtlamalarının uçuş rotalarına olası etkisi.",
      "Genişleyen filo ve yeni uçak siparişleri sebebiyle artan CapEx sermaye ihtiyacı.",
      "Yurt içi bilet tavan fiyat regülasyonları."
    ]
  },
  "ASELS": {
    ticker: "ASELS",
    name: "Aselsan Elektronik Sanayi",
    sector: "Savunma Sanayii & Radar",
    price: 64.80,
    change: 1.20,
    change_percent: 1.89,
    currency: "TRY",
    day_low: 63.50,
    day_high: 65.40,
    volume: 34120900,
    market_cap: 295488000000,
    pe_ratio: 11.40,
    pb_ratio: 2.85,
    ev_ebitda: 9.80,
    dividend_yield: 0.45,
    dcf_fair_value: 78.20,
    margin_of_safety: 20.68,
    wacc: 0.350,
    verdict: "Al / Defansif Büyüme & 11+ Mr $ Bakiye Sipariş",
    bull_thesis: [
      "Tarihi rekor seviyede 11+ Milyar Dolar bakiye sipariş (Backlog) portföyü.",
      "Milli muharip uçak KAAN, hava savunma (Siper/Hisar) ve radar projeleri.",
      "İhracat odaklı yeni uluslararası sözleşmeler ile döviz bazlı nakit akışı.",
      "Kritik teknolojilerde yüksek katma değerli AR-GE teşvikleri ve pazar tekeli."
    ],
    bear_thesis: [
      "Kamu alacak tahsilat vadelerinin uzaması ve işletme sermayesi baskısı.",
      "Enflasyonist ortamda sabit fiyatlı sözleşmelerin marj erozyonu riski.",
      "Gelişmiş yarı iletken ve çip tedarik zincirindeki uluslararası lisans kısıtları."
    ]
  },
  "TUPRS": {
    ticker: "TUPRS",
    name: "Tüpraş Türkiye Petrol Rafinerileri",
    sector: "Enerji & Petrol Rafinajı",
    price: 168.40,
    change: -1.10,
    change_percent: -0.65,
    currency: "TRY",
    day_low: 167.00,
    day_high: 170.80,
    volume: 14210000,
    market_cap: 324480000000,
    pe_ratio: 6.10,
    pb_ratio: 1.62,
    ev_ebitda: 4.90,
    dividend_yield: 9.20,
    dcf_fair_value: 195.00,
    margin_of_safety: 15.80,
    wacc: 0.370,
    verdict: "Al / Temettü Şampiyonu & Güçlü Rafinaj Marjı",
    bull_thesis: [
      "Yüksek Akdeniz kompleks rafineri marjları ve dizel/jet yakıtı talebi.",
      "Stratejik dönüşüm planı (yeşil hidrojen, sıfır karbonlu elektrik yatırımları).",
      "Güçlü serbest nakit akışı ve geleneksel yüksek temettü verimi (%9+).",
      "Entek Elektrik entegrasyonuyla dengelenen enerji portföyü."
    ],
    bear_thesis: [
      "Küresel ham petrol fiyatlarındaki volatilite ve stok değerleme riskleri.",
      "Karbon vergisi ve AB Sınırda Karbon Düzenleme Mekanizması geçiş maliyeti.",
      "Dönemsel rafineri bakım duruşlarının kapasite kullanımına etkisi."
    ]
  },
  "BIMAS": {
    ticker: "BIMAS",
    name: "BİM Birleşik Mağazalar A.Ş.",
    sector: "Perakende & Tüketim",
    price: 482.00,
    change: 6.50,
    change_percent: 1.37,
    currency: "TRY",
    day_low: 476.00,
    day_high: 486.50,
    volume: 4120000,
    market_cap: 292670000000,
    pe_ratio: 12.80,
    pb_ratio: 2.95,
    ev_ebitda: 8.40,
    dividend_yield: 2.80,
    dcf_fair_value: 560.00,
    margin_of_safety: 16.18,
    wacc: 0.345,
    verdict: "Al / Enflasyon Kalkanı & Defansif Nakit Akışı",
    bull_thesis: [
      "Enflasyonist ortamda en güçlü fiyatlama ve tedarik maliyeti yansıtma gücü.",
      "Private label (özel markalı) ürün payı ile esnek brüt kar marjı koruması.",
      "Hızlı mağaza açılışları ve FİLE formatı ile üst segmente genişleme.",
      "Negatif işletme sermayesi döngüsü (tedarikçiden vadeli alım, anında nakit satış)."
    ],
    bear_thesis: [
      "Asgari ücret ve personel gider artışlarının operasyonel giderleri yükseltmesi.",
      "Rekabet Kurumu ve perakende regülasyonlarının ceza ve denetim riskleri.",
      "Fas ve Mısır iştiraklerinde kur devalüasyonu baskısı."
    ]
  },
  "KCHOL": {
    ticker: "KCHOL",
    name: "Koç Holding A.Ş.",
    sector: "Holding & Sanayi",
    price: 204.50,
    change: 2.30,
    change_percent: 1.14,
    currency: "TRY",
    day_low: 201.00,
    day_high: 206.00,
    volume: 9850000,
    market_cap: 518590000000,
    pe_ratio: 6.40,
    pb_ratio: 1.35,
    ev_ebitda: 5.10,
    dividend_yield: 3.90,
    dcf_fair_value: 265.00,
    margin_of_safety: 29.58,
    wacc: 0.355,
    verdict: "Kuvvetli Al / Yüksek NAD İskontosu (%35+)",
    bull_thesis: [
      "Tüpraş, Ford Otosan, Yapı Kredi, Arçelik ve TürkTraktör ile dengeli gelir sepeti.",
      "Tarihsel Net Aktif Değeri (NAD) iskontosunun %35 üzerinde seyretmesi.",
      "Yüksek ihracat oranı ve döviz gelirleri kalkanı.",
      "Güçlü solo net nakit pozisyonu ve sermaye tahsis disiplini."
    ],
    bear_thesis: [
      "Avrupa otomotiv pazarındaki daralmanın ihracatçı iştiraklere (FROTO) etkisi.",
      "Sıkı para politikasının bankacılık segmenti (YKBNK) marjlarına getirdiği baskı.",
      "Faiz ortamının dayanıklı tüketim (Arçelik) talebini yavaşlatması."
    ]
  },
  "EREGL": {
    ticker: "EREGL",
    name: "Ereğli Demir ve Çelik Fabrikaları",
    sector: "Demir & Çelik",
    price: 48.20,
    change: -0.40,
    change_percent: -0.82,
    currency: "TRY",
    day_low: 47.90,
    day_high: 49.30,
    volume: 21500000,
    market_cap: 168700000000,
    pe_ratio: 14.20,
    pb_ratio: 0.88,
    ev_ebitda: 8.90,
    dividend_yield: 1.10,
    dcf_fair_value: 58.00,
    margin_of_safety: 20.33,
    wacc: 0.375,
    verdict: "Tut / Bingöl Pelet Yatırımı & Toparlanma Beklentisi",
    bull_thesis: [
      "Bingöl Avnik peletleme tesisi ile hammadde özkaynak oranının %85'e çıkacak olması.",
      "Yeşil çelik dönüşümü için planlanan 3.2 milyar dolarlık stratejik yatırım paketi.",
      "PD/DD çarpanının 1.0x altında (0.88x) kalması ve defter değerine göre iskontosu."
    ],
    bear_thesis: [
      "Çin menşeli dampingli çelik ihracatının küresel HRC fiyatlarını baskılaması.",
      "Yüksek enerji ve koklaşabilir kömür girdi maliyetleri.",
      "Büyük yatırımlar sebebiyle kısa vadeli serbest nakit akışı zayıflığı."
    ]
  },
  "SISE": {
    ticker: "SISE",
    name: "Türkiye Şişe ve Cam Fabrikaları",
    sector: "Cam & Kimyasallar",
    price: 42.10,
    change: 0.30,
    change_percent: 0.72,
    currency: "TRY",
    day_low: 41.60,
    day_high: 42.80,
    volume: 16400000,
    market_cap: 129000000000,
    pe_ratio: 7.90,
    pb_ratio: 0.95,
    ev_ebitda: 6.40,
    dividend_yield: 2.10,
    dcf_fair_value: 54.50,
    margin_of_safety: 29.45,
    wacc: 0.360,
    verdict: "Al / Küresel Soda Külü & Düşük Defter Değeri",
    bull_thesis: [
      "Dünyanın en büyük soda külü ve cam üreticilerinden biri olması.",
      "ABD Wyoming doğal soda külü yatırımı ile maliyet avantajının katlanması.",
      "İhracat ve uluslararası operasyonların toplam cirodaki payının %60+ olması.",
      "Defter değerinin altında (PD/DD 0.95x) tarihsel iskontolu fiyatlanması."
    ],
    bear_thesis: [
      "Avrupa inşaat ve otomotiv sektöründeki durgunluğun düzcam talebini düşürmesi.",
      "Doğalgaz ve elektrik maliyetlerinin operasyonel marjlar üzerindeki ağırlığı.",
      "Yüksek borçluluk ve artan net finansman giderleri."
    ]
  },

  // --- ATAKAN'IN PORTFÖY VARLIKLARI (9 ENSTRÜMAN) ---
  "ALTIN.S1": {
    ticker: "ALTIN.S1",
    name: "Darphane Altın Sertifikası (BIST)",
    sector: "Emtia & Koruma",
    price: 34.15,
    change: 0.45,
    change_percent: 1.33,
    currency: "TRY",
    day_low: 33.70,
    day_high: 34.35,
    volume: 18500000,
    market_cap: 85000000000,
    pe_ratio: null,
    pb_ratio: null,
    ev_ebitda: null,
    dividend_yield: 0.0,
    dcf_fair_value: 36.80,
    margin_of_safety: 7.76,
    wacc: 0.300,
    verdict: "Tut / Enflasyon Kalkanı (%30 Hedef Ağırlık, Makas Kontrolü)",
    bull_thesis: [
      "Borsa İstanbul nezdinde stopajsız (%0) ve saklama maliyetsiz fiziki külçe altına dönüşüm hakkı.",
      "Enflasyon ve kur şoklarına karşı portföyün en güçlü savunma çıpası (1.001 TL -> 1.452 TL hedef).",
      "Küresel faiz indirim döngüsünde ons altın ve jeopolitik risk priminden doğrudan faydalanma."
    ],
    bear_thesis: [
      "Fiziki spot altına kıyasla zaman zaman oluşan %30-%60 prim makası anomalisi.",
      "Prim makasının sert kapandığı dönemlerde sertifika fiyatının düzeltme riski."
    ]
  },
  "AKBNK": {
    ticker: "AKBNK",
    name: "Akbank T.A.Ş.",
    sector: "Bankacılık (BIST 30)",
    price: 54.20,
    change: 1.40,
    change_percent: 2.65,
    currency: "TRY",
    day_low: 52.80,
    day_high: 54.90,
    volume: 42100000,
    market_cap: 281840000000,
    pe_ratio: 4.10,
    pb_ratio: 0.92,
    ev_ebitda: 3.80,
    dividend_yield: 4.50,
    dcf_fair_value: 72.00,
    margin_of_safety: 32.84,
    wacc: 0.380,
    verdict: "Kuvvetli Al / 11,45 Mr TL Temettü & %19,26 SYR (%25 Hedef)",
    bull_thesis: [
      "Sektör lideri Sermaye Yeterlilik Rasyosu (%19,26 SYR) ve rekor 11,45 Milyar TL nakit temettü.",
      "Dezenflasyon sürecinde mevduat maliyetlerinin gevşemesiyle Net Faiz Marjında (NIM) +%2,5 toparlanma.",
      "F/K 4.10x ve PD/DD 0.92x çarpanlarıyla gelişmekte olan piyasaların en ucuz bankalarından biri.",
      "Atlas 4+1 Modelinde +730 TL ilave alım ile 1.210 TL (%25) çekirdek omurga hedefi."
    ],
    bear_thesis: [
      "Sıkı para politikasında yüksek TL mevduat maliyetlerinin kısa vadeli marj baskısı.",
      "Takipteki alacaklar (NPL) oranında ekonomik yavaşlamayla oluşabilecek artış.",
      "TCMB makroihtiyati düzenlemelerinin getirdiği zorunlu karşılık yükleri."
    ]
  },
  "HRKET": {
    ticker: "HRKET",
    name: "Hareket Proje Taşımacılığı ve Yük Mühendisliği",
    sector: "Sanayi & Proje Lojistiği",
    price: 71.30,
    change: 2.10,
    change_percent: 3.03,
    currency: "TRY",
    day_low: 69.50,
    day_high: 72.80,
    volume: 6850000,
    market_cap: 11408000000,
    pe_ratio: 8.90,
    pb_ratio: 2.15,
    ev_ebitda: 7.20,
    dividend_yield: 1.20,
    dcf_fair_value: 94.50,
    margin_of_safety: 32.54,
    wacc: 0.355,
    verdict: "Kuvvetli Al / Dövizli RES Lojistiği & Küresel Backlog (%18 Hedef)",
    bull_thesis: [
      "Nordex (7,2M $) ve Umman Duqm RES (11,9M+ $) sözleşmeleriyle güçlü döviz nakit akışı.",
      "Yurt içi kredi daralmasından bağımsız küresel ağır nakliyat ve rüzgar enerjisi santrali montaj pazarı.",
      "Hareket Rüzgar Enerji iştirakiyle yenilenebilir enerji montajında uzmanlaşma.",
      "Atlas kararıyla tasfiye havuzundan çıkarılarak %18 hedef ağırlıkla (872 TL) çekirdeğe kilitlendi."
    ],
    bear_thesis: [
      "Küresel proje ertelemeleri ve rüzgar türbini tedarik zinciri aksamaları.",
      "Yüksek akaryakıt ve sınır ötesi operasyonel lojistik maliyetleri."
    ]
  },
  "GENIL": {
    ticker: "GENIL",
    name: "Gen İlaç ve Sağlık Ürünleri",
    sector: "İlaç & Biyoteknoloji",
    price: 73.80,
    change: 1.30,
    change_percent: 1.79,
    currency: "TRY",
    day_low: 72.20,
    day_high: 74.90,
    volume: 5120000,
    market_cap: 22140000000,
    pe_ratio: 9.40,
    pb_ratio: 1.95,
    ev_ebitda: 7.80,
    dividend_yield: 2.10,
    dcf_fair_value: 98.00,
    margin_of_safety: 32.79,
    wacc: 0.340,
    verdict: "Kuvvetli Al / Net Nakit Bilanço & Incyte Lisans Katalizörü (%15 Hedef)",
    bull_thesis: [
      "Net nakit pozisyonunda borçsuz bilanço; %50 politika faizinde sıfır finansman gideri yükü.",
      "Biyofarmasötik devi Incyte ile Niktimvo & Opzelura için 5 yıllık münhasır lisans sözleşmesi.",
      "Azerbaycan 'GEN Caucasus' fabrikasıyla Kafkasya ve Orta Asya pazarına doğrudan ihracat.",
      "4+1 Modelinde +283 TL ilave takviye ile 726 TL (%15) hedef ağırlık."
    ],
    bear_thesis: [
      "Sağlık Bakanlığı ilaç fiyat kararnamesindeki Euro kuru iskonto baskısı.",
      "Ruhsatlandırma ve klinik onay süreçlerindeki bürokratik vadeler."
    ]
  },
  "SASA": {
    ticker: "SASA",
    name: "SASA Polyester Sanayi A.Ş.",
    sector: "Petrokimya & Elyaf",
    price: 4.15,
    change: -0.05,
    change_percent: -1.19,
    currency: "TRY",
    day_low: 4.10,
    day_high: 4.22,
    volume: 85200000,
    market_cap: 217875000000,
    pe_ratio: 28.50,
    pb_ratio: 2.10,
    ev_ebitda: 14.80,
    dividend_yield: 0.0,
    dcf_fair_value: 3.80,
    margin_of_safety: -8.43,
    wacc: 0.420,
    verdict: "Sat (Tasfiye) / Ağır Faiz Yükü & %700 Sermaye Sulanması",
    bull_thesis: [
      "1,72 Milyar Dolarlık Saf Tereftalik Asit (PTA) tesisinin faaliyete geçmesi.",
      "Türkiye'nin polyester elyaf ithalatını ikame etme vizyonu."
    ],
    bear_thesis: [
      "Çıkarılmış sermayenin 52,5 milyar TL'ye fırlamasıyla dramatik hisse sulanması.",
      "%50 faiz ortamında faaliyet kârının tamamını yutan net finansman giderleri.",
      "Çin menşeli dampingli petrokimya arz baskısı. 467,50 TL tasfiye edilmeli."
    ]
  },
  "INFO": {
    ticker: "INFO",
    name: "İnfo Yatırım Menkul Değerler",
    sector: "Finans & Aracı Kurum",
    price: 11.65,
    change: -0.15,
    change_percent: -1.27,
    currency: "TRY",
    day_low: 11.45,
    day_high: 11.85,
    volume: 9400000,
    market_cap: 2656200000,
    pe_ratio: 10.20,
    pb_ratio: 1.85,
    ev_ebitda: 8.50,
    dividend_yield: 3.50,
    dcf_fair_value: 12.20,
    margin_of_safety: 4.72,
    wacc: 0.390,
    verdict: "Sat (Tasfiye) / BIST Hacim Daralması & Döngüsel Risk",
    bull_thesis: [
      "Geniş şube ağı ve bireysel yatırımcı portföy büyüklüğü.",
      "%100 bedelsiz sermaye artırımı."
    ],
    bear_thesis: [
      "TCMB %50 faizi nedeniyle tasarrufların mevduat ve PPF'ye kayması.",
      "BIST günlük işlem hacminde sert daralma ve halka arz gelirlerinin durması. 467,04 TL tasfiye edilmeli."
    ]
  },
  "MANAS": {
    ticker: "MANAS",
    name: "Manas Enerji Yönetimi Sanayi",
    sector: "Teknoloji & Sayaç Sanayi",
    price: 9.80,
    change: -0.20,
    change_percent: -2.00,
    currency: "TRY",
    day_low: 9.65,
    day_high: 10.15,
    volume: 3850000,
    market_cap: 1960000000,
    pe_ratio: 18.40,
    pb_ratio: 2.90,
    ev_ebitda: 12.10,
    dividend_yield: 0.0,
    dcf_fair_value: 9.10,
    margin_of_safety: -7.14,
    wacc: 0.410,
    verdict: "Sat (Tasfiye) / %100 Bedelli Riski & Sığ Tahta Volatilitesi",
    bull_thesis: [
      "ASKİ (523M TL) ve İGDAŞ (114M TL) akıllı sayaç altyapı ihaleleri.",
      "Gaz ve su yönetim sistemlerinde dijital dönüşüm talebi."
    ],
    bear_thesis: [
      "%100 bedelli sermaye artırımı baskısı ve yatırımcı sermayesi ihtiyacı.",
      "Kamu kurumlarının hak ediş tahsilat gecikmeleri ve işletme sermayesi açığı.",
      "Sığ tahta yapısında spekülatif sert dalgalanmalar. 437,10 TL tasfiye edilmeli."
    ]
  },
  "PEKGY": {
    ticker: "PEKGY",
    name: "Peker Gayrimenkul Yatırım Ortaklığı",
    sector: "Gayrimenkul Yatırım Ortaklığı",
    price: 3.42,
    change: -0.08,
    change_percent: -2.29,
    currency: "TRY",
    day_low: 3.38,
    day_high: 3.55,
    volume: 12100000,
    market_cap: 2305080000,
    pe_ratio: 15.60,
    pb_ratio: 0.72,
    ev_ebitda: 11.50,
    dividend_yield: 0.0,
    dcf_fair_value: 3.10,
    margin_of_safety: -9.36,
    wacc: 0.430,
    verdict: "Sat (Tasfiye) / Bedelliyle Borç Çevirme & Konut Kredi Krizi",
    bull_thesis: [
      "Gayrimenkul portföyünün Net Aktif Değeri (NAD) iskontosu."
    ],
    bear_thesis: [
      "%100 bedelliden toplanan paranın %45'inin doğrudan banka borcu kapatmaya gitmesi.",
      "Konut kredisi faizlerinin %60-70 bandında kilitlenmesiyle duran satışlar.",
      "Aşırı faiz duyarlılığı ve spekülatif fiyatlama. 394,24 TL tasfiye edilmeli."
    ]
  },
  "HDFGS": {
    ticker: "HDFGS",
    name: "Hedef Girişim Sermayesi Yatırım Ortaklığı",
    sector: "Finans & Girişim Sermayesi",
    price: 2.75,
    change: -0.04,
    change_percent: -1.43,
    currency: "TRY",
    day_low: 2.71,
    day_high: 2.82,
    volume: 8200000,
    market_cap: 1650000000,
    pe_ratio: 12.80,
    pb_ratio: 0.85,
    ev_ebitda: 9.90,
    dividend_yield: 1.80,
    dcf_fair_value: 2.85,
    margin_of_safety: 3.64,
    wacc: 0.400,
    verdict: "Sat (Tasfiye) / Start-up Değerleme İskontosu & Çıkış Tıkanıklığı",
    bull_thesis: [
      "Startup Burada GSYF yatırımı ve kitle fonlama ekosistemi.",
      "Defter değerinin altında (PD/DD 0.85x) fiyatlanması."
    ],
    bear_thesis: [
      "Küresel ve yerel yüksek faiz konjonktüründe teknoloji değerlemelerinin çöküşü.",
      "Halka arz kanallarının tıkanması sebebiyle girişim sermayesi çıkışlarının (exit) durması. 550,40 TL tasfiye edilmeli."
    ]
  }
};

// 2. Obsidian Araştırma Raporları Sabit Kalkanı
const STATIC_REPORTS = [
  {
    ticker: "PORTFOY",
    title: "BIST Portföy Sağlık Teşhisi, Şirket Kararları & Stratejik Master Rapor",
    date: "2026-10-13",
    verdict: "Radikal Konsolidasyon Gerekli (4+1 Model)",
    summary: "4.842 TL, 9 Varlık, N_eff = 8.25. 5 zayıf halkanın (PEKGY, MANAS, SASA, INFO, HDFGS) tasfiyesi ile açığa çıkan 2.316 TL'nin 4 çekirdek ve PPF'ye aktarımı."
  },
  {
    ticker: "THYAO",
    title: "Türk Hava Yolları Temel & Deterministik DCF Değerleme Raporu",
    date: "2026-10-13",
    verdict: "Kuvvetli Al (%23.5 Güvenlik Marjı)",
    summary: "F/K 4.82x çarpanı, dövizli gelir kalkanı, Turkish Cargo büyümesi ve 388.50 TL adil değer."
  },
  {
    ticker: "AKBNK",
    title: "Akbank Bilanço, Rekor Temettü & NIM Genişlemesi",
    date: "2026-10-13",
    verdict: "Kuvvetli Al (%19.26 SYR)",
    summary: "11,45 Mr TL nakit temettü, dezenflasyon ile toparlanan net faiz marjı ve 72.00 TL hedef değer."
  },
  {
    ticker: "HRKET",
    title: "Hareket Proje Taşımacılığı Nordex & Umman RES Sözleşmeleri",
    date: "2026-10-13",
    verdict: "Kuvvetli Al (Dövizli Backlog)",
    summary: "Nordex (7,2M $) ve Umman Duqm (11,9M+ $) sözleşmeleri. Tasfiyeden çıkarılarak %18 çekirdek hedef kilitlendi."
  },
  {
    ticker: "GENIL",
    title: "Gen İlaç Azerbaycan Üssü & Incyte Küresel Lisansı",
    date: "2026-10-13",
    verdict: "Kuvvetli Al (Net Nakit Bilanço)",
    summary: "Borçsuz bilanço, Incyte 5 yıllık lisansı ve Kafkasya ihracat sıçraması ile 98.00 TL adil değer."
  },
  {
    ticker: "ASELS",
    title: "Aselsan Savunma Sanayii & 11+ Mr $ Bakiye Sipariş Analizi",
    date: "2026-10-13",
    verdict: "Al / Defansif Büyüme",
    summary: "11+ Milyar Dolar bakiye sipariş portföyü, KAAN ve Siper projeleri ile 78.20 TL adil değer."
  }
];

/**
 * Sayfa Yüklendiğinde Başlatıcı
 */
document.addEventListener("DOMContentLoaded", () => {
  initTradingViewChart();
  initPortfolioCharts();
  setupEventListeners();
  loadTicker("THYAO");
  renderReports(STATIC_REPORTS);
});

/**
 * 1. TradingView Lightweight Charts Kurulumu
 */
function initTradingViewChart() {
  const container = document.getElementById("tv-chart-container");
  if (!container || !window.LightweightCharts) return;

  container.innerHTML = "";

  tvChart = LightweightCharts.createChart(container, {
    width: container.clientWidth,
    height: container.clientHeight || 420,
    layout: {
      background: { type: "solid", color: "#131c31" },
      textColor: "#94a3b8",
      fontSize: 11,
      fontFamily: "JetBrains Mono, monospace"
    },
    grid: {
      vertLines: { color: "#1e293b", style: 1 },
      horzLines: { color: "#1e293b", style: 1 }
    },
    crosshair: {
      mode: LightweightCharts.CrosshairMode.Normal,
      vertLine: {
        color: "#475569",
        width: 1,
        style: 3,
        labelBackgroundColor: "#334155"
      },
      horzLine: {
        color: "#475569",
        width: 1,
        style: 3,
        labelBackgroundColor: "#334155"
      }
    },
    timeScale: {
      borderColor: "#334155",
      timeVisible: true,
      secondsVisible: false
    },
    rightPriceScale: {
      borderColor: "#334155",
      scaleMargins: {
        top: 0.1,
        bottom: 0.25
      }
    }
  });

  // Mum Çubukları Serisi
  candleSeries = tvChart.addCandlestickSeries({
    upColor: "#10b981",
    downColor: "#ef4444",
    borderVisible: false,
    wickUpColor: "#10b981",
    wickDownColor: "#ef4444"
  });

  // Hacim Histogramı Serisi
  volumeSeries = tvChart.addHistogramSeries({
    color: "#3b82f6",
    priceFormat: {
      type: "volume"
    },
    priceScaleId: "",
    scaleMargins: {
      top: 0.8,
      bottom: 0.0
    }
  });

  // Crosshair Üzerinde Legend Güncelleme
  tvChart.subscribeCrosshairMove((param) => {
    if (!param || !param.time || !param.seriesData) return;
    const cData = param.seriesData.get(candleSeries);
    const vData = param.seriesData.get(volumeSeries);
    if (cData) {
      document.getElementById("legend-open").textContent = formatCurrency(cData.open);
      document.getElementById("legend-high").textContent = formatCurrency(cData.high);
      document.getElementById("legend-low").textContent = formatCurrency(cData.low);
      document.getElementById("legend-close").textContent = formatCurrency(cData.close);
    }
    if (vData) {
      document.getElementById("legend-vol").textContent = formatCompact(vData.value);
    }
  });

  // Otomatik Yeniden Boyutlandırma
  window.addEventListener("resize", () => {
    if (tvChart && container) {
      tvChart.applyOptions({
        width: container.clientWidth,
        height: container.clientHeight || 420
      });
    }
  });
}

/**
 * Sentetik Kandil Geçmişi Üretici (TradingView Görseli için)
 */
function generateFallbackCandles(basePrice, count = 90) {
  const candles = [];
  const volumes = [];
  let price = basePrice * 0.78;
  const now = new Date();
  
  for (let i = count; i >= 0; i--) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    if (d.getDay() === 0 || d.getDay() === 6) continue;

    const timeStr = d.toISOString().split("T")[0];
    const wave = Math.sin(i * 0.22) * 0.018 + Math.cos(i * 0.45) * 0.015;
    const trend = 0.0035;
    const delta = wave + trend;

    const open = price;
    const close = open * (1.0 + delta);
    const high = Math.max(open, close) * (1.0 + Math.abs(Math.sin(i * 0.8)) * 0.012);
    const low = Math.min(open, close) * (1.0 - Math.abs(Math.cos(i * 0.6)) * 0.011);
    const vol = Math.floor(18000000 * (0.6 + Math.abs(Math.sin(i * 0.3)) * 0.8));

    candles.push({
      time: timeStr,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2))
    });

    volumes.push({
      time: timeStr,
      value: vol,
      color: close >= open ? "rgba(16, 185, 129, 0.4)" : "rgba(239, 68, 68, 0.4)"
    });

    price = close;
  }

  // Son fiyatı basePrice ile normalize et
  if (candles.length > 0) {
    const ratio = basePrice / candles[candles.length - 1].close;
    candles.forEach((c) => {
      c.open = parseFloat((c.open * ratio).toFixed(2));
      c.high = parseFloat((c.high * ratio).toFixed(2));
      c.low = parseFloat((c.low * ratio).toFixed(2));
      c.close = parseFloat((c.close * ratio).toFixed(2));
    });
  }

  return { candles, volumes };
}

/**
 * 2. Hisse Verilerini Yükle ve Arayüzü Güncelle
 */
async function loadTicker(tickerSymbol) {
  const ticker = tickerSymbol.toUpperCase().replace(".IS", "");
  currentTicker = ticker;

  // Aktif Çip Butonu Stilini Güncelle
  document.querySelectorAll(".chip-btn").forEach((btn) => {
    const btnTicker = btn.getAttribute("data-ticker");
    if (btnTicker === ticker) {
      btn.className = "chip-btn px-2 py-0.5 rounded bg-blue-600 text-white font-bold shadow-md font-mono text-[11px] border border-blue-400 transition";
    } else {
      const isPort = PORTFOLIO_TICKERS.has(btnTicker);
      btn.className = `chip-btn px-2 py-0.5 rounded bg-slate-800 ${isPort ? "text-amber-300 border border-amber-500/20" : "text-slate-300"} font-medium hover:bg-slate-700 font-mono text-[11px] transition`;
    }
  });

  // Statik Kalkan Verisini Al
  let finalData = FALLBACK_DATA[ticker];

  // Eğer listede yoksa jenerik fallback oluştur
  if (!finalData) {
    finalData = {
      ticker: ticker,
      name: `${ticker} Sanayi ve Ticaret A.Ş.`,
      sector: "BIST Şirketi",
      price: 100.0,
      change: 1.5,
      change_percent: 1.5,
      currency: "TRY",
      day_low: 98.5,
      day_high: 102.0,
      volume: 12000000,
      market_cap: 25000000000,
      pe_ratio: 7.5,
      pb_ratio: 1.4,
      ev_ebitda: 5.8,
      dividend_yield: 2.0,
      dcf_fair_value: 125.0,
      margin_of_safety: 25.0,
      wacc: 0.36,
      verdict: "İzle / Temel Rasyo Filtresi",
      bull_thesis: ["Sektörel büyüme katalizörü.", "İskontolu piyasa çarpanları."],
      bear_thesis: ["Yüksek faiz ve finansman maliyeti.", "Kur hassasiyeti."]
    };
  }

  // Eğer arka planda yerel bir API varsa sessizce dene (GitHub Pages'de hata fırlatmaz)
  try {
    const qResp = await fetch(`/api/quote?ticker=${ticker}`);
    if (qResp.ok) {
      const qJson = await qResp.json();
      finalData = { ...finalData, ...qJson };
    }
  } catch (_) {
    // Statik kalkan devrede
  }

  // Dashboard'u Çiz
  renderDashboard(finalData);
}

/**
 * 3. Dashboard Bileşenlerini Render Et
 */
function renderDashboard(data) {
  // Başlıklar & Portföy Rozeti
  document.getElementById("stock-name").textContent = data.name || data.ticker;
  document.getElementById("stock-name").title = data.name || data.ticker;
  document.getElementById("stock-price").textContent = `${formatCurrency(data.price)} ₺`;
  
  const tagEl = document.getElementById("portfolio-tag");
  if (tagEl) {
    if (PORTFOLIO_TICKERS.has(data.ticker)) {
      tagEl.classList.remove("hidden");
    } else {
      tagEl.classList.add("hidden");
    }
  }

  const chgEl = document.getElementById("stock-change");
  const isPos = (data.change_percent || 0) >= 0;
  chgEl.textContent = `${isPos ? "▲ +" : "▼ "}${data.change_percent ? data.change_percent.toFixed(2) : "0.00"}%`;
  chgEl.className = `text-xs font-mono font-bold flex items-center ${isPos ? "text-emerald-400" : "text-rose-400"}`;

  // Günlük Aralık
  document.getElementById("day-low").textContent = formatCurrency(data.day_low || data.price * 0.98);
  document.getElementById("day-high").textContent = formatCurrency(data.day_high || data.price * 1.02);
  const low = data.day_low || data.price * 0.98;
  const high = data.day_high || data.price * 1.02;
  const pct = Math.max(5, Math.min(95, ((data.price - low) / (high - low || 1)) * 100));
  document.getElementById("day-range-bar").style.width = `${pct}%`;

  // Piyasa Değeri & Hacim
  document.getElementById("stock-mcap").textContent = `${(data.market_cap / 1e9).toFixed(2)} Mr ₺`;
  document.getElementById("stock-vol").textContent = `${formatCompact(data.volume)} Adet`;

  // Çarpanlar
  document.getElementById("ratio-pe").textContent = data.pe_ratio ? `${data.pe_ratio.toFixed(2)}x` : "—";
  document.getElementById("ratio-pb").textContent = data.pb_ratio ? `${data.pb_ratio.toFixed(2)}x` : "—";
  document.getElementById("ratio-evebitda").textContent = data.ev_ebitda ? `${data.ev_ebitda.toFixed(2)}x` : "—";
  document.getElementById("ratio-div").textContent = data.dividend_yield !== undefined && data.dividend_yield !== null ? `%${data.dividend_yield.toFixed(1)}` : "—";

  // Deterministik DCF & Güvenlik Marjı
  const fairVal = data.dcf_fair_value || data.price * 1.2;
  document.getElementById("stock-fair-value").textContent = `${formatCurrency(fairVal)} ₺`;
  
  const mos = data.margin_of_safety !== undefined ? data.margin_of_safety : ((fairVal - data.price) / data.price) * 100;
  const mosBadge = document.getElementById("margin-badge");
  mosBadge.textContent = `${mos >= 0 ? "+" : ""}%${mos.toFixed(1)} Marj`;
  mosBadge.className = `px-2 py-0.5 rounded text-[10px] font-bold border font-mono ${
    mos >= 15 ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
    mos >= 0 ? "bg-blue-500/20 text-blue-400 border-blue-500/30" :
    "bg-rose-500/20 text-rose-400 border-rose-500/30"
  }`;

  const waccVal = data.wacc ? (data.wacc * 100).toFixed(1) : "36.5";
  document.getElementById("stock-wacc").textContent = `%${waccVal}`;

  // Grafik Başlığı ve Sektör
  document.getElementById("chart-title").textContent = `${data.ticker} / TRY — Günlük Mumlar`;
  document.getElementById("sector-pill").textContent = data.sector || "BIST";

  // Boğa vs. Ayı Sparring
  renderThesisList("bull-thesis-list", data.bull_thesis || []);
  renderThesisList("bear-thesis-list", data.bear_thesis || []);
  document.getElementById("verdict-banner").textContent = data.verdict || "Al / Model Konsensüsü";

  // Grafik Verisini Güncelle
  if (candleSeries && volumeSeries) {
    const fbCandles = generateFallbackCandles(data.price);
    candleSeries.setData(fbCandles.candles);
    volumeSeries.setData(fbCandles.volumes);
    const last = fbCandles.candles[fbCandles.candles.length - 1];
    document.getElementById("legend-open").textContent = formatCurrency(last.open);
    document.getElementById("legend-high").textContent = formatCurrency(last.high);
    document.getElementById("legend-low").textContent = formatCurrency(last.low);
    document.getElementById("legend-close").textContent = formatCurrency(last.close);
    document.getElementById("legend-vol").textContent = formatCompact(last.volume);
    tvChart.timeScale().fitContent();
  }

  // Duyarlılık Matrisini Çiz
  renderSensitivityTable(data.price, fairVal);
}

/**
 * Tez Listesi Renderlayıcı
 */
function renderThesisList(containerId, items) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = "";
  items.forEach((txt) => {
    const li = document.createElement("li");
    li.textContent = txt;
    el.appendChild(li);
  });
}

/**
 * 4. DCF Duyarlılık Tablosu Renderlayıcı
 */
function renderSensitivityTable(currentPrice, baseFairVal) {
  const tbody = document.getElementById("sensitivity-tbody");
  if (!tbody) return;
  tbody.innerHTML = "";

  const waccLevels = [0.32, 0.35, 0.38, 0.41, 0.44];
  const growthLevels = [0.05, 0.07, 0.09, 0.11];

  waccLevels.forEach((w) => {
    const tr = document.createElement("tr");
    tr.className = "hover:bg-slate-800/40 transition";

    const th = document.createElement("td");
    th.className = "p-2.5 text-left font-bold text-slate-300 bg-slate-900/50";
    th.textContent = `%${(w * 100).toFixed(1)}`;
    tr.appendChild(th);

    growthLevels.forEach((g) => {
      const factor = (0.38 - 0.08) / Math.max(0.01, w - g);
      const val = parseFloat((baseFairVal * Math.pow(factor, 0.55)).toFixed(2));
      const diff = parseFloat((((val - currentPrice) / currentPrice) * 100).toFixed(1));

      const td = document.createElement("td");
      td.className = "p-2 font-mono";

      const badge = document.createElement("div");
      badge.className = `p-1.5 rounded text-xs font-bold transition flex flex-col items-center justify-center ${
        diff >= 15
          ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/40"
          : diff >= 0
          ? "bg-emerald-950/30 text-emerald-300 border border-emerald-500/20"
          : diff >= -15
          ? "bg-rose-950/30 text-rose-300 border border-rose-500/20"
          : "bg-rose-950/60 text-rose-400 border border-rose-500/40"
      }`;

      badge.innerHTML = `<span>${val.toFixed(2)} ₺</span><span class="text-[10px] font-normal opacity-80">${diff >= 0 ? "+" : ""}${diff}%</span>`;
      td.appendChild(badge);
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });
}

/**
 * 5. Chart.js Portföy Çift Pasta Grafiği (Mevcut vs Hedef)
 */
function initPortfolioCharts() {
  if (!window.Chart) return;

  // 1. Mevcut Portföy Pastası (9 Varlık + Nakit)
  const currentCanvas = document.getElementById("current-portfolio-chart");
  if (currentCanvas) {
    const ctx = currentCanvas.getContext("2d");
    currentPortfolioDoughnut = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: [
          "ALTIN.S1 (1.001 TL)",
          "HRKET (571 TL)",
          "HDFGS (550 TL)",
          "AKBNK (480 TL)",
          "SASA (468 TL)",
          "INFO (467 TL)",
          "GENIL (443 TL)",
          "MANAS (437 TL)",
          "PEKGY (394 TL)",
          "Nakit (32 TL)"
        ],
        datasets: [
          {
            data: [20.68, 11.78, 11.37, 9.91, 9.65, 9.65, 9.14, 9.03, 8.14, 0.65],
            backgroundColor: [
              "#f59e0b", // ALTIN - Kehribar
              "#10b981", // HRKET - Yeşil
              "#64748b", // HDFGS - Slate
              "#3b82f6", // AKBNK - Mavi
              "#ef4444", // SASA - Kırmızı
              "#8b5cf6", // INFO - Mor
              "#06b6d4", // GENIL - Camgöbeği
              "#ec4899", // MANAS - Pembe
              "#f43f5e", // PEKGY - Gül
              "#94a3b8"  // Nakit - Gri
            ],
            borderColor: "#0f172a",
            borderWidth: 2,
            hoverOffset: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#1e293b",
            titleColor: "#f8fafc",
            bodyColor: "#94a3b8",
            borderColor: "#334155",
            borderWidth: 1,
            callbacks: {
              label: (ctx) => ` Pay: %${ctx.parsed}`
            }
          }
        },
        cutout: "64%"
      }
    });
  }

  // 2. Hedef 4+1 Portföy Modeli Pastası
  const targetCanvas = document.getElementById("target-portfolio-chart");
  if (targetCanvas) {
    const ctx = targetCanvas.getContext("2d");
    targetPortfolioDoughnut = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: [
          "ALTIN.S1 (1.452 TL)",
          "AKBNK (1.210 TL)",
          "HRKET (872 TL)",
          "GENIL (726 TL)",
          "PPF Nakit Fonu (582 TL)"
        ],
        datasets: [
          {
            data: [30.0, 25.0, 18.0, 15.0, 12.0],
            backgroundColor: [
              "#f59e0b", // ALTIN.S1 - Altın Sarısı
              "#3b82f6", // AKBNK - Mavi
              "#10b981", // HRKET - Zümrüt
              "#6366f1", // GENIL - İndigo
              "#a855f7"  // PPF Nakit - Mor
            ],
            borderColor: "#0f172a",
            borderWidth: 2,
            hoverOffset: 8
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#1e293b",
            titleColor: "#f8fafc",
            bodyColor: "#94a3b8",
            borderColor: "#334155",
            borderWidth: 1,
            callbacks: {
              label: (ctx) => ` Hedef Pay: %${ctx.parsed}`
            }
          }
        },
        cutout: "64%"
      }
    });
  }
}

/**
 * 6. Raporlar Listesini Render Et
 */
function renderReports(reports) {
  const listEl = document.getElementById("reports-list");
  if (!listEl) return;
  listEl.innerHTML = "";

  reports.forEach((rep) => {
    const card = document.createElement("div");
    card.className = "bg-slate-900/80 border border-slate-800 p-4 rounded-xl hover:border-slate-700 transition flex flex-col justify-between";
    card.innerHTML = `
      <div>
        <div class="flex items-center justify-between mb-2">
          <span class="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-bold border border-blue-500/20 text-[11px] font-mono">${rep.ticker}</span>
          <span class="text-slate-500 text-[10px] font-mono">${rep.date}</span>
        </div>
        <h5 class="font-bold text-slate-100 text-xs mb-1.5 leading-snug">${rep.title}</h5>
        <p class="text-[11px] text-slate-400 leading-relaxed mb-3">${rep.summary}</p>
      </div>
      <div class="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
        <span class="text-slate-400">Karar: <strong class="text-emerald-400">${rep.verdict}</strong></span>
        ${rep.ticker !== "PORTFOY" ? `
          <button onclick="loadTicker('${rep.ticker}')" class="text-blue-400 hover:text-blue-300 font-bold text-[11px] flex items-center gap-1">
            İncele →
          </button>
        ` : `
          <button onclick="document.getElementById('tab-btn-portfolio').click()" class="text-amber-400 hover:text-amber-300 font-bold text-[11px] flex items-center gap-1">
            Görüntüle →
          </button>
        `}
      </div>
    `;
    listEl.appendChild(card);
  });
}

/**
 * 7. Dinleyiciler ve Sekme Yönetimi
 */
function setupEventListeners() {
  // Popüler Çip Butonları
  document.querySelectorAll(".chip-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const ticker = btn.getAttribute("data-ticker");
      if (ticker) loadTicker(ticker);
    });
  });

  // Arama Formu
  const searchForm = document.getElementById("search-form");
  const searchInput = document.getElementById("ticker-input");
  if (searchForm && searchInput) {
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const val = searchInput.value.trim().toUpperCase();
      if (val) {
        loadTicker(val);
        searchInput.value = "";
      }
    });
  }

  // Rapor Yenileme Butonu
  const refreshBtn = document.getElementById("refresh-reports-btn");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
      renderReports(STATIC_REPORTS);
    });
  }

  // Sekmeler (Tabs)
  const tabPortfolio = document.getElementById("tab-btn-portfolio");
  const tabDcf = document.getElementById("tab-btn-dcf");
  const tabReports = document.getElementById("tab-btn-reports");

  const contentPortfolio = document.getElementById("tab-content-portfolio");
  const contentDcf = document.getElementById("tab-content-dcf");
  const contentReports = document.getElementById("tab-content-reports");

  function switchTab(activeBtn, activeContent) {
    [tabPortfolio, tabDcf, tabReports].forEach((b) => {
      b.className = "tab-btn px-4 py-2 rounded-lg text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 transition flex items-center gap-1.5";
    });
    [contentPortfolio, contentDcf, contentReports].forEach((c) => {
      c.classList.add("hidden");
    });

    activeBtn.className = "tab-btn px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 text-white transition flex items-center gap-1.5";
    activeContent.classList.remove("hidden");
  }

  if (tabPortfolio && tabDcf && tabReports) {
    tabPortfolio.addEventListener("click", () => {
      switchTab(tabPortfolio, contentPortfolio);
      if (currentPortfolioDoughnut) currentPortfolioDoughnut.resize();
      if (targetPortfolioDoughnut) targetPortfolioDoughnut.resize();
    });
    tabDcf.addEventListener("click", () => switchTab(tabDcf, contentDcf));
    tabReports.addEventListener("click", () => {
      switchTab(tabReports, contentReports);
    });
  }
}

/**
 * Sayı ve Para Biçimlendiriciler
 */
function formatCurrency(val) {
  if (val === undefined || val === null || isNaN(val)) return "0.00";
  return parseFloat(val).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatCompact(num) {
  if (!num || isNaN(num)) return "0";
  if (num >= 1e9) return (num / 1e9).toFixed(2) + "Mrd";
  if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
  if (num >= 1e3) return (num / 1e3).toFixed(1) + "K";
  return num.toString();
}
