import 'package:flutter/foundation.dart';
import '../models/asset_model.dart';
import '../services/api_service.dart';
import '../services/demo_data_service.dart';
import '../core/constants.dart';

class AssetProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  bool _isDemoMode = false;

  List<Asset> _allAssets = [];
  List<Asset> _watchlist = [];
  bool _isLoading = false;
  String? _errorMessage;

  List<Asset> get allAssets => _allAssets;
  List<Asset> get watchlist => _watchlist;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  bool get isDemoMode => _isDemoMode;
  
  void setDemoMode(bool enabled) {
    _isDemoMode = enabled;
    if (enabled) {
      _allAssets = DemoDataService.getDemoAssets();
      notifyListeners();
    }
  }

  List<Asset> get goldAssets => _allAssets
      .where((asset) => asset.type == AppConstants.assetTypeGold)
      .toList();

  List<Asset> get currencyAssets => _allAssets
      .where((asset) => asset.type == AppConstants.assetTypeCurrency)
      .toList();

  List<Asset> get cryptoAssets => _allAssets
      .where((asset) => asset.type == AppConstants.assetTypeCrypto)
      .toList();

  Future<void> loadAllAssets() async {
    if (_isDemoMode) {
      _allAssets = DemoDataService.getDemoAssets();
      notifyListeners();
      return;
    }

    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _allAssets = await _apiService.getAssets();
      _errorMessage = null;
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _errorMessage = 'Varlıklar yüklenemedi: ${e.toString()}';
      _isLoading = false;
      notifyListeners();
      // Fallback to demo data if API fails
      if (_allAssets.isEmpty) {
        _allAssets = DemoDataService.getDemoAssets();
        _isDemoMode = true;
      }
    }
  }

  Future<void> loadWatchlist() async {
    if (_isDemoMode) {
      // In demo mode, watchlist stays local
      return;
    }

    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _watchlist = await _apiService.getWatchlist();
      _errorMessage = null;
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _errorMessage = 'İzleme listesi yüklenemedi: ${e.toString()}';
      _isLoading = false;
      notifyListeners();
      // Don't clear existing watchlist on error
    }
  }

  Future<bool> addToWatchlist(Asset asset, bool isPro) async {
    // Check free limit
    if (!isPro && _watchlist.length >= AppConstants.freeAssetLimit) {
      _errorMessage = AppConstants.errorFreeLimitReached;
      notifyListeners();
      return false;
    }

    // Check if already in watchlist
    if (isInWatchlist(asset.id)) {
      _errorMessage = 'Bu varlık zaten izleme listenizde';
      notifyListeners();
      return false;
    }

    try {
      if (!_isDemoMode) {
        await _apiService.addToWatchlist(asset.id);
      }
      _watchlist.add(asset);
      _errorMessage = null;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = 'Ekleme başarısız: ${e.toString()}';
      notifyListeners();
      return false;
    }
  }

  Future<void> removeFromWatchlist(String assetId) async {
    try {
      if (!_isDemoMode) {
        await _apiService.removeFromWatchlist(assetId);
      }
      _watchlist.removeWhere((asset) => asset.id == assetId);
      _errorMessage = null;
      notifyListeners();
    } catch (e) {
      _errorMessage = 'Silme başarısız: ${e.toString()}';
      notifyListeners();
    }
  }

  bool isInWatchlist(String assetId) {
    return _watchlist.any((asset) => asset.id == assetId);
  }

  Future<void> refreshAssets() async {
    await Future.wait([
      loadAllAssets(),
      loadWatchlist(),
    ]);
  }
}
