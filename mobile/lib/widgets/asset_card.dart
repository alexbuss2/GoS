import 'package:flutter/material.dart';
import '../models/asset_model.dart';
import '../core/theme.dart';
import 'package:intl/intl.dart';

class AssetCard extends StatelessWidget {
  final Asset asset;
  final VoidCallback? onTap;
  final bool showAddButton;
  final VoidCallback? onAddPressed;
  final VoidCallback? onRemovePressed;
  final bool isInWatchlist;

  const AssetCard({
    super.key,
    required this.asset,
    this.onTap,
    this.showAddButton = false,
    this.onAddPressed,
    this.onRemovePressed,
    this.isInWatchlist = false,
  });

  @override
  Widget build(BuildContext context) {
    final currencyFormat = NumberFormat.currency(locale: 'tr_TR', symbol: '₺');
    final percentFormat = NumberFormat.decimalPercentPattern(decimalDigits: 2);

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              // Asset Icon
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: AppTheme.surfaceBg,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Center(
                  child: Text(
                    _getAssetIcon(),
                    style: const TextStyle(fontSize: 24),
                  ),
                ),
              ),
              const SizedBox(width: 16),
              
              // Asset Info
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      asset.name,
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      asset.symbol.toUpperCase(),
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                  ],
                ),
              ),
              
              // Price & Change
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    currencyFormat.format(asset.currentPrice),
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: asset.isPositive
                          ? AppTheme.chartPositive.withOpacity(0.2)
                          : AppTheme.chartNegative.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          asset.isPositive
                              ? Icons.arrow_upward
                              : Icons.arrow_downward,
                          size: 12,
                          color: asset.isPositive
                              ? AppTheme.chartPositive
                              : AppTheme.chartNegative,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          percentFormat.format(asset.changePercent / 100),
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: asset.isPositive
                                ? AppTheme.chartPositive
                                : AppTheme.chartNegative,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              
              // Add/Remove Button
              if (showAddButton) ...[
                const SizedBox(width: 8),
                IconButton(
                  onPressed: isInWatchlist ? onRemovePressed : onAddPressed,
                  icon: Icon(
                    isInWatchlist ? Icons.star : Icons.star_border,
                    color: isInWatchlist
                        ? AppTheme.primaryGold
                        : AppTheme.textTertiary,
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  String _getAssetIcon() {
    switch (asset.type) {
      case 'gold':
        return '🪙';
      case 'currency':
        return '💵';
      case 'crypto':
        return '₿';
      default:
        return '💰';
    }
  }
}
