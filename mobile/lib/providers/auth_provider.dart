import 'package:flutter/foundation.dart';
import 'package:google_sign_in/google_sign_in.dart';
import '../models/user_model.dart';
import '../services/api_service.dart';
import '../services/storage_service.dart';
import '../core/constants.dart';

class AuthProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  final StorageService _storageService = StorageService();
  final GoogleSignIn _googleSignIn = GoogleSignIn(
    scopes: ['email', 'profile'],
    serverClientId: AppConstants.googleServerClientId != 'YOUR_GOOGLE_SERVER_CLIENT_ID'
        ? AppConstants.googleServerClientId
        : null,
  );

  User? _currentUser;
  bool _isLoading = false;
  String? _errorMessage;

  User? get currentUser => _currentUser;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  bool get isAuthenticated => _currentUser != null;
  bool get isPro => _currentUser?.isPro ?? false;

  Future<void> checkAuthStatus() async {
    final token = await _storageService.getAuthToken();
    if (token != null) {
      _apiService.setAuthToken(token);
      try {
        final userData = await _apiService.getCurrentUser();
        _currentUser = User.fromJson(userData);
        await _storageService.saveProStatus(_currentUser!.isPro);
      } catch (_) {
        // If token is invalid, clear it
        await _storageService.deleteAuthToken();
        _currentUser = null;
      }
      notifyListeners();
    }
  }

  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await _apiService.login(email, password);
      final token = response['token'];
      final userData = response['user'];

      await _storageService.saveAuthToken(token);
      await _storageService.saveUserId(userData['id']);
      _apiService.setAuthToken(token);

      _currentUser = User.fromJson(userData);
      await _storageService.saveProStatus(_currentUser!.isPro);

      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = 'Giriş başarısız: ${e.toString()}';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> register(String email, String password, String name) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await _apiService.register(email, password, name);
      final token = response['token'];
      final userData = response['user'];

      await _storageService.saveAuthToken(token);
      await _storageService.saveUserId(userData['id']);
      _apiService.setAuthToken(token);

      _currentUser = User.fromJson(userData);
      await _storageService.saveProStatus(_currentUser!.isPro);

      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = 'Kayıt başarısız: ${e.toString()}';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    try {
      await _googleSignIn.signOut();
    } catch (_) {
      // Ignore sign-out errors
    }
    await _storageService.clearAll();
    _currentUser = null;
    notifyListeners();
  }

  Future<bool> signInWithGoogle() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      if (AppConstants.googleServerClientId == 'YOUR_GOOGLE_SERVER_CLIENT_ID') {
        throw Exception('Google Client ID ayarlanmamış');
      }

      final account = await _googleSignIn.signIn();
      if (account == null) {
        _isLoading = false;
        notifyListeners();
        return false;
      }

      final auth = await account.authentication;
      final idToken = auth.idToken;
      if (idToken == null) {
        throw Exception('Google ID token alınamadı');
      }

      final response = await _apiService.exchangeGoogleIdToken(idToken);
      final token = response['token'];
      final userData = response['user'];

      await _storageService.saveAuthToken(token);
      await _storageService.saveUserId(userData['id']);
      _apiService.setAuthToken(token);

      _currentUser = User.fromJson(userData);
      await _storageService.saveProStatus(_currentUser!.isPro);

      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = 'Google ile giriş başarısız: ${e.toString()}';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  void updateProStatus(bool isPro) {
    if (_currentUser != null) {
      _currentUser = User(
        id: _currentUser!.id,
        email: _currentUser!.email,
        name: _currentUser!.name,
        isPro: isPro,
        proExpiresAt: isPro ? DateTime.now().add(const Duration(days: 30)) : null,
        watchlistAssetIds: _currentUser!.watchlistAssetIds,
        createdAt: _currentUser!.createdAt,
      );
      _storageService.saveProStatus(isPro);
      notifyListeners();
    }
  }
}
