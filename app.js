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
let activeCandleData = [];
let activeVolumeData = [];
let currentPortfolioDoughnut = null;
let targetPortfolioDoughnut = null;
let currentTicker = "THYAO";

/**
 * Canlı Dijital Borsa Saati (İstanbul / TR)
 * Her saniye (#live-clock) elementini saniyesi saniyesine canlı günceller
 */
function startLiveClock() {
  const clockEl = document.getElementById("live-clock");
  function tick() {
    const now = new Date();
    if (clockEl) {
      clockEl.textContent = now.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    }
  }
  tick();
  setInterval(tick, 1000);
}

// Supabase Realtime Yapılandırması (BIST Analyze Projesi)
const SUPABASE_CONFIG = {
  url: "https://uzythsdqpbzqcapepkdz.supabase.co",
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6eXRoc2RxcGJ6cWNhcGVwa2R6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE5NzgwODUsImV4cCI6MjEwNzU1NDA4NX0.U4F-SZiuFy90gmDSNvshp5fZlMZJ0Lu-kuYxnzWvkgw"
};
let supabaseClient = null;
if (window.supabase && typeof window.supabase.createClient === "function") {
  supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
}

// 4+1 Çekirdek Model Varsayılan Portföy Kütüğü (AtakanOS 400-Vault ile Eşit)
const DEFAULT_PORTFOLIO_HOLDINGS = [
  { ticker: "ALTIN.S1", name: "Darphane Altın Sertifikası", lot: 20, cost: 71.05, sector: "Emtia / Altın" },
  { ticker: "AKBNK", name: "Akbank T.A.Ş.", lot: 19, cost: 67.85, sector: "Bankacılık" },
  { ticker: "HRKET", name: "Hareket Proje Taşımacılığı", lot: 82, cost: 10.10, sector: "Lojistik / Enerji" },
  { ticker: "GENIL", name: "Gen İlaç ve Sağlık Ürünleri", lot: 135, cost: 5.04, sector: "İlaç / Sağlık" },
  { ticker: "PPZ", name: "Azimut Portföy Para Piyasası Fonu", lot: 1, cost: 364.62, sector: "Para Piyasası" }
];

// Portföy Varlıkları Kümesi (Dinamik senkronize edilir)
let PORTFOLIO_TICKERS = new Set(["ALTIN.S1", "AKBNK", "HRKET", "GENIL", "PPZ"]);

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

  // --- ATAKAN'IN PORTFÖY VARLIKLARI (4+1 ÇEKİRDEK MODEL) ---
  "PPZ": {
    ticker: "PPZ",
    name: "Azimut Portföy Para Piyasası Fonu (PPF)",
    sector: "Para Piyasası / Likit Fon",
    price: 364.62,
    change: 0.50,
    change_percent: 0.14,
    currency: "TRY",
    day_low: 364.00,
    day_high: 365.00,
    volume: 15000000,
    market_cap: 12500000000,
    pe_ratio: null,
    pb_ratio: null,
    ev_ebitda: null,
    dividend_yield: 50.0,
    dcf_fair_value: 364.62,
    margin_of_safety: 0.0,
    wacc: 0.50,
    verdict: "Likit Nema / Günlük %50 Bileşik Getiri Kalkanı",
    bull_thesis: [
      "TCMB gecelik repo faizi ile risksiz günlük bileşik getiri birikimi.",
      "BIST düşüşlerinde hisse almak için anında harcanabilir likidite tamponu.",
      "Sıfır sermaye kaybı ve sıfır piyasa volatilitesi."
    ],
    bear_thesis: [
      "TCMB faiz indirim döngüsünde getiri marjında kademeli daralma.",
      "Yüksek enflasyon ortamında uzun vadeli hisse senedi kadar reel büyüme sunmaması."
    ]
  },
  "ALTIN.S1": {
    ticker: "ALTIN.S1",
    name: "Darphane Altın Sertifikası (BIST)",
    sector: "Emtia & Koruma",
    price: 71.05,
    change: 0.45,
    change_percent: 0.64,
    currency: "TRY",
    day_low: 70.80,
    day_high: 71.60,
    volume: 18500000,
    market_cap: 85000000000,
    pe_ratio: null,
    pb_ratio: null,
    ev_ebitda: null,
    dividend_yield: 0.0,
    dcf_fair_value: 78.50,
    margin_of_safety: 10.49,
    wacc: 0.300,
    verdict: "Tut / Enflasyon Kalkanı (%30 Hedef Ağırlık, Makas Kontrolü)",
    bull_thesis: [
      "Borsa İstanbul nezdinde stopajsız (%0) ve saklama maliyetsiz fiziki külçe altına dönüşüm hakkı.",
      "Enflasyon ve kur şoklarına karşı portföyün en güçlü savunma çıpası (1.421 TL gerçekleşen | %31).",
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
    price: 67.85,
    change: 1.40,
    change_percent: 2.11,
    currency: "TRY",
    day_low: 67.20,
    day_high: 68.90,
    volume: 42100000,
    market_cap: 352820000000,
    pe_ratio: 4.60,
    pb_ratio: 1.05,
    ev_ebitda: 4.10,
    dividend_yield: 4.50,
    dcf_fair_value: 86.00,
    margin_of_safety: 26.75,
    wacc: 0.380,
    verdict: "Kuvvetli Al / 11,45 Mr TL Temettü & %19,26 SYR (%25 Hedef)",
    bull_thesis: [
      "Sektör lideri Sermaye Yeterlilik Rasyosu (%19,26 SYR) ve rekor 11,45 Milyar TL nakit temettü.",
      "Dezenflasyon sürecinde mevduat maliyetlerinin gevşemesiyle Net Faiz Marjında (NIM) +%2,5 toparlanma.",
      "F/K 4.60x ve PD/DD 1.05x çarpanlarıyla gelişmekte olan piyasaların en ucuz bankalarından biri.",
      "Atlas 4+1 Modelinde 1.289 TL (%28,1) pozisyon ile ana omurga lokomotifi."
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
    price: 10.10,
    change: 0.22,
    change_percent: 2.23,
    currency: "TRY",
    day_low: 9.95,
    day_high: 10.35,
    volume: 6850000,
    market_cap: 11408000000,
    pe_ratio: 8.90,
    pb_ratio: 2.15,
    ev_ebitda: 7.20,
    dividend_yield: 1.20,
    dcf_fair_value: 13.80,
    margin_of_safety: 36.63,
    wacc: 0.355,
    verdict: "Kuvvetli Al / Dövizli RES Lojistiği & Küresel Backlog (%18 Hedef)",
    bull_thesis: [
      "Nordex (7,2M $) ve Umman Duqm RES (11,9M+ $) sözleşmeleriyle güçlü döviz nakit akışı.",
      "Yurt içi kredi daralmasından bağımsız küresel ağır nakliyat ve rüzgar enerjisi santrali montaj pazarı.",
      "Hareket Rüzgar Enerji iştirakiyle yenilenebilir enerji montajında uzmanlaşma.",
      "Atlas kararıyla 828 TL (%18,1) ile 4+1 modelin 3. büyük büyüme ayağı."
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
    price: 5.04,
    change: 0.08,
    change_percent: 1.61,
    currency: "TRY",
    day_low: 4.95,
    day_high: 5.15,
    volume: 5120000,
    market_cap: 22140000000,
    pe_ratio: 9.40,
    pb_ratio: 1.95,
    ev_ebitda: 7.80,
    dividend_yield: 2.10,
    dcf_fair_value: 6.85,
    margin_of_safety: 35.91,
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

// 2. Obsidian Araştırma Raporları Sabit Kalkanı & Derin Şirket Analizleri
const STATIC_REPORTS = [
  {
    ticker: "PORTFOY",
    title: "BIST Portföy Sağlık Teşhisi, Şirket Kararları & Stratejik Master Rapor",
    date: "2026-10-13",
    verdict: "Radikal Konsolidasyon Gerekli (4+1 Model)",
    summary: "4.842 TL, 9 Varlık, N_eff = 8.25. 5 zayıf halkanın (PEKGY, MANAS, SASA, INFO, HDFGS) tasfiyesi ile açığa çıkan 2.316 TL'nin 4 çekirdek ve PPF'ye aktarımı.",
    full_content: `
      <div class="space-y-4">
        <div class="bg-amber-950/30 border border-amber-500/30 p-3.5 rounded-xl">
          <h4 class="font-bold text-amber-300 text-sm mb-1">🚨 Yapısal Teşhis: Aşırı Çeşitlendirme (Over-Diversification)</h4>
          <p>4.842,13 TL'lik sermaye 9 farklı enstrümana bölünmüş durumda. Efektif varlık sayısı <strong>N_eff = 8.25</strong> ve Herfindahl-Hirschman İndeksi (HHI) <strong>0.1212</strong> seviyesinde. Pozisyon başına ortalama 450 TL düşmekte, tavan kârında dahi bilişsel takip maliyetini karşılamamaktadır.</p>
        </div>
        <div class="space-y-2">
          <h4 class="font-bold text-white text-sm">🎯 4+1 Konsolide Çekirdek Hedef Modeli:</h4>
          <ul class="space-y-1.5 list-disc list-inside text-slate-300">
            <li><strong>ALTIN.S1 (%30 - 1.452 TL):</strong> Enflasyon ve kur şoku kalkanı (Makas kontrolü şartıyla).</li>
            <li><strong>AKBNK (%25 - 1.210 TL):</strong> BIST 30 omurgası, rekor 11,45 Mr TL temettü ve dezenflasyon NIM toparlanması.</li>
            <li><strong>HRKET (%18 - 872 TL):</strong> Nordex & Umman Duqm dövizli rüzgar enerjisi lojistik sözleşmeleri.</li>
            <li><strong>GENIL (%15 - 726 TL):</strong> Net nakit pozisyonu, Incyte 5 yıllık lisansı ve Azerbaycan ihracat fabrikası.</li>
            <li><strong>PPF / Nakit (%12 - 582 TL):</strong> %50 faizle günlük bileşik nema ve piyasa düşüşlerinde alım akçesi.</li>
          </ul>
        </div>
        <div class="bg-slate-900 p-3 rounded-lg border border-slate-800">
          <h4 class="font-bold text-rose-400 text-xs mb-1">⚠️ Tasfiye Edilecek 5 Zayıf Halka (+2.316 TL):</h4>
          <p class="text-slate-400">PEKGY (394 TL), MANAS (437 TL), SASA (467 TL), INFO (467 TL), HDFGS (550 TL) kademeli tasfiye edilerek çekirdek havuza enjekte edilmelidir.</p>
        </div>
      </div>
    `
  },
  {
    ticker: "ALTIN.S1",
    title: "Darphane Altın Sertifikası: Enflasyon Kalkanı & Prim Makası Analizi",
    date: "2026-10-13",
    verdict: "Tut / Enflasyon Çıpası (%30 Hedef, Makas Takibi)",
    summary: "Borsa İstanbul nezdinde stopajsız (%0) ve saklama maliyetsiz fiziki altına dönüşüm hakkı. Spot altına göre prim makası kontrol edilmeli.",
    full_content: `
      <div class="space-y-4">
        <p><strong>Yatırım Tezi:</strong> Darphane Altın Sertifikası, portföyün TL devalüasyonu ve enflasyon şoklarına karşı en sağlam defansif çıpasıdır. 50 tonluk fiziki külçe altın karşılığı bulunur ve BIST nezdinde %0 stopajla işlem görür.</p>
        <div class="grid grid-cols-2 gap-3 text-xs font-mono">
          <div class="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-lg">
            <span class="text-emerald-400 font-bold block mb-1">🟢 Güçlü Yönler</span>
            • Sıfır saklama maliyeti ve BIST likiditesi<br>
            • Darphane'den fiziki külçe altına dönüşüm garantisi<br>
            • Küresel faiz indirim döngüsünde ons altın desteği
          </div>
          <div class="p-3 bg-rose-950/20 border border-rose-500/30 rounded-lg">
            <span class="text-rose-400 font-bold block mb-1">🔴 Kritik Risk</span>
            • Fiziki gram altına göre %30-%60 aralığında primli fiyatlama anomalisi.<br>
            • İlave alımlar prim makasının %5 altına indiği dönemlerde yapılmalıdır.
          </div>
        </div>
      </div>
    `
  },
  {
    ticker: "AKBNK",
    title: "Akbank T.A.Ş.: Rekor Nakit Kâr Payı & NIM Genişlemesi",
    date: "2026-10-13",
    verdict: "Kuvvetli Al (%19.26 SYR, 72.00 TL Hedef)",
    summary: "11,45 Mr TL nakit temettü, dezenflasyon sürecinde toparlanan net faiz marjı, F/K 4.10x ve PD/DD 0.92x.",
    full_content: `
      <div class="space-y-4">
        <p><strong>Yatırım Tezi:</strong> Akbank, Türk bankacılık sektörünün en yüksek Sermaye Yeterlilik Rasyosuna (%19,26) sahiptir. 2025'te 6,35 Mr TL, 2026'da 11,45 Mr TL nakit temettü ödemiştir. Dezenflasyonla birlikte mevduat faiz maliyeti geriledikçe Net Faiz Marjı (NIM) hızla toparlanmaktadır.</p>
        <div class="bg-blue-950/30 border border-blue-500/30 p-3 rounded-lg text-xs font-mono">
          <strong>Atlas Kararı:</strong> Portföydeki 479,85 TL'lik pozisyon +730 TL takviye edilerek 1.210 TL'ye (%25) çıkarılmalı ve ana lokomotif yapılmalıdır.
        </div>
      </div>
    `
  },
  {
    ticker: "HRKET",
    title: "Hareket Proje Taşımacılığı: Nordex & Umman RES Sözleşmeleri",
    date: "2026-10-13",
    verdict: "Kuvvetli Al (Dövizli Backlog, %18 Hedef)",
    summary: "Nordex (7,2M $) ve Umman Duqm (11,9M+ $) sözleşmeleri. Tasfiyeden çıkarılarak %18 çekirdek hedef kilitlendi.",
    full_content: `
      <div class="space-y-4">
        <p><strong>Yatırım Tezi:</strong> Şirket yurt içi yüksek faiz ve kredi daralmasından bağımsız, tamamen döviz bazlı küresel ağır taşımacılık ve rüzgar enerjisi santrali montajı yürütmektedir. Son dönemde Nordex (7,2M $) ve Umman Duqm RES (11,9M+ $) sözleşmelerini imzalamıştır.</p>
        <div class="bg-emerald-950/20 border border-emerald-500/30 p-3 rounded-lg text-xs font-mono">
          <strong>Atlas Kararı:</strong> İlk incelemedeki tasfiye kararı bozuldu; güçlü döviz nakit akışı ve ihracat gücü sebebiyle portföyde %18 payla (872 TL) çekirdeğe kilitlendi.
        </div>
      </div>
    `
  },
  {
    ticker: "GENIL",
    title: "Gen İlaç: Incyte 5 Yıllık Lisansı & Net Nakit Bilanço",
    date: "2026-10-13",
    verdict: "Kuvvetli Al (Net Nakit Bilanço, 98.00 TL Hedef)",
    summary: "Borçsuz bilanço, Incyte 5 yıllık lisansı ve Kafkasya ihracat sıçraması ile 98.00 TL adil değer.",
    full_content: `
      <div class="space-y-4">
        <p><strong>Yatırım Tezi:</strong> Gen İlaç net nakit pozisyonunda borçsuz bir bilançoya sahiptir; bu sayede %50 politika faizi ortamında sıfır finansman gideri yükü taşır. Incyte ile Niktimvo ve Opzelura için 5 yıllık münhasır lisans imzalamış, Azerbaycan fabrikasıyla ihracat atağı başlatmıştır.</p>
        <div class="bg-emerald-950/20 border border-emerald-500/30 p-3 rounded-lg text-xs font-mono">
          <strong>Atlas Kararı:</strong> Defansif sağlık büyümesi omurgası olarak 442 TL'den 726 TL'ye (%15) büyütülecektir.
        </div>
      </div>
    `
  },
  {
    ticker: "SASA",
    title: "Sasa Polyester: PTA Tesisi, Faiz Baskısı & Tasfiye Tezi",
    date: "2026-10-13",
    verdict: "Sat (Tasfiye) / Yüksek Borç & %700 Sermaye Sulanması",
    summary: "Adana PTA tesisi devreye girdi ancak 52,5 Milyar TL'ye fırlayan sermaye sulanması ve yüksek finansman giderleri kârı tamamen baskılıyor.",
    full_content: `
      <div class="space-y-4">
        <p><strong>Yatırım Tezi:</strong> Mart 2025'te 1,72 Milyar Dolarlık Adana PTA tesisi devreye alınmış olsa da, çıkarılmış sermaye bedelsiz ve tahsisli ihraçlarla 52,5 Milyar TL'ye fırlamıştır. Yüksek borç stoğu ve %50 faiz ortamında finansman giderleri faaliyet kârını yutmaktadır.</p>
        <div class="bg-rose-950/30 border border-rose-500/30 p-3 rounded-lg text-xs font-mono">
          <strong>Atlas Kararı:</strong> 467,50 TL'lik SASA pozisyonu tasfiye edilerek çekirdek havuza (AKBNK / ALTIN.S1) aktarılmalıdır.
        </div>
      </div>
    `
  },
  {
    ticker: "PEKGY",
    title: "Peker GYO: Bedelli Sermaye Artırımı & Faiz Krizinden Çıkış",
    date: "2026-10-13",
    verdict: "Sat (Tasfiye) / Gayrimenkul Faiz Baskısı & Bedelli",
    summary: "%100 bedelli sermaye artırımı ile toplanan fonun %45'i banka borcu kapatmaya ayrıldı. Faiz ortamında GYO sektörü baskı altında.",
    full_content: `
      <div class="space-y-4">
        <p><strong>Yatırım Tezi:</strong> Peker GYO %100 bedelli sermaye artırımı yapmış, toplanan kaynağın yaklaşık %45'iyle yüksek faizli banka kredilerini kapatmıştır. %50 faiz ve sıkılaşma ortamında gayrimenkul satışları ve nakit akışı baskılanmaktadır.</p>
        <div class="bg-rose-950/30 border border-rose-500/30 p-3 rounded-lg text-xs font-mono">
          <strong>Atlas Kararı:</strong> 394,24 TL'lik pozisyon derhal nakde dönüştürülmeli ve PPF fonuna park edilmelidir.
        </div>
      </div>
    `
  },
  {
    ticker: "MANAS",
    title: "Manas Enerji: Sayaç İhaleleri vs. %100 Bedelli Sermaye Baskısı",
    date: "2026-10-13",
    verdict: "Sat (Tasfiye) / Bedelli Süreci & Sığ Tahta Riski",
    summary: "ASKİ ve İGDAŞ ihaleleri kazanılmış olsa da şirketin %100 bedelli sermaye artırımı süreci hisse üzerinde yoğun arz baskısı yaratmaktadır.",
    full_content: `
      <div class="space-y-4">
        <p><strong>Yatırım Tezi:</strong> Şirket ASKİ (523M TL) ve İGDAŞ (114M TL) sayaç ihalelerini kazanmıştır; ancak sermaye ihtiyacı sebebiyle %100 bedelli sermaye artırımına gitmiştir. Sığ tahta volatilitesi ve yatırımcıdan nakit talep eden yapı küçük portföy için risklidir.</p>
        <div class="bg-rose-950/30 border border-rose-500/30 p-3 rounded-lg text-xs font-mono">
          <strong>Atlas Kararı:</strong> 437,10 TL'lik tutar tasfiye edilerek çekirdek büyüme şirketlerine aktarılmalıdır.
        </div>
      </div>
    `
  },
  {
    ticker: "INFO",
    title: "İnfo Yatırım: BIST Hacim Daralması & Aracı Kurum Gelir Baskısı",
    date: "2026-10-13",
    verdict: "Sat (Tasfiye) / BIST Hacim Daralması",
    summary: "Yüksek faiz sebebiyle mevduata kaçan fonlar BIST işlem hacimlerini ve komisyon gelirlerini düşürdü. Halka arz temposundaki yavaşlama kârı baskılıyor.",
    full_content: `
      <div class="space-y-4">
        <p><strong>Yatırım Tezi:</strong> Aracı kurumların kârlılığı BIST günlük işlem hacmi ve halka arz gelirlerine doğrudan bağımlıdır. %50 faiz ortamında yatırımcıların para piyasası fonlarına yönelmesi aracı kurum gelirlerini zayıflatmıştır.</p>
        <div class="bg-rose-950/30 border border-rose-500/30 p-3 rounded-lg text-xs font-mono">
          <strong>Atlas Kararı:</strong> 467,04 TL'lik pozisyon tasfiye edilmeli, doğrudan %50 faiz neması sunan PPF'ye çekilmelidir.
        </div>
      </div>
    `
  },
  {
    ticker: "HDFGS",
    title: "Hedef Girişim: Girişim Sermayesi İskontosu & Çıkış Tıkanıklığı",
    date: "2026-10-13",
    verdict: "Sat (Tasfiye) / Start-up Değerleme İskontosu",
    summary: "Küresel ve yerel faiz artışları start-up değerlemelerini baskılamış, halka arz penceresinin daralması girişim sermayesi çıkışlarını (exit) zorlaştırmıştır.",
    full_content: `
      <div class="space-y-4">
        <p><strong>Yatırım Tezi:</strong> Portföyündeki Seyitler Kimya (SEYKM) kısmi satışı ve Startup Burada Fonu yatırımları devam etse de, yüksek iskonto oranı ve sığ tahta yapısı sermaye verimliliğini düşürmektedir.</p>
        <div class="bg-rose-950/30 border border-rose-500/30 p-3 rounded-lg text-xs font-mono">
          <strong>Atlas Kararı:</strong> 550,40 TL'lik tutar tasfiye edilerek yüksek temettülü AKBNK omurgasına eklenmelidir.
        </div>
      </div>
    `
  },
  {
    ticker: "THYAO",
    title: "Türk Hava Yolları: Temel Göstergeler & Deterministik DCF Değerleme",
    date: "2026-10-13",
    verdict: "Kuvvetli Al (%23.5 Güvenlik Marjı, 388.50 TL Hedef)",
    summary: "F/K 4.82x çarpanı, dövizli gelir kalkanı, Turkish Cargo büyümesi ve İstanbul Havalimanı küresel transfer merkezi gücü.",
    full_content: `
      <div class="space-y-4">
        <p><strong>Yatırım Tezi:</strong> THYAO gelirlerinin %85'ten fazlası döviz (Euro/Dolar) cinsindendir. Gelişmekte olan piyasa emsallerine göre F/K 4.82x ile derin iskontoludur. Turkish Cargo'nun e-ticaret lojistiği çift haneli büyümektedir.</p>
        <div class="bg-emerald-950/20 border border-emerald-500/30 p-3 rounded-lg text-xs font-mono">
          <strong>Atlas Kararı:</strong> BIST 30 lokomotifi olarak 388.50 TL hedef değerle kuvvetli al statüsündedir.
        </div>
      </div>
    `
  },
  {
    ticker: "ASELS",
    title: "Aselsan Elektronik: Savunma Sanayii & 11+ Mr $ Bakiye Sipariş",
    date: "2026-10-13",
    verdict: "Al / Defansif Büyüme (78.20 TL Hedef)",
    summary: "11+ Milyar Dolar bakiye sipariş portföyü, KAAN, Siper ve Hisar projeleri ile güçlü bütçe görünürlüğü.",
    full_content: `
      <div class="space-y-4">
        <p><strong>Yatırım Tezi:</strong> Aselsan, Türkiye savunma sanayiinin teknoloji omurgasıdır. 11 Milyar Doları aşan bakiye sipariş portföyü (backlog) önümüzdeki 4-5 yılın gelirini garanti altına almaktadır.</p>
        <div class="bg-blue-950/30 border border-blue-500/30 p-3 rounded-lg text-xs font-mono">
          <strong>Atlas Kararı:</strong> Uzun vadeli defansif büyüme sepeti için 78.20 TL hedef değerle alım listesindedir.
        </div>
      </div>
    `
  }
];

/**
 * Sayfa Yüklendiğinde Başlatıcı (Hata Korumalı & Birleşik)
 */
document.addEventListener("DOMContentLoaded", async () => {
  try {
    startLiveClock();
  } catch (e) {
    console.error("Canlı saat başlatma hatası:", e);
  }

  try {
    initTradingViewChart();
  } catch (e) {
    console.error("TradingView grafik başlatma hatası:", e);
  }

  try {
    initPortfolioCharts();
  } catch (e) {
    console.error("Portföy pastaları başlatma hatası:", e);
  }

  try {
    setupEventListeners();
  } catch (e) {
    console.error("Olay dinleyicileri bağlama hatası:", e);
  }

  try {
    await loadTicker("THYAO");
  } catch (e) {
    console.error("Varsayılan hisse yükleme hatası:", e);
  }

  try {
    renderReports(STATIC_REPORTS);
  } catch (e) {
    console.error("Raporlar listesi render hatası:", e);
  }

  try {
    await loadDynamicData();
  } catch (e) {
    console.error("data.json dinamik yükleme hatası:", e);
  }
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

  // Mum Çubukları Serisi (v4 ve v5 tam uyumlu)
  if (typeof tvChart.addCandlestickSeries === "function") {
    candleSeries = tvChart.addCandlestickSeries({
      upColor: "#10b981",
      downColor: "#ef4444",
      borderVisible: false,
      wickUpColor: "#10b981",
      wickDownColor: "#ef4444"
    });
  } else if (typeof tvChart.addSeries === "function" && window.LightweightCharts && window.LightweightCharts.CandlestickSeries) {
    candleSeries = tvChart.addSeries(window.LightweightCharts.CandlestickSeries, {
      upColor: "#10b981",
      downColor: "#ef4444",
      borderVisible: false,
      wickUpColor: "#10b981",
      wickDownColor: "#ef4444"
    });
  }

  // Hacim Histogramı Serisi (v4 ve v5 tam uyumlu)
  if (typeof tvChart.addHistogramSeries === "function") {
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
  } else if (typeof tvChart.addSeries === "function" && window.LightweightCharts && window.LightweightCharts.HistogramSeries) {
    volumeSeries = tvChart.addSeries(window.LightweightCharts.HistogramSeries, {
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
  }

  // Crosshair Üzerinde Legend Güncelleme (Hata Korumalı)
  tvChart.subscribeCrosshairMove((param) => {
    if (!param || !param.time || !param.seriesData) return;
    try {
      const getSeriesData = (series) => {
        if (!series || !param.seriesData) return null;
        if (typeof param.seriesData.get === "function") {
          return param.seriesData.get(series);
        }
        return param.seriesData[series] || null;
      };

      const cData = getSeriesData(candleSeries);
      const vData = getSeriesData(volumeSeries);
      if (cData) {
        const oEl = document.getElementById("legend-open");
        const hEl = document.getElementById("legend-high");
        const lEl = document.getElementById("legend-low");
        const kEl = document.getElementById("legend-close");
        if (oEl) oEl.textContent = formatCurrency(cData.open);
        if (hEl) hEl.textContent = formatCurrency(cData.high);
        if (lEl) lEl.textContent = formatCurrency(cData.low);
        if (kEl) kEl.textContent = formatCurrency(cData.close);
      }
      if (vData) {
        const volEl = document.getElementById("legend-vol");
        if (volEl) volEl.textContent = formatCompact(vData.value);
      }
    } catch (_) {}
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
 * Ticker koduna göre deterministik seed oluşturarak her hissede benzersiz dalga formu üretir.
 */
function generateFallbackCandles(basePrice, ticker = "THYAO", count = 90) {
  const candles = [];
  const volumes = [];
  let hash = 0;
  for (let j = 0; j < ticker.length; j++) {
    hash = (hash << 5) - hash + ticker.charCodeAt(j);
  }
  const freq1 = 0.15 + (Math.abs(hash % 100) / 100) * 0.15;
  const freq2 = 0.35 + (Math.abs((hash >> 3) % 100) / 100) * 0.2;
  const amp1 = 0.012 + (Math.abs((hash >> 6) % 100) / 100) * 0.015;
  const amp2 = 0.010 + (Math.abs((hash >> 9) % 100) / 100) * 0.012;
  const trend = ((hash % 10) - 4) * 0.0008;

  let price = basePrice * (0.8 + ((Math.abs(hash) % 20) / 100));
  const now = new Date();

  for (let i = count; i >= 0; i--) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    if (d.getDay() === 0 || d.getDay() === 6) continue;

    const timeStr = d.toISOString().split("T")[0];
    const wave = Math.sin(i * freq1) * amp1 + Math.cos(i * freq2) * amp2;
    const delta = wave + trend;

    const open = price;
    const close = open * (1.0 + delta);
    const high = Math.max(open, close) * (1.0 + Math.abs(Math.sin(i * 0.8)) * 0.012);
    const low = Math.min(open, close) * (1.0 - Math.abs(Math.cos(i * 0.6)) * 0.011);
    const vol = Math.floor(15000000 * (0.5 + Math.abs(Math.sin(i * freq1)) * 0.8));

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

  // Eğer window.TICKER_DATA varsa dinamik veriyi harmanla
  const dynamicItem = window.TICKER_DATA?.[ticker];
  if (dynamicItem) {
    if (!finalData) {
      finalData = {
        ticker: ticker,
        name: dynamicItem.name || ticker,
        sector: dynamicItem.sector || "BIST Şirketi",
        price: dynamicItem.price,
        change_percent: dynamicItem.change_pct,
        currency: "TRY"
      };
    } else {
      finalData = {
        ...finalData,
        price: dynamicItem.price !== undefined ? dynamicItem.price : finalData.price,
        change_percent: dynamicItem.change_pct !== undefined ? dynamicItem.change_pct : finalData.change_percent,
        market_cap: dynamicItem.market_cap || finalData.market_cap,
        pe_ratio: dynamicItem.pe_ratio || finalData.pe_ratio,
        pb_ratio: dynamicItem.pb_ratio || finalData.pb_ratio,
        day_low: dynamicItem.day_low || finalData.day_low,
        day_high: dynamicItem.day_high || finalData.day_high,
        volume: dynamicItem.volume || finalData.volume
      };
    }
  }

  // Eğer hala veri yoksa jenerik fallback oluştur
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

  // Dashboard'u Çiz (Senkron & Gecikmesiz)
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
    let candleData = [];
    let volumeData = [];

    // Gerçek yfinance verisi var mı kontrol et
    const dynamicCandles = window.DYNAMIC_DATA?.candles?.[data.ticker];
    if (dynamicCandles && dynamicCandles.length > 0) {
      candleData = dynamicCandles.map((c) => ({
        time: c.time,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close
      }));
      volumeData = dynamicCandles.map((c) => ({
        time: c.time,
        value: c.volume,
        color: c.close >= c.open ? "rgba(16, 185, 129, 0.4)" : "rgba(239, 68, 68, 0.4)"
      }));
    } else {
      const fb = generateFallbackCandles(data.price, data.ticker);
      candleData = fb.candles;
      volumeData = fb.volumes;
    }

    activeCandleData = candleData;
    activeVolumeData = volumeData;
    candleSeries.setData(candleData);
    volumeSeries.setData(volumeData);

    if (candleData.length > 0) {
      const last = candleData[candleData.length - 1];
      const lastVol = volumeData[volumeData.length - 1];
      const oEl = document.getElementById("legend-open");
      const hEl = document.getElementById("legend-high");
      const lEl = document.getElementById("legend-low");
      const kEl = document.getElementById("legend-close");
      const volEl = document.getElementById("legend-vol");
      if (oEl) oEl.textContent = formatCurrency(last.open);
      if (hEl) hEl.textContent = formatCurrency(last.high);
      if (lEl) lEl.textContent = formatCurrency(last.low);
      if (kEl) kEl.textContent = formatCurrency(last.close);
      if (volEl && lastVol) volEl.textContent = formatCompact(lastVol.value);
    }
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
          "ALTIN.S1 (1.421 TL)",
          "AKBNK (1.289 TL)",
          "HRKET (828 TL)",
          "GENIL (680 TL)",
          "PPZ / Fon (365 TL)"
        ],
        datasets: [
          {
            data: [31.00, 28.13, 18.07, 14.84, 7.96],
            backgroundColor: [
              "#f59e0b", // ALTIN - Kehribar
              "#3b82f6", // AKBNK - Mavi
              "#10b981", // HRKET - Yeşil
              "#06b6d4", // GENIL - Camgöbeği
              "#94a3b8"  // PPZ - Gri / Likit
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
        <button onclick="openReportModal('${rep.ticker}')" class="px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white rounded border border-blue-500/30 font-bold text-[11px] transition flex items-center gap-1">
          📖 Raporu Oku →
        </button>
      </div>
    `;
    listEl.appendChild(card);
  });
}

/**
 * 6.1. Detaylı Analiz & Rapor Okuma Modalı Mantığı
 */
function openReportModal(ticker) {
  const modal = document.getElementById("report-modal");
  if (!modal) return;

  const rep = STATIC_REPORTS.find((r) => r.ticker === ticker) || {
    ticker: ticker,
    title: `${ticker} Temel & Stratejik Değerleme Raporu`,
    verdict: "İnceleniyor",
    summary: `${ticker} kodlu varlık için analiz dökümü.`,
    full_content: `<p class="text-slate-300">${ticker} için detaylı analitik görünüm. Grafik ve finansal rasyolar ana panelde güncellenmiştir.</p>`
  };

  document.getElementById("modal-ticker-badge").textContent = rep.ticker;
  document.getElementById("modal-title").textContent = rep.title;
  document.getElementById("modal-verdict").textContent = `Karar: ${rep.verdict}`;

  const bodyEl = document.getElementById("modal-body");
  bodyEl.innerHTML = `
    <div class="space-y-4">
      <div class="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
        <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Yönetici Özeti</h4>
        <p class="text-slate-200 text-xs leading-relaxed">${rep.summary}</p>
      </div>
      <div class="border-t border-slate-800/80 pt-3">
        ${rep.full_content || ""}
      </div>
    </div>
  `;

  const chartBtn = document.getElementById("modal-load-chart-btn");
  if (chartBtn) {
    if (rep.ticker !== "PORTFOY") {
      chartBtn.style.display = "flex";
      chartBtn.onclick = () => {
        closeReportModal();
        loadTicker(rep.ticker);
      };
    } else {
      chartBtn.style.display = "flex";
      chartBtn.innerHTML = "<span>🥧</span> Portföy Sekmesine Git";
      chartBtn.onclick = () => {
        closeReportModal();
        const tabPort = document.getElementById("tab-btn-portfolio");
        if (tabPort) tabPort.click();
      };
    }
  }

  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function closeReportModal() {
  const modal = document.getElementById("report-modal");
  if (!modal) return;
  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

/**
 * 7. Dinleyiciler ve Sekme Yönetimi
 */
function setupEventListeners() {
  // Modal Kapatma Dinleyicileri
  const closeBtn = document.getElementById("modal-close-btn");
  if (closeBtn) {
    closeBtn.addEventListener("click", closeReportModal);
  }
  const modal = document.getElementById("report-modal");
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeReportModal();
    });
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeReportModal();
  });

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

/**
 * 8. Dinamik GitHub Actions Veri Yükleyici (data.json Fetch Shield)
 */
async function loadDynamicData() {
  try {
    const res = await fetch("data.json?t=" + new Date().getTime());
    if (!res.ok) return;
    const dynamicData = await res.json();
    if (!dynamicData || !dynamicData.portfolio) return;

    window.DYNAMIC_DATA = dynamicData;
    window.TICKER_DATA = {};

    // 1. Portföy varlıklarını TICKER_DATA ve FALLBACK_DATA'ya işle
    if (dynamicData.portfolio.items) {
      dynamicData.portfolio.items.forEach((item) => {
        const t = item.ticker;
        window.TICKER_DATA[t] = item;
        if (!FALLBACK_DATA[t]) {
          FALLBACK_DATA[t] = {
            ticker: t,
            name: item.name,
            sector: item.sector || "Portföy Varlığı",
            price: item.price,
            change_percent: item.change_pct,
            currency: "TRY"
          };
        } else {
          FALLBACK_DATA[t].price = item.price;
          FALLBACK_DATA[t].change_percent = item.change_pct;
          if (item.market_cap) FALLBACK_DATA[t].market_cap = item.market_cap;
          if (item.pe_ratio) FALLBACK_DATA[t].pe_ratio = item.pe_ratio;
          if (item.pb_ratio) FALLBACK_DATA[t].pb_ratio = item.pb_ratio;
          if (item.day_low) FALLBACK_DATA[t].day_low = item.day_low;
          if (item.day_high) FALLBACK_DATA[t].day_high = item.day_high;
          if (item.volume) FALLBACK_DATA[t].volume = item.volume;
        }
      });
    }

    // 2. İzleme listesi BIST çiplerini güncelle
    if (dynamicData.watchlist) {
      dynamicData.watchlist.forEach((item) => {
        const t = item.ticker;
        window.TICKER_DATA[t] = item;
        if (!FALLBACK_DATA[t]) {
          FALLBACK_DATA[t] = {
            ticker: t,
            name: item.symbol || t,
            sector: "BIST Şirketi",
            price: item.price,
            change_percent: item.change_pct,
            currency: "TRY"
          };
        } else {
          FALLBACK_DATA[t].price = item.price;
          FALLBACK_DATA[t].change_percent = item.change_pct;
          if (item.market_cap) FALLBACK_DATA[t].market_cap = item.market_cap;
          if (item.pe_ratio) FALLBACK_DATA[t].pe_ratio = item.pe_ratio;
          if (item.pb_ratio) FALLBACK_DATA[t].pb_ratio = item.pb_ratio;
          if (item.fifty_two_week_low) FALLBACK_DATA[t].day_low = item.day_low || item.fifty_two_week_low;
          if (item.fifty_two_week_high) FALLBACK_DATA[t].day_high = item.day_high || item.fifty_two_week_high;
          if (item.volume) FALLBACK_DATA[t].volume = item.volume;
        }
      });
    }

    // 3. Makro göstergeleri güncelle
    if (dynamicData.macro) {
      const usdEl = document.getElementById("macro-usd");
      if (usdEl && dynamicData.macro.USD_TRY) {
        usdEl.textContent = dynamicData.macro.USD_TRY.price.toFixed(2);
      }
      const xuEl = document.getElementById("macro-xu100");
      if (xuEl && dynamicData.macro.BIST_100) {
        xuEl.textContent = formatCompact(dynamicData.macro.BIST_100.price);
      }
    }

    // 4. Portföy toplam değerini ve metrikleri dinamik yeniden hesapla
    recalculatePortfolioMetrics();

    // 5. Mevcut hisse dashboard'unu dinamik veriler ve gerçek mumlarla yeniden render et
    if (FALLBACK_DATA[currentTicker] && typeof renderDashboard === "function") {
      renderDashboard(FALLBACK_DATA[currentTicker]);
    }

    // 6. Üst bara son güncelleme rozeti ekle
    const marketStatus = document.getElementById("market-status");
    if (marketStatus && dynamicData.updated_at) {
      const dt = new Date(dynamicData.updated_at);
      const timeStr = dt.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
      const existingBadge = marketStatus.querySelector(".update-time-badge");
      if (existingBadge) {
        existingBadge.textContent = `⚡ ${timeStr}`;
      } else {
        const badge = document.createElement("span");
        badge.className = "update-time-badge text-[9px] text-emerald-400 font-mono ml-1.5 border border-emerald-500/30 px-1 py-0.2 rounded hidden sm:inline";
        badge.textContent = `⚡ ${timeStr}`;
        marketStatus.appendChild(badge);
      }
    }

    // 7. Supabase Realtime ve Sandbox Masasını Başlat
    initSupabaseRealtime();
    setupSandboxModal();
  } catch (e) {
    console.warn("data.json dinamik yükleme fallback'e düştü:", e);
    initSupabaseRealtime();
    setupSandboxModal();
  }
}

/**
 * 9. Supabase Realtime & Dinamik Portföy Masası Motoru
 */

// Aktif Portföyü Al (localStorage veya Varsayılan 4+1 Kütük)
function getActivePortfolioHoldings() {
  try {
    const raw = localStorage.getItem("atakanos_custom_portfolio");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (_) {}
  return JSON.parse(JSON.stringify(DEFAULT_PORTFOLIO_HOLDINGS));
}

function saveActivePortfolioHoldings(list) {
  try {
    localStorage.setItem("atakanos_custom_portfolio", JSON.stringify(list));
  } catch (_) {}
  recalculatePortfolioMetrics();
}

function resetActivePortfolioHoldings() {
  try {
    localStorage.removeItem("atakanos_custom_portfolio");
  } catch (_) {}
  recalculatePortfolioMetrics();
}

// Portföy Metriklerini Canlı Yeniden Hesapla
function recalculatePortfolioMetrics() {
  const holdings = getActivePortfolioHoldings();
  let totalMarketVal = 0;
  let totalCostVal = 0;

  holdings.forEach((item) => {
    const livePrice = (FALLBACK_DATA[item.ticker] && FALLBACK_DATA[item.ticker].price) || item.cost;
    const mVal = livePrice * item.lot;
    const cVal = item.cost * item.lot;
    totalMarketVal += mVal;
    totalCostVal += cVal;
  });

  const netPl = totalMarketVal - totalCostVal;
  const netPlPct = totalCostVal > 0 ? (netPl / totalCostVal) * 100 : 0;

  // 1. Üst Bar ve Ana Ekran Kartlarını Güncelle
  const headerPort = document.getElementById("header-portfolio-val");
  if (headerPort) {
    headerPort.textContent = `${formatCurrency(totalMarketVal)} ₺`;
    headerPort.classList.add("text-emerald-300");
    setTimeout(() => headerPort.classList.remove("text-emerald-300"), 600);
  }
  const mainPort = document.getElementById("portfolio-total-value");
  if (mainPort) mainPort.textContent = `${formatCurrency(totalMarketVal)} TL`;

  // 2. Sandbox Özet Kartlarını Güncelle
  const sbTotal = document.getElementById("sb-total-val");
  const sbCost = document.getElementById("sb-total-cost");
  const sbPl = document.getElementById("sb-net-pl");
  const sbCount = document.getElementById("sb-asset-count");

  if (sbTotal) sbTotal.textContent = `${formatCurrency(totalMarketVal)} ₺`;
  if (sbCost) sbCost.textContent = `${formatCurrency(totalCostVal)} ₺`;
  if (sbPl) {
    const isPos = netPl >= 0;
    sbPl.textContent = `${isPos ? "+" : ""}${formatCurrency(netPl)} ₺ (${isPos ? "+" : ""}${netPlPct.toFixed(2)}%)`;
    sbPl.className = `text-base sm:text-lg font-bold font-mono ${isPos ? "text-emerald-400" : "text-rose-400"}`;
  }
  if (sbCount) sbCount.textContent = `${holdings.length} Varlık`;

  // 3. Portföy Pasta Grafiğini Güncelle
  if (currentPortfolioDoughnut && holdings.length > 0) {
    currentPortfolioDoughnut.data.labels = holdings.map((p) => {
      const pPrice = (FALLBACK_DATA[p.ticker] && FALLBACK_DATA[p.ticker].price) || p.cost;
      return `${p.ticker} (${formatCurrency(p.lot * pPrice)} TL)`;
    });
    currentPortfolioDoughnut.data.datasets[0].data = holdings.map((p) => {
      const pPrice = (FALLBACK_DATA[p.ticker] && FALLBACK_DATA[p.ticker].price) || p.cost;
      const weight = totalMarketVal > 0 ? (p.lot * pPrice) / totalMarketVal * 100 : 0;
      return parseFloat(weight.toFixed(2));
    });
    currentPortfolioDoughnut.update();
  }

  // 4. Portföy Varlık Kümesini Güncelle
  PORTFOLIO_TICKERS = new Set(holdings.map((p) => p.ticker));
}

// Supabase Realtime Gelen Fiyatı İşle
function handleRealtimeQuoteUpdate(newQuote) {
  if (!newQuote || !newQuote.ticker) return;
  const ticker = newQuote.ticker.toUpperCase().replace(".IS", "");
  const price = parseFloat(newQuote.price);
  const chg = parseFloat(newQuote.change_pct || 0);

  // FALLBACK_DATA ve TICKER_DATA güncelle
  if (FALLBACK_DATA[ticker]) {
    FALLBACK_DATA[ticker].price = price;
    FALLBACK_DATA[ticker].change_percent = chg;
    if (newQuote.day_low) FALLBACK_DATA[ticker].day_low = parseFloat(newQuote.day_low);
    if (newQuote.day_high) FALLBACK_DATA[ticker].day_high = parseFloat(newQuote.day_high);
    if (newQuote.volume) FALLBACK_DATA[ticker].volume = parseInt(newQuote.volume);
  }
  if (window.TICKER_DATA) {
    window.TICKER_DATA[ticker] = { ...(window.TICKER_DATA[ticker] || {}), price, change_pct: chg };
  }

  // Eğer açık olan hisse ise canlı ekranda flaşla
  if (currentTicker === ticker) {
    const pEl = document.getElementById("stock-price");
    if (pEl) {
      pEl.textContent = `${formatCurrency(price)} ₺`;
      pEl.classList.add(chg >= 0 ? "text-emerald-400" : "text-rose-400");
      setTimeout(() => pEl.classList.remove("text-emerald-400", "text-rose-400"), 800);
    }
    const chgEl = document.getElementById("stock-change");
    if (chgEl) {
      const isPos = chg >= 0;
      chgEl.textContent = `${isPos ? "▲ +" : "▼ "}${chg.toFixed(2)}%`;
      chgEl.className = `text-xs font-mono font-bold flex items-center ${isPos ? "text-emerald-400" : "text-rose-400"}`;
    }
    if (newQuote.day_low && newQuote.day_high) {
      const low = parseFloat(newQuote.day_low);
      const high = parseFloat(newQuote.day_high);
      const dl = document.getElementById("day-low");
      const dh = document.getElementById("day-high");
      if (dl) dl.textContent = formatCurrency(low);
      if (dh) dh.textContent = formatCurrency(high);
      const pct = Math.max(5, Math.min(95, ((price - low) / (high - low || 1)) * 100));
      const bar = document.getElementById("day-range-bar");
      if (bar) bar.style.width = `${pct}%`;
    }

    // TradingView Hafif Grafik Canlı Mum Tick Beslemesi
    if (candleSeries && activeCandleData && activeCandleData.length > 0) {
      const lastCandle = activeCandleData[activeCandleData.length - 1];
      const updatedCandle = {
        time: lastCandle.time,
        open: lastCandle.open,
        high: Math.max(lastCandle.high, price),
        low: Math.min(lastCandle.low, price),
        close: price
      };
      activeCandleData[activeCandleData.length - 1] = updatedCandle;
      try {
        candleSeries.update(updatedCandle);
      } catch (err) {
        console.warn("Mum canlı güncelleme hatası:", err);
      }

      // Lejant değerlerini anlık tick ile senkronize et
      const oEl = document.getElementById("legend-open");
      const hEl = document.getElementById("legend-high");
      const lEl = document.getElementById("legend-low");
      const kEl = document.getElementById("legend-close");
      if (oEl) oEl.textContent = formatCurrency(updatedCandle.open);
      if (hEl) hEl.textContent = formatCurrency(updatedCandle.high);
      if (lEl) lEl.textContent = formatCurrency(updatedCandle.low);
      if (kEl) kEl.textContent = formatCurrency(updatedCandle.close);
    }

    if (volumeSeries && activeVolumeData && activeVolumeData.length > 0 && newQuote.volume) {
      const lastVol = activeVolumeData[activeVolumeData.length - 1];
      const newVol = parseInt(newQuote.volume);
      if (newVol > 0) {
        const lastCandle = activeCandleData[activeCandleData.length - 1];
        const updatedVol = {
          time: lastVol.time,
          value: newVol,
          color: lastCandle && price >= lastCandle.open ? "rgba(16, 185, 129, 0.4)" : "rgba(239, 68, 68, 0.4)"
        };
        activeVolumeData[activeVolumeData.length - 1] = updatedVol;
        try {
          volumeSeries.update(updatedVol);
        } catch (_) {}
        const volEl = document.getElementById("legend-vol");
        if (volEl) volEl.textContent = formatCompact(newVol);
      }
    }
  }

  // Portföy toplamını ve dağılımını canlı yeniden hesapla
  recalculatePortfolioMetrics();
}

// Supabase Realtime WebSocket Kanalını Başlat
function initSupabaseRealtime() {
  if (!supabaseClient) {
    const dot = document.getElementById("realtime-status-dot");
    const lbl = document.getElementById("realtime-status-label");
    if (lbl) lbl.textContent = "Offline";
    return;
  }

  try {
    const channel = supabaseClient
      .channel("bist-realtime-public")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bist_quotes" },
        (payload) => {
          if (payload && payload.new) {
            handleRealtimeQuoteUpdate(payload.new);
          }
        }
      )
      .subscribe((status) => {
        const dot = document.getElementById("realtime-status-dot");
        const lbl = document.getElementById("realtime-status-label");
        if (status === "SUBSCRIBED") {
          if (dot) dot.className = "w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse";
          if (lbl) lbl.textContent = "Canlı (WS)";
        } else {
          if (dot) dot.className = "w-1.5 h-1.5 rounded-full bg-amber-400";
          if (lbl) lbl.textContent = status;
        }
      });
  } catch (err) {
    console.warn("Supabase Realtime subscription error:", err);
  }
}

// İnteraktif Portföy Masası (Sandbox) Arayüz Yöneticisi
function setupSandboxModal() {
  const modal = document.getElementById("sandbox-modal");
  const openBtn = document.getElementById("open-sandbox-btn");
  const closeBtn = document.getElementById("close-sandbox-btn");
  const saveBtn = document.getElementById("sb-save-btn");
  const resetBtn = document.getElementById("sb-reset-btn");
  const exportBtn = document.getElementById("sb-export-btn");
  const addBtn = document.getElementById("sb-add-btn");

  if (!modal) return;

  function renderTable() {
    const tbody = document.getElementById("sb-table-body");
    if (!tbody) return;
    tbody.innerHTML = "";

    const holdings = getActivePortfolioHoldings();
    let totalMarket = 0;
    holdings.forEach((h) => {
      const p = (FALLBACK_DATA[h.ticker] && FALLBACK_DATA[h.ticker].price) || h.cost;
      totalMarket += p * h.lot;
    });

    holdings.forEach((item, idx) => {
      const livePrice = (FALLBACK_DATA[item.ticker] && FALLBACK_DATA[item.ticker].price) || item.cost;
      const mVal = livePrice * item.lot;
      const weight = totalMarket > 0 ? ((mVal / totalMarket) * 100).toFixed(1) : "0.0";
      const tr = document.createElement("tr");
      tr.className = "hover:bg-slate-800/40 transition text-xs";
      tr.innerHTML = `
        <td class="p-2.5 font-bold text-blue-400">${item.ticker}</td>
        <td class="p-2.5 text-slate-300 truncate max-w-[140px]">${item.name || item.ticker}</td>
        <td class="p-2.5">
          <input type="number" min="1" value="${item.lot}" data-idx="${idx}" class="sb-lot-input w-20 bg-slate-950 border border-slate-700 px-1.5 py-0.5 rounded text-white font-mono focus:border-blue-500">
        </td>
        <td class="p-2.5">
          <input type="number" step="0.01" min="0.01" value="${item.cost}" data-idx="${idx}" class="sb-cost-input w-24 bg-slate-950 border border-slate-700 px-1.5 py-0.5 rounded text-white font-mono focus:border-blue-500">
        </td>
        <td class="p-2.5 text-emerald-400 font-bold">${formatCurrency(livePrice)} ₺</td>
        <td class="p-2.5 font-bold text-white">${formatCurrency(mVal)} ₺</td>
        <td class="p-2.5 text-amber-300 font-bold">%${weight}</td>
        <td class="p-2.5 text-center">
          <button data-idx="${idx}" class="sb-del-btn text-rose-400 hover:text-rose-300 p-1 font-bold">✕</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // İnput dinleyicileri
    tbody.querySelectorAll(".sb-lot-input").forEach((inp) => {
      inp.addEventListener("input", (e) => {
        const i = parseInt(e.target.getAttribute("data-idx"));
        const val = parseFloat(e.target.value) || 1;
        const current = getActivePortfolioHoldings();
        if (current[i]) {
          current[i].lot = val;
          saveActivePortfolioHoldings(current);
          renderTable();
        }
      });
    });

    tbody.querySelectorAll(".sb-cost-input").forEach((inp) => {
      inp.addEventListener("input", (e) => {
        const i = parseInt(e.target.getAttribute("data-idx"));
        const val = parseFloat(e.target.value) || 0.01;
        const current = getActivePortfolioHoldings();
        if (current[i]) {
          current[i].cost = val;
          saveActivePortfolioHoldings(current);
          renderTable();
        }
      });
    });

    tbody.querySelectorAll(".sb-del-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const i = parseInt(e.target.getAttribute("data-idx"));
        const current = getActivePortfolioHoldings();
        if (current[i]) {
          current.splice(i, 1);
          saveActivePortfolioHoldings(current);
          renderTable();
        }
      });
    });

    recalculatePortfolioMetrics();
  }

  if (openBtn) {
    openBtn.addEventListener("click", () => {
      renderTable();
      modal.classList.remove("hidden");
      modal.classList.add("flex");
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    });
  }

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    }
  });

  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
      recalculatePortfolioMetrics();
      if (typeof loadTicker === "function") loadTicker(currentTicker);
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      resetActivePortfolioHoldings();
      renderTable();
    });
  }

  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      const holdings = getActivePortfolioHoldings();
      let md = "| Varlık Kodu | Varlık Adı | Lot | Maliyet (₺) | Canlı Fiyat (₺) | Değer (₺) |\n";
      md += "| :--- | :--- | :--- | :--- | :--- | :--- |\n";
      holdings.forEach((h) => {
        const p = (FALLBACK_DATA[h.ticker] && FALLBACK_DATA[h.ticker].price) || h.cost;
        md += `| ${h.ticker} | ${h.name || h.ticker} | ${h.lot} | ${formatCurrency(h.cost)} | ${formatCurrency(p)} | ${formatCurrency(p * h.lot)} |\n`;
      });
      navigator.clipboard.writeText(md).then(() => {
        exportBtn.innerHTML = "<span>✅</span> Panoya Kopyalandı!";
        setTimeout(() => (exportBtn.innerHTML = "<span>📋</span> AtakanOS'a Kopyala"), 2000);
      });
    });
  }

  if (addBtn) {
    addBtn.addEventListener("click", () => {
      const tickerInput = document.getElementById("sb-add-ticker");
      const lotInput = document.getElementById("sb-add-lot");
      const costInput = document.getElementById("sb-add-cost");

      const tick = tickerInput?.value.trim().toUpperCase().replace(".IS", "");
      const lot = parseFloat(lotInput?.value) || 1;
      const cost = parseFloat(costInput?.value) || (FALLBACK_DATA[tick]?.price || 100.0);

      if (tick) {
        const holdings = getActivePortfolioHoldings();
        const existing = holdings.find((h) => h.ticker === tick);
        if (existing) {
          existing.lot += lot;
        } else {
          holdings.push({
            ticker: tick,
            name: FALLBACK_DATA[tick]?.name || tick,
            lot: lot,
            cost: cost,
            sector: FALLBACK_DATA[tick]?.sector || "BIST Şirketi"
          });
        }
        saveActivePortfolioHoldings(holdings);
        if (tickerInput) tickerInput.value = "";
        if (lotInput) lotInput.value = "";
        if (costInput) costInput.value = "";
        renderTable();
      }
    });
  }
}
