class Asset {
  final String id;
  final String name;
  final String symbol;
  final String type; // gold, currency, crypto
  final double currentPrice;
  final double previousPrice;
  final double changePercent;
  final String? imageUrl;
  final DateTime updatedAt;

  Asset({
    required this.id,
    required this.name,
    required this.symbol,
    required this.type,
    required this.currentPrice,
    required this.previousPrice,
    required this.changePercent,
    this.imageUrl,
    required this.updatedAt,
  });

  bool get isPositive => changePercent >= 0;

  factory Asset.fromJson(Map<String, dynamic> json) {
    return Asset(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      symbol: json['symbol'] ?? '',
      type: json['type'] ?? '',
      currentPrice: (json['current_price'] ?? 0).toDouble(),
      previousPrice: (json['previous_price'] ?? 0).toDouble(),
      changePercent: (json['change_percent'] ?? 0).toDouble(),
      imageUrl: json['image_url'],
      updatedAt: json['updated_at'] != null 
          ? DateTime.parse(json['updated_at'])
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'symbol': symbol,
      'type': type,
      'current_price': currentPrice,
      'previous_price': previousPrice,
      'change_percent': changePercent,
      'image_url': imageUrl,
      'updated_at': updatedAt.toIso8601String(),
    };
  }
}
