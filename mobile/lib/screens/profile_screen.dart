import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';

import '../core/constants.dart';
import '../core/theme.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';
import '../services/purchase_service.dart';
import 'login_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  bool _isPurchasing = false;

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();
    final user = authProvider.currentUser;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Profil'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                children: [
                  CircleAvatar(
                    radius: 40,
                    backgroundColor: AppTheme.primaryGreen,
                    child: Text(
                      user?.name?.substring(0, 1).toUpperCase() ?? 'U',
                      style: const TextStyle(
                        fontSize: 32,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.textPrimary,
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    user?.name ?? 'Kullanıcı',
                    style: Theme.of(context).textTheme.headlineMedium,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    user?.email ?? '',
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                  const SizedBox(height: 16),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 8,
                    ),
                    decoration: BoxDecoration(
                      color: authProvider.isPro
                          ? AppTheme.primaryGold.withOpacity(0.2)
                          : AppTheme.textTertiary.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      authProvider.isPro ? '⭐ PRO ÜYE' : '🆓 ÜCRETSİZ',
                      style: TextStyle(
                        color: authProvider.isPro
                            ? AppTheme.primaryGold
                            : AppTheme.textSecondary,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),
          if (!authProvider.isPro)
            Card(
              color: AppTheme.primaryGold.withOpacity(0.1),
              child: InkWell(
                onTap: _isPurchasing
                    ? null
                    : () => _showProUpgradeDialog(context, authProvider),
                borderRadius: BorderRadius.circular(16),
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Icon(
                            Icons.star,
                            color: AppTheme.primaryGold,
                            size: 32,
                          ),
                          const SizedBox(width: 12),
                          Text(
                            'PRO Sürüme Geçin',
                            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                                  color: AppTheme.primaryGold,
                                  fontWeight: FontWeight.bold,
                                ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      _buildProFeature('Sınırsız varlık takibi'),
                      _buildProFeature('Reklamsız deneyim'),
                      _buildProFeature('Gelişmiş grafikler'),
                      _buildProFeature('Fiyat alarm bildirimleri'),
                      const SizedBox(height: 16),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: _isPurchasing
                              ? null
                              : () => _showProUpgradeDialog(context, authProvider),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppTheme.primaryGold,
                          ),
                          child: _isPurchasing
                              ? const SizedBox(
                                  width: 20,
                                  height: 20,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    color: Colors.black,
                                  ),
                                )
                              : const Text(
                                  'Şimdi Başla - 50₺/ay',
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 16,
                                  ),
                                ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          const SizedBox(height: 24),
          _buildSectionTitle(context, 'Ayarlar'),
          _buildSettingItem(
            context,
            icon: Icons.notifications_outlined,
            title: 'Bildirimler',
            onTap: () {},
          ),
          _buildSettingItem(
            context,
            icon: Icons.language_outlined,
            title: 'Dil',
            subtitle: 'Türkçe',
            onTap: () {},
          ),
          _buildSettingItem(
            context,
            icon: Icons.dark_mode_outlined,
            title: 'Tema',
            subtitle: 'Koyu Mod',
            onTap: () {},
          ),
          const SizedBox(height: 24),
          _buildSectionTitle(context, 'Hakkında'),
          _buildSettingItem(
            context,
            icon: Icons.info_outline,
            title: 'Uygulama Hakkında',
            onTap: () {},
          ),
          _buildSettingItem(
            context,
            icon: Icons.privacy_tip_outlined,
            title: 'Gizlilik Politikası',
            onTap: () => _openExternalUrl(AppConstants.privacyPolicyUrl),
          ),
          _buildSettingItem(
            context,
            icon: Icons.description_outlined,
            title: 'Kullanım Koşulları',
            onTap: () => _openExternalUrl(AppConstants.termsOfServiceUrl),
          ),
          const SizedBox(height: 24),
          OutlinedButton.icon(
            onPressed: () async {
              await authProvider.logout();
              if (context.mounted) {
                Navigator.pushReplacement(
                  context,
                  MaterialPageRoute(
                    builder: (context) => const LoginScreen(),
                  ),
                );
              }
            },
            icon: const Icon(Icons.logout, color: AppTheme.errorRed),
            label: const Text(
              'Çıkış Yap',
              style: TextStyle(color: AppTheme.errorRed),
            ),
            style: OutlinedButton.styleFrom(
              side: const BorderSide(color: AppTheme.errorRed),
              padding: const EdgeInsets.symmetric(vertical: 16),
            ),
          ),
          const SizedBox(height: 16),
          Center(
            child: Text(
              'Versiyon 1.0.0',
              style: Theme.of(context).textTheme.bodySmall,
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _openExternalUrl(String url) async {
    if (url.isEmpty) {
      _showSnackBar(context, 'Bu baglanti henuz ayarlanmadi.');
      return;
    }

    final bool launched = await launchUrl(
      Uri.parse(url),
      mode: LaunchMode.externalApplication,
    );
    if (!mounted) {
      return;
    }
    if (!launched) {
      _showSnackBar(context, 'Baglanti acilamadi: $url');
    }
  }

  Future<void> _handleProPurchase(AuthProvider authProvider) async {
    if (_isPurchasing) {
      return;
    }

    setState(() => _isPurchasing = true);
    try {
      final ProPurchaseResult result =
          await PurchaseService().purchaseProSubscription();

      if (!mounted) {
        return;
      }

      if (result.status == ProPurchaseStatus.success) {
        final String receipt = result.receipt ?? '';
        if (receipt.isEmpty) {
          _showSnackBar(context, 'Satin alma dogrulama verisi alinamadi.');
          return;
        }

        await ApiService().subscribeToPro(receipt);
        authProvider.updateProStatus(true);
        if (mounted) {
          _showSnackBar(
            context,
            'PRO aboneliginiz aktif edildi.',
            isError: false,
          );
        }
        return;
      }

      _showSnackBar(context, result.message ?? _purchaseStatusMessage(result.status));
    } catch (e) {
      if (mounted) {
        _showSnackBar(context, 'Satin alma islemi basarisiz oldu: $e');
      }
    } finally {
      if (mounted) {
        setState(() => _isPurchasing = false);
      }
    }
  }

  String _purchaseStatusMessage(ProPurchaseStatus status) {
    switch (status) {
      case ProPurchaseStatus.unavailable:
        return 'Satin alma servisi su anda kullanilamiyor.';
      case ProPurchaseStatus.productNotFound:
        return 'PRO urunu bulunamadi. Play Console ayarlarini kontrol edin.';
      case ProPurchaseStatus.cancelled:
        return 'Satin alma iptal edildi.';
      case ProPurchaseStatus.pending:
        return 'Satin alma islemi beklemede.';
      case ProPurchaseStatus.failed:
        return 'Satin alma basarisiz oldu.';
      case ProPurchaseStatus.success:
        return 'Satin alma basarili.';
    }
  }

  void _showSnackBar(
    BuildContext context,
    String message, {
    bool isError = true,
  }) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: isError ? AppTheme.errorRed : AppTheme.successGreen,
      ),
    );
  }

  Widget _buildProFeature(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          const Icon(
            Icons.check_circle,
            color: AppTheme.successGreen,
            size: 20,
          ),
          const SizedBox(width: 8),
          Text(
            text,
            style: const TextStyle(
              color: AppTheme.textPrimary,
              fontSize: 14,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(BuildContext context, String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text(
        title,
        style: Theme.of(context).textTheme.titleMedium?.copyWith(
              color: AppTheme.textSecondary,
            ),
      ),
    );
  }

  Widget _buildSettingItem(
    BuildContext context, {
    required IconData icon,
    required String title,
    String? subtitle,
    required VoidCallback onTap,
  }) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: Icon(icon, color: AppTheme.primaryGreen),
        title: Text(title),
        subtitle: subtitle != null ? Text(subtitle) : null,
        trailing: const Icon(Icons.chevron_right),
        onTap: onTap,
      ),
    );
  }

  void _showProUpgradeDialog(BuildContext context, AuthProvider authProvider) {
    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Row(
          children: [
            Icon(Icons.star, color: AppTheme.primaryGold),
            SizedBox(width: 8),
            Text('PRO Sürüme Geçin'),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'PRO özelliklerinin keyfini çıkarın:',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            _buildProFeature('Sınırsız varlık takibi'),
            _buildProFeature('Reklamsız deneyim'),
            _buildProFeature('Gelişmiş grafikler'),
            _buildProFeature('Fiyat alarm bildirimleri'),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppTheme.primaryGold.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    '50₺',
                    style: TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.primaryGold,
                    ),
                  ),
                  SizedBox(width: 8),
                  Text(
                    '/ay',
                    style: TextStyle(
                      fontSize: 16,
                      color: AppTheme.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext),
            child: const Text('Şimdi Değil'),
          ),
          ElevatedButton(
            onPressed: _isPurchasing
                ? null
                : () async {
                    Navigator.pop(dialogContext);
                    await _handleProPurchase(authProvider);
                  },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.primaryGold,
            ),
            child: const Text('Satın Al'),
          ),
        ],
      ),
    );
  }
}
