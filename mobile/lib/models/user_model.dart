class User {
  final String id;
  final String email;
  final String? name;
  final bool isPro;
  final DateTime? proExpiresAt;
  final List<String> watchlistAssetIds;
  final DateTime createdAt;

  User({
    required this.id,
    required this.email,
    this.name,
    required this.isPro,
    this.proExpiresAt,
    required this.watchlistAssetIds,
    required this.createdAt,
  });

  bool get canAddMoreAssets => isPro || watchlistAssetIds.length < 5;

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] ?? '',
      email: json['email'] ?? '',
      name: json['name'],
      isPro: json['is_pro'] ?? false,
      proExpiresAt: json['pro_expires_at'] != null
          ? DateTime.parse(json['pro_expires_at'])
          : null,
      watchlistAssetIds: List<String>.from(json['watchlist_asset_ids'] ?? []),
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'])
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'name': name,
      'is_pro': isPro,
      'pro_expires_at': proExpiresAt?.toIso8601String(),
      'watchlist_asset_ids': watchlistAssetIds,
      'created_at': createdAt.toIso8601String(),
    };
  }
}
