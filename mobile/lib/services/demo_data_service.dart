import '../models/asset_model.dart';
import '../core/constants.dart';

class DemoDataService {
  static List<Asset> getDemoAssets() {
    return [
      // Gold
      Asset(
        id: 'gold_gram',
        name: 'Gram Altın',
        symbol: 'GAU',
        type: AppConstants.assetTypeGold,
        currentPrice: 2845.50,
        previousPrice: 2820.00,
        changePercent: 0.90,
        updatedAt: DateTime.now(),
      ),
      Asset(
        id: 'gold_quarter',
        name: 'Çeyrek Altın',
        symbol: 'QAU',
        type: AppConstants.assetTypeGold,
        currentPrice: 4620.00,
        previousPrice: 4580.00,
        changePercent: 0.87,
        updatedAt: DateTime.now(),
      ),
      Asset(
        id: 'gold_ons',
        name: 'ONS Altın',
        symbol: 'XAU',
        type: AppConstants.assetTypeGold,
        currentPrice: 88500.00,
        previousPrice: 88200.00,
        changePercent: 0.34,
        updatedAt: DateTime.now(),
      ),
      
      // Currency
      Asset(
        id: 'usd_try',
        name: 'Dolar',
        symbol: 'USD/TRY',
        type: AppConstants.assetTypeCurrency,
        currentPrice: 34.25,
        previousPrice: 34.10,
        changePercent: 0.44,
        updatedAt: DateTime.now(),
      ),
      Asset(
        id: 'eur_try',
        name: 'Euro',
        symbol: 'EUR/TRY',
        type: AppConstants.assetTypeCurrency,
        currentPrice: 37.15,
        previousPrice: 37.05,
        changePercent: 0.27,
        updatedAt: DateTime.now(),
      ),
      Asset(
        id: 'gbp_try',
        name: 'Sterlin',
        symbol: 'GBP/TRY',
        type: AppConstants.assetTypeCurrency,
        currentPrice: 43.80,
        previousPrice: 43.65,
        changePercent: 0.34,
        updatedAt: DateTime.now(),
      ),
      
      // Crypto
      Asset(
        id: 'btc_usdt',
        name: 'Bitcoin',
        symbol: 'BTC/USDT',
        type: AppConstants.assetTypeCrypto,
        currentPrice: 97850.00,
        previousPrice: 98200.00,
        changePercent: -0.36,
        updatedAt: DateTime.now(),
      ),
      Asset(
        id: 'eth_usdt',
        name: 'Ethereum',
        symbol: 'ETH/USDT',
        type: AppConstants.assetTypeCrypto,
        currentPrice: 3420.50,
        previousPrice: 3450.00,
        changePercent: -0.86,
        updatedAt: DateTime.now(),
      ),
      Asset(
        id: 'bnb_usdt',
        name: 'Binance Coin',
        symbol: 'BNB/USDT',
        type: AppConstants.assetTypeCrypto,
        currentPrice: 615.20,
        previousPrice: 610.00,
        changePercent: 0.85,
        updatedAt: DateTime.now(),
      ),
      Asset(
        id: 'xrp_usdt',
        name: 'Ripple',
        symbol: 'XRP/USDT',
        type: AppConstants.assetTypeCrypto,
        currentPrice: 2.45,
        previousPrice: 2.42,
        changePercent: 1.24,
        updatedAt: DateTime.now(),
      ),
      Asset(
        id: 'ada_usdt',
        name: 'Cardano',
        symbol: 'ADA/USDT',
        type: AppConstants.assetTypeCrypto,
        currentPrice: 0.98,
        previousPrice: 0.96,
        changePercent: 2.08,
        updatedAt: DateTime.now(),
      ),
      Asset(
        id: 'sol_usdt',
        name: 'Solana',
        symbol: 'SOL/USDT',
        type: AppConstants.assetTypeCrypto,
        currentPrice: 178.50,
        previousPrice: 175.20,
        changePercent: 1.88,
        updatedAt: DateTime.now(),
      ),
    ];
  }
}
