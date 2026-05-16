"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  PayPalScriptProvider,
  PayPalButtons,
  type ReactPayPalScriptOptions,
} from "@paypal/react-paypal-js";
import { clientEnv } from "@/lib/env-client";

// Renders PayPal Smart Buttons. All the real validation lives server-side
// in /api/payments/create-order + /api/payments/capture — this component
// is intentionally dumb: it tells the API which product to charge and
// trusts the API to do the right thing.

interface Props {
  productSlug: string;
  productName: string;
  amountValue: string; // "147.00" — display-only, server is the source of truth
  currency: string;
}

type Status = "idle" | "creating" | "capturing" | "error";

export function CheckoutClient({ productSlug, productName, amountValue, currency }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const publicClientId = clientEnv.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  if (!publicClientId) {
    return (
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-200">
        Checkout is temporarily unavailable. Please email{" "}
        <a href="mailto:hello@digitalalchemy.dev" className="underline">
          hello@digitalalchemy.dev
        </a>{" "}
        to complete your purchase.
      </div>
    );
  }

  const scriptOptions: ReactPayPalScriptOptions = {
    clientId: publicClientId,
    currency,
    intent: "capture",
    components: "buttons",
  };

  async function createOrderOnServer(): Promise<string> {
    setStatus("creating");
    setErrorMsg(null);
    const res = await fetch("/api/payments/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_slug: productSlug }),
    });
    if (!res.ok) {
      throw new Error(`createOrder ${res.status}`);
    }
    const json = (await res.json()) as { orderId: string };
    return json.orderId;
  }

  async function captureOrderOnServer(orderId: string): Promise<{
    productSlug: string;
    orderId: string;
  }> {
    setStatus("capturing");
    const res = await fetch("/api/payments/capture", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order_id: orderId }),
    });
    if (!res.ok) {
      throw new Error(`capture ${res.status}`);
    }
    return (await res.json()) as { productSlug: string; orderId: string };
  }

  return (
    <div className="space-y-4">
      <PayPalScriptProvider options={scriptOptions} deferLoading={false}>
        <PayPalButtons
          style={{
            layout: "vertical",
            shape: "rect",
            label: "pay",
            color: "blue",
          }}
          createOrder={async () => {
            try {
              return await createOrderOnServer();
            } catch (err) {
              console.error("createOrder failed", err);
              setStatus("error");
              setErrorMsg(
                "We couldn't start the payment. Please try again or email hello@digitalalchemy.dev.",
              );
              throw err;
            }
          }}
          onApprove={async (data) => {
            try {
              const result = await captureOrderOnServer(data.orderID);
              router.push(
                `/checkout/success?product=${encodeURIComponent(result.productSlug)}&order=${encodeURIComponent(result.orderId)}`,
              );
            } catch (err) {
              console.error("capture failed", err);
              setStatus("error");
              setErrorMsg(
                "Payment was authorized but we couldn't finalize it. Your card may not be charged. Please email hello@digitalalchemy.dev with this product name: " +
                  productName,
              );
            }
          }}
          onCancel={() => {
            setStatus("idle");
            router.push("/checkout/cancel");
          }}
          onError={(err) => {
            console.error("PayPal error", err);
            setStatus("error");
            setErrorMsg(
              "PayPal hit an error. Please try again or use a different payment method.",
            );
          }}
        />
      </PayPalScriptProvider>

      {status === "capturing" && (
        <p className="text-center text-sm text-da-muted" aria-live="polite">
          Finalizing your purchase — don&apos;t close this window…
        </p>
      )}

      {errorMsg && (
        <div
          role="alert"
          className="rounded-xl border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-200"
        >
          {errorMsg}
        </div>
      )}

      <p className="text-center text-xs text-da-muted">
        Amount shown: ${amountValue} {currency} (server-verified).
      </p>
    </div>
  );
}
