import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../core/theme.dart';
import '../providers/portfolio_provider.dart';
import 'position_form_screen.dart';

class PortfolioScreen extends StatefulWidget {
  const PortfolioScreen({super.key});

  @override
  State<PortfolioScreen> createState() => _PortfolioScreenState();
}

class _PortfolioScreenState extends State<PortfolioScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<PortfolioProvider>().loadPortfolio();
    });
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<PortfolioProvider>();
    final currency = NumberFormat.currency(locale: 'tr_TR', symbol: '₺');

    return Scaffold(
      appBar: AppBar(title: const Text('Portfoy')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () async {
          final created = await Navigator.push<bool>(
            context,
            MaterialPageRoute(builder: (_) => const PositionFormScreen()),
          );
          if (!context.mounted) return;
          if (created == true) context.read<PortfolioProvider>().loadPortfolio();
        },
        icon: const Icon(Icons.add),
        label: const Text('Pozisyon'),
      ),
      body: RefreshIndicator(
        onRefresh: () => provider.loadPortfolio(),
        child: provider.isLoading && provider.positions.isEmpty
            ? const Center(child: CircularProgressIndicator())
            : ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Toplam Portfoy',
                            style: Theme.of(context).textTheme.titleMedium,
                          ),
                          const SizedBox(height: 8),
                          Text(
                            currency.format(provider.summary.totalMarketValue),
                            style: Theme.of(context).textTheme.headlineMedium,
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'P/L: ${currency.format(provider.summary.totalPnlValue)} (${provider.summary.totalPnlPercent.toStringAsFixed(2)}%)',
                            style: TextStyle(
                              color: provider.summary.totalPnlValue >= 0
                                  ? AppTheme.chartPositive
                                  : AppTheme.chartNegative,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 10),
                  if (provider.positions.isEmpty)
                    const Card(
                      child: Padding(
                        padding: EdgeInsets.all(16),
                        child: Text('Henüz pozisyon eklenmedi.'),
                      ),
                    )
                  else
                    ...provider.positions.map(
                      (position) => Card(
                        child: ListTile(
                          title: Text(position.assetName),
                          subtitle: Text(
                            '${position.quantity} adet • Maliyet ${position.avgCost.toStringAsFixed(2)} ${position.currency}',
                          ),
                          trailing: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Text(currency.format(position.marketValue)),
                              Text(
                                '${position.pnlPercent.toStringAsFixed(2)}%',
                                style: TextStyle(
                                  color: position.pnlValue >= 0
                                      ? AppTheme.chartPositive
                                      : AppTheme.chartNegative,
                                ),
                              ),
                            ],
                          ),
                          onLongPress: () => provider.deletePosition(position.id),
                        ),
                      ),
                    ),
                ],
              ),
      ),
    );
  }
}
