import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../core/theme.dart';
import '../models/asset_model.dart';
import '../models/portfolio_models.dart';
import '../providers/auth_provider.dart';
import '../providers/market_provider.dart';
import '../services/api_service.dart';
import 'position_form_screen.dart';

class AssetDetailScreen extends StatefulWidget {
  const AssetDetailScreen({super.key, required this.asset});
  final Asset asset;

  @override
  State<AssetDetailScreen> createState() => _AssetDetailScreenState();
}

class _AssetDetailScreenState extends State<AssetDetailScreen> {
  final ApiService _apiService = ApiService();
  final List<String> _ranges = const ['1D', '1W', '1M', '3M', '1Y'];
  String _selectedRange = '1D';
  bool _loading = true;
  List<AssetHistoryPoint> _points = [];

  @override
  void initState() {
    super.initState();
    _loadHistory();
  }

  Future<void> _loadHistory() async {
    setState(() => _loading = true);
    try {
      final data = await _apiService.getAssetHistory(
        widget.asset.id,
        range: _selectedRange,
      );
      if (!mounted) return;
      setState(() => _points = data);
    } catch (_) {
      if (!mounted) return;
      setState(() => _points = []);
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final marketProvider = context.watch<MarketProvider>();
    final authProvider = context.watch<AuthProvider>();
    final currency = NumberFormat.currency(locale: 'tr_TR', symbol: '₺');
    final isInWatchlist = marketProvider.isInWatchlist(widget.asset.id);

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.asset.name),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(widget.asset.symbol, style: Theme.of(context).textTheme.titleMedium),
                  const SizedBox(height: 8),
                  Text(
                    currency.format(widget.asset.currentPrice),
                    style: Theme.of(context).textTheme.headlineMedium,
                  ),
                  Text(
                    '${widget.asset.changePercent.toStringAsFixed(2)}%',
                    style: TextStyle(
                      color: widget.asset.changePercent >= 0
                          ? AppTheme.chartPositive
                          : AppTheme.chartNegative,
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: _ranges
                  .map(
                    (range) => Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: ChoiceChip(
                        label: Text(range),
                        selected: _selectedRange == range,
                        onSelected: (_) {
                          setState(() => _selectedRange = range);
                          _loadHistory();
                        },
                      ),
                    ),
                  )
                  .toList(),
            ),
          ),
          const SizedBox(height: 12),
          Card(
            child: SizedBox(
              height: 240,
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: _loading
                    ? const Center(child: CircularProgressIndicator())
                    : _points.length < 2
                        ? const Center(child: Text('Grafik verisi bulunamadi'))
                        : LineChart(
                            LineChartData(
                              gridData: const FlGridData(show: false),
                              titlesData: const FlTitlesData(show: false),
                              borderData: FlBorderData(show: false),
                              lineBarsData: [
                                LineChartBarData(
                                  spots: _points
                                      .asMap()
                                      .entries
                                      .map(
                                        (entry) => FlSpot(
                                          entry.key.toDouble(),
                                          entry.value.price,
                                        ),
                                      )
                                      .toList(),
                                  isCurved: true,
                                  color: widget.asset.changePercent >= 0
                                      ? AppTheme.chartPositive
                                      : AppTheme.chartNegative,
                                  barWidth: 2.5,
                                  dotData: const FlDotData(show: false),
                                  belowBarData: BarAreaData(
                                    show: true,
                                    color: (widget.asset.changePercent >= 0
                                            ? AppTheme.chartPositive
                                            : AppTheme.chartNegative)
                                        .withOpacity(0.15),
                                  ),
                                ),
                              ],
                            ),
                          ),
              ),
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () async {
                    if (isInWatchlist) {
                      await marketProvider.removeFromWatchlist(widget.asset.id);
                    } else {
                      await marketProvider.addToWatchlist(widget.asset, authProvider.isPro);
                    }
                  },
                  icon: Icon(isInWatchlist ? Icons.star : Icons.star_border),
                  label: Text(isInWatchlist ? 'Izlemeden Cikar' : 'Izlemeye Ekle'),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => PositionFormScreen(prefilledAsset: widget.asset),
                      ),
                    );
                  },
                  icon: const Icon(Icons.add_chart),
                  label: const Text('Pozisyon Ac'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
