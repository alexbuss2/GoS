import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../core/theme.dart';
import '../models/asset_model.dart';
import '../providers/market_provider.dart';
import '../providers/portfolio_provider.dart';

class PositionFormScreen extends StatefulWidget {
  const PositionFormScreen({super.key, this.prefilledAsset});

  final Asset? prefilledAsset;

  @override
  State<PositionFormScreen> createState() => _PositionFormScreenState();
}

class _PositionFormScreenState extends State<PositionFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final _quantityController = TextEditingController();
  final _avgCostController = TextEditingController();
  final _notesController = TextEditingController();
  String? _selectedAssetKey;
  String _currency = 'TRY';

  @override
  void initState() {
    super.initState();
    if (widget.prefilledAsset != null) {
      _selectedAssetKey = widget.prefilledAsset!.id;
      _currency = widget.prefilledAsset!.type == 'crypto' ? 'USD' : 'TRY';
      _avgCostController.text = widget.prefilledAsset!.currentPrice.toStringAsFixed(2);
    }
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<MarketProvider>().loadMarketAssets();
    });
  }

  @override
  void dispose() {
    _quantityController.dispose();
    _avgCostController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate() || _selectedAssetKey == null) return;
    final portfolioProvider = context.read<PortfolioProvider>();
    final success = await portfolioProvider.createPosition(
      assetKey: _selectedAssetKey!,
      quantity: double.parse(_quantityController.text),
      avgCost: double.parse(_avgCostController.text),
      currency: _currency,
      notes: _notesController.text.trim().isEmpty ? null : _notesController.text.trim(),
    );

    if (!mounted) return;
    if (success) {
      Navigator.pop(context, true);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(portfolioProvider.errorMessage ?? 'Pozisyon kaydedilemedi'),
          backgroundColor: AppTheme.errorRed,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final marketProvider = context.watch<MarketProvider>();
    final assets = marketProvider.marketAssets;
    return Scaffold(
      appBar: AppBar(title: const Text('Pozisyon Ekle')),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            DropdownButtonFormField<String>(
              value: _selectedAssetKey,
              items: assets
                  .map(
                    (asset) => DropdownMenuItem(
                      value: asset.id,
                      child: Text('${asset.name} (${asset.symbol})'),
                    ),
                  )
                  .toList(),
              onChanged: (value) => setState(() => _selectedAssetKey = value),
              decoration: const InputDecoration(labelText: 'Varlik'),
              validator: (value) => value == null ? 'Varlik secin' : null,
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _quantityController,
              keyboardType: const TextInputType.numberWithOptions(decimal: true),
              decoration: const InputDecoration(labelText: 'Adet / Miktar'),
              validator: (value) {
                final parsed = double.tryParse(value ?? '');
                if (parsed == null || parsed <= 0) return 'Gecerli miktar girin';
                return null;
              },
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _avgCostController,
              keyboardType: const TextInputType.numberWithOptions(decimal: true),
              decoration: const InputDecoration(labelText: 'Alis Fiyati'),
              validator: (value) {
                final parsed = double.tryParse(value ?? '');
                if (parsed == null || parsed <= 0) return 'Gecerli fiyat girin';
                return null;
              },
            ),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              value: _currency,
              items: const [
                DropdownMenuItem(value: 'TRY', child: Text('TRY')),
                DropdownMenuItem(value: 'USD', child: Text('USD')),
                DropdownMenuItem(value: 'EUR', child: Text('EUR')),
              ],
              onChanged: (value) => setState(() => _currency = value ?? 'TRY'),
              decoration: const InputDecoration(labelText: 'Para Birimi'),
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _notesController,
              decoration: const InputDecoration(labelText: 'Not (opsiyonel)'),
              maxLines: 3,
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: _submit,
              child: const Text('Kaydet'),
            ),
          ],
        ),
      ),
    );
  }
}
