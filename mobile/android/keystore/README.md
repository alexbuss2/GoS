# Android Release Keystore

Bu klasörde release keystore dosyanızı saklayın.

Örnek oluşturma komutu:

```bash
keytool -genkey -v -keystore birikio-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias birikio
```

Oluşturduğunuz dosyayı bu klasöre taşıyın ve `android/key.properties` dosyasını
`android/key.properties.example` şablonuna göre doldurun.
