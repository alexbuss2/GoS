import 'package:flutter/foundation.dart';

import '../models/portfolio_models.dart';
import '../services/api_service.dart';

class PortfolioProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();

  List<PortfolioPosition> _positions = [];
  PortfolioSummary _summary = const PortfolioSummary(
    totalMarketValue: 0,
    totalInvestedValue: 0,
    totalPnlValue: 0,
    totalPnlPercent: 0,
    distribution: {'gold': 0, 'currency': 0, 'crypto': 0},
    positionCount: 0,
  );
  bool _isLoading = false;
  String? _errorMessage;

  List<PortfolioPosition> get positions => _positions;
  PortfolioSummary get summary => _summary;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  Future<void> loadPortfolio() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();
    try {
      _positions = await _apiService.getPortfolioPositions();
      _summary = await _apiService.getPortfolioSummary();
    } catch (e) {
      _errorMessage = 'Portfoy yuklenemedi: ${e.toString()}';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> createPosition({
    required String assetKey,
    required double quantity,
    required double avgCost,
    required String currency,
    DateTime? openedAt,
    String? notes,
  }) async {
    try {
      await _apiService.createPortfolioPosition(
        assetKey: assetKey,
        quantity: quantity,
        avgCost: avgCost,
        currency: currency,
        openedAt: openedAt,
        notes: notes,
      );
      await loadPortfolio();
      return true;
    } catch (e) {
      _errorMessage = 'Pozisyon eklenemedi: ${e.toString()}';
      notifyListeners();
      return false;
    }
  }

  Future<bool> updatePosition({
    required int positionId,
    double? quantity,
    double? avgCost,
    String? currency,
    DateTime? openedAt,
    String? notes,
  }) async {
    try {
      await _apiService.updatePortfolioPosition(
        positionId: positionId,
        quantity: quantity,
        avgCost: avgCost,
        currency: currency,
        openedAt: openedAt,
        notes: notes,
      );
      await loadPortfolio();
      return true;
    } catch (e) {
      _errorMessage = 'Pozisyon guncellenemedi: ${e.toString()}';
      notifyListeners();
      return false;
    }
  }

  Future<void> deletePosition(int positionId) async {
    try {
      await _apiService.deletePortfolioPosition(positionId);
      await loadPortfolio();
    } catch (e) {
      _errorMessage = 'Pozisyon silinemedi: ${e.toString()}';
      notifyListeners();
    }
  }
}
