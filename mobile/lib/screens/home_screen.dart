import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/asset_provider.dart';
import '../widgets/asset_card.dart';
import '../widgets/ad_banner_widget.dart';
import '../core/theme.dart';
import 'search_screen.dart';
import 'profile_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;

  void switchToTab(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  final List<Widget> _screens = [
    const WatchlistTab(),
    const SearchScreen(),
    const ProfileScreen(),
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<AssetProvider>().refreshAssets();
    });
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();

    return Scaffold(
      body: _screens[_selectedIndex],
      bottomNavigationBar: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Show ads only for free users
          if (!authProvider.isPro) const AdBannerWidget(),
          
          NavigationBar(
            selectedIndex: _selectedIndex,
            onDestinationSelected: (index) {
              setState(() {
                _selectedIndex = index;
              });
            },
            backgroundColor: AppTheme.surfaceBg,
            indicatorColor: AppTheme.primaryGreen.withOpacity(0.3),
            destinations: const [
              NavigationDestination(
                icon: Icon(Icons.star_outline),
                selectedIcon: Icon(Icons.star),
                label: 'İzleme Listesi',
              ),
              NavigationDestination(
                icon: Icon(Icons.search),
                selectedIcon: Icon(Icons.search),
                label: 'Keşfet',
              ),
              NavigationDestination(
                icon: Icon(Icons.person_outline),
                selectedIcon: Icon(Icons.person),
                label: 'Profil',
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class WatchlistTab extends StatelessWidget {
  const WatchlistTab({super.key});

  @override
  Widget build(BuildContext context) {
    final assetProvider = context.watch<AssetProvider>();
    final authProvider = context.watch<AuthProvider>();

    return Scaffold(
      appBar: AppBar(
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('BİRİKİO'),
            if (assetProvider.isDemoMode) ...[
              const SizedBox(width: 8),
              const Chip(
                label: Text(
                  'DEMO',
                  style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold),
                ),
                backgroundColor: AppTheme.warningOrange,
                padding: EdgeInsets.symmetric(horizontal: 6, vertical: 0),
                visualDensity: VisualDensity.compact,
              ),
            ],
          ],
        ),
        actions: [
          if (!authProvider.isPro)
            const Padding(
              padding: EdgeInsets.only(right: 8),
              child: Chip(
                label: Text(
                  'ÜCRETSİZ',
                  style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold),
                ),
                backgroundColor: AppTheme.warningOrange,
                padding: EdgeInsets.zero,
              ),
            ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => assetProvider.refreshAssets(),
        child: assetProvider.isLoading && assetProvider.watchlist.isEmpty
            ? const Center(child: CircularProgressIndicator())
            : assetProvider.watchlist.isEmpty
                ? _buildEmptyState()
                : Column(
                    children: [
                      // Limit indicator for free users
                      if (!authProvider.isPro)
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(16),
                          margin: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: AppTheme.primaryGold.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: AppTheme.primaryGold.withOpacity(0.3),
                            ),
                          ),
                          child: Row(
                            children: [
                              const Icon(
                                Icons.info_outline,
                                color: AppTheme.primaryGold,
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Text(
                                  '${assetProvider.watchlist.length}/5 varlık izliyorsunuz',
                                  style: const TextStyle(
                                    color: AppTheme.textPrimary,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ),
                              TextButton(
                                onPressed: () {
                                  // Navigate to PRO screen
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder: (context) =>
                                          const ProfileScreen(),
                                    ),
                                  );
                                },
                                child: const Text('PRO AL'),
                              ),
                            ],
                          ),
                        ),
                      
                      Expanded(
                        child: ListView.builder(
                          itemCount: assetProvider.watchlist.length,
                          itemBuilder: (context, index) {
                            final asset = assetProvider.watchlist[index];
                            return AssetCard(
                              asset: asset,
                              showAddButton: true,
                              isInWatchlist: true,
                              onRemovePressed: () {
                                assetProvider.removeFromWatchlist(asset.id);
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
                      ),
                    ],
                  ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Builder(
      builder: (context) {
        return Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.star_outline,
                size: 80,
                color: AppTheme.textTertiary.withOpacity(0.5),
              ),
              const SizedBox(height: 16),
              Text(
                'İzleme listeniz boş',
                style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                      color: AppTheme.textSecondary,
                    ),
              ),
              const SizedBox(height: 8),
              Text(
                'Keşfet sekmesinden varlık ekleyin',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
              const SizedBox(height: 24),
              ElevatedButton.icon(
                onPressed: () {
                  // Find parent HomeScreen and switch tab
                  final homeState = context.findAncestorStateOfType<_HomeScreenState>();
                  homeState?.switchToTab(1);
                },
                icon: const Icon(Icons.search),
                label: const Text('Varlık Keşfet'),
              ),
            ],
          ),
        );
      },
    );
  }
}
