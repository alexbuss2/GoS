import 'package:flutter/foundation.dart';

class AppConstants {
  // API Configuration
  // Use --dart-define=BIRIKIO_API_BASE_URL=... for production builds
  static const String baseUrl = String.fromEnvironment(
    'BIRIKIO_API_BASE_URL',
    defaultValue: 'http://10.0.2.2:8000/api/v1', // Emulator -> local backend
  );
  static const int apiTimeout = 30000;
  
  // Free Tier Limits
  static const int freeAssetLimit = 5;
  
  // Subscription
  static const String proSubscriptionId = 'birikio_pro_monthly';
  static const double proSubscriptionPrice = 50.0; // TRY

  // Public legal pages (recommended to pass with --dart-define for release)
  static const String privacyPolicyUrl = String.fromEnvironment(
    'BIRIKIO_PRIVACY_POLICY_URL',
    defaultValue: '',
  );
  static const String termsOfServiceUrl = String.fromEnvironment(
    'BIRIKIO_TERMS_OF_SERVICE_URL',
    defaultValue: '',
  );

  // Google Sign-In (OAuth)
  static const String googleServerClientId =
      '622569434136-pg1qcs6biuaa7vmk39jee8i7nffdbsjb.apps.googleusercontent.com';
  
  // AdMob IDs (use --dart-define to override test IDs per build)
  static const String androidBannerId = String.fromEnvironment(
    'BIRIKIO_ADMOB_ANDROID_BANNER_ID',
    defaultValue: 'ca-app-pub-4755649135970169/1597913156',
  );
  static const String androidInterstitialId = String.fromEnvironment(
    'BIRIKIO_ADMOB_ANDROID_INTERSTITIAL_ID',
    defaultValue: 'ca-app-pub-4755649135970169/5644243027',
  );
  static const String iosBannerId = String.fromEnvironment(
    'BIRIKIO_ADMOB_IOS_BANNER_ID',
    defaultValue: 'ca-app-pub-3940256099942544/2934735716', // Test ID
  );
  static const String iosInterstitialId = String.fromEnvironment(
    'BIRIKIO_ADMOB_IOS_INTERSTITIAL_ID',
    defaultValue: 'ca-app-pub-3940256099942544/4411468910', // Test ID
  );
  
  // Asset Types
  static const String assetTypeGold = 'gold';
  static const String assetTypeCurrency = 'currency';
  static const String assetTypeCrypto = 'crypto';
  
  // Storage Keys
  static const String keyAuthToken = 'auth_token';
  static const String keyUserId = 'user_id';
  static const String keyIsPro = 'is_pro';
  static const String keyOnboardingComplete = 'onboarding_complete';
  
  // Error Messages
  static const String errorNetwork = 'İnternet bağlantınızı kontrol edin';
  static const String errorUnknown = 'Bir hata oluştu, lütfen tekrar deneyin';
  static const String errorFreeLimitReached = 'Ücretsiz limit aşıldı. PRO sürüme geçin!';

  static bool get hasLocalApiBaseUrl {
    return baseUrl.contains('10.0.2.2') ||
        baseUrl.contains('localhost') ||
        baseUrl.contains('127.0.0.1');
  }

  static String? get releaseConfigError {
    if (!kReleaseMode) {
      return null;
    }

    if (hasLocalApiBaseUrl) {
      return 'Release build local backend ile acilamaz. '
          'Lutfen --dart-define=BIRIKIO_API_BASE_URL ile production API verin.';
    }

    return null;
  }
}
