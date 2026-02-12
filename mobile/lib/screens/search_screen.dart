import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/market_provider.dart';
import '../providers/auth_provider.dart';
import '../widgets/asset_card.dart';
import '../core/theme.dart';
import '../core/constants.dart';
import 'asset_detail_screen.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<MarketProvider>().loadMarketAssets();
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final marketProvider = context.watch<MarketProvider>();
    final authProvider = context.watch<AuthProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Piyasalar'),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(110),
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.all(16),
                child: TextField(
                  controller: _searchController,
                  onChanged: (value) {
                    setState(() {
                      _searchQuery = value.toLowerCase();
                    });
                  },
                  decoration: const InputDecoration(
                    hintText: 'Ara...',
                    prefixIcon: Icon(Icons.search),
                    suffixIcon: Icon(Icons.tune),
                  ),
                ),
              ),
              TabBar(
                controller: _tabController,
                indicatorColor: AppTheme.primaryGreen,
                labelColor: AppTheme.textPrimary,
                unselectedLabelColor: AppTheme.textTertiary,
                tabs: const [
                  Tab(text: 'Altın'),
                  Tab(text: 'Döviz'),
                  Tab(text: 'Kripto'),
                ],
              ),
            ],
          ),
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildAssetList(
            marketProvider.goldAssets,
            marketProvider,
            authProvider,
          ),
          _buildAssetList(
            marketProvider.currencyAssets,
            marketProvider,
            authProvider,
          ),
          _buildAssetList(
            marketProvider.cryptoAssets,
            marketProvider,
            authProvider,
          ),
        ],
      ),
    );
  }

  Widget _buildAssetList(
    List assets,
    MarketProvider marketProvider,
    AuthProvider authProvider,
  ) {
    final filteredAssets = assets.where((asset) {
      if (_searchQuery.isEmpty) return true;
      return asset.name.toLowerCase().contains(_searchQuery) ||
          asset.symbol.toLowerCase().contains(_searchQuery);
    }).toList();

    if (marketProvider.isLoading && filteredAssets.isEmpty) {
      return const Center(child: CircularProgressIndicator());
    }

    if (filteredAssets.isEmpty) {
      return Builder(
        builder: (context) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.search_off,
                size: 64,
                color: AppTheme.textTertiary.withOpacity(0.5),
              ),
              const SizedBox(height: 16),
              Text(
                'Sonuç bulunamadı',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      color: AppTheme.textSecondary,
                    ),
              ),
            ],
          ),
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: () => marketProvider.loadMarketAssets(),
      child: ListView.builder(
        itemCount: filteredAssets.length,
        itemBuilder: (context, index) {
          final asset = filteredAssets[index];
          final isInWatchlist = marketProvider.isInWatchlist(asset.id);

          return AssetCard(
            asset: asset,
            showAddButton: true,
            isInWatchlist: isInWatchlist,
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => AssetDetailScreen(asset: asset),
                ),
              );
            },
            onAddPressed: () async {
              final messenger = ScaffoldMessenger.of(context);
              
              final success = await marketProvider.addToWatchlist(
                asset,
                authProvider.isPro,
              );

              if (!context.mounted) return;

              if (success) {
                messenger.showSnackBar(
                  SnackBar(
                    content: Text('${asset.name} izleme listesine eklendi'),
                    backgroundColor: AppTheme.successGreen,
                  ),
                );
              } else {
                // Show error
                if (marketProvider.errorMessage ==
                    AppConstants.errorFreeLimitReached) {
                  _showProUpgradeDialog(context);
                } else {
                  messenger.showSnackBar(
                    SnackBar(
                      content: Text(
                        marketProvider.errorMessage ?? 'Bir hata oluştu',
                      ),
                      backgroundColor: AppTheme.errorRed,
                    ),
                  );
                }
              }
            },
            onRemovePressed: () {
              marketProvider.removeFromWatchlist(asset.id);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('${asset.name} kaldırıldı'),
                  backgroundColor: AppTheme.successGreen,
                ),
              );
            },
          );
        },
      ),
    );
  }

  void _showProUpgradeDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('PRO Sürüme Geçin'),
        content: const Text(
          'Ücretsiz sürümde maksimum 5 varlık izleyebilirsiniz.\n\n'
          'PRO sürüme geçerek sınırsız varlık izleyin ve reklamsız deneyim yaşayın!',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('İptal'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              // Navigate to subscription screen
            },
            child: const Text('PRO AL - 50₺/ay'),
          ),
        ],
      ),
    );
  }
}
