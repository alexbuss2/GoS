# 📋 Google Play Store Yayınlama Kontrol Listesi

## ✅ TAMAMLANMIŞ

### Kod & Yapı
- [x] Flutter projesi oluşturuldu (com.celal.birikio)
- [x] Tüm ekranlar kodlandı (Splash, Login, Home, Search, Profile)
- [x] State management (Provider)
- [x] API servisleri
- [x] Demo mod (backend olmadan test)
- [x] AdMob entegrasyonu
- [x] In-app purchase hazırlığı
- [x] Dark mode tasarım
- [x] Error handling iyileştirildi
- [x] ProGuard rules eklendi
- [x] Release optimization (minify, shrink)
- [x] AndroidManifest permissions
- [x] Singleton pattern (API Service)

---

## 🔧 YAPMANIIZ GEREKENLER

### 1. Backend URL'ini Ayarlayın ⚠️

**Dosya**: `mobile/lib/core/constants.dart` (Satır 3)

```dart
static const String baseUrl = 'https://YOUR-BACKEND-URL.com';
```

**Seçenekler:**
- Railway: https://railway.app
- Render: https://render.com  
- DigitalOcean App Platform
- AWS Elastic Beanstalk
- Google Cloud Run

Backend'inizdeki `app/backend/main.py` dosyasını deploy edin.

---

### 2. AdMob Hesabı & ID'leri Alın ⚠️

1. https://admob.google.com adresine gidin
2. "Apps" → "Add app" → "Android"
3. App name: **BİRİKİO**
4. Package name: **com.celal.birikio**
5. Ad unit'leri oluşturun:
   - Banner ad
   - Interstitial ad
6. ID'leri kopyalayın

**Dosya**: `mobile/lib/core/constants.dart` (Satır 14-17)

```dart
static const String androidBannerId = 'ca-app-pub-YOUR-ID/BANNER-ID';
static const String androidInterstitialId = 'ca-app-pub-YOUR-ID/INTERSTITIAL-ID';
```

---

### 3. App Icon Oluşturun ⚠️

Logo dosyanız var, icon'a dönüştürün:

**Otomatik Yöntem (Önerilen):**

```bash
cd mobile

# Package ekle
flutter pub add dev:flutter_launcher_icons

# pubspec.yaml'a ekle:
```

Sonra `pubspec.yaml` dosyasının sonuna ekleyin:

```yaml
flutter_launcher_icons:
  android: true
  ios: false
  image_path: "assets/images/logo.png"
  adaptive_icon_background: "#0D7C66"
  adaptive_icon_foreground: "assets/images/logo.png"
```

Logo'nuzu `mobile/assets/images/logo.png` olarak kaydedin, sonra:

```bash
flutter pub run flutter_launcher_icons
```

**Manuel Yöntem:**
- Logo'nuzu şu boyutlarda resize edin:
  - mdpi: 48x48
  - hdpi: 72x72
  - xhdpi: 96x96
  - xxhdpi: 144x144
  - xxxhdpi: 192x192
- `android/app/src/main/res/mipmap-*/ic_launcher.png` dosyalarını değiştirin

---

### 4. Release Signing Key Oluşturun ⚠️

**Windows PowerShell:**

```powershell
cd C:\Users\CELAL

keytool -genkey -v -keystore birikio-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias birikio
```

**Sorular:**
- Store password: [Güçlü şifre - kaydedin!]
- Key password: [Store password ile aynı olabilir]
- First and last name: Celal
- Organizational unit: BİRİKİO
- Organization: BİRİKİO
- City/Locality: [Şehriniz]
- State/Province: [İliniz]
- Country code: TR

**Key bilgilerini kaydedin:**
```
Store Path: C:\Users\CELAL\birikio-release-key.jks
Store Password: [ŞİFRENİZ]
Key Alias: birikio
Key Password: [ŞİFRENİZ]
```

**Sonra `mobile/android/key.properties` oluşturun:**

```properties
storePassword=YOUR_STORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=birikio
storeFile=C:\\Users\\CELAL\\birikio-release-key.jks
```

**`mobile/android/app/build.gradle`'a ekleyin (satır 1'den sonra):**

```gradle
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('key.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}
```

**Ve signingConfigs'i değiştirin:**

```gradle
signingConfigs {
    release {
        keyAlias keystoreProperties['keyAlias']
        keyPassword keystoreProperties['keyPassword']
        storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
        storePassword keystoreProperties['storePassword']
    }
}
buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled true
        shrinkResources true
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
}
```

**⚠️ ÖNEMLİ:** `key.properties` dosyasını `.gitignore`'a ekleyin!

---

### 5. Privacy Policy Hazırlayın ⚠️

Şu bilgileri içeren bir sayfa oluşturun:

- Toplanan veriler (email, kullanım verileri)
- Veri kullanım amacı
- Üçüncü taraf servisler (AdMob, Binance API, vb.)
- Kullanıcı hakları
- İletişim bilgileri

**Yayınlama seçenekleri:**
- GitHub Pages (ücretsiz)
- Google Sites (ücretsiz)
- Notion (public page)

**URL'i kaydedin**, Play Console'da gerekecek.

---

### 6. Release APK/AAB Oluşturun 🎯

**AAB (Play Store için önerilen):**

```bash
cd mobile
flutter clean
flutter pub get
flutter build appbundle --release
```

Dosya konumu: `mobile/build/app/outputs/bundle/release/app-release.aab`

**APK (Test için):**

```bash
flutter build apk --release
```

Dosya konumu: `mobile/build/app/outputs/flutter-apk/app-release.apk`

---

### 7. Play Console'da Uygulama Oluşturun 📱

1. https://play.google.com/console → "Create app"

**App details:**
- App name: **BİRİKİO**
- Default language: **Turkish**
- App or game: **App**
- Free or paid: **Free** (with in-app purchases)

---

### 8. Store Listing Doldurun 📝

**Main store listing:**

**App name**: BİRİKİO

**Short description** (80 karakter):
```
Altın, Döviz ve Kripto paralarını anlık takip edin. PRO ile sınırsız!
```

**Full description** (4000 karakter):
```
🪙 BİRİKİO - Altın, Döviz ve Kripto Para Takip Uygulaması

Altın, döviz kurları ve Binance kripto paralarını anlık olarak takip edin! BİRİKİO ile yatırımlarınızı her zaman kontrol altında tutun.

✨ ÖZELLİKLER:

🪙 ALTIN FİYATLARI
• Gram Altın
• Çeyrek Altın
• ONS Altın
• Anlık fiyat güncellemeleri

💵 DÖVİZ KURLARI
• Dolar (USD/TRY)
• Euro (EUR/TRY)
• Sterlin (GBP/TRY)
• Ve daha fazlası...

₿ KRİPTO PARALAR
• Bitcoin (BTC)
• Ethereum (ETH)
• Binance Coin (BNB)
• XRP, Cardano, Solana ve daha fazlası
• Binance canlı fiyatları

📊 ÖZEL ÖZELLİKLER
• İzleme listesi oluşturun
• Anlık fiyat grafikleri
• Yüzde değişim göstergeleri
• Pull-to-refresh ile güncel veri
• Modern dark mode arayüz

💰 ÜYELİK SEÇENEKLERİ:

🆓 ÜCRETSİZ SÜRÜM:
• 5 varlığa kadar takip
• Temel özellikler
• Reklamlarla desteklenir

⭐ PRO SÜRÜM (50₺/ay):
✅ Sınırsız varlık takibi
✅ Reklamsız deneyim
✅ Gelişmiş grafikler
✅ Fiyat alarm bildirimleri (yakında)
✅ Öncelikli destek

🎯 KİMLER İÇİN?
• Altın yatırımcıları
• Forex traders
• Kripto yatırımcıları
• Finans takipçileri
• Biriktirmek isteyenler

📱 NEDEN BİRİKİO?
• Hızlı ve güvenilir
• Güncel fiyat bilgileri
• Kullanıcı dostu arayüz
• Türkçe dil desteği
• Düşük batarya kullanımı

Hemen indirin ve yatırımlarınızı takip etmeye başlayın!

📧 Destek: support@birikio.com
🌐 Web: www.birikio.com
```

**App category:** Finance

**Tags**: altın, döviz, kripto, bitcoin, finans, yatırım, borsa

---

### 9. Grafikler ve Görseller 📸

**Gerekli görseller:**

1. **App Icon** (512x512 PNG, 32-bit, alfa kanalı yok)
2. **Feature Graphic** (1024x500 PNG/JPG)
3. **Phone Screenshots** (En az 2, maks 8)
   - Boyut: 1080x1920 veya 1080x2340 piksel
   - Format: PNG veya JPEG
   - Ekranlar: Login, Home (watchlist), Search, Profile

**Screenshot önerileri:**
- Splash screen
- Login screen  
- İzleme listesi (varlıklarla dolu)
- Keşfet ekranı (kategori sekmeleri)
- PRO üyelik ekranı
- Profile ekranı

---

### 10. Content Rating & App Content 📋

**Content Rating:**
1. "Start questionnaire"
2. Kategori: Finance
3. Tüm soruları cevaplayın (genellikle "Hayır")
4. Rating alın

**Data Safety:**
- Email adresi topluyorsunuz → Yes
- User actions → Yes (watchlist)
- Üçüncü taraflarla paylaşılıyor mu → Yes (AdMob)
- Data encrypted → Yes
- User can delete → Yes

**Privacy Policy:**
- URL ekleyin (yukarıda hazırladığınız)

**Ads:**
- Contains ads: Yes (free version)
- Ad types: Banner, Interstitial

---

### 11. Pricing & Distribution 🌍

- **Countries**: Turkey (başlangıç), daha sonra global
- **Content rating**: Doldur
- **Target audience**: 18+ (finance)
- **In-app purchases**: Yes (PRO subscription 50₺/month)

---

### 12. Release Oluşturun 🚀

1. "Production" → "Create new release"
2. AAB dosyasını yükleyin
3. Release name: `1.0.0 - İlk Sürüm`
4. Release notes (Turkish):

```
🎉 İlk Sürüm - v1.0.0

• 🪙 Altın fiyatları (Gram, Çeyrek, ONS)
• 💵 Döviz kurları (USD, EUR, GBP)
• ₿ Binance kripto paraları
• ⭐ İzleme listesi özelliği
• 📊 Anlık fiyat güncellemeleri
• 🌙 Modern dark mode tasarım
• 💎 PRO abonelik sistemi (50₺/ay)

Hemen indirin ve finansal varlıklarınızı takip edin!
```

5. "Review release" → "Start rollout to Production"

**İnceleme süresi:** 1-7 gün

---

## 🧪 YAYINLAMADAN ÖNCE TEST

### Test Checklist:
- [ ] Gerçek Android cihazda test edildi
- [ ] Login/Register çalışıyor
- [ ] Demo mode çalışıyor
- [ ] İzleme listesi ekleme/çıkarma
- [ ] 5 varlık limiti çalışıyor (free users)
- [ ] PRO upgrade dialog açılıyor
- [ ] Reklamlar görünüyor (test mode)
- [ ] Pull-to-refresh çalışıyor
- [ ] Tüm kategoriler (Altın, Döviz, Kripto) gösteriliyor
- [ ] Arama fonksiyonu çalışıyor
- [ ] Logout çalışıyor
- [ ] App rotation disabled (portrait only)
- [ ] Back button navigation doğru
- [ ] No crashes or errors

### Komutlar:
```bash
cd mobile

# Debug modda test
flutter run

# Release modda test (signing gerekli)
flutter run --release

# Gerçek cihaza yükle
flutter install
```

---

## 📊 PERFORMANS OPTİMİZASYONU

### APK/AAB Boyutu
```bash
# Boyutu kontrol et
flutter build apk --release --analyze-size

# Splitleri kullan (daha küçük)
flutter build apk --release --split-per-abi
```

**Hedef:** < 25 MB

---

## 🎯 POST-LAUNCH (Yayınlandıktan Sonra)

### İlk 24 Saat:
- [ ] Play Console'da "approved" durumu kontrol edin
- [ ] Uygulamayı Play Store'da arayın
- [ ] Link'i test edin
- [ ] İlk kurulumu yapın
- [ ] Crash reports kontrol edin

### İlk Hafta:
- [ ] Kullanıcı yorumlarını okuyun ve cevap verin
- [ ] Analytics kontrol edin
- [ ] Crash rate < %2 olmalı
- [ ] İlk bug fix'leri hazırlayın

### İlk Ay:
- [ ] v1.0.1 güncellemesi (bug fixes)
- [ ] Yeni özellikler planı
- [ ] Marketing başlatın

---

## 📞 YARDIM KAYNAKLARI

### Official Docs:
- Flutter: https://docs.flutter.dev
- Play Console: https://support.google.com/googleplay/android-developer
- AdMob: https://developers.google.com/admob

### Topluluk:
- r/FlutterDev
- Flutter Discord
- Stack Overflow [flutter]

---

## 🎉 BAŞARI HEDEF LERI

### Launch Hedefleri:
- [ ] İlk 10 indirme (1 gün)
- [ ] İlk 100 indirme (1 hafta)
- [ ] İlk yorum/puan
- [ ] İlk PRO üye

### 3 Ay Hedefleri:
- [ ] 500+ aktif kullanıcı
- [ ] 30+ PRO üye
- [ ] 4.0+ yıldız ortalama
- [ ] <2% crash rate

---

**Tahmin edilen Play Store yayınlama süresi: 3-5 iş günü**

**Hazır olduğunuzda yukarıdaki adımları sırayla takip edin!** 🚀
