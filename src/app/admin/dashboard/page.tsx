'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Plus, Save, LogOut, Instagram, Music, AlertCircle, Settings, ShoppingCart, Eye, EyeOff, BarChart3, Search, Filter, MessageSquare, X, ChevronDown, ChevronRight, Tag, Percent, Calendar, Hash, Zap } from 'lucide-react';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';
import FunnelOrderSummary from '@/components/admin/FunnelOrderSummary';
import CustomerLoyaltyBadge from '@/components/CustomerLoyaltyBadge';

interface Goal {
  followers: string;
  price: string;
}

interface PricingData {
  instagram: Goal[];
  tiktok: Goal[];
  twitter: Goal[];
  instagram_likes: Goal[];
  tiktok_views: Goal[];
  tiktok_likes: Goal[];
  youtube_views: Goal[];
  linkedin_followers: Goal[];
}

interface Order {
  id: number;
  username: string;
  email: string;
  platform: string;
  followers: number;
  price: number;
  cost?: number;
  payment_status: string;
  payment_intent_id: string | null;
  created_at: string;
  order_status?: string;
  notes?: string;
  country?: string;
  order_source?: string;
  customer_total_orders?: number;
  customer_order_number?: number;
  funnel_data?: {
    username: string;
    avatarUrl: string;
    services: Array<{
      type: string;
      quantity: number;
      price: number;
      distribution?: Array<{
        postId: string;
        shortcode: string;
        imageUrl: string;
        quantityAllocated: number;
      }>;
    }>;
  };
}

type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

interface DeleteConfirmation {
  isOpen: boolean;
  platform: 'instagram' | 'tiktok' | 'twitter' | 'instagram_likes' | 'tiktok_views' | 'tiktok_likes' | 'youtube_views' | 'linkedin_followers' | null;
  index: number | null;
  followers: string;
}

interface OrderDeleteConfirmation {
  isOpen: boolean;
  orderId: number | null;
  username: string;
}

interface PromoCode {
  id: number;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  max_uses: number | null;
  current_uses: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

interface GoogleAdsExpense {
  month: string;
  amount: number;
  updated_at?: string;
}

type PromoBarConfig = {
  enabled: boolean;
  code: string;
  percentOff: number;
  durationHours: number;
  showCountdown: boolean;
  badgeText: Record<'en' | 'fr' | 'de', string>;
  messageText: Record<'en' | 'fr' | 'de', string>;
  excludePaths: string[];
  includePaths: string[];
  bgColor: string;
  textColor: string;
  accentColor: string;
  size: 'sm' | 'md' | 'lg';
};

type TabType = 'pricing' | 'settings' | 'orders' | 'analytics' | 'promo' | 'funnel';

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('pricing');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [pricing, setPricing] = useState<PricingData>({
    instagram: [],
    tiktok: [],
    twitter: [],
    instagram_likes: [],
    tiktok_views: [],
    tiktok_likes: [],
    youtube_views: [],
    linkedin_followers: [],
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    repeatPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [showStripeSecretKey, setShowStripeSecretKey] = useState(false);
  const [stripeSettings, setStripeSettings] = useState({
    secretKey: '',
    publishableKey: '',
    hasSecretKey: false,
    hasPublishableKey: false,
  });
  const [message, setMessage] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState<DeleteConfirmation>({
    isOpen: false,
    platform: null,
    index: null,
    followers: '',
  });
  const [orderDeleteConfirmation, setOrderDeleteConfirmation] = useState<OrderDeleteConfirmation>({
    isOpen: false,
    orderId: null,
    username: '',
  });

  // Order management states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDateRange, setFilterDateRange] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [editingNotes, setEditingNotes] = useState<number | null>(null);
  const [tempNotes, setTempNotes] = useState('');
  const [editingCost, setEditingCost] = useState<number | null>(null);
  const [tempCost, setTempCost] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  // Funnel pricing states
  type FunnelTier = { qty: number; price: number; oldPrice: number; bonus: number };
  const [funnelPricing, setFunnelPricing] = useState<Record<string, FunnelTier[]>>({});
  const [, setFunnelPricingLoaded] = useState(false);
  const [isSavingFunnel, setIsSavingFunnel] = useState(false);
  const [funnelMessage, setFunnelMessage] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

  // Funnel defaults states
  const [funnelDefaults, setFunnelDefaults] = useState<Record<string, number>>({
    followers: 1,
    likes: 1,
    views: 0,
    'story-views': 0,
  });
  const [isSavingDefaults, setIsSavingDefaults] = useState(false);
  const [defaultsMessage, setDefaultsMessage] = useState('');

  // Currency pricing states
  const SUPPORTED_CURRENCIES = ['usd', 'gbp', 'chf', 'cad', 'aud', 'nzd', 'brl', 'mxn', 'sek', 'pln', 'dkk'] as const;
  const CURRENCY_LABELS: Record<string, string> = {
    usd: '🇺🇸 USD ($)', gbp: '🇬🇧 GBP (£)', chf: '🇨🇭 CHF', cad: '🇨🇦 CAD ($)',
    aud: '🇦🇺 AUD ($)', nzd: '🇳🇿 NZD ($)', brl: '🇧🇷 BRL (R$)', mxn: '🇲🇽 MXN ($)', sek: '🇸🇪 SEK (kr)',
    pln: '🇵🇱 PLN (zł)', dkk: '🇩🇰 DKK (kr)',
  };
  const [currencyPricing, setCurrencyPricing] = useState<Record<string, Record<string, FunnelTier[]>>>({});
  const [activeCurrency, setActiveCurrency] = useState<string>('usd');
  const [isSavingCurrency, setIsSavingCurrency] = useState(false);
  const [currencyMessage, setCurrencyMessage] = useState('');

  // Promo codes states
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [showPromoForm, setShowPromoForm] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);
  const [promoForm, setPromoForm] = useState({
    code: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: '',
    max_uses: '',
    expires_at: '',
  });
  const [promoDeleteConfirm, setPromoDeleteConfirm] = useState<{ isOpen: boolean; id: number | null; code: string }>({
    isOpen: false,
    id: null,
    code: '',
  });
  const [promoFieldEnabled, setPromoFieldEnabled] = useState(true);
  const [promoBarConfig, setPromoBarConfig] = useState<PromoBarConfig>({
    enabled: true,
    code: 'SOCIALOURA5',
    percentOff: 5,
    durationHours: 6,
    showCountdown: true,
    badgeText: {
      en: 'Limited offer',
      fr: 'Offre limitée',
      de: 'Zeitlich begrenzt',
    },
    messageText: {
      en: 'Get 5% OFF with code',
      fr: 'Profite de -5% avec le code',
      de: 'Erhalte 5% Rabatt mit Code',
    },
    excludePaths: ['/ins-l', '/tik-v'],
    includePaths: [],
    bgColor: '#0a0a1a',
    textColor: '#e2e8f0',
    accentColor: '#a855f7',
    size: 'sm',
  });

  const [popularPackInstagram, setPopularPackInstagram] = useState<string>('');
  const [popularPackTiktok, setPopularPackTiktok] = useState<string>('');
  const [popularPackTwitter, setPopularPackTwitter] = useState<string>('');
  const [popularPackInstagramLikes, setPopularPackInstagramLikes] = useState<string>('');
  const [popularPackTiktokViews, setPopularPackTiktokViews] = useState<string>('');
  const [popularPackTiktokLikes, setPopularPackTiktokLikes] = useState<string>('');
  const [popularPackYoutubeViews, setPopularPackYoutubeViews] = useState<string>('');
  const [popularPackLinkedinFollowers, setPopularPackLinkedinFollowers] = useState<string>('');
  const [googleAdsExpenses, setGoogleAdsExpenses] = useState<GoogleAdsExpense[]>([]);
  const [googleAdsMonth, setGoogleAdsMonth] = useState('');
  const [googleAdsAmount, setGoogleAdsAmount] = useState('');

  // Operating expenses state
  interface OperatingExpenseItem { id: number; month: string; name: string; amount: number; }
  const [operatingExpenses, setOperatingExpenses] = useState<OperatingExpenseItem[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin');
      return;
    }

    if (activeTab === 'pricing') {
      fetchPricing();
    } else if (activeTab === 'orders' || activeTab === 'analytics') {
      fetchOrders();
      if (activeTab === 'analytics') {
        fetchGoogleAdsExpenses();
        fetchOperatingExpenses();
      }
    } else if (activeTab === 'settings') {
      fetchStripeSettings();
      setIsLoading(false);
    } else if (activeTab === 'promo') {
      fetchPromoCodes();
      fetchPromoFieldEnabled();
      fetchPromoBarConfig();
    } else if (activeTab === 'funnel') {
      fetchFunnelPricing();
      fetchFunnelDefaults();
      fetchCurrencyPricing();
    } else {
      setIsLoading(false);
    }
  }, [router, activeTab]);

  const fetchGoogleAdsExpenses = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/google-ads-expenses', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setGoogleAdsExpenses(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching Google Ads expenses:', error);
    }
  };

  const handleUpsertGoogleAdsExpense = async () => {
    if (!googleAdsMonth || !googleAdsAmount) return;

    setIsSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/google-ads-expenses', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ month: googleAdsMonth, amount: googleAdsAmount }),
      });

      if (response.ok) {
        setGoogleAdsMonth('');
        setGoogleAdsAmount('');
        await fetchGoogleAdsExpenses();
      }
    } catch (error) {
      console.error('Error updating Google Ads expense:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const fetchOperatingExpenses = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/operating-expenses', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setOperatingExpenses(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching operating expenses:', error);
    }
  };

  const handleAddOperatingExpense = async (month: string, name: string, amount: number) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch('/api/admin/operating-expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ month, name, amount }),
    });
    if (response.ok) {
      await fetchOperatingExpenses();
    }
  };

  const handleDeleteOperatingExpense = async (id: number) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`/api/admin/operating-expenses?id=${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (response.ok) {
      await fetchOperatingExpenses();
    }
  };

  const fetchPricing = async () => {
    try {
      const response = await fetch('/api/admin/pricing');
      if (response.ok) {
        const data = await response.json();
        setPricing({ instagram: data.instagram, tiktok: data.tiktok, twitter: data.twitter || [], instagram_likes: data.instagram_likes || [], tiktok_views: data.tiktok_views || [], tiktok_likes: data.tiktok_likes || [], youtube_views: data.youtube_views || [], linkedin_followers: data.linkedin_followers || [] });
        if (data.popularPackInstagram) setPopularPackInstagram(data.popularPackInstagram);
        if (data.popularPackTiktok) setPopularPackTiktok(data.popularPackTiktok);
        if (data.popularPackTwitter) setPopularPackTwitter(data.popularPackTwitter);
        if (data.popularPackInstagramLikes) setPopularPackInstagramLikes(data.popularPackInstagramLikes);
        if (data.popularPackTiktokViews) setPopularPackTiktokViews(data.popularPackTiktokViews);
        if (data.popularPackTiktokLikes) setPopularPackTiktokLikes(data.popularPackTiktokLikes);
        if (data.popularPackYoutubeViews) setPopularPackYoutubeViews(data.popularPackYoutubeViews);
        if (data.popularPackLinkedinFollowers) setPopularPackLinkedinFollowers(data.popularPackLinkedinFollowers);
      }
    } catch (error) {
      console.error('Error fetching pricing:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update order cost
  const handleSaveCost = async (orderId: number) => {
    setUpdatingOrderId(orderId);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/orders/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ orderId, cost: tempCost }),
      });

      if (response.ok) {
        setOrders(prev => prev.map(order =>
          order.id === orderId ? { ...order, cost: Number(tempCost) } : order
        ));
        setEditingCost(null);
        setTempCost('');
      }
    } catch (error) {
      console.error('Error updating order cost:', error);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStripeSettings = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/stripe-settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setStripeSettings(data);
      }
    } catch (error) {
      console.error('Error fetching Stripe settings:', error);
    }
  };

  const fetchPromoCodes = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/promo-codes', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setPromoCodes(data);
      }
    } catch (error) {
      console.error('Error fetching promo codes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFunnelPricing = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/funnel-pricing', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setFunnelPricing(data);
        setFunnelPricingLoaded(true);
      }
    } catch (error) {
      console.error('Error fetching funnel pricing:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFunnelDefaults = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/funnel-defaults', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setFunnelDefaults(data);
      }
    } catch (error) {
      console.error('Error fetching funnel defaults:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveFunnelDefaults = async () => {
    setIsSavingDefaults(true);
    setDefaultsMessage('');
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/funnel-defaults', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(funnelDefaults),
      });
      if (response.ok) {
        setDefaultsMessage('Sélections par défaut enregistrées avec succès !');
      } else {
        setDefaultsMessage('Échec de l\'enregistrement.');
      }
    } catch (error) {
      console.error('Error saving funnel defaults:', error);
      setDefaultsMessage('Erreur lors de l\'enregistrement.');
    } finally {
      setIsSavingDefaults(false);
      setTimeout(() => setDefaultsMessage(''), 3000);
    }
  };

  const saveFunnelPricing = async () => {
    setIsSavingFunnel(true);
    setFunnelMessage('');
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/funnel-pricing', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(funnelPricing),
      });
      if (response.ok) {
        setFunnelMessage('Funnel pricing saved successfully!');
      } else {
        setFunnelMessage('Failed to save funnel pricing.');
      }
    } catch (error) {
      console.error('Error saving funnel pricing:', error);
      setFunnelMessage('Error saving funnel pricing.');
    } finally {
      setIsSavingFunnel(false);
      setTimeout(() => setFunnelMessage(''), 3000);
    }
  };

  const updateFunnelTier = (serviceType: string, tierIndex: number, field: keyof FunnelTier, value: number) => {
    setFunnelPricing(prev => {
      const updated = { ...prev };
      const tiers = [...(updated[serviceType] || [])];
      tiers[tierIndex] = { ...tiers[tierIndex], [field]: value };
      updated[serviceType] = tiers;
      return updated;
    });
  };

  const addFunnelTier = (serviceType: string) => {
    setFunnelPricing(prev => {
      const updated = { ...prev };
      const tiers = [...(updated[serviceType] || [])];
      const lastTier = tiers[tiers.length - 1];
      tiers.push({
        qty: lastTier ? lastTier.qty * 2 : 100,
        price: lastTier ? lastTier.price * 1.8 : 2.99,
        oldPrice: lastTier ? lastTier.oldPrice * 1.8 : 9.99,
        bonus: lastTier ? lastTier.bonus * 2 : 10,
      });
      updated[serviceType] = tiers;
      return updated;
    });
  };

  const removeFunnelTier = (serviceType: string, tierIndex: number) => {
    setFunnelPricing(prev => {
      const updated = { ...prev };
      const tiers = [...(updated[serviceType] || [])];
      tiers.splice(tierIndex, 1);
      updated[serviceType] = tiers;
      return updated;
    });
  };

  // Currency pricing functions
  const fetchCurrencyPricing = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/funnel-currency-pricing', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setCurrencyPricing(data);
      }
    } catch (error) {
      console.error('Error fetching currency pricing:', error);
    }
  };

  const saveCurrencyPricing = async () => {
    setIsSavingCurrency(true);
    setCurrencyMessage('');
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/funnel-currency-pricing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(currencyPricing),
      });
      if (response.ok) {
        setCurrencyMessage('Currency pricing saved successfully!');
      } else {
        setCurrencyMessage('Failed to save currency pricing.');
      }
    } catch (error) {
      console.error('Error saving currency pricing:', error);
      setCurrencyMessage('Error saving currency pricing.');
    } finally {
      setIsSavingCurrency(false);
      setTimeout(() => setCurrencyMessage(''), 3000);
    }
  };

  const initCurrencyFromEur = (cur: string) => {
    setCurrencyPricing(prev => ({
      ...prev,
      [cur]: JSON.parse(JSON.stringify(funnelPricing)),
    }));
  };

  const updateCurrencyTier = (cur: string, serviceType: string, tierIndex: number, field: keyof FunnelTier, value: number) => {
    setCurrencyPricing(prev => {
      const updated = JSON.parse(JSON.stringify(prev));
      if (!updated[cur]) updated[cur] = {};
      if (!updated[cur][serviceType]) updated[cur][serviceType] = [];
      if (updated[cur][serviceType][tierIndex]) {
        updated[cur][serviceType][tierIndex][field] = value;
      }
      return updated;
    });
  };

  const removeCurrencyConfig = (cur: string) => {
    setCurrencyPricing(prev => {
      const updated = { ...prev };
      delete updated[cur];
      return updated;
    });
  };

  const fetchPromoFieldEnabled = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/promo-settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setPromoFieldEnabled(data.enabled);
      }
    } catch (error) {
      console.error('Error fetching promo field setting:', error);
    }
  };

  const fetchPromoBarConfig = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/promo-bar-settings', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        if (data?.config) {
          setPromoBarConfig(data.config);
        }
      }
    } catch (error) {
      console.error('Error fetching promo bar config:', error);
    }
  };

  const handleSavePromoBarConfig = async () => {
    setIsSaving(true);
    setMessage('');
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/promo-bar-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ config: promoBarConfig }),
      });

      if (response.ok) {
        setMessage('Promo bar updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        const data = await response.json();
        setMessage(data.error || 'Failed to update promo bar');
      }
    } catch (error) {
      console.error('Error updating promo bar config:', error);
      setMessage('An error occurred while saving');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePromoField = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/promo-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ enabled: !promoFieldEnabled }),
      });
      if (response.ok) {
        setPromoFieldEnabled(!promoFieldEnabled);
        setMessage(promoFieldEnabled ? 'Promo code field disabled' : 'Promo code field enabled');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error toggling promo field:', error);
    }
  };

  const handleCreatePromoCode = async () => {
    if (!promoForm.code || !promoForm.discount_value) {
      setMessage('Code and discount value are required');
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/promo-codes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: promoForm.code,
          discount_type: promoForm.discount_type,
          discount_value: parseFloat(promoForm.discount_value),
          max_uses: promoForm.max_uses ? parseInt(promoForm.max_uses) : null,
          expires_at: promoForm.expires_at || null,
        }),
      });

      if (response.ok) {
        setMessage('Promo code created successfully!');
        setShowPromoForm(false);
        setPromoForm({ code: '', discount_type: 'percentage', discount_value: '', max_uses: '', expires_at: '' });
        fetchPromoCodes();
      } else {
        const error = await response.json();
        setMessage(error.error || 'Error creating promo code');
      }
    } catch (error) {
      console.error('Error creating promo code:', error);
      setMessage('Error creating promo code');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePromoCode = async () => {
    if (!editingPromo) return;

    setIsSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/promo-codes', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: editingPromo.id,
          code: promoForm.code,
          discount_type: promoForm.discount_type,
          discount_value: parseFloat(promoForm.discount_value),
          max_uses: promoForm.max_uses ? parseInt(promoForm.max_uses) : null,
          expires_at: promoForm.expires_at || null,
        }),
      });

      if (response.ok) {
        setMessage('Promo code updated successfully!');
        setEditingPromo(null);
        setShowPromoForm(false);
        setPromoForm({ code: '', discount_type: 'percentage', discount_value: '', max_uses: '', expires_at: '' });
        fetchPromoCodes();
      }
    } catch (error) {
      console.error('Error updating promo code:', error);
      setMessage('Error updating promo code');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePromoActive = async (promo: PromoCode) => {
    try {
      const token = localStorage.getItem('adminToken');
      await fetch('/api/admin/promo-codes', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: promo.id,
          is_active: !promo.is_active,
        }),
      });
      fetchPromoCodes();
    } catch (error) {
      console.error('Error toggling promo code:', error);
    }
  };

  const handleDeletePromoCode = async () => {
    if (!promoDeleteConfirm.id) return;

    try {
      const token = localStorage.getItem('adminToken');
      await fetch(`/api/admin/promo-codes?id=${promoDeleteConfirm.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setPromoDeleteConfirm({ isOpen: false, id: null, code: '' });
      fetchPromoCodes();
    } catch (error) {
      console.error('Error deleting promo code:', error);
    }
  };

  const openEditPromo = (promo: PromoCode) => {
    setEditingPromo(promo);
    setPromoForm({
      code: promo.code,
      discount_type: promo.discount_type,
      discount_value: promo.discount_value.toString(),
      max_uses: promo.max_uses?.toString() || '',
      expires_at: promo.expires_at ? promo.expires_at.split('T')[0] : '',
    });
    setShowPromoForm(true);
  };

  // Update order status
  const handleUpdateOrderStatus = async (orderId: number, newStatus: OrderStatus) => {
    setUpdatingOrderId(orderId);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/orders/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ orderId, orderStatus: newStatus }),
      });

      if (response.ok) {
        setOrders(prev => prev.map(order => 
          order.id === orderId ? { ...order, order_status: newStatus } : order
        ));
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Update order notes
  const handleSaveNotes = async (orderId: number) => {
    setUpdatingOrderId(orderId);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/orders/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ orderId, notes: tempNotes }),
      });

      if (response.ok) {
        setOrders(prev => prev.map(order => 
          order.id === orderId ? { ...order, notes: tempNotes } : order
        ));
        setEditingNotes(null);
        setTempNotes('');
      }
    } catch (error) {
      console.error('Error updating order notes:', error);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!order.username.toLowerCase().includes(query) && 
          !order.email?.toLowerCase().includes(query)) {
        return false;
      }
    }

    // Platform filter
    if (filterPlatform !== 'all' && order.platform !== filterPlatform) {
      return false;
    }

    // Status filter
    if (filterStatus !== 'all') {
      const orderStatus = order.order_status || 'pending';
      if (orderStatus !== filterStatus) {
        return false;
      }
    }

    // Date filter
    if (filterDateRange !== 'all') {
      const orderDate = new Date(order.created_at);
      const now = new Date();
      
      if (filterDateRange === 'today') {
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        if (orderDate < todayStart) return false;
      } else if (filterDateRange === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (orderDate < weekAgo) return false;
      } else if (filterDateRange === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        if (orderDate < monthAgo) return false;
      }
    }

    return true;
  });

  const handleAddGoal = (platform: 'instagram' | 'tiktok' | 'twitter' | 'instagram_likes' | 'tiktok_views' | 'tiktok_likes' | 'youtube_views' | 'linkedin_followers') => {
    setPricing((prev) => ({
      ...prev,
      [platform]: [...prev[platform], { followers: '', price: '' }],
    }));
  };

  const handleRemoveGoal = (platform: 'instagram' | 'tiktok' | 'twitter' | 'instagram_likes' | 'tiktok_views' | 'tiktok_likes' | 'youtube_views' | 'linkedin_followers', index: number) => {
    const goal = pricing[platform][index];
    setDeleteConfirmation({
      isOpen: true,
      platform,
      index,
      followers: goal.followers,
    });
  };

  const confirmDelete = () => {
    if (deleteConfirmation.platform && deleteConfirmation.index !== null) {
      setPricing((prev) => ({
        ...prev,
        [deleteConfirmation.platform!]: prev[deleteConfirmation.platform!].filter((_, i) => i !== deleteConfirmation.index),
      }));
    }
    setDeleteConfirmation({ isOpen: false, platform: null, index: null, followers: '' });
  };

  const cancelDelete = () => {
    setDeleteConfirmation({ isOpen: false, platform: null, index: null, followers: '' });
  };

  const handleDeleteOrder = (orderId: number, username: string) => {
    setOrderDeleteConfirmation({ isOpen: true, orderId, username });
  };

  const confirmDeleteOrder = async () => {
    if (!orderDeleteConfirmation.orderId) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/orders/delete/${orderDeleteConfirmation.orderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Remove the order from the state
        setOrders(orders.filter(order => order.id !== orderDeleteConfirmation.orderId));
        setMessage('Order deleted successfully');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to delete order');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      setMessage('Error deleting order');
      setTimeout(() => setMessage(''), 3000);
    }

    setOrderDeleteConfirmation({ isOpen: false, orderId: null, username: '' });
  };

  const cancelDeleteOrder = () => {
    setOrderDeleteConfirmation({ isOpen: false, orderId: null, username: '' });
  };

  const handleUpdateGoal = (
    platform: 'instagram' | 'tiktok' | 'twitter' | 'instagram_likes' | 'tiktok_views' | 'tiktok_likes' | 'youtube_views' | 'linkedin_followers',
    index: number,
    field: 'followers' | 'price',
    value: string
  ) => {
    setPricing((prev) => ({
      ...prev,
      [platform]: prev[platform].map((goal, i) =>
        i === index ? { ...goal, [field]: value } : goal
      ),
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage('');

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/pricing', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...pricing,
          popularPackInstagram,
          popularPackTiktok,
          popularPackTwitter,
          popularPackInstagramLikes,
          popularPackTiktokViews,
          popularPackTiktokLikes,
          popularPackYoutubeViews,
          popularPackLinkedinFollowers,
        }),
      });

      if (response.ok) {
        setMessage('Pricing updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        const data = await response.json();
        setMessage(data.error || 'Failed to update pricing');
      }
    } catch (error) {
      console.error('Error saving pricing:', error);
      setMessage('An error occurred while saving');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    setMessage('');

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.repeatPassword) {
      setMessage('All fields are required');
      return;
    }

    if (passwordData.newPassword !== passwordData.repeatPassword) {
      setMessage('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setMessage('New password must be at least 8 characters');
      return;
    }

    setIsSaving(true);

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (response.ok) {
        setMessage('Password updated successfully!');
        setPasswordData({ currentPassword: '', newPassword: '', repeatPassword: '' });
        setTimeout(() => setMessage(''), 3000);
      } else {
        const data = await response.json();
        setMessage(data.error || 'Failed to update password');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      setMessage('An error occurred while saving');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStripeSettingsUpdate = async () => {
    setMessage('');

    if (!stripeSettings.secretKey || !stripeSettings.publishableKey) {
      setMessage('Both Stripe keys are required');
      return;
    }

    setIsSaving(true);

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/stripe-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          secretKey: stripeSettings.secretKey,
          publishableKey: stripeSettings.publishableKey,
        }),
      });

      if (response.ok) {
        setMessage('Stripe settings updated successfully!');
        await fetchStripeSettings();
        setTimeout(() => setMessage(''), 3000);
      } else {
        const data = await response.json();
        setMessage(data.error || 'Failed to update Stripe settings');
      }
    } catch (error) {
      console.error('Error updating Stripe settings:', error);
      setMessage('An error occurred while saving');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/admin');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-gray-400 mt-2">Manage your settings and orders</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-300 bg-black border border-gray-700 rounded-xl hover:bg-gray-800 transition-all shadow-sm hover:shadow-md"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-xl shadow-lg ${
              message.includes('success')
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                : 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
            } animate-in slide-in-from-top duration-300`}
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">{message}</span>
            </div>
          </div>
        )}

        <div className="mb-8 bg-black rounded-2xl shadow-xl border border-gray-800">
          <div className="flex flex-col sm:flex-row border-b border-gray-800">
            <button
              onClick={() => setActiveTab('pricing')}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-all ${
                activeTab === 'pricing'
                  ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-900/30'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
            >
              <Instagram className="w-5 h-5" />
              Social Media Pricing
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-all ${
                activeTab === 'settings'
                  ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-900/30'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
            >
              <Settings className="w-5 h-5" />
              Settings
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-all ${
                activeTab === 'orders'
                  ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-900/30'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              Orders
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-all ${
                activeTab === 'analytics'
                  ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-900/30'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('promo')}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-all ${
                activeTab === 'promo'
                  ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-900/30'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
            >
              <Tag className="w-5 h-5" />
              Promo Codes
            </button>
            <button
              onClick={() => setActiveTab('funnel')}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-all ${
                activeTab === 'funnel'
                  ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-900/30'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
            >
              <Zap className="w-5 h-5" />
              Funnel Pricing
            </button>
          </div>
        </div>

        {activeTab === 'pricing' && (
          <>
            <div className="mb-8 bg-black rounded-2xl shadow-xl p-8 border border-gray-800">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
                    <Instagram className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      Instagram Pricing
                    </h2>
                    <p className="text-sm text-gray-400 mt-0.5">
                      {pricing.instagram.length} option{pricing.instagram.length !== 1 ? 's' : ''} available
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleAddGoal('instagram')}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <Plus className="w-4 h-4" />
                  Add Goal
                </button>
              </div>

              <div className="grid gap-4">
                {pricing.instagram.map((goal, index) => (
                  <div
                    key={index}
                    className="group relative bg-gray-900/50 rounded-xl p-5 border border-gray-700 hover:shadow-lg transition-all"
                  >
                    <div className="flex gap-4 items-end">
                      <div className="flex-1">
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Followers
                        </label>
                        <input
                          type="text"
                          value={goal.followers}
                          onChange={(e) =>
                            handleUpdateGoal('instagram', index, 'followers', e.target.value)
                          }
                          placeholder="e.g., 100"
                          className="w-full px-4 py-3 border-2 border-gray-600 rounded-xl bg-black text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                        />
                      </div>

                      <div className="flex-1">
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Price (€)
                        </label>
                        <input
                          type="text"
                          value={goal.price}
                          onChange={(e) =>
                            handleUpdateGoal('instagram', index, 'price', e.target.value)
                          }
                          placeholder="e.g., 1.90"
                          className="w-full px-4 py-3 border-2 border-gray-600 rounded-xl bg-black text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                        />
                      </div>

                      <button
                        onClick={() => handleRemoveGoal('instagram', index)}
                        className="p-3 text-red-400 hover:bg-red-900/30 rounded-xl transition-all hover:scale-110 group-hover:shadow-md"
                        title="Delete this pricing option"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}

                {pricing.instagram.length === 0 && (
                  <div className="text-center py-12 px-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
                    <Instagram className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-400 font-medium">
                      No pricing goals yet. Click &quot;Add Goal&quot; to create one.
                    </p>
                  </div>
                )}
              </div>

              {/* Popular Pack Selector - Instagram */}
              {pricing.instagram.length > 0 && (
                <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800/50">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-300 whitespace-nowrap">
                      &quot;Most Popular&quot; badge on:
                    </span>
                    <select
                      value={popularPackInstagram}
                      onChange={(e) => setPopularPackInstagram(e.target.value)}
                      className="flex-1 px-4 py-2.5 border-2 border-purple-700 rounded-xl bg-black text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-sm font-medium"
                    >
                      <option value="">None</option>
                      {pricing.instagram.map((goal) => (
                        <option key={goal.followers} value={goal.followers}>
                          {parseInt(goal.followers).toLocaleString()} followers — {goal.price}€
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="mb-8 bg-black rounded-2xl shadow-xl p-8 border border-gray-800">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl shadow-lg">
                    <Music className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      TikTok Pricing
                    </h2>
                    <p className="text-sm text-gray-400 mt-0.5">
                      {pricing.tiktok.length} option{pricing.tiktok.length !== 1 ? 's' : ''} available
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleAddGoal('tiktok')}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl hover:from-pink-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <Plus className="w-4 h-4" />
                  Add Goal
                </button>
              </div>

              <div className="grid gap-4">
                {pricing.tiktok.map((goal, index) => (
                  <div
                    key={index}
                    className="group relative bg-gray-900/50 rounded-xl p-5 border border-gray-700 hover:shadow-lg transition-all"
                  >
                    <div className="flex gap-4 items-end">
                      <div className="flex-1">
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Followers
                        </label>
                        <input
                          type="text"
                          value={goal.followers}
                          onChange={(e) =>
                            handleUpdateGoal('tiktok', index, 'followers', e.target.value)
                          }
                          placeholder="e.g., 100"
                          className="w-full px-4 py-3 border-2 border-gray-600 rounded-xl bg-black text-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                        />
                      </div>

                      <div className="flex-1">
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Price (€)
                        </label>
                        <input
                          type="text"
                          value={goal.price}
                          onChange={(e) =>
                            handleUpdateGoal('tiktok', index, 'price', e.target.value)
                          }
                          placeholder="e.g., 2.90"
                          className="w-full px-4 py-3 border-2 border-gray-600 rounded-xl bg-black text-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                        />
                      </div>

                      <button
                        onClick={() => handleRemoveGoal('tiktok', index)}
                        className="p-3 text-red-400 hover:bg-red-900/30 rounded-xl transition-all hover:scale-110 group-hover:shadow-md"
                        title="Delete this pricing option"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}

                {pricing.tiktok.length === 0 && (
                  <div className="text-center py-12 px-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
                    <Music className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-400 font-medium">
                      No pricing goals yet. Click &quot;Add Goal&quot; to create one.
                    </p>
                  </div>
                )}
              </div>

              {/* Popular Pack Selector - TikTok */}
              {pricing.tiktok.length > 0 && (
                <div className="mt-6 p-4 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-xl border border-pink-200 dark:border-pink-800/50">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-300 whitespace-nowrap">
                      &quot;Most Popular&quot; badge on:
                    </span>
                    <select
                      value={popularPackTiktok}
                      onChange={(e) => setPopularPackTiktok(e.target.value)}
                      className="flex-1 px-4 py-2.5 border-2 border-pink-700 rounded-xl bg-black text-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all text-sm font-medium"
                    >
                      <option value="">None</option>
                      {pricing.tiktok.map((goal) => (
                        <option key={goal.followers} value={goal.followers}>
                          {parseInt(goal.followers).toLocaleString()} followers — {goal.price}€
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="mb-8 bg-black rounded-2xl shadow-xl p-8 border border-gray-800">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-gray-700 to-black rounded-xl shadow-lg">
                    <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      X (Twitter) Pricing
                    </h2>
                    <p className="text-sm text-gray-400 mt-0.5">
                      {pricing.twitter.length} option{pricing.twitter.length !== 1 ? 's' : ''} available
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleAddGoal('twitter')}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-gray-700 to-black rounded-xl hover:from-gray-800 hover:to-gray-900 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <Plus className="w-4 h-4" />
                  Add Goal
                </button>
              </div>

              <div className="grid gap-4">
                {pricing.twitter.map((goal, index) => (
                  <div
                    key={index}
                    className="group relative bg-gray-900/50 rounded-xl p-5 border border-gray-700 hover:shadow-lg transition-all"
                  >
                    <div className="flex gap-4 items-end">
                      <div className="flex-1">
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Followers
                        </label>
                        <input
                          type="text"
                          value={goal.followers}
                          onChange={(e) =>
                            handleUpdateGoal('twitter', index, 'followers', e.target.value)
                          }
                          placeholder="e.g., 100"
                          className="w-full px-4 py-3 border-2 border-gray-600 rounded-xl bg-black text-white focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all"
                        />
                      </div>

                      <div className="flex-1">
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Price (€)
                        </label>
                        <input
                          type="text"
                          value={goal.price}
                          onChange={(e) =>
                            handleUpdateGoal('twitter', index, 'price', e.target.value)
                          }
                          placeholder="e.g., 2.50"
                          className="w-full px-4 py-3 border-2 border-gray-600 rounded-xl bg-black text-white focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all"
                        />
                      </div>

                      <button
                        onClick={() => handleRemoveGoal('twitter', index)}
                        className="p-3 text-red-400 hover:bg-red-900/30 rounded-xl transition-all hover:scale-110 group-hover:shadow-md"
                        title="Delete this pricing option"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}

                {pricing.twitter.length === 0 && (
                  <div className="text-center py-12 px-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
                    <svg viewBox="0 0 24 24" className="w-12 h-12 text-gray-500 mx-auto mb-3" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    <p className="text-gray-400 font-medium">
                      No pricing goals yet. Click &quot;Add Goal&quot; to create one.
                    </p>
                  </div>
                )}
              </div>

              {/* Popular Pack Selector - Twitter */}
              {pricing.twitter.length > 0 && (
                <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 rounded-xl border border-gray-200 dark:border-gray-700/50">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-300 whitespace-nowrap">
                      &quot;Most Popular&quot; badge on:
                    </span>
                    <select
                      value={popularPackTwitter}
                      onChange={(e) => setPopularPackTwitter(e.target.value)}
                      className="flex-1 px-4 py-2.5 border-2 border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all text-sm font-medium"
                    >
                      <option value="">None</option>
                      {pricing.twitter.map((goal) => (
                        <option key={goal.followers} value={goal.followers}>
                          {parseInt(goal.followers).toLocaleString()} followers — {goal.price}€
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="mb-8 bg-black rounded-2xl shadow-xl p-8 border border-gray-800">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      Instagram Likes Pricing
                    </h2>
                    <p className="text-sm text-gray-400 mt-0.5">
                      {pricing.instagram_likes.length} option{pricing.instagram_likes.length !== 1 ? 's' : ''} available
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleAddGoal('instagram_likes')}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-pink-600 rounded-xl hover:from-red-600 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <Plus className="w-4 h-4" />
                  Add Goal
                </button>
              </div>

              <div className="grid gap-4">
                {pricing.instagram_likes.map((goal, index) => (
                  <div
                    key={index}
                    className="group relative bg-gray-900/50 rounded-xl p-5 border border-gray-700 hover:shadow-lg transition-all"
                  >
                    <div className="flex gap-4 items-end">
                      <div className="flex-1">
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Likes
                        </label>
                        <input
                          type="text"
                          value={goal.followers}
                          onChange={(e) =>
                            handleUpdateGoal('instagram_likes', index, 'followers', e.target.value)
                          }
                          placeholder="e.g., 100"
                          className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                        />
                      </div>

                      <div className="flex-1">
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Price (€)
                        </label>
                        <input
                          type="text"
                          value={goal.price}
                          onChange={(e) =>
                            handleUpdateGoal('instagram_likes', index, 'price', e.target.value)
                          }
                          placeholder="e.g., 0.99"
                          className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                        />
                      </div>

                      <button
                        onClick={() => handleRemoveGoal('instagram_likes', index)}
                        className="p-3 text-red-400 hover:bg-red-900/30 rounded-xl transition-all hover:scale-110 group-hover:shadow-md"
                        title="Delete this pricing option"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}

                {pricing.instagram_likes.length === 0 && (
                  <div className="text-center py-12 px-4 bg-red-50 dark:bg-red-900/10 rounded-xl border-2 border-dashed border-red-300 dark:border-red-800/30">
                    <svg className="w-12 h-12 text-red-400 dark:text-red-500 mx-auto mb-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    <p className="text-gray-400 font-medium">
                      No pricing goals yet. Click &quot;Add Goal&quot; to create one.
                    </p>
                  </div>
                )}
              </div>

              {/* Popular Pack Selector - Instagram Likes */}
              {pricing.instagram_likes.length > 0 && (
                <div className="mt-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/10 dark:to-pink-900/10 rounded-xl border border-red-200 dark:border-red-800/30">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-300 whitespace-nowrap">
                      &quot;Most Popular&quot; badge on:
                    </span>
                    <select
                      value={popularPackInstagramLikes}
                      onChange={(e) => setPopularPackInstagramLikes(e.target.value)}
                      className="flex-1 px-4 py-2.5 border-2 border-red-300 dark:border-red-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-sm font-medium"
                    >
                      <option value="">None</option>
                      {pricing.instagram_likes.map((goal) => (
                        <option key={goal.followers} value={goal.followers}>
                          {parseInt(goal.followers).toLocaleString()} likes — {goal.price}€
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="mb-8 bg-black rounded-2xl shadow-xl p-8 border border-gray-800">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-xl shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      TikTok Views Pricing
                    </h2>
                    <p className="text-sm text-gray-400 mt-0.5">
                      {pricing.tiktok_views.length} option{pricing.tiktok_views.length !== 1 ? 's' : ''} available
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleAddGoal('tiktok_views')}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-teal-600 rounded-xl hover:from-cyan-600 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <Plus className="w-4 h-4" />
                  Add Goal
                </button>
              </div>

              <div className="grid gap-4">
                {pricing.tiktok_views.map((goal, index) => (
                  <div
                    key={index}
                    className="group relative bg-gray-900/50 rounded-xl p-5 border border-gray-700 hover:shadow-lg transition-all"
                  >
                    <div className="flex gap-4 items-end">
                      <div className="flex-1">
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Views
                        </label>
                        <input
                          type="text"
                          value={goal.followers}
                          onChange={(e) =>
                            handleUpdateGoal('tiktok_views', index, 'followers', e.target.value)
                          }
                          placeholder="e.g., 1000"
                          className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                        />
                      </div>

                      <div className="flex-1">
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Price (€)
                        </label>
                        <input
                          type="text"
                          value={goal.price}
                          onChange={(e) =>
                            handleUpdateGoal('tiktok_views', index, 'price', e.target.value)
                          }
                          placeholder="e.g., 0.99"
                          className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                        />
                      </div>

                      <button
                        onClick={() => handleRemoveGoal('tiktok_views', index)}
                        className="p-3 text-red-400 hover:bg-red-900/30 rounded-xl transition-all hover:scale-110 group-hover:shadow-md"
                        title="Delete this pricing option"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}

                {pricing.tiktok_views.length === 0 && (
                  <div className="text-center py-12 px-4 bg-cyan-50 dark:bg-cyan-900/10 rounded-xl border-2 border-dashed border-cyan-300 dark:border-cyan-800/30">
                    <svg className="w-12 h-12 text-cyan-400 dark:text-cyan-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <p className="text-gray-400 font-medium">
                      No pricing goals yet. Click &quot;Add Goal&quot; to create one.
                    </p>
                  </div>
                )}
              </div>

              {/* Popular Pack Selector - TikTok Views */}
              {pricing.tiktok_views.length > 0 && (
                <div className="mt-6 p-4 bg-gradient-to-r from-cyan-50 to-teal-50 dark:from-cyan-900/10 dark:to-teal-900/10 rounded-xl border border-cyan-200 dark:border-cyan-800/30">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-300 whitespace-nowrap">
                      &quot;Most Popular&quot; badge on:
                    </span>
                    <select
                      value={popularPackTiktokViews}
                      onChange={(e) => setPopularPackTiktokViews(e.target.value)}
                      className="flex-1 px-4 py-2.5 border-2 border-cyan-300 dark:border-cyan-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-sm font-medium"
                    >
                      <option value="">None</option>
                      {pricing.tiktok_views.map((goal) => (
                        <option key={goal.followers} value={goal.followers}>
                          {parseInt(goal.followers).toLocaleString()} views — {goal.price}€
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* TikTok Likes Pricing Section */}
            <div className="mb-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-rose-100 dark:border-rose-900/30">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      TikTok Likes Pricing
                    </h2>
                    <p className="text-sm text-gray-400 mt-0.5">
                      {pricing.tiktok_likes.length} option{pricing.tiktok_likes.length !== 1 ? 's' : ''} available
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleAddGoal('tiktok_likes')}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-rose-500 to-pink-600 rounded-xl hover:from-rose-600 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <Plus className="w-4 h-4" />
                  Add Goal
                </button>
              </div>

              <div className="grid gap-4">
                {pricing.tiktok_likes.map((goal, index) => (
                  <div
                    key={index}
                    className="group relative bg-gray-900/50 rounded-xl p-5 border border-gray-700 hover:shadow-lg transition-all"
                  >
                    <div className="flex gap-4 items-end">
                      <div className="flex-1">
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Likes
                        </label>
                        <input
                          type="text"
                          value={goal.followers}
                          onChange={(e) =>
                            handleUpdateGoal('tiktok_likes', index, 'followers', e.target.value)
                          }
                          placeholder="e.g., 50"
                          className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all"
                        />
                      </div>

                      <div className="flex-1">
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Price (€)
                        </label>
                        <input
                          type="text"
                          value={goal.price}
                          onChange={(e) =>
                            handleUpdateGoal('tiktok_likes', index, 'price', e.target.value)
                          }
                          placeholder="e.g., 1.49"
                          className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all"
                        />
                      </div>

                      <button
                        onClick={() => handleRemoveGoal('tiktok_likes', index)}
                        className="p-3 text-red-400 hover:bg-red-900/30 rounded-xl transition-all hover:scale-110 group-hover:shadow-md"
                        title="Delete this pricing option"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}

                {pricing.tiktok_likes.length === 0 && (
                  <div className="text-center py-12 px-4 bg-rose-50 dark:bg-rose-900/10 rounded-xl border-2 border-dashed border-rose-300 dark:border-rose-800/30">
                    <svg className="w-12 h-12 text-rose-400 dark:text-rose-500 mx-auto mb-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    <p className="text-gray-400 font-medium">
                      No pricing goals yet. Click &quot;Add Goal&quot; to create one.
                    </p>
                  </div>
                )}
              </div>

              {/* Popular Pack Selector - TikTok Likes */}
              {pricing.tiktok_likes.length > 0 && (
                <div className="mt-6 p-4 bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/10 dark:to-pink-900/10 rounded-xl border border-rose-200 dark:border-rose-800/30">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-300 whitespace-nowrap">
                      &quot;Most Popular&quot; badge on:
                    </span>
                    <select
                      value={popularPackTiktokLikes}
                      onChange={(e) => setPopularPackTiktokLikes(e.target.value)}
                      className="flex-1 px-4 py-2.5 border-2 border-rose-300 dark:border-rose-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all text-sm font-medium"
                    >
                      <option value="">None</option>
                      {pricing.tiktok_likes.map((goal) => (
                        <option key={goal.followers} value={goal.followers}>
                          {parseInt(goal.followers).toLocaleString()} likes — {goal.price}€
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* YouTube Views Pricing */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-red-100 dark:border-red-900/30">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl shadow-lg">
                    <Eye className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      YouTube Views
                    </h2>
                    <p className="text-sm text-gray-400 mt-0.5">
                      Configure YouTube views pricing
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleAddGoal('youtube_views')}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-red-500 to-rose-600 rounded-xl hover:from-red-600 hover:to-rose-700 transition-all shadow-lg hover:shadow-red-500/30 hover:scale-105"
                >
                  <Plus className="w-4 h-4" />
                  Add Goal
                </button>
              </div>

              {pricing.youtube_views.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <Eye className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No YouTube Views goals yet. Add one to get started.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pricing.youtube_views.map((goal, index) => (
                    <div
                      key={index}
                      className="group flex items-center gap-4 p-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-700 bg-gray-50 dark:bg-gray-900 transition-all"
                    >
                      <div className="flex-1 grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 block">
                            Views
                          </label>
                          <input
                            type="text"
                            value={goal.followers}
                            onChange={(e) => handleUpdateGoal('youtube_views', index, 'followers', e.target.value)}
                            className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-sm font-medium"
                            placeholder="e.g. 1000"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 block">
                            Price (€)
                          </label>
                          <input
                            type="text"
                            value={goal.price}
                            onChange={(e) => handleUpdateGoal('youtube_views', index, 'price', e.target.value)}
                            className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-sm font-medium"
                            placeholder="e.g. 9.90"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => setDeleteConfirmation({ isOpen: true, platform: 'youtube_views', index, followers: goal.followers })}
                        className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                        title="Remove goal"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-300 whitespace-nowrap">
                      &quot;Most Popular&quot; badge on:
                    </span>
                    <select
                      value={popularPackYoutubeViews}
                      onChange={(e) => setPopularPackYoutubeViews(e.target.value)}
                      className="flex-1 px-4 py-2.5 border-2 border-red-300 dark:border-red-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-sm font-medium"
                    >
                      <option value="">None</option>
                      {pricing.youtube_views.map((goal) => (
                        <option key={goal.followers} value={goal.followers}>
                          {parseInt(goal.followers).toLocaleString()} views — {goal.price}€
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* LinkedIn Followers Pricing */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-blue-100 dark:border-blue-900/30">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-[#0A66C2] to-blue-600 rounded-xl shadow-lg">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      LinkedIn Followers
                    </h2>
                    <p className="text-sm text-gray-400 mt-0.5">
                      Configure LinkedIn followers pricing
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleAddGoal('linkedin_followers')}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-[#0A66C2] to-blue-600 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-blue-500/30 hover:scale-105"
                >
                  <Plus className="w-4 h-4" />
                  Add Goal
                </button>
              </div>

              {pricing.linkedin_followers.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No LinkedIn Followers goals yet. Add one to get started.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pricing.linkedin_followers.map((goal, index) => (
                    <div
                      key={index}
                      className="group flex items-center gap-4 p-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 bg-gray-50 dark:bg-gray-900 transition-all"
                    >
                      <div className="flex-1 grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 block">
                            Followers
                          </label>
                          <input
                            type="text"
                            value={goal.followers}
                            onChange={(e) => handleUpdateGoal('linkedin_followers', index, 'followers', e.target.value)}
                            className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm font-medium"
                            placeholder="e.g. 1000"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 block">
                            Price (€)
                          </label>
                          <input
                            type="text"
                            value={goal.price}
                            onChange={(e) => handleUpdateGoal('linkedin_followers', index, 'price', e.target.value)}
                            className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm font-medium"
                            placeholder="e.g. 19.90"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => setDeleteConfirmation({ isOpen: true, platform: 'linkedin_followers', index, followers: goal.followers })}
                        className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                        title="Remove goal"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-300 whitespace-nowrap">
                      &quot;Most Popular&quot; badge on:
                    </span>
                    <select
                      value={popularPackLinkedinFollowers}
                      onChange={(e) => setPopularPackLinkedinFollowers(e.target.value)}
                      className="flex-1 px-4 py-2.5 border-2 border-blue-300 dark:border-blue-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm font-medium"
                    >
                      <option value="">None</option>
                      {pricing.linkedin_followers.map((goal) => (
                        <option key={goal.followers} value={goal.followers}>
                          {parseInt(goal.followers).toLocaleString()} followers — {goal.price}€
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-center sticky bottom-8">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-3 px-10 py-4 text-lg font-bold text-white bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-size-200 bg-pos-0 hover:bg-pos-100 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-500 shadow-2xl hover:shadow-purple-500/50 hover:scale-105"
              >
                <Save className="w-6 h-6" />
                {isSaving ? 'Saving Changes...' : 'Save All Changes'}
              </button>
            </div>
          </>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-8">
            {/* Password Change Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-purple-100 dark:border-purple-900/30">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl shadow-lg">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Admin Password
                  </h2>
                  <p className="text-sm text-gray-400 mt-0.5">
                    Change your admin password
                  </p>
                </div>
              </div>

            <div className="max-w-md space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Must be at least 8 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Repeat New Password
                </label>
                <div className="relative">
                  <input
                    type={showRepeatPassword ? 'text' : 'password'}
                    value={passwordData.repeatPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, repeatPassword: e.target.value })}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Repeat new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    aria-label={showRepeatPassword ? 'Hide password' : 'Show password'}
                  >
                    {showRepeatPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                onClick={handlePasswordChange}
                disabled={isSaving}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Save className="w-5 h-5" />
                {isSaving ? 'Saving...' : 'Update Password'}
              </button>
            </div>
          </div>

          {/* Stripe Settings Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-purple-100 dark:border-purple-900/30">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"/>
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Stripe API Keys
                </h2>
                <p className="text-sm text-gray-400 mt-0.5">
                  Configure your Stripe payment gateway
                </p>
              </div>
            </div>

            <div className="max-w-2xl space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Secret Key
                </label>
                <div className="relative">
                  <input
                    type={showStripeSecretKey ? 'text' : 'password'}
                    value={stripeSettings.secretKey}
                    onChange={(e) => setStripeSettings({ ...stripeSettings, secretKey: e.target.value })}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all font-mono text-sm"
                    placeholder={stripeSettings.hasSecretKey ? 'sk_****...' : 'sk_test_... or sk_live_...'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowStripeSecretKey(!showStripeSecretKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    aria-label={showStripeSecretKey ? 'Hide key' : 'Show key'}
                  >
                    {showStripeSecretKey ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Starts with sk_test_ or sk_live_
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Publishable Key
                </label>
                <input
                  type="text"
                  value={stripeSettings.publishableKey}
                  onChange={(e) => setStripeSettings({ ...stripeSettings, publishableKey: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all font-mono text-sm"
                  placeholder={stripeSettings.hasPublishableKey ? 'pk_****...' : 'pk_test_... or pk_live_...'}
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Starts with pk_test_ or pk_live_
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Note:</strong> These keys will be stored securely in the database and used for all payment transactions. You can find your Stripe API keys in your{' '}
                  <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600 dark:hover:text-blue-300">
                    Stripe Dashboard
                  </a>.
                </p>
              </div>

              <button
                onClick={handleStripeSettingsUpdate}
                disabled={isSaving}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Save className="w-5 h-5" />
                {isSaving ? 'Saving...' : 'Update Stripe Keys'}
              </button>
            </div>
          </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-purple-100 dark:border-purple-900/30">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg">
                  <ShoppingCart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Orders
                  </h2>
                  <p className="text-sm text-gray-400 mt-0.5">
                    {filteredOrders.length} of {orders.length} order{orders.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {/* Search Bar */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search username or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 w-64 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-2 rounded-xl border transition-colors ${
                    showFilters 
                      ? 'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700 text-purple-600 dark:text-purple-400' 
                      : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Filter className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                <div className="flex flex-wrap gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Platform</label>
                    <select
                      value={filterPlatform}
                      onChange={(e) => setFilterPlatform(e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                    >
                      <option value="all">All Platforms</option>
                      <option value="instagram">Instagram</option>
                      <option value="tiktok">TikTok</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Order Status</label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                    >
                      <option value="all">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Date Range</label>
                    <select
                      value={filterDateRange}
                      onChange={(e) => setFilterDateRange(e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                    >
                      <option value="all">All Time</option>
                      <option value="today">Today</option>
                      <option value="week">Last 7 Days</option>
                      <option value="month">Last 30 Days</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setFilterPlatform('all');
                        setFilterStatus('all');
                        setFilterDateRange('all');
                      }}
                      className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    >
                      Reset Filters
                    </button>
                  </div>
                </div>
              </div>
            )}

            {filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  {orders.length === 0 ? 'No orders yet' : 'No orders match your filters'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Order ID</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Username</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Platform</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Country</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Followers</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Price</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Cost</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Order Status</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Notes</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => {
                      const isFunnel = order.order_source === 'APP_FUNNEL' && order.funnel_data;
                      const isExpanded = expandedOrderId === order.id;
                      return (
                      <React.Fragment key={order.id}>
                      <tr className={`border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors ${isExpanded ? 'bg-gray-50 dark:bg-gray-700/30' : ''}`}>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            {isFunnel && (
                              <button
                                onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                                className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                              >
                                {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
                              </button>
                            )}
                            <div>
                              <span className="text-sm text-gray-900 dark:text-white font-medium">#{order.id}</span>
                              {isFunnel && (
                                <span className="ml-1.5 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-700 dark:text-fuchsia-400">
                                  <Zap className="w-2.5 h-2.5" />
                                  FUNNEL
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm text-gray-900 dark:text-white">@{order.username}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{order.email || '-'}</div>
                          {order.customer_total_orders != null && order.customer_order_number != null && (
                            <div className="mt-1">
                              <CustomerLoyaltyBadge
                                customerOrderNumber={Number(order.customer_order_number)}
                                customerTotalOrders={Number(order.customer_total_orders)}
                              />
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center gap-1 text-sm font-medium text-gray-900 dark:text-white capitalize">
                            {order.platform === 'instagram' ? <Instagram className="w-4 h-4 text-pink-500" /> : <Music className="w-4 h-4 text-cyan-500" />}
                            {order.platform}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400">{order.country || '-'}</td>
                        <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400">{order.followers.toLocaleString()}</td>
                        <td className="py-4 px-4 text-sm font-semibold text-gray-900 dark:text-white">€{Number(order.price).toFixed(2)}</td>
                        <td className="py-4 px-4">
                          {editingCost === order.id ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={tempCost}
                                onChange={(e) => setTempCost(e.target.value)}
                                className="w-24 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                                autoFocus
                              />
                              <button
                                onClick={() => handleSaveCost(order.id)}
                                disabled={updatingOrderId === order.id}
                                className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                              >
                                <Save className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => { setEditingCost(null); setTempCost(''); }}
                                className="p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingCost(order.id);
                                const currentCost = order.cost === undefined || order.cost === null ? 0 : Number(order.cost);
                                setTempCost(currentCost.toFixed(2));
                              }}
                              className="text-sm font-semibold text-gray-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400"
                            >
                              €{Number(order.cost || 0).toFixed(2)}
                            </button>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div className="relative">
                            <select
                              value={order.order_status || 'pending'}
                              onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                              disabled={updatingOrderId === order.id}
                              className={`appearance-none pl-3 pr-8 py-1.5 rounded-full text-xs font-medium border-0 cursor-pointer ${
                                (order.order_status || 'pending') === 'completed'
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                  : (order.order_status || 'pending') === 'processing'
                                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                                  : (order.order_status || 'pending') === 'cancelled'
                                  ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                  : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                              } ${updatingOrderId === order.id ? 'opacity-50' : ''}`}
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" />
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4">
                          {editingNotes === order.id ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={tempNotes}
                                onChange={(e) => setTempNotes(e.target.value)}
                                className="w-32 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                placeholder="Add note..."
                                autoFocus
                              />
                              <button
                                onClick={() => handleSaveNotes(order.id)}
                                disabled={updatingOrderId === order.id}
                                className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                              >
                                <Save className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => { setEditingNotes(null); setTempNotes(''); }}
                                className="p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => { setEditingNotes(order.id); setTempNotes(order.notes || ''); }}
                              className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
                            >
                              <MessageSquare className="w-3 h-3" />
                              {order.notes ? (
                                <span className="max-w-[100px] truncate">{order.notes}</span>
                              ) : (
                                <span>Add note</span>
                              )}
                            </button>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <button
                            onClick={() => handleDeleteOrder(order.id, order.username)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Delete order"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                      {/* Expanded funnel detail row */}
                      {isFunnel && isExpanded && order.funnel_data && (
                        <tr className="border-b border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50">
                          <td colSpan={11} className="px-4 py-4">
                            <div className="max-w-2xl ml-6">
                              <FunnelOrderSummary funnelData={order.funnel_data} />
                            </div>
                          </td>
                        </tr>
                      )}
                      </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-purple-100 dark:border-purple-900/30">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">Google Ads Expenses</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Add your monthly Google Ads spend (YYYY-MM)</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Month</label>
                  <input
                    type="month"
                    value={googleAdsMonth}
                    onChange={(e) => setGoogleAdsMonth(e.target.value)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount (€)</label>
                  <input
                    type="number"
                    value={googleAdsAmount}
                    onChange={(e) => setGoogleAdsAmount(e.target.value)}
                    min="0"
                    step="0.01"
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    placeholder="0.00"
                  />
                </div>
                <button
                  onClick={handleUpsertGoogleAdsExpense}
                  disabled={isSaving || !googleAdsMonth || !googleAdsAmount}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
              </div>

              <div className="mt-6 overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Month</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {googleAdsExpenses.length === 0 ? (
                      <tr>
                        <td colSpan={2} className="py-6 px-4 text-sm text-gray-500 dark:text-gray-400">No expenses yet</td>
                      </tr>
                    ) : (
                      googleAdsExpenses.map((exp) => (
                        <tr key={exp.month} className="border-b border-gray-100 dark:border-gray-700/50">
                          <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">{exp.month}</td>
                          <td className="py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">€{Number(exp.amount || 0).toFixed(2)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <AnalyticsDashboard orders={orders} totalVisitors={1000} googleAdsExpenses={googleAdsExpenses} operatingExpenses={operatingExpenses} onAddOperatingExpense={handleAddOperatingExpense} onDeleteOperatingExpense={handleDeleteOperatingExpense} />
          </div>
        )}

        {activeTab === 'promo' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-purple-100 dark:border-purple-900/30">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl shadow-lg">
                  <Tag className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Promo Codes
                  </h2>
                  <p className="text-sm text-gray-400 mt-0.5">
                    {promoCodes.length} code{promoCodes.length !== 1 ? 's' : ''} total
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setEditingPromo(null);
                  setPromoForm({ code: '', discount_type: 'percentage', discount_value: '', max_uses: '', expires_at: '' });
                  setShowPromoForm(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all shadow-lg"
              >
                <Plus className="w-5 h-5" />
                New Promo Code
              </button>
            </div>

            {/* Promo Field Toggle */}
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Promo Code Field in Payment
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {promoFieldEnabled ? 'Customers can enter promo codes during checkout' : 'Promo code field is hidden from customers'}
                  </p>
                </div>
                <button
                  onClick={handleTogglePromoField}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    promoFieldEnabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      promoFieldEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Promo Bar Settings */}
            <div className="mb-6 p-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Promo Bar</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Configure the banner shown at the top of the site header
                  </p>
                </div>
                <button
                  onClick={handleSavePromoBarConfig}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white/60 dark:bg-gray-800/40">
                  <div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">Enabled</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Show promo bar in header</div>
                  </div>
                  <button
                    onClick={() => setPromoBarConfig((p) => ({ ...p, enabled: !p.enabled }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      promoBarConfig.enabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        promoBarConfig.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white/60 dark:bg-gray-800/40">
                  <div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">Show countdown</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Display timer on the right</div>
                  </div>
                  <button
                    onClick={() => setPromoBarConfig((p) => ({ ...p, showCountdown: !p.showCountdown }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      promoBarConfig.showCountdown ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        promoBarConfig.showCountdown ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Promo Code</label>
                  <input
                    value={promoBarConfig.code}
                    onChange={(e) => setPromoBarConfig((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Percent off</label>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={promoBarConfig.percentOff}
                    onChange={(e) => setPromoBarConfig((p) => ({ ...p, percentOff: Number(e.target.value) || 0 }))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Countdown duration (hours)</label>
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={promoBarConfig.durationHours}
                    onChange={(e) => setPromoBarConfig((p) => ({ ...p, durationHours: Math.max(1, Number(e.target.value) || 1) }))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Exclude paths (one per line)</label>
                  <textarea
                    value={promoBarConfig.excludePaths.join('\n')}
                    onChange={(e) =>
                      setPromoBarConfig((p) => ({
                        ...p,
                        excludePaths: e.target.value
                          .split(/\r?\n/)
                          .map((s) => s.trim())
                          .filter(Boolean),
                      }))
                    }
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Include paths only (one per line, leave empty = all pages)</label>
                  <textarea
                    value={promoBarConfig.includePaths.join('\n')}
                    onChange={(e) =>
                      setPromoBarConfig((p) => ({
                        ...p,
                        includePaths: e.target.value
                          .split(/\r?\n/)
                          .map((s) => s.trim())
                          .filter(Boolean),
                      }))
                    }
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Size</label>
                  <select
                    value={promoBarConfig.size}
                    onChange={(e) => setPromoBarConfig((p) => ({ ...p, size: e.target.value as 'sm' | 'md' | 'lg' }))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="sm">Small</option>
                    <option value="md">Medium</option>
                    <option value="lg">Large</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Background color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={promoBarConfig.bgColor}
                      onChange={(e) => setPromoBarConfig((p) => ({ ...p, bgColor: e.target.value }))}
                      className="w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer"
                    />
                    <input
                      value={promoBarConfig.bgColor}
                      onChange={(e) => setPromoBarConfig((p) => ({ ...p, bgColor: e.target.value }))}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Text color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={promoBarConfig.textColor}
                      onChange={(e) => setPromoBarConfig((p) => ({ ...p, textColor: e.target.value }))}
                      className="w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer"
                    />
                    <input
                      value={promoBarConfig.textColor}
                      onChange={(e) => setPromoBarConfig((p) => ({ ...p, textColor: e.target.value }))}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Accent color (badge & button)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={promoBarConfig.accentColor}
                      onChange={(e) => setPromoBarConfig((p) => ({ ...p, accentColor: e.target.value }))}
                      className="w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer"
                    />
                    <input
                      value={promoBarConfig.accentColor}
                      onChange={(e) => setPromoBarConfig((p) => ({ ...p, accentColor: e.target.value }))}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <div className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Live preview</div>
                <div
                  className={`w-full rounded-xl overflow-hidden ${promoBarConfig.size === 'lg' ? 'py-3' : promoBarConfig.size === 'md' ? 'py-2' : 'py-1.5'}`}
                  style={{ backgroundColor: promoBarConfig.bgColor, color: promoBarConfig.textColor }}
                >
                  <div className="flex items-center justify-center gap-3 flex-wrap px-4">
                    <span
                      className={`${promoBarConfig.size === 'lg' ? 'text-sm' : promoBarConfig.size === 'md' ? 'text-[13px]' : 'text-xs'} font-bold uppercase tracking-wider px-2 py-0.5 rounded`}
                      style={{ backgroundColor: `${promoBarConfig.accentColor}30`, color: promoBarConfig.accentColor }}
                    >
                      {promoBarConfig.badgeText.en}
                    </span>
                    <span className={`${promoBarConfig.size === 'lg' ? 'text-sm' : promoBarConfig.size === 'md' ? 'text-[13px]' : 'text-xs'} font-medium opacity-90`}>
                      {promoBarConfig.messageText.en}
                    </span>
                    <span
                      className={`${promoBarConfig.size === 'lg' ? 'text-sm' : promoBarConfig.size === 'md' ? 'text-[13px]' : 'text-xs'} px-2.5 py-0.5 rounded font-black tracking-wider`}
                      style={{ backgroundColor: promoBarConfig.accentColor, color: promoBarConfig.bgColor }}
                    >
                      {promoBarConfig.code}
                    </span>
                    {promoBarConfig.showCountdown && (
                      <span className={`${promoBarConfig.size === 'lg' ? 'text-sm' : promoBarConfig.size === 'md' ? 'text-[13px]' : 'text-xs'} font-semibold opacity-70`}>
                        Ends in <span className="font-black tabular-nums px-1.5 py-0.5 rounded" style={{ backgroundColor: `${promoBarConfig.textColor}15` }}>05:59:42</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Badge text</div>
                  <div className="grid grid-cols-1 gap-3">
                    <input
                      value={promoBarConfig.badgeText.en}
                      onChange={(e) => setPromoBarConfig((p) => ({ ...p, badgeText: { ...p.badgeText, en: e.target.value } }))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="English"
                    />
                    <input
                      value={promoBarConfig.badgeText.fr}
                      onChange={(e) => setPromoBarConfig((p) => ({ ...p, badgeText: { ...p.badgeText, fr: e.target.value } }))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="Français"
                    />
                    <input
                      value={promoBarConfig.badgeText.de}
                      onChange={(e) => setPromoBarConfig((p) => ({ ...p, badgeText: { ...p.badgeText, de: e.target.value } }))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="Deutsch"
                    />
                  </div>
                </div>

                <div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Message text</div>
                  <div className="grid grid-cols-1 gap-3">
                    <input
                      value={promoBarConfig.messageText.en}
                      onChange={(e) => setPromoBarConfig((p) => ({ ...p, messageText: { ...p.messageText, en: e.target.value } }))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="English"
                    />
                    <input
                      value={promoBarConfig.messageText.fr}
                      onChange={(e) => setPromoBarConfig((p) => ({ ...p, messageText: { ...p.messageText, fr: e.target.value } }))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="Français"
                    />
                    <input
                      value={promoBarConfig.messageText.de}
                      onChange={(e) => setPromoBarConfig((p) => ({ ...p, messageText: { ...p.messageText, de: e.target.value } }))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="Deutsch"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Promo Form Modal */}
            {showPromoForm && (
              <div className="mb-6 p-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {editingPromo ? 'Edit Promo Code' : 'Create New Promo Code'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Code *
                    </label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={promoForm.code}
                        onChange={(e) => setPromoForm({ ...promoForm, code: e.target.value.toUpperCase() })}
                        placeholder="PROMO20"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Discount Type *
                    </label>
                    <select
                      value={promoForm.discount_type}
                      onChange={(e) => setPromoForm({ ...promoForm, discount_type: e.target.value as 'percentage' | 'fixed' })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (€)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Discount Value *
                    </label>
                    <div className="relative">
                      <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="number"
                        value={promoForm.discount_value}
                        onChange={(e) => setPromoForm({ ...promoForm, discount_value: e.target.value })}
                        placeholder={promoForm.discount_type === 'percentage' ? '20' : '5'}
                        min="0"
                        max={promoForm.discount_type === 'percentage' ? '100' : undefined}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {promoForm.discount_type === 'percentage' ? 'Enter a value between 0 and 100' : 'Enter the amount in euros'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Max Uses (optional)
                    </label>
                    <input
                      type="number"
                      value={promoForm.max_uses}
                      onChange={(e) => setPromoForm({ ...promoForm, max_uses: e.target.value })}
                      placeholder="100"
                      min="1"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 mt-1">Leave empty for unlimited uses</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Expiration Date (optional)
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="date"
                        value={promoForm.expires_at}
                        onChange={(e) => setPromoForm({ ...promoForm, expires_at: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={editingPromo ? handleUpdatePromoCode : handleCreatePromoCode}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? 'Saving...' : (editingPromo ? 'Update' : 'Create')}
                  </button>
                  <button
                    onClick={() => {
                      setShowPromoForm(false);
                      setEditingPromo(null);
                      setPromoForm({ code: '', discount_type: 'percentage', discount_value: '', max_uses: '', expires_at: '' });
                    }}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Promo Codes List */}
            {promoCodes.length === 0 ? (
              <div className="text-center py-12">
                <Tag className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No promo codes yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Create your first promo code to get started</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Code</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Discount</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Usage</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Expires</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {promoCodes.map((promo) => (
                      <tr key={promo.id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-lg font-mono font-bold">
                            <Tag className="w-4 h-4" />
                            {promo.code}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-lg font-bold text-gray-900 dark:text-white">
                            {promo.discount_type === 'percentage' ? `${promo.discount_value}%` : `€${promo.discount_value}`}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                            {promo.discount_type === 'percentage' ? 'off' : 'discount'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900 dark:text-white">{promo.current_uses}</span>
                            <span className="text-gray-500 dark:text-gray-400">/</span>
                            <span className="text-gray-500 dark:text-gray-400">{promo.max_uses || '∞'}</span>
                          </div>
                          {promo.max_uses && (
                            <div className="w-20 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full mt-1">
                              <div 
                                className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"
                                style={{ width: `${Math.min((promo.current_uses / promo.max_uses) * 100, 100)}%` }}
                              />
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400">
                          {promo.expires_at ? (
                            <span className={new Date(promo.expires_at) < new Date() ? 'text-red-500' : ''}>
                              {new Date(promo.expires_at).toLocaleDateString()}
                            </span>
                          ) : (
                            <span className="text-gray-400">Never</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <button
                            onClick={() => handleTogglePromoActive(promo)}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                              promo.is_active
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                            }`}
                          >
                            {promo.is_active ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEditPromo(promo)}
                              className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Settings className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setPromoDeleteConfirm({ isOpen: true, id: promo.id, code: promo.code })}
                              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Promo Delete Confirmation Modal */}
        {promoDeleteConfirm.isOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setPromoDeleteConfirm({ isOpen: false, id: null, code: '' })} />
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="relative transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 text-left shadow-xl transition-all w-full max-w-md">
                <div className="bg-white dark:bg-gray-800 px-6 pt-6 pb-4">
                  <div className="flex items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                      <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="ml-4 mt-0 text-left flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Promo Code</h3>
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Are you sure you want to delete <span className="font-bold text-yellow-600">{promoDeleteConfirm.code}</span>? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 flex gap-3 justify-end">
                  <button
                    onClick={() => setPromoDeleteConfirm({ isOpen: false, id: null, code: '' })}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeletePromoCode}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'funnel' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-purple-100 dark:border-purple-900/30">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-fuchsia-500 to-purple-600 rounded-xl shadow-lg">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Funnel Pricing</h2>
                  <p className="text-sm text-gray-400 mt-0.5">Configure pricing tiers for the upsell tunnel</p>
                </div>
              </div>
              <button
                onClick={saveFunnelPricing}
                disabled={isSavingFunnel}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white rounded-xl hover:from-fuchsia-700 hover:to-purple-700 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Save className="w-5 h-5" />
                {isSavingFunnel ? 'Saving...' : 'Save All'}
              </button>
            </div>

            {funnelMessage && (
              <div className={`mb-6 p-3 rounded-xl text-sm font-medium ${funnelMessage.includes('success') ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'}`}>
                {funnelMessage}
              </div>
            )}

            {isLoading ? (
              <div className="text-center py-12 text-gray-400">Loading...</div>
            ) : (
              <div className="space-y-8">
                {['followers', 'likes', 'views', 'story-views'].map((serviceType) => {
                  const tiers = funnelPricing[serviceType] || [];
                  const labels: Record<string, string> = { followers: 'Abonnés', likes: 'Likes', views: 'Vues', 'story-views': 'Vues de story' };
                  return (
                    <div key={serviceType} className="border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{labels[serviceType] || serviceType}</h3>
                        <button
                          onClick={() => addFunnelTier(serviceType)}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-fuchsia-600 hover:bg-fuchsia-50 dark:hover:bg-fuchsia-900/20 rounded-lg transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Add Tier
                        </button>
                      </div>
                      {tiers.length === 0 ? (
                        <p className="text-sm text-gray-400 py-4">No tiers configured. Click &quot;Add Tier&quot; to start.</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-gray-200 dark:border-gray-700">
                                <th className="text-left py-2 px-2 font-medium text-gray-600 dark:text-gray-400">Qty</th>
                                <th className="text-left py-2 px-2 font-medium text-gray-600 dark:text-gray-400">Price (€)</th>
                                <th className="text-left py-2 px-2 font-medium text-gray-600 dark:text-gray-400">Old Price (€)</th>
                                <th className="text-left py-2 px-2 font-medium text-gray-600 dark:text-gray-400">Bonus</th>
                                <th className="py-2 px-2"></th>
                              </tr>
                            </thead>
                            <tbody>
                              {tiers.map((tier, idx) => (
                                <tr key={idx} className="border-b border-gray-100 dark:border-gray-700/50">
                                  <td className="py-2 px-2">
                                    <input type="number" value={tier.qty} onChange={(e) => updateFunnelTier(serviceType, idx, 'qty', parseFloat(e.target.value) || 0)} className="w-24 px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm" />
                                  </td>
                                  <td className="py-2 px-2">
                                    <input type="number" step="0.01" value={tier.price} onChange={(e) => updateFunnelTier(serviceType, idx, 'price', parseFloat(e.target.value) || 0)} className="w-24 px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm" />
                                  </td>
                                  <td className="py-2 px-2">
                                    <input type="number" step="0.01" value={tier.oldPrice} onChange={(e) => updateFunnelTier(serviceType, idx, 'oldPrice', parseFloat(e.target.value) || 0)} className="w-24 px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm" />
                                  </td>
                                  <td className="py-2 px-2">
                                    <input type="number" value={tier.bonus} onChange={(e) => updateFunnelTier(serviceType, idx, 'bonus', parseFloat(e.target.value) || 0)} className="w-24 px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm" />
                                  </td>
                                  <td className="py-2 px-2">
                                    <button onClick={() => removeFunnelTier(serviceType, idx)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Default Selections Section */}
            <div className="mt-8 bg-gradient-to-br from-purple-50 to-fuchsia-50 dark:from-purple-900/10 dark:to-fuchsia-900/10 rounded-2xl p-8 border border-purple-200 dark:border-purple-800">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-fuchsia-600 rounded-xl shadow-lg">
                    <Settings className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Sélections par défaut</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">Configurez quel pack est sélectionné par défaut pour chaque service</p>
                  </div>
                </div>
                <button
                  onClick={saveFunnelDefaults}
                  disabled={isSavingDefaults}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-xl hover:from-purple-700 hover:to-fuchsia-700 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Save className="w-5 h-5" />
                  {isSavingDefaults ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>

              {defaultsMessage && (
                <div className={`mb-6 p-3 rounded-xl text-sm font-medium ${defaultsMessage.includes('succès') ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'}`}>
                  {defaultsMessage}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {['followers', 'likes', 'views', 'story-views'].map((serviceType) => {
                  const labels: Record<string, string> = { 
                    followers: 'Abonnés', 
                    likes: 'Likes', 
                    views: 'Vues', 
                    'story-views': 'Vues de story' 
                  };
                  const tiers = funnelPricing[serviceType] || [];
                  const currentDefault = funnelDefaults[serviceType] || 0;

                  return (
                    <div key={serviceType} className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
                      <h4 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500"></div>
                        {labels[serviceType] || serviceType}
                      </h4>
                      
                      <div className="space-y-2">
                        <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors">
                          <input
                            type="radio"
                            name={`default-${serviceType}`}
                            checked={currentDefault === 0}
                            onChange={() => setFunnelDefaults(prev => ({ ...prev, [serviceType]: 0 }))}
                            className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                          />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Aucune sélection (0)
                          </span>
                        </label>

                        {tiers.map((tier, idx) => (
                          <label key={idx} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors">
                            <input
                              type="radio"
                              name={`default-${serviceType}`}
                              checked={currentDefault === idx + 1}
                              onChange={() => setFunnelDefaults(prev => ({ ...prev, [serviceType]: idx + 1 }))}
                              className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                            />
                            <div className="flex-1 flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Pack {idx + 1}: {tier.qty.toLocaleString()} {labels[serviceType]?.toLowerCase()}
                              </span>
                              <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                                {tier.price.toFixed(2)} €
                              </span>
                            </div>
                          </label>
                        ))}
                      </div>

                      {tiers.length === 0 && (
                        <p className="text-xs text-gray-400 italic mt-2">
                          Configurez d&apos;abord les tiers de pricing ci-dessus
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800 dark:text-blue-300">
                    <p className="font-semibold mb-1">Comment ça marche ?</p>
                    <p className="text-blue-700 dark:text-blue-400">
                      L&apos;indice sélectionné correspond au tier qui sera pré-sélectionné quand le client arrive sur l&apos;étape 2 du tunnel. 
                      <strong> 0 = aucune sélection</strong>, <strong>1 = premier pack</strong>, <strong>2 = deuxième pack</strong>, etc.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Currency-Specific Pricing Section */}
            <div className="mt-8 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 rounded-2xl p-8 border border-emerald-200 dark:border-emerald-800">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
                    <span className="text-xl">💱</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Prix par devise</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">Définissez des prix personnalisés pour chaque devise (funnels Instagram &amp; TikTok)</p>
                  </div>
                </div>
                <button
                  onClick={saveCurrencyPricing}
                  disabled={isSavingCurrency}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Save className="w-5 h-5" />
                  {isSavingCurrency ? 'Saving...' : 'Save Currency Pricing'}
                </button>
              </div>

              {currencyMessage && (
                <div className={`mb-6 p-3 rounded-xl text-sm font-medium ${currencyMessage.includes('success') ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'}`}>
                  {currencyMessage}
                </div>
              )}

              {/* Currency tabs */}
              <div className="flex flex-wrap gap-2 mb-6">
                {SUPPORTED_CURRENCIES.map((cur) => {
                  const isConfigured = !!currencyPricing[cur];
                  return (
                    <button
                      key={cur}
                      onClick={() => setActiveCurrency(cur)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        activeCurrency === cur
                          ? 'bg-emerald-600 text-white shadow-lg'
                          : isConfigured
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 border border-emerald-300 dark:border-emerald-700'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {CURRENCY_LABELS[cur] || cur.toUpperCase()}
                      {isConfigured && <span className="ml-1.5 text-xs">✓</span>}
                    </button>
                  );
                })}
              </div>

              {/* Active currency content */}
              {(() => {
                const cur = activeCurrency;
                const isConfigured = !!currencyPricing[cur];
                const curData = currencyPricing[cur] || {};

                if (!isConfigured) {
                  return (
                    <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl">
                      <span className="text-4xl mb-4 block">💰</span>
                      <p className="text-gray-500 dark:text-gray-400 mb-2">
                        Aucun prix configuré pour <strong>{CURRENCY_LABELS[cur]}</strong>
                      </p>
                      <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">
                        Les utilisateurs dans cette zone verront les prix en EUR par défaut
                      </p>
                      <button
                        onClick={() => initCurrencyFromEur(cur)}
                        className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-md font-medium"
                      >
                        Copier les prix EUR et adapter
                      </button>
                    </div>
                  );
                }

                return (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                        Prix pour {CURRENCY_LABELS[cur]} — modifiez les montants dans la devise locale
                      </p>
                      <button
                        onClick={() => removeCurrencyConfig(cur)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Supprimer cette devise
                      </button>
                    </div>

                    {['followers', 'likes', 'views', 'story-views'].map((serviceType) => {
                      const tiers = curData[serviceType] || [];
                      const labels: Record<string, string> = { followers: 'Abonnés', likes: 'Likes', views: 'Vues', 'story-views': 'Vues de story' };
                      if (tiers.length === 0) return null;

                      return (
                        <div key={serviceType} className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 bg-white dark:bg-gray-800">
                          <h4 className="text-base font-bold text-gray-900 dark:text-white mb-3">{labels[serviceType] || serviceType}</h4>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-700">
                                  <th className="text-left py-2 px-2 font-medium text-gray-600 dark:text-gray-400">Qty</th>
                                  <th className="text-left py-2 px-2 font-medium text-gray-600 dark:text-gray-400">Price ({cur.toUpperCase()})</th>
                                  <th className="text-left py-2 px-2 font-medium text-gray-600 dark:text-gray-400">Old Price ({cur.toUpperCase()})</th>
                                  <th className="text-left py-2 px-2 font-medium text-gray-600 dark:text-gray-400">Bonus</th>
                                </tr>
                              </thead>
                              <tbody>
                                {tiers.map((tier, idx) => (
                                  <tr key={idx} className="border-b border-gray-100 dark:border-gray-700/50">
                                    <td className="py-2 px-2">
                                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{tier.qty.toLocaleString()}</span>
                                    </td>
                                    <td className="py-2 px-2">
                                      <input type="number" step="0.01" value={tier.price} onChange={(e) => updateCurrencyTier(cur, serviceType, idx, 'price', parseFloat(e.target.value) || 0)} className="w-24 px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm" />
                                    </td>
                                    <td className="py-2 px-2">
                                      <input type="number" step="0.01" value={tier.oldPrice} onChange={(e) => updateCurrencyTier(cur, serviceType, idx, 'oldPrice', parseFloat(e.target.value) || 0)} className="w-24 px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm" />
                                    </td>
                                    <td className="py-2 px-2">
                                      <span className="text-sm text-gray-500">{tier.bonus}</span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-emerald-800 dark:text-emerald-300">
                    <p className="font-semibold mb-1">Comment ça marche ?</p>
                    <p className="text-emerald-700 dark:text-emerald-400">
                      Si une devise est configurée, les utilisateurs de cette zone verront ces prix et paieront dans leur devise locale via Stripe.
                      Si une devise n&apos;est pas configurée, les prix EUR seront affichés et le paiement sera en EUR.
                      Les quantités et bonus sont repris depuis les prix EUR — seuls les montants changent.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {deleteConfirmation.isOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={cancelDelete} />
            
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="relative transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 text-left shadow-xl transition-all w-full max-w-md">
                <div className="bg-white dark:bg-gray-800 px-6 pt-6 pb-4">
                  <div className="flex items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                      <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="ml-4 mt-0 text-left flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Delete Pricing Option
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Are you sure you want to delete the pricing option for{' '}
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {deleteConfirmation.followers} followers
                          </span>
                          ? This action cannot be undone.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={cancelDelete}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmDelete}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors shadow-lg hover:shadow-red-500/50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {orderDeleteConfirmation.isOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={cancelDeleteOrder} />
            
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="relative transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 text-left shadow-xl transition-all w-full max-w-md">
                <div className="bg-white dark:bg-gray-800 px-6 pt-6 pb-4">
                  <div className="flex items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                      <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="ml-4 mt-0 text-left flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Delete Order
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Are you sure you want to delete the order for{' '}
                          <span className="font-semibold text-gray-900 dark:text-white">
                            @{orderDeleteConfirmation.username}
                          </span>
                          ? This action cannot be undone.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={cancelDeleteOrder}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmDeleteOrder}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors shadow-lg hover:shadow-red-500/50"
                  >
                    Delete Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
