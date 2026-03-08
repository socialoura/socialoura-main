'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

const ADS_STORAGE_KEY = 'socialoura_ads_params';

export interface AdsParams {
  keyword?: string;
  campaign?: string;
  device?: string;
}

/**
 * Hook to capture Google Ads URL parameters and store them in sessionStorage.
 * Call this on landing pages (/tiktok, /instagram, /t).
 * Parameters captured: ?keyword=, ?campaignid=, ?device=
 */
export function useAdsParams() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const keyword = searchParams.get('keyword');
    const campaign = searchParams.get('campaignid');
    const device = searchParams.get('device');

    // Only store if at least one param is present
    if (keyword || campaign || device) {
      const params: AdsParams = {};
      if (keyword) params.keyword = keyword;
      if (campaign) params.campaign = campaign;
      if (device) params.device = device;
      sessionStorage.setItem(ADS_STORAGE_KEY, JSON.stringify(params));
    }
  }, [searchParams]);
}

/**
 * Retrieve stored ads params (call at payment time).
 */
export function getStoredAdsParams(): AdsParams {
  try {
    const raw = sessionStorage.getItem(ADS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return {};
}
