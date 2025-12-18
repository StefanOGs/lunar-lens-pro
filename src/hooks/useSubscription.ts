import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type SubscriptionPlan = 'FREE' | 'BASIC' | 'PREMIUM' | 'LIFETIME';
export type AppRole = 'admin' | 'user';

interface Subscription {
  plan: SubscriptionPlan;
  planExpiresAt: Date | null;
}

interface OneTimePurchase {
  productType: 'forecast' | 'compatibility';
  creditsRemaining: number;
}

interface FeatureAccess {
  dailyHoroscope: boolean;
  fullNatalChart: boolean;
  compatibility: boolean;
  personalizedForecast: boolean;
  transitsProgressions: boolean;
  dailyEmails: boolean;
}

const FEATURE_MATRIX: Record<SubscriptionPlan, FeatureAccess> = {
  FREE: {
    dailyHoroscope: true,
    fullNatalChart: false,
    compatibility: false,
    personalizedForecast: false,
    transitsProgressions: false,
    dailyEmails: false,
  },
  BASIC: {
    dailyHoroscope: true,
    fullNatalChart: true,
    compatibility: true,
    personalizedForecast: true,
    transitsProgressions: true,
    dailyEmails: false,
  },
  PREMIUM: {
    dailyHoroscope: true,
    fullNatalChart: true,
    compatibility: true,
    personalizedForecast: true,
    transitsProgressions: true,
    dailyEmails: true,
  },
  LIFETIME: {
    dailyHoroscope: true,
    fullNatalChart: true,
    compatibility: true,
    personalizedForecast: true,
    transitsProgressions: true,
    dailyEmails: true,
  },
};

export const useSubscription = (userId: string | null) => {
  const [subscription, setSubscription] = useState<Subscription>({
    plan: 'FREE',
    planExpiresAt: null,
  });
  const [oneTimePurchases, setOneTimePurchases] = useState<OneTimePurchase[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchSubscriptionAndRoles = async () => {
      try {
        // Fetch user roles
        const { data: rolesData, error: rolesError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId);

        if (rolesError) throw rolesError;

        if (rolesData) {
          const userRoles = rolesData.map((r) => r.role as AppRole);
          setRoles(userRoles);
          setIsAdmin(userRoles.includes('admin'));
        }

        // Fetch subscription
        const { data: subData, error: subError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (subError) throw subError;

        if (subData) {
          // Check if subscription has expired (except LIFETIME)
          const isExpired = subData.plan !== 'LIFETIME' && 
            subData.plan_expires_at && 
            new Date(subData.plan_expires_at) < new Date();

          setSubscription({
            plan: isExpired ? 'FREE' : (subData.plan as SubscriptionPlan),
            planExpiresAt: subData.plan_expires_at ? new Date(subData.plan_expires_at) : null,
          });
        } else {
          // Create FREE subscription for new users
          const { error: insertError } = await supabase
            .from('subscriptions')
            .insert({ user_id: userId, plan: 'FREE' });
          
          if (insertError) console.error('Error creating subscription:', insertError);
        }

        // Fetch one-time purchases
        const { data: purchasesData, error: purchasesError } = await supabase
          .from('one_time_purchases')
          .select('*')
          .eq('user_id', userId)
          .gt('credits_remaining', 0);

        if (purchasesError) throw purchasesError;

        if (purchasesData) {
          setOneTimePurchases(
            purchasesData.map((p) => ({
              productType: p.product_type as 'forecast' | 'compatibility',
              creditsRemaining: p.credits_remaining,
            }))
          );
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionAndRoles();
  }, [userId]);

  const getActivePlan = (): SubscriptionPlan => {
    return subscription.plan;
  };

  const hasFeature = (feature: keyof FeatureAccess): boolean => {
    // Admins have access to all features
    if (isAdmin) return true;
    return FEATURE_MATRIX[subscription.plan][feature];
  };

  const hasOneTimeCredit = (productType: 'forecast' | 'compatibility'): boolean => {
    return oneTimePurchases.some(
      (p) => p.productType === productType && p.creditsRemaining > 0
    );
  };

  const canAccessFeature = (feature: keyof FeatureAccess, productType?: 'forecast' | 'compatibility'): boolean => {
    // Admins have access to all features
    if (isAdmin) return true;
    if (hasFeature(feature)) return true;
    if (productType && hasOneTimeCredit(productType)) return true;
    return false;
  };

  const useOneTimeCredit = async (productType: 'forecast' | 'compatibility'): Promise<boolean> => {
    // Admins don't need to use credits
    if (isAdmin) return true;

    const purchase = oneTimePurchases.find(
      (p) => p.productType === productType && p.creditsRemaining > 0
    );

    if (!purchase || !userId) return false;

    const { error } = await supabase
      .from('one_time_purchases')
      .update({ credits_remaining: purchase.creditsRemaining - 1 })
      .eq('user_id', userId)
      .eq('product_type', productType)
      .gt('credits_remaining', 0);

    if (error) {
      console.error('Error using credit:', error);
      return false;
    }

    setOneTimePurchases((prev) =>
      prev.map((p) =>
        p.productType === productType
          ? { ...p, creditsRemaining: p.creditsRemaining - 1 }
          : p
      )
    );

    return true;
  };

  return {
    subscription,
    oneTimePurchases,
    isAdmin,
    roles,
    loading,
    getActivePlan,
    hasFeature,
    hasOneTimeCredit,
    canAccessFeature,
    useOneTimeCredit,
  };
};

export { FEATURE_MATRIX };
