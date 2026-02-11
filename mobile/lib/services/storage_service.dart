import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../core/constants.dart';

class StorageService {
  static final StorageService _instance = StorageService._internal();
  factory StorageService() => _instance;
  StorageService._internal();

  final _secureStorage = const FlutterSecureStorage();
  SharedPreferences? _prefs;

  Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
  }

  // Secure Storage (for sensitive data)
  Future<void> saveAuthToken(String token) async {
    await _secureStorage.write(key: AppConstants.keyAuthToken, value: token);
  }

  Future<String?> getAuthToken() async {
    return await _secureStorage.read(key: AppConstants.keyAuthToken);
  }

  Future<void> deleteAuthToken() async {
    await _secureStorage.delete(key: AppConstants.keyAuthToken);
  }

  // Regular Storage
  Future<void> saveUserId(String userId) async {
    await _prefs?.setString(AppConstants.keyUserId, userId);
  }

  String? getUserId() {
    return _prefs?.getString(AppConstants.keyUserId);
  }

  Future<void> saveProStatus(bool isPro) async {
    await _prefs?.setBool(AppConstants.keyIsPro, isPro);
  }

  bool getProStatus() {
    return _prefs?.getBool(AppConstants.keyIsPro) ?? false;
  }

  Future<void> setOnboardingComplete(bool complete) async {
    await _prefs?.setBool(AppConstants.keyOnboardingComplete, complete);
  }

  bool isOnboardingComplete() {
    return _prefs?.getBool(AppConstants.keyOnboardingComplete) ?? false;
  }

  Future<void> clearAll() async {
    await _secureStorage.deleteAll();
    await _prefs?.clear();
  }
}
