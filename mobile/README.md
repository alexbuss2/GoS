# BİRİKİO - Flutter Mobil Uygulama

**Google Play Store için profesyonel finans takip uygulaması**

## 📱 Uygulama Hakkında

BİRİKİO, Altın, Döviz ve Binance kripto paralarını anlık olarak takip etmenizi sağlayan modern bir mobil uygulamadır.

### ✨ Özellikler

- 🪙 **Altın Takibi**: Gram altın, çeyrek altın, ONS fiyatları
- 💵 **Döviz Takibi**: USD, EUR, GBP ve diğer döviz kurları
- ₿ **Kripto Para Takibi**: Binance üzerinden Bitcoin, Ethereum ve diğer kripto paralar
- 📊 **Grafikler**: Anlık ve geçmiş fiyat grafikleri
- ⭐ **İzleme Listesi**: Favori varlıklarınızı takip edin
- 🌙 **Dark Mode**: Göz yormayan koyu tema

### 💰 Üyelik Modeli

#### 🆓 Ücretsiz Sürüm
- Maksimum 5 varlık takibi
- AdMob reklamları
- Temel özellikler

#### ⭐ PRO Sürüm (50₺/ay)
- ✅ Sınırsız varlık takibi
- ✅ Reklamsız deneyim
- ✅ Gelişmiş grafikler
- ✅ Fiyat alarm bildirimleri

## 🏗️ Teknik Detaylar

### Paket Bilgileri
- **Paket Adı**: com.celal.birikio
- **Versiyon**: 1.0.0
- **Minimum SDK**: 21 (Android 5.0)
- **Target SDK**: 34 (Android 14)

### Kullanılan Teknolojiler

```yaml
- Flutter SDK: ^3.5.4
- State Management: Provider
- HTTP Client: Dio
- Local Storage: SharedPreferences, FlutterSecureStorage
- Monetization: Google Mobile Ads, In-App Purchase
- Charts: FL Chart
- UI Components: Material Design 3
```

### Proje Yapısı

```
mobile/
├── lib/
│   ├── core/              # Tema ve sabitler
│   │   ├── theme.dart
│   │   └── constants.dart
│   ├── models/            # Veri modelleri
│   │   ├── asset_model.dart
│   │   └── user_model.dart
│   ├── providers/         # State management
│   │   ├── auth_provider.dart
│   │   └── asset_provider.dart
│   ├── services/          # API ve servisler
│   │   ├── api_service.dart
│   │   ├── storage_service.dart
│   │   └── ad_service.dart
│   ├── screens/           # Uygulama ekranları
│   │   ├── splash_screen.dart
│   │   ├── login_screen.dart
│   │   ├── home_screen.dart
│   │   ├── search_screen.dart
│   │   └── profile_screen.dart
│   ├── widgets/           # Reusable widget'lar
│   │   ├── asset_card.dart
│   │   └── ad_banner_widget.dart
│   └── main.dart
├── android/               # Android native konfigürasyonu
├── ios/                   # iOS native konfigürasyonu
└── assets/               # Görseller ve ikonlar
```

## 🚀 Kurulum ve Çalıştırma

### Gereksinimler
- Flutter SDK (3.5.4 veya üzeri)
- Android Studio / VS Code
- Android SDK (API 21+)
- Dart SDK

### Adımlar

1. **Bağımlılıkları Yükle**
```bash
cd mobile
flutter pub get
```

2. **Backend URL'ini Ayarla**
`lib/core/constants.dart` dosyasında backend URL'ini güncelleyin:
```dart
static const String baseUrl = 'https://your-backend-url.com';
```

3. **AdMob ID'lerini Ayarla**
`lib/core/constants.dart` dosyasında AdMob ID'lerini gerçek ID'lerinizle değiştirin.

4. **Uygulamayı Çalıştır**
```bash
flutter run
```

## 📦 Play Store Hazırlığı

### 1. App Icon Değiştirme
`android/app/src/main/res/mipmap-*/` klasörlerindeki launcher ikonlarını değiştirin.

### 2. Release Build için Signing
`android/app/build.gradle` dosyasında release signing konfigürasyonunu ekleyin:

```gradle
signingConfigs {
    release {
        storeFile file('path/to/keystore.jks')
        storePassword 'your-store-password'
        keyAlias 'your-key-alias'
        keyPassword 'your-key-password'
    }
}
```

### 3. Release APK Oluşturma
```bash
flutter build apk --release
```

### 4. Release AAB Oluşturma (Play Store için önerilen)
```bash
flutter build appbundle --release
```

### 5. Play Console'da Yayınlama
1. Play Console'a giriş yapın
2. Yeni uygulama oluşturun
3. AAB dosyasını yükleyin
4. Store listing bilgilerini doldurun
5. Fiyatlandırma ve dağıtım ayarlarını yapın
6. İncelemeye gönderin

## 🔑 Önemli Notlar

### API Backend
Bu uygulama mevcut backend'inizi (`app/backend/`) kullanır. Backend şu özellikleri sağlamalı:
- User authentication
- Asset listing (gold, currency, crypto)
- Watchlist management
- Subscription handling
- Payment processing

### Güvenlik
- API anahtarları ve hassas veriler `.env` dosyasında saklanmalı
- Production'da SSL/TLS kullanın
- API token'ları güvenli şekilde saklayın (`flutter_secure_storage`)

### Test
```bash
# Unit testleri çalıştır
flutter test

# Widget testleri
flutter test test/widget_test.dart
```

## 📱 Ekran Görüntüleri

Ekran görüntüleri için Play Store gereksinimleri:
- Telefon: 1080 x 1920 piksel (en az 2, en fazla 8 adet)
- 7 inç tablet: 1200 x 1920 piksel
- 10 inç tablet: 1920 x 1200 piksel

## 🎨 Tasarım

Uygulamada kullanılan renkler:
- **Primary Green**: #0D7C66 (Güven ve finans teması)
- **Primary Gold**: #D4AF37 (Premium ve değer hissi)
- **Dark Background**: #0A1828 (Modern dark mode)
- **Card Background**: #1C2834 (Kontrast)

## 📄 Lisans

Bu proje özel bir projedir ve telif hakkı koruması altındadır.

## 👨‍💻 Geliştirici

**Celal**
- Email: your-email@example.com
- Paket: com.celal.birikio

## 🔄 Güncellemeler

### v1.0.0 (İlk Sürüm)
- ✅ Altın, Döviz, Kripto takibi
- ✅ İzleme listesi
- ✅ PRO abonelik sistemi
- ✅ AdMob entegrasyonu
- ✅ Dark mode tasarım

---

**Google Play Store'da Yayınlanmak İçin Hazır! 🚀**
