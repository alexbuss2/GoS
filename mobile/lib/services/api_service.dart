import 'dart:convert';
import 'package:http/http.dart' as http;
import '../core/constants.dart';
import '../models/asset_model.dart';

class ApiService {
  // Singleton pattern
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  final String baseUrl = AppConstants.baseUrl;
  String? _authToken;

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

  // Auth
  Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/login'),
        headers: _headers,
        body: jsonEncode({'email': email, 'password': password}),
      ).timeout(const Duration(milliseconds: AppConstants.apiTimeout));

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Login failed: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  Future<Map<String, dynamic>> exchangeGoogleIdToken(String idToken) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/mobile/google'),
        headers: _headers,
        body: jsonEncode({'id_token': idToken}),
      ).timeout(const Duration(milliseconds: AppConstants.apiTimeout));

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Google sign-in failed: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  Future<Map<String, dynamic>> register(
      String email, String password, String name) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/register'),
        headers: _headers,
        body: jsonEncode({'email': email, 'password': password, 'name': name}),
      ).timeout(const Duration(milliseconds: AppConstants.apiTimeout));

      if (response.statusCode == 201) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Registration failed: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  Future<Map<String, dynamic>> getCurrentUser() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/auth/me'),
        headers: _headers,
      ).timeout(const Duration(milliseconds: AppConstants.apiTimeout));

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Failed to load user: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  // Assets
  Future<List<Asset>> getAssets({String? type}) async {
    try {
      final uri = type != null
          ? Uri.parse('$baseUrl/assets?type=$type')
          : Uri.parse('$baseUrl/assets');

      final response = await http.get(uri, headers: _headers).timeout(
            const Duration(milliseconds: AppConstants.apiTimeout),
          );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((json) => Asset.fromJson(json)).toList();
      } else {
        throw Exception('Failed to load assets: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  Future<Asset> getAssetById(String id) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/assets/$id'),
        headers: _headers,
      ).timeout(const Duration(milliseconds: AppConstants.apiTimeout));

      if (response.statusCode == 200) {
        return Asset.fromJson(jsonDecode(response.body));
      } else {
        throw Exception('Failed to load asset: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  // User Watchlist
  Future<List<Asset>> getWatchlist() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/user/watchlist'),
        headers: _headers,
      ).timeout(const Duration(milliseconds: AppConstants.apiTimeout));

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((json) => Asset.fromJson(json)).toList();
      } else {
        throw Exception('Failed to load watchlist: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  Future<void> addToWatchlist(String assetId) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/user/watchlist'),
        headers: _headers,
        body: jsonEncode({'asset_id': assetId}),
      ).timeout(const Duration(milliseconds: AppConstants.apiTimeout));

      if (response.statusCode != 200 && response.statusCode != 201) {
        throw Exception('Failed to add to watchlist: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  Future<void> removeFromWatchlist(String assetId) async {
    try {
      final response = await http.delete(
        Uri.parse('$baseUrl/user/watchlist/$assetId'),
        headers: _headers,
      ).timeout(const Duration(milliseconds: AppConstants.apiTimeout));

      if (response.statusCode != 200 && response.statusCode != 204) {
        throw Exception(
            'Failed to remove from watchlist: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  // Subscription
  Future<Map<String, dynamic>> subscribeToPro(String receipt) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/subscription/activate'),
        headers: _headers,
        body: jsonEncode({'receipt': receipt}),
      ).timeout(const Duration(milliseconds: AppConstants.apiTimeout));

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Subscription failed: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }
}
