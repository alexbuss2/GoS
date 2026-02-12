import 'dart:async';
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../core/constants.dart';
import '../models/asset_model.dart';
import '../models/portfolio_models.dart';

class ApiService {
  // Singleton pattern
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  final String baseUrl = AppConstants.baseUrl;
  String? _authToken;
  static const int _maxRetryCount = 2;

  void setAuthToken(String token) {
    _authToken = token;
  }

  Map<String, String> get _headers {
    final headers = {
      'Content-Type': 'application/json',
    };
    if (_authToken != null) {
      headers['Authorization'] = 'Bearer $_authToken';
    }
    return headers;
  }

  Future<http.Response> _sendWithRetry(
    Future<http.Response> Function() requestBuilder,
  ) async {
    Object? lastError;
    for (int attempt = 0; attempt <= _maxRetryCount; attempt++) {
      try {
        return await requestBuilder().timeout(
          const Duration(milliseconds: AppConstants.apiTimeout),
        );
      } catch (e) {
        lastError = e;
        if (attempt == _maxRetryCount) break;
        await Future.delayed(Duration(milliseconds: 400 * (attempt + 1)));
      }
    }
    throw Exception('Network error: $lastError');
  }

  Exception _apiError(String context, http.Response response) {
    try {
      final decoded = jsonDecode(response.body);
      if (decoded is Map && decoded['detail'] != null) {
        return Exception('$context: ${decoded['detail']}');
      }
    } catch (_) {
      // Ignore parsing error, fallback to status code.
    }
    return Exception('$context: ${response.statusCode}');
  }

  // Auth
  Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await _sendWithRetry(
      () => http.post(
        Uri.parse('$baseUrl/auth/login'),
        headers: _headers,
        body: jsonEncode({'email': email, 'password': password}),
      ),
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    throw _apiError('Login failed', response);
  }

  Future<Map<String, dynamic>> exchangeGoogleIdToken(String idToken) async {
    final response = await _sendWithRetry(
      () => http.post(
        Uri.parse('$baseUrl/auth/mobile/google'),
        headers: _headers,
        body: jsonEncode({'id_token': idToken}),
      ),
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    throw _apiError('Google sign-in failed', response);
  }

  Future<Map<String, dynamic>> register(
      String email, String password, String name) async {
    final response = await _sendWithRetry(
      () => http.post(
        Uri.parse('$baseUrl/auth/register'),
        headers: _headers,
        body: jsonEncode({'email': email, 'password': password, 'name': name}),
      ),
    );
    if (response.statusCode == 201) {
      return jsonDecode(response.body);
    }
    throw _apiError('Registration failed', response);
  }

  Future<Map<String, dynamic>> getCurrentUser() async {
    final response = await _sendWithRetry(
      () => http.get(
        Uri.parse('$baseUrl/auth/me'),
        headers: _headers,
      ),
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    throw _apiError('Failed to load user', response);
  }

  // Assets
  Future<List<Asset>> getAssets({String? type}) async {
    final uri = type != null
        ? Uri.parse('$baseUrl/assets?type=$type')
        : Uri.parse('$baseUrl/assets');

    final response = await _sendWithRetry(
      () => http.get(uri, headers: _headers),
    );

    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((json) => Asset.fromJson(json)).toList();
    }
    throw _apiError('Failed to load assets', response);
  }

  Future<Asset> getAssetById(String id) async {
    final response = await _sendWithRetry(
      () => http.get(
        Uri.parse('$baseUrl/assets/$id'),
        headers: _headers,
      ),
    );
    if (response.statusCode == 200) {
      return Asset.fromJson(jsonDecode(response.body));
    }
    throw _apiError('Failed to load asset', response);
  }

  // User Watchlist
  Future<List<Asset>> getWatchlist() async {
    final response = await _sendWithRetry(
      () => http.get(
        Uri.parse('$baseUrl/user/watchlist'),
        headers: _headers,
      ),
    );
    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((json) => Asset.fromJson(json)).toList();
    }
    throw _apiError('Failed to load watchlist', response);
  }

  Future<void> addToWatchlist(String assetId) async {
    final response = await _sendWithRetry(
      () => http.post(
        Uri.parse('$baseUrl/user/watchlist'),
        headers: _headers,
        body: jsonEncode({'asset_key': assetId}),
      ),
    );
    if (response.statusCode != 200 && response.statusCode != 201) {
      throw _apiError('Failed to add to watchlist', response);
    }
  }

  Future<void> removeFromWatchlist(String assetId) async {
    final response = await _sendWithRetry(
      () => http.delete(
        Uri.parse('$baseUrl/user/watchlist/$assetId'),
        headers: _headers,
      ),
    );
    if (response.statusCode != 200 && response.statusCode != 204) {
      throw _apiError('Failed to remove from watchlist', response);
    }
  }

  // Subscription
  Future<Map<String, dynamic>> subscribeToPro(String receipt) async {
    final response = await _sendWithRetry(
      () => http.post(
        Uri.parse('$baseUrl/subscription/activate'),
        headers: _headers,
        body: jsonEncode({'receipt': receipt}),
      ),
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    throw _apiError('Subscription failed', response);
  }

  Future<List<Asset>> getMarketAssets({String? type, String? query}) async {
    final queryParams = <String, String>{};
    if (type != null && type.isNotEmpty) queryParams['type'] = type;
    if (query != null && query.isNotEmpty) queryParams['query'] = query;
    final uri = Uri.parse('$baseUrl/market/assets').replace(queryParameters: queryParams.isEmpty ? null : queryParams);

    final response = await _sendWithRetry(() => http.get(uri, headers: _headers));
    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((json) => Asset.fromJson(json)).toList();
    }
    throw _apiError('Failed to load market assets', response);
  }

  Future<List<AssetHistoryPoint>> getAssetHistory(
    String assetKey, {
    String range = '1D',
  }) async {
    final uri = Uri.parse('$baseUrl/market/assets/$assetKey/history?range=$range');
    final response = await _sendWithRetry(() => http.get(uri, headers: _headers));
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body) as Map<String, dynamic>;
      final points = (data['points'] as List<dynamic>? ?? []);
      return points
          .map((item) => AssetHistoryPoint.fromJson(item as Map<String, dynamic>))
          .toList();
    }
    throw _apiError('Failed to load asset history', response);
  }

  Future<List<PortfolioPosition>> getPortfolioPositions() async {
    final response = await _sendWithRetry(
      () => http.get(Uri.parse('$baseUrl/user/portfolio/positions'), headers: _headers),
    );
    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data
          .map((item) => PortfolioPosition.fromJson(item as Map<String, dynamic>))
          .toList();
    }
    throw _apiError('Failed to load portfolio positions', response);
  }

  Future<PortfolioSummary> getPortfolioSummary() async {
    final response = await _sendWithRetry(
      () => http.get(Uri.parse('$baseUrl/user/portfolio/summary'), headers: _headers),
    );
    if (response.statusCode == 200) {
      return PortfolioSummary.fromJson(jsonDecode(response.body));
    }
    throw _apiError('Failed to load portfolio summary', response);
  }

  Future<PortfolioPosition> createPortfolioPosition({
    required String assetKey,
    required double quantity,
    required double avgCost,
    required String currency,
    DateTime? openedAt,
    String? notes,
  }) async {
    final response = await _sendWithRetry(
      () => http.post(
        Uri.parse('$baseUrl/user/portfolio/positions'),
        headers: _headers,
        body: jsonEncode({
          'asset_key': assetKey,
          'quantity': quantity,
          'avg_cost': avgCost,
          'currency': currency,
          'opened_at': openedAt?.toIso8601String(),
          'notes': notes,
        }),
      ),
    );
    if (response.statusCode == 201 || response.statusCode == 200) {
      return PortfolioPosition.fromJson(jsonDecode(response.body));
    }
    throw _apiError('Failed to create portfolio position', response);
  }

  Future<PortfolioPosition> updatePortfolioPosition({
    required int positionId,
    double? quantity,
    double? avgCost,
    String? currency,
    DateTime? openedAt,
    String? notes,
  }) async {
    final body = <String, dynamic>{};
    if (quantity != null) body['quantity'] = quantity;
    if (avgCost != null) body['avg_cost'] = avgCost;
    if (currency != null) body['currency'] = currency;
    if (openedAt != null) body['opened_at'] = openedAt.toIso8601String();
    if (notes != null) body['notes'] = notes;

    final response = await _sendWithRetry(
      () => http.put(
        Uri.parse('$baseUrl/user/portfolio/positions/$positionId'),
        headers: _headers,
        body: jsonEncode(body),
      ),
    );
    if (response.statusCode == 200) {
      return PortfolioPosition.fromJson(jsonDecode(response.body));
    }
    throw _apiError('Failed to update portfolio position', response);
  }

  Future<void> deletePortfolioPosition(int positionId) async {
    final response = await _sendWithRetry(
      () => http.delete(
        Uri.parse('$baseUrl/user/portfolio/positions/$positionId'),
        headers: _headers,
      ),
    );
    if (response.statusCode != 204 && response.statusCode != 200) {
      throw _apiError('Failed to delete portfolio position', response);
    }
  }
}
