import 'package:flutter/foundation.dart';
import '../core/constants.dart';
import '../models/asset_model.dart';
import '../services/api_service.dart';

class MarketProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();

  List<Asset> _marketAssets = [];
  List<Asset> _watchlist = [];
  bool _isLoading = false;
  String? _errorMessage;

  List<Asset> get marketAssets => _marketAssets;
  List<Asset> get watchlist => _watchlist;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  List<Asset> get goldAssets => _marketAssets
      .where((asset) => asset.type == AppConstants.assetTypeGold)
      .toList();
  List<Asset> get currencyAssets => _marketAssets
      .where((asset) => asset.type == AppConstants.assetTypeCurrency)
      .toList();
  List<Asset> get cryptoAssets => _marketAssets
      .where((asset) => asset.type == AppConstants.assetTypeCrypto)
      .toList();

  bool isInWatchlist(String assetKey) {
    return _watchlist.any((item) => item.id == assetKey);
  }

  Future<void> loadMarketAssets({String? type, String? query}) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _marketAssets = await _apiService.getMarketAssets(type: type, query: query);
    } catch (e) {
      _errorMessage = 'Piyasa verisi yuklenemedi: ${e.toString()}';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> loadWatchlist() async {
    try {
      _watchlist = await _apiService.getWatchlist();
      _errorMessage = null;
    } catch (e) {
      _errorMessage = 'Izleme listesi yuklenemedi: ${e.toString()}';
    }
    notifyListeners();
  }

  Future<bool> addToWatchlist(Asset asset, bool isPro) async {
    if (!isPro && _watchlist.length >= AppConstants.freeAssetLimit) {
      _errorMessage = AppConstants.errorFreeLimitReached;
      notifyListeners();
      return false;
    }
    if (isInWatchlist(asset.id)) {
      _errorMessage = 'Bu varlik zaten izleme listenizde';
      notifyListeners();
      return false;
    }

    try {
      await _apiService.addToWatchlist(asset.id);
      _watchlist.add(asset);
      _errorMessage = null;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = 'Ekleme basarisiz: ${e.toString()}';
      notifyListeners();
      return false;
    }
  }

  Future<void> removeFromWatchlist(String assetKey) async {
    try {
      await _apiService.removeFromWatchlist(assetKey);
      _watchlist.removeWhere((asset) => asset.id == assetKey);
      _errorMessage = null;
    } catch (e) {
      _errorMessage = 'Silme basarisiz: ${e.toString()}';
    }
    notifyListeners();
  }

  Future<void> refreshData() async {
    await Future.wait([loadMarketAssets(), loadWatchlist()]);
  }
}
