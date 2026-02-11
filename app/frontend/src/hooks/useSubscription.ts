import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import type { SubscriptionStatus } from '@/types';

const FREE_ASSET_LIMIT = 5;

export function useSubscription() {
  const [status, setStatus] = useState<SubscriptionStatus>({
    is_pro: false,
    plan_type: 'free',
    asset_limit: FREE_ASSET_LIMIT,
    alerts_enabled: false,
    ads_enabled: true,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    try {
      const response = await api.apiCall.invoke({
        url: '/api/v1/payment/subscription-status',
        method: 'GET',
      });
      if (response?.data) {
        setStatus(response.data as SubscriptionStatus);
      }
    } catch (error) {
      console.error('Failed to fetch subscription status:', error);
      // Default to free
      setStatus({
        is_pro: false,
        plan_type: 'free',
        asset_limit: FREE_ASSET_LIMIT,
        alerts_enabled: false,
        ads_enabled: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const checkAssetLimit = useCallback((currentAssetCount: number): boolean => {
    if (status.is_pro) return true;
    return currentAssetCount < status.asset_limit;
  }, [status]);

  const canUseAlerts = useCallback((): boolean => {
    return status.alerts_enabled;
  }, [status]);

  const shouldShowAds = useCallback((): boolean => {
    return status.ads_enabled;
  }, [status]);

  const startCheckout = useCallback(async () => {
    try {
      const response = await api.apiCall.invoke({
        url: '/api/v1/payment/create-checkout-session',
        method: 'POST',
        data: {
          success_url: `${window.location.origin}/payment-success`,
          cancel_url: `${window.location.origin}/pro`,
        },
      });
      if (response?.data?.url) {
        api.utils.openUrl(response.data.url);
      }
    } catch (error) {
      console.error('Failed to start checkout:', error);
      throw error;
    }
  }, []);

  const verifyPayment = useCallback(async (sessionId: string) => {
    try {
      const response = await api.apiCall.invoke({
        url: '/api/v1/payment/verify-payment',
        method: 'POST',
        data: { session_id: sessionId },
      });
      if (response?.data?.is_pro) {
        await fetchStatus();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to verify payment:', error);
      return false;
    }
  }, [fetchStatus]);

  const cancelSubscription = useCallback(async () => {
    try {
      await api.apiCall.invoke({
        url: '/api/v1/payment/cancel-subscription',
        method: 'POST',
      });
      await fetchStatus();
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      throw error;
    }
  }, [fetchStatus]);

  return {
    status,
    isLoading,
    isPro: status.is_pro,
    assetLimit: status.asset_limit,
    checkAssetLimit,
    canUseAlerts,
    shouldShowAds,
    startCheckout,
    verifyPayment,
    cancelSubscription,
    refreshStatus: fetchStatus,
  };
}