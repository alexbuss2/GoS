class PortfolioPosition {
  final int id;
  final String assetKey;
  final String assetName;
  final String assetType;
  final double quantity;
  final double avgCost;
  final double currentPrice;
  final double marketValue;
  final double investedValue;
  final double pnlValue;
  final double pnlPercent;
  final String currency;
  final DateTime? openedAt;
  final String? notes;
  final DateTime updatedAt;

  const PortfolioPosition({
    required this.id,
    required this.assetKey,
    required this.assetName,
    required this.assetType,
    required this.quantity,
    required this.avgCost,
    required this.currentPrice,
    required this.marketValue,
    required this.investedValue,
    required this.pnlValue,
    required this.pnlPercent,
    required this.currency,
    required this.openedAt,
    required this.notes,
    required this.updatedAt,
  });

  factory PortfolioPosition.fromJson(Map<String, dynamic> json) {
    return PortfolioPosition(
      id: json['id'] as int,
      assetKey: json['asset_key'] ?? '',
      assetName: json['asset_name'] ?? '',
      assetType: json['asset_type'] ?? '',
      quantity: (json['quantity'] ?? 0).toDouble(),
      avgCost: (json['avg_cost'] ?? 0).toDouble(),
      currentPrice: (json['current_price'] ?? 0).toDouble(),
      marketValue: (json['market_value'] ?? 0).toDouble(),
      investedValue: (json['invested_value'] ?? 0).toDouble(),
      pnlValue: (json['pnl_value'] ?? 0).toDouble(),
      pnlPercent: (json['pnl_percent'] ?? 0).toDouble(),
      currency: json['currency'] ?? 'TRY',
      openedAt: json['opened_at'] != null ? DateTime.tryParse(json['opened_at']) : null,
      notes: json['notes'],
      updatedAt: json['updated_at'] != null
          ? DateTime.parse(json['updated_at'])
          : DateTime.now(),
    );
  }
}

class PortfolioSummary {
  final double totalMarketValue;
  final double totalInvestedValue;
  final double totalPnlValue;
  final double totalPnlPercent;
  final Map<String, double> distribution;
  final int positionCount;

  const PortfolioSummary({
    required this.totalMarketValue,
    required this.totalInvestedValue,
    required this.totalPnlValue,
    required this.totalPnlPercent,
    required this.distribution,
    required this.positionCount,
  });

  factory PortfolioSummary.fromJson(Map<String, dynamic> json) {
    final distributionRaw = (json['distribution'] as Map<String, dynamic>? ?? {});
    return PortfolioSummary(
      totalMarketValue: (json['total_market_value'] ?? 0).toDouble(),
      totalInvestedValue: (json['total_invested_value'] ?? 0).toDouble(),
      totalPnlValue: (json['total_pnl_value'] ?? 0).toDouble(),
      totalPnlPercent: (json['total_pnl_percent'] ?? 0).toDouble(),
      distribution: distributionRaw.map(
        (key, value) => MapEntry(key, (value ?? 0).toDouble()),
      ),
      positionCount: json['position_count'] ?? 0,
    );
  }
}

class AssetHistoryPoint {
  final DateTime timestamp;
  final double price;

  const AssetHistoryPoint({required this.timestamp, required this.price});

  factory AssetHistoryPoint.fromJson(Map<String, dynamic> json) {
    return AssetHistoryPoint(
      timestamp: json['timestamp'] != null
          ? DateTime.parse(json['timestamp'])
          : DateTime.now(),
      price: (json['price'] ?? 0).toDouble(),
    );
  }
}
