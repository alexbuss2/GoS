import 'dart:async';
import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:in_app_purchase/in_app_purchase.dart';

import '../core/constants.dart';

enum ProPurchaseStatus {
  success,
  unavailable,
  productNotFound,
  cancelled,
  pending,
  failed,
}

class ProPurchaseResult {
  const ProPurchaseResult({
    required this.status,
    this.receipt,
    this.message,
  });

  final ProPurchaseStatus status;
  final String? receipt;
  final String? message;
}

class PurchaseService {
  PurchaseService._internal();
  static final PurchaseService _instance = PurchaseService._internal();
  factory PurchaseService() => _instance;

  final InAppPurchase _inAppPurchase = InAppPurchase.instance;

  Future<ProPurchaseResult> purchaseProSubscription() async {
    if (!Platform.isAndroid && !Platform.isIOS) {
      return const ProPurchaseResult(
        status: ProPurchaseStatus.failed,
        message: 'Bu platformda satın alma desteklenmiyor.',
      );
    }

    final bool available = await _inAppPurchase.isAvailable();
    if (!available) {
      return const ProPurchaseResult(
        status: ProPurchaseStatus.unavailable,
        message: 'Satın alma servisi şu anda kullanılamıyor.',
      );
    }

    final ProductDetailsResponse productResponse =
        await _inAppPurchase.queryProductDetails({AppConstants.proSubscriptionId});

    if (productResponse.error != null) {
      return ProPurchaseResult(
        status: ProPurchaseStatus.failed,
        message: productResponse.error!.message,
      );
    }

    if (productResponse.productDetails.isEmpty) {
      return const ProPurchaseResult(
        status: ProPurchaseStatus.productNotFound,
        message: 'PRO abonelik ürünü Play Console tarafında bulunamadı.',
      );
    }

    final ProductDetails product = productResponse.productDetails.first;
    final Completer<ProPurchaseResult> completer = Completer<ProPurchaseResult>();

    late final StreamSubscription<List<PurchaseDetails>> purchaseSub;
    purchaseSub = _inAppPurchase.purchaseStream.listen(
      (List<PurchaseDetails> purchases) async {
        for (final PurchaseDetails purchase in purchases) {
          if (purchase.productID != product.id) {
            continue;
          }

          if (purchase.status == PurchaseStatus.pending) {
            if (!completer.isCompleted) {
              completer.complete(
                const ProPurchaseResult(status: ProPurchaseStatus.pending),
              );
            }
            continue;
          }

          if (purchase.pendingCompletePurchase) {
            await _inAppPurchase.completePurchase(purchase);
          }

          if (purchase.status == PurchaseStatus.purchased ||
              purchase.status == PurchaseStatus.restored) {
            if (!completer.isCompleted) {
              completer.complete(
                ProPurchaseResult(
                  status: ProPurchaseStatus.success,
                  receipt: purchase.verificationData.serverVerificationData,
                ),
              );
            }
            continue;
          }

          if (purchase.status == PurchaseStatus.canceled) {
            if (!completer.isCompleted) {
              completer.complete(
                const ProPurchaseResult(
                  status: ProPurchaseStatus.cancelled,
                  message: 'Satın alma iptal edildi.',
                ),
              );
            }
            continue;
          }

          if (purchase.status == PurchaseStatus.error) {
            if (!completer.isCompleted) {
              completer.complete(
                ProPurchaseResult(
                  status: ProPurchaseStatus.failed,
                  message: purchase.error?.message ?? 'Satın alma başarısız oldu.',
                ),
              );
            }
          }
        }
      },
      onError: (Object e) {
        if (!completer.isCompleted) {
          completer.complete(
            ProPurchaseResult(
              status: ProPurchaseStatus.failed,
              message: e.toString(),
            ),
          );
        }
      },
    );

    try {
      final PurchaseParam purchaseParam = PurchaseParam(productDetails: product);
      final bool started = await _inAppPurchase.buyNonConsumable(
        purchaseParam: purchaseParam,
      );

      if (!started) {
        return const ProPurchaseResult(
          status: ProPurchaseStatus.failed,
          message: 'Satın alma akışı başlatılamadı.',
        );
      }

      final ProPurchaseResult result = await completer.future.timeout(
        const Duration(minutes: 2),
        onTimeout: () => const ProPurchaseResult(
          status: ProPurchaseStatus.failed,
          message: 'Satın alma zaman aşımına uğradı.',
        ),
      );
      return result;
    } catch (e) {
      debugPrint('Purchase error: $e');
      return ProPurchaseResult(
        status: ProPurchaseStatus.failed,
        message: e.toString(),
      );
    } finally {
      await purchaseSub.cancel();
    }
  }
}
