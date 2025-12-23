"use client";

import { loadStripe, Stripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { PropsWithChildren, useMemo } from "react";

// Initialize Stripe with publishable key
const getStripe = (): Promise<Stripe | null> => {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!publishableKey) {
    console.warn("Stripe publishable key not configured");
    return Promise.resolve(null);
  }
  return loadStripe(publishableKey);
};

const stripePromise = getStripe();

interface StripeProviderProps extends PropsWithChildren {
  clientSecret?: string;
}

/**
 * Stripe Elements Provider component
 * Wrap checkout components with this to use Stripe Elements
 */
export function StripeProvider({
  children,
  clientSecret,
}: StripeProviderProps) {
  const options = useMemo(() => {
    if (!clientSecret) return {};
    return {
      clientSecret,
      appearance: {
        theme: "night" as const,
        variables: {
          colorPrimary: "#ff3366",
          colorBackground: "#1a1a1a",
          colorText: "#ffffff",
          colorDanger: "#ff4444",
          fontFamily: "Inter, system-ui, sans-serif",
          borderRadius: "8px",
        },
      },
    };
  }, [clientSecret]);

  if (!clientSecret) {
    return <>{children}</>;
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  );
}

export default StripeProvider;
