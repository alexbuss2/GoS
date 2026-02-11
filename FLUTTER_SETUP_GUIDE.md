# 🚀 BİRİKİO Flutter Uygulaması - Kurulum Rehberi

## ✅ Tamamlanan İşlemler

### 1. ✅ Flutter Projesi Oluşturuldu
- Paket adı: `com.celal.birikio`
- Klasör: `mobile/`
- Flutter SDK: 3.5.4+
- Material Design 3

### 2. ✅ Tam Klasör Yapısı Kuruldu
```
mobile/
├── lib/
│   ├── core/
│   │   ├── theme.dart           ✅ Modern dark mode tasarım
│   │   └── constants.dart        ✅ API ve uygulama sabitleri
│   ├── models/
│   │   ├── asset_model.dart      ✅ Varlık veri modeli
│   │   └── user_model.dart       ✅ Kullanıcı veri modeli
│   ├── providers/
│   │   ├── auth_provider.dart    ✅ Kimlik doğrulama state
│   │   └── asset_provider.dart   ✅ Varlık yönetimi state
│   ├── services/
│   │   ├── api_service.dart      ✅ Backend API entegrasyonu
│   │   ├── storage_service.dart  ✅ Local storage
│   │   └── ad_service.dart       ✅ AdMob reklam servisi
│   ├── screens/
│   │   ├── login_screen.dart     ✅ Giriş/Kayıt ekranı
│   │   ├── home_screen.dart      ✅ Ana ekran + İzleme listesi
│   │   ├── search_screen.dart    ✅ Varlık keşfet ekranı
│   │   └── profile_screen.dart   ✅ Profil ve ayarlar
│   ├── widgets/
│   │   ├── asset_card.dart       ✅ Varlık kartı widget
│   │   └── ad_banner_widget.dart ✅ Reklam banner widget
│   └── main.dart                 ✅ Ana uygulama dosyası
├── android/                      ✅ Android konfigürasyonu
├── ios/                          ✅ iOS konfigürasyonu
├── assets/
│   ├── images/                   ✅ Görseller klasörü
│   └── icons/                    ✅ İkonlar klasörü
└── pubspec.yaml                  ✅ Bağımlılıklar yüklendi
```

### 3. ✅ Tüm Bağımlılıklar Yüklendi
- ✅ provider (State management)
- ✅ dio (HTTP client)
- ✅ http (API calls)
- ✅ shared_preferences (Local storage)
- ✅ flutter_secure_storage (Güvenli storage)
- ✅ google_mobile_ads (Reklam)
- ✅ in_app_purchase (Abonelik)
- ✅ fl_chart (Grafikler)
- ✅ intl (Formatlar)
- ✅ shimmer (Loading animasyonları)
- ✅ flutter_svg (SVG desteği)

### 4. ✅ Android Konfigürasyonu
- ✅ Package name: `com.celal.birikio`
- ✅ minSdk: 21 (Android 5.0)
- ✅ targetSdk: 34 (Android 14)
- ✅ Internet ve network izinleri eklendi
- ✅ MultiDex etkinleştirildi
- ✅ App name: "BİRİKİO"

### 5. ✅ Uygulama Özellikleri Uygulandı

#### Ekranlar:
- ✅ **Splash Screen**: Logo ve animasyon
- ✅ **Login/Register**: Kullanıcı girişi ve kayıt
- ✅ **Home (İzleme Listesi)**: Favori varlıklar
- ✅ **Search/Keşfet**: Altın, Döviz, Kripto kategorileri
- ✅ **Profile**: Ayarlar ve PRO üyelik

#### Özellikler:
- ✅ Dark Mode (Koyu tema)
- ✅ Ücretsiz kullanıcılar: 5 varlık limiti
- ✅ PRO kullanıcılar: Sınırsız
- ✅ AdMob banner reklamları (free users)
- ✅ İzleme listesi yönetimi
- ✅ Arama ve filtreleme
- ✅ Pull-to-refresh
- ✅ Modern Material Design 3

---

## 🔧 Yapılması Gerekenler

### 1. Backend API URL'ini Ayarlayın

**Dosya**: `mobile/lib/core/constants.dart`

```dart
static const String baseUrl = 'BACKEND_URL_BURAYA'; // Değiştirin!
```

Mevcut backend'iniz (`app/backend/main.py`) şu adreste çalışıyor olabilir:
- Local: `http://localhost:8000`
- Production: Backend'inizi deploy edin (Railway, Heroku, DigitalOcean, vb.)

### 2. AdMob ID'lerini Ayarlayın

**Dosya**: `mobile/lib/core/constants.dart`

AdMob Console'dan gerçek ID'lerinizi alın ve değiştirin:

```dart
// Test ID'leri - Gerçek ID'lerle değiştirin!
static const String androidBannerId = 'ca-app-pub-XXXXX/XXXXX';
static const String androidInterstitialId = 'ca-app-pub-XXXXX/XXXXX';
```

### 3. App Icon'u Değiştirin

Logo dosyanızı kullanarak uygulama ikonunu oluşturun:

**Manuel Yöntem:**
- `android/app/src/main/res/mipmap-*` klasörlerine icon ekleyin

**Otomatik Yöntem (önerilen):**
```bash
# flutter_launcher_icons paketi ekleyin
flutter pub add dev:flutter_launcher_icons

# pubspec.yaml'a ekleyin:
flutter_icons:
  android: true
  ios: true
  image_path: "assets/images/logo.png"

# Icon oluştur
flutter pub run flutter_launcher_icons
```

### 4. Signing Key Oluşturun (Release için)

```bash
# Windows için:
keytool -genkey -v -keystore C:\Users\CELAL\birikio-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias birikio

# Bilgileri kaydedin:
# - Key store password
# - Key alias: birikio
# - Key password
```

**Sonra**: `android/app/build.gradle` dosyasını güncelleyin:

```gradle
android {
    ...
    signingConfigs {
        release {
            storeFile file('C:\\Users\\CELAL\\birikio-release-key.jks')
            storePassword 'YOUR_STORE_PASSWORD'
            keyAlias 'birikio'
            keyPassword 'YOUR_KEY_PASSWORD'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            ...
        }
    }
}
```

---

## 🧪 Test Etme

### 1. Uygulamayı Çalıştırın

```bash
cd mobile
flutter run
```

### 2. Demo Mode'da Test Edin

Login ekranında "Demo Modda Devam Et" butonuna tıklayarak backend olmadan test edebilirsiniz.

### 3. Backend ile Test Edin

Backend'i çalıştırın:
```bash
cd app/backend
python main.py
```

Sonra constants.dart'da URL'i `http://YOUR_LOCAL_IP:8000` olarak ayarlayın.

---

## 📦 Play Store'a Yükleme

### 1. Release APK/AAB Oluşturun

```bash
# AAB (önerilen - Play Store için)
flutter build appbundle --release

# APK (test için)
flutter build apk --release
```

Dosyalar:
- AAB: `mobile/build/app/outputs/bundle/release/app-release.aab`
- APK: `mobile/build/app/outputs/flutter-apk/app-release.apk`

### 2. Play Console'da Yeni Uygulama Oluşturun

1. https://play.google.com/console adresine gidin
2. "Create app" tıklayın
3. Bilgileri doldurun:
   - **App name**: BİRİKİO
   - **Default language**: Turkish
   - **App or game**: App
   - **Free or paid**: Free

### 3. Store Listing Bilgilerini Doldurun

**Gerekli Bilgiler:**
- **App name**: BİRİKİO
- **Short description** (80 karakter max):
  ```
  Altın, Döviz ve Kripto paralarını anlık takip edin. PRO özelliklerle sınırsız!
  ```
- **Full description** (4000 karakter max):
  ```
  BİRİKİO ile Altın, Döviz ve Binance kripto paralarını anlık olarak takip edin!
  
  ✨ ÖZELLİKLER:
  • 🪙 Altın fiyatları (Gram, Çeyrek, ONS)
  • 💵 Döviz kurları (USD, EUR, GBP ve daha fazlası)
  • ₿ Kripto paralar (Bitcoin, Ethereum, vb.)
  • 📊 Anlık grafikler
  • ⭐ İzleme listesi
  • 🌙 Dark mode
  
  💰 ÜCRETSİZ SÜRÜM:
  • 5 varlığa kadar takip
  • Temel özellikler
  
  ⭐ PRO SÜRÜM (50₺/ay):
  • ✅ Sınırsız varlık takibi
  • ✅ Reklamsız deneyim
  • ✅ Gelişmiş grafikler
  • ✅ Fiyat alarm bildirimleri
  
  Hemen indirin ve yatırımlarınızı takip edin!
  ```

**Ekran Görüntüleri:**
- En az 2, en fazla 8 adet
- Boyut: 1080 x 1920 piksel (telefon)
- Format: PNG veya JPEG

**Feature Graphic:**
- Boyut: 1024 x 500 piksel
- Format: PNG veya JPEG

**App Icon:**
- Boyut: 512 x 512 piksel
- Format: PNG (32-bit)

### 4. Content Rating

"Start questionnaire" → Sorular finance category için cevaplayın

### 5. Pricing & Distribution

- **Countries**: Turkey (veya tüm ülkeler)
- **Content rating**: Rate your app
- **Target audience**: 18+
- **Ads**: Yes (ücretsiz sürüm için)

### 6. App Content

- Privacy policy URL ekleyin
- Data safety form doldurun
- Permissions açıklayın

### 7. Release

1. "Production" → "Create new release"
2. AAB dosyasını yükleyin
3. Release notes yazın (Türkçe):
   ```
   🎉 İlk Sürüm - v1.0.0
   
   • Altın, Döviz ve Kripto para takibi
   • İzleme listesi özelliği
   • PRO abonelik sistemi
   • Modern dark mode tasarım
   ```
4. "Review release" tıklayın
5. "Start rollout to Production" tıklayın

**İnceleme Süresi**: Genellikle 1-7 gün

---

## 🎯 Önemli Kontrol Listesi

### Yayınlamadan Önce:
- [ ] Backend URL'i production URL ile değiştirildi
- [ ] AdMob ID'leri gerçek ID'lerle değiştirildi
- [ ] App icon değiştirildi
- [ ] Release signing yapılandırıldı
- [ ] Privacy policy hazırlandı
- [ ] Ekran görüntüleri alındı
- [ ] Release notes hazırlandı
- [ ] Test edildi (gerçek cihazda)

### Yasal Gereksinimler:
- [ ] Privacy Policy URL'i
- [ ] Terms of Service
- [ ] KVKK uyumluluğu (Türkiye için)
- [ ] User data handling açıklaması
- [ ] In-app purchase şeffaflığı

---

## 🆘 Sorun Giderme

### "Backend'e bağlanamıyorum"
- Backend URL'ini kontrol edin
- Backend çalışıyor mu?
- AndroidManifest.xml'de internet izni var mı?
- CORS ayarları doğru mu?

### "Reklamlar görünmüyor"
- AdMob hesabınız onaylandı mı?
- Test ID'lerini gerçek ID'lerle değiştirdiniz mi?
- AdMob uygulaması oluşturuldu mu?

### "Build hatası alıyorum"
```bash
flutter clean
flutter pub get
flutter build apk --release
```

---

## 📞 Destek

Sorularınız için:
- Email: your-email@example.com
- GitHub Issues: [proje-linki]

---

**🎉 Tebrikler! Flutter uygulamanız Play Store'a yüklenmeye hazır!**
