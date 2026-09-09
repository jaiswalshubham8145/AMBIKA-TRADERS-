import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Check,
  Lock,
  QrCode,
  Copy,
  Smartphone,
  MessageSquare,
  ExternalLink,
  Clock,
  ShieldCheck,
  AlertCircle,
  Tag,
  X,
  Loader2,
  Truck,
  MapPin,
  Ban,
} from "lucide-react";
import { cartSubtotal, useCart } from "@/lib/cart";
import { inr } from "@/lib/products";
import { validateCoupon, type Coupon } from "@/lib/coupons";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { PAYMENT_CONFIG, buildUpiUri } from "@/lib/payment-config";
import {
  formatWhatsAppOrderAlert,
  buildWhatsAppDirectUrl,
  sendCallMeBotWhatsAppAlert,
} from "@/lib/whatsapp";
import { calculateShipping, type ShippingResult } from "@/lib/shipping";
import {
  trackBeginCheckout,
  trackPurchase,
  trackAddToCart,
  trackRemoveFromCart,
} from "@/lib/analytics";
import { trackCartEvent } from "@/lib/cart-events";
import { validateReferralCode, redeemReferral } from "@/lib/referrals";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Ambika Traders" },
      { name: "description", content: "Complete your festive order." },
    ],
  }),
  component: Checkout,
});

type Step = 1 | 2 | 3;

const contactSchema = z.object({
  email: z.string().trim().email("Enter a valid email").max(160),
  phone: z
    .string()
    .trim()
    .regex(/^[+()\-\s\d]{7,20}$/, "Enter a valid phone number"),
});

const shippingSchema = z.object({
  name: z.string().trim().min(2, "Full name is required").max(80),
  address1: z.string().trim().min(4, "Address is required").max(160),
  address2: z.string().trim().max(160).optional(),
  city: z.string().trim().min(2, "City required").max(60),
  state: z.string().trim().min(2, "State required").max(60),
  pincode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "6-digit pincode"),
});

type Contact = z.infer<typeof contactSchema>;
type Shipping = z.infer<typeof shippingSchema>;

function Checkout() {
  const { lines, clear } = useCart();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const subtotal = cartSubtotal(lines);
  const [step, setStep] = useState<Step>(1);
  const [placed, setPlaced] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);
  const [placedOrderUtr, setPlacedOrderUtr] = useState<string>("");
  const [placedOrderWaUrl, setPlacedOrderWaUrl] = useState<string>("");
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [pay, setPay] = useState<"upi" | "cod">("upi");
  const [utr, setUtr] = useState("");
  const [utrErr, setUtrErr] = useState("");
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [contact, setContact] = useState<Contact>({ email: "", phone: "" });
  const [shipping, setShipping] = useState<Shipping>({
    name: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [contactErr, setContactErr] = useState<Partial<Record<keyof Contact, string>>>({});
  const [shipErr, setShipErr] = useState<Partial<Record<keyof Shipping, string>>>({});

  // Pincode shipping state
  const [shippingResult, setShippingResult] = useState<ShippingResult | null>(null);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeChecked, setPincodeChecked] = useState(false);
  const pincodeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [discount, setDiscount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");

  // Referral state
  const [referralCode, setReferralCode] = useState("");
  const [referralDiscount, setReferralDiscount] = useState(0);
  const [referralApplied, setReferralApplied] = useState(false);
  const [referralError, setReferralError] = useState("");
  const [referralLoading, setReferralLoading] = useState(false);

  // Auto-fill logged in user details
  useEffect(() => {
    if (user) {
      setContact((prev) => ({
        ...prev,
        email: prev.email || user.email || "",
      }));
      if (profile?.full_name) {
        setShipping((prev) => ({
          ...prev,
          name: prev.name || profile.full_name || "",
        }));
      }
    }
  }, [user, profile]);

  // Auto-check pincode when shipping pincode changes (debounced)
  useEffect(() => {
    if (pincodeTimerRef.current) clearTimeout(pincodeTimerRef.current);
    if (shipping.pincode.length === 6) {
      pincodeTimerRef.current = setTimeout(() => {
        handlePincodeCheck(shipping.pincode);
      }, 500);
    }
    return () => {
      if (pincodeTimerRef.current) clearTimeout(pincodeTimerRef.current);
    };
  }, [shipping.pincode]);

  const handlePincodeCheck = useCallback(
    async (pincode: string) => {
      if (pincode.length < 6) {
        setShippingResult(null);
        setPincodeChecked(false);
        return;
      }
      setPincodeLoading(true);
      try {
        const result = await calculateShipping(pincode, subtotal);
        setShippingResult(result);
        setPincodeChecked(true);
      } catch {
        setShippingResult(null);
        setPincodeChecked(false);
      } finally {
        setPincodeLoading(false);
      }
    },
    [subtotal],
  );

  const submitContact = () => {
    const parsed = contactSchema.safeParse(contact);
    if (!parsed.success) {
      const errs: Partial<Record<keyof Contact, string>> = {};
      parsed.error.issues.forEach((i) => {
        const k = i.path[0] as keyof Contact;
        if (!errs[k]) errs[k] = i.message;
      });
      setContactErr(errs);
      return;
    }
    setContactErr({});
    setStep(2);
  };
  const submitShipping = () => {
    const parsed = shippingSchema.safeParse(shipping);
    if (!parsed.success) {
      const errs: Partial<Record<keyof Shipping, string>> = {};
      parsed.error.issues.forEach((i) => {
        const k = i.path[0] as keyof Shipping;
        if (!errs[k]) errs[k] = i.message;
      });
      setShipErr(errs);
      return;
    }
    // Require pincode check before proceeding
    if (!pincodeChecked || !shippingResult) {
      toast.error("Please check delivery availability for your pincode first.");
      return;
    }
    if (!shippingResult.isServiceable) {
      toast.error("Sorry, we don't deliver to this pincode yet.");
      return;
    }
    setShipErr({});
    setStep(3);
    trackBeginCheckout(
      totalPayable,
      lines.map((l) => ({ slug: l.slug, title: l.title, price: l.price })),
      appliedCoupon?.code,
    );
    trackCartEvent({
      eventType: "checkout_start",
      cartValue: totalPayable,
      userEmail: contact.email,
      userPhone: contact.phone,
    });
  };

  const ship = shippingResult?.isServiceable ? shippingResult.fee : 0;
  const totalPayable = Math.max(
    0,
    subtotal - discount - referralDiscount + ship + (pay === "cod" ? 49 : 0),
  );
  const upiUri = buildUpiUri(totalPayable, placedOrderId || undefined);

  const copyUpi = () => {
    navigator.clipboard.writeText(PAYMENT_CONFIG.upiId);
    setCopiedUpi(true);
    toast.success("Admin UPI ID copied to clipboard!");
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    try {
      const result = await validateCoupon(couponCode, subtotal);
      if (result.valid && result.coupon && result.discount) {
        setAppliedCoupon(result.coupon);
        setDiscount(result.discount);
        setCouponError("");
        toast.success(`${result.coupon.code} applied: -${inr(result.discount)}`);
      } else {
        setAppliedCoupon(null);
        setDiscount(0);
        setCouponError(result.error || "Invalid coupon.");
      }
    } catch {
      setCouponError("Failed to validate coupon. Try again.");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscount(0);
    setCouponCode("");
    setCouponError("");
  };

  const handleApplyReferral = async () => {
    if (!referralCode.trim()) return;
    setReferralLoading(true);
    setReferralError("");
    try {
      const result = await validateReferralCode(referralCode);
      if (result.valid) {
        setReferralDiscount(result.discount);
        setReferralApplied(true);
        setReferralError("");
        toast.success(`Referral applied: -₹${result.discount}`);
      } else {
        setReferralDiscount(0);
        setReferralApplied(false);
        setReferralError(result.error || "Invalid referral code");
      }
    } catch {
      setReferralError("Failed to validate referral code");
    } finally {
      setReferralLoading(false);
    }
  };

  const handleRemoveReferral = () => {
    setReferralCode("");
    setReferralDiscount(0);
    setReferralApplied(false);
    setReferralError("");
  };

  const place = async () => {
    if (pay === "upi") {
      if (!utr.trim()) {
        setUtrErr("Please enter the 12-digit UTR / Reference ID after completing payment.");
        return;
      }
      if (utr.trim().length < 6) {
        setUtrErr("Please enter a valid Transaction / Reference ID (minimum 6 digits).");
        return;
      }
    }
    setUtrErr("");

    try {
      setIsSubmittingOrder(true);
      const giftLine = lines.find((l) => l.giftMessage);
      const giftDetail = giftLine?.giftMessage
        ? {
            recipientName: shipping.name,
            message: giftLine.giftMessage,
            giftWrap: true,
          }
        : null;

      const isUpi = pay === "upi";
      const cleanUtr = isUpi ? utr.trim() : null;

      // Persist order in Supabase
      const { data: orderData, error: orderErr } = await supabase
        .from("orders")
        .insert([
          {
            user_id: user?.id || null,
            guest_email: contact.email,
            guest_phone: contact.phone,
            status: "PENDING",
            payment_method: isUpi ? "UPI" : "COD",
            payment_status: isUpi ? "VERIFICATION_PENDING" : "UNPAID",
            transaction_id: cleanUtr,
            subtotal,
            shipping_total: ship,
            discount_total: discount,
            total: totalPayable,
            shipping_address: shipping,
            gift_detail: giftDetail,
            applied_coupon_code: appliedCoupon?.code || null,
            referral_code: referralApplied ? referralCode : null,
            referral_discount: referralDiscount,
          },
        ])
        .select("id")
        .single();

      if (orderErr) {
        console.error("Order creation fallback:", orderErr);
      }

      const refId = orderData?.id || Math.random().toString(36).substring(2, 10).toUpperCase();
      setPlacedOrderId(refId);
      setPlacedOrderUtr(cleanUtr || "");

      // Insert line items
      if (orderData?.id) {
        const itemsPayload = lines.map((l) => ({
          order_id: orderData.id,
          product_slug: l.slug,
          title: l.title,
          unit_price: l.price,
          quantity: l.qty,
          image_url: l.image,
        }));

        await supabase.from("order_items").insert(itemsPayload);

        // Redeem referral code if applied
        if (referralApplied && referralCode && orderData.id) {
          redeemReferral(referralCode, orderData.id, contact.email);
        }
      }

      // Build WhatsApp Alert Message for Admin
      const alertMsg = formatWhatsAppOrderAlert({
        orderId: refId,
        customerName: shipping.name || "Customer",
        customerPhone: contact.phone,
        customerEmail: contact.email,
        city: shipping.city,
        state: shipping.state,
        pincode: shipping.pincode,
        total: totalPayable,
        paymentMethod: isUpi ? "Direct UPI (Verification Pending)" : "Cash on Delivery",
        utrNumber: cleanUtr,
        items: lines.map((l) => ({ title: l.title, qty: l.qty, price: l.price })),
        giftMessage: giftLine?.giftMessage || null,
      });

      const waUrl = buildWhatsAppDirectUrl(alertMsg);
      setPlacedOrderWaUrl(waUrl);

      // Attempt automated background alert via CallMeBot if key is configured
      sendCallMeBotWhatsAppAlert(alertMsg);

      setPlaced(true);
      clear();
      trackPurchase(
        refId,
        totalPayable,
        lines.map((l) => ({ slug: l.slug, title: l.title, price: l.price })),
      );
      trackCartEvent({
        eventType: "checkout_complete",
        cartValue: totalPayable,
        userEmail: contact.email,
        userPhone: contact.phone,
      });
    } catch (err) {
      console.error(err);
      setPlaced(true);
      clear();
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  if (placed) {
    const isUpi = pay === "upi";
    return (
      <div className="mx-auto max-w-xl px-6 py-20 text-center">
        <div
          className={`h-16 w-16 mx-auto rounded-full flex items-center justify-center shadow-md ${
            isUpi
              ? "bg-amber-500/20 text-amber-600 border border-amber-300"
              : "bg-peacock text-ivory"
          }`}
        >
          {isUpi ? <Clock className="h-8 w-8 animate-pulse" /> : <Check className="h-8 w-8" />}
        </div>

        <span
          className={`eyebrow text-xs uppercase tracking-widest mt-6 block font-semibold ${
            isUpi ? "text-amber-600" : "text-primary"
          }`}
        >
          {isUpi ? "Payment Verification Pending" : "Order Placed Successfully"}
        </span>

        <h1 className="mt-2 font-display text-3xl sm:text-4xl">
          {isUpi ? "We Have Received Your Order!" : "Thank You For Your Order"}
        </h1>

        <p className="mt-2 text-xs font-mono text-muted-foreground">
          Order Reference #{placedOrderId?.slice(0, 8).toUpperCase()}
        </p>

        {isUpi && placedOrderUtr && (
          <div className="mt-6 p-4 bg-amber-50/80 border border-amber-200 rounded-lg text-left text-xs space-y-2 max-w-md mx-auto">
            <div className="flex items-center justify-between">
              <span className="text-neutral-500 font-medium">Submitted UTR / Ref ID:</span>
              <span className="font-mono font-bold text-neutral-900 bg-white px-2 py-0.5 rounded border border-amber-200">
                {placedOrderUtr}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-neutral-500 font-medium">Payment Status:</span>
              <span className="font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                Awaiting Admin Verification
              </span>
            </div>
            <p className="text-[11px] text-amber-900/80 pt-1 leading-relaxed">
              Our administrator has been alerted with your order details and is verifying your UPI
              transfer. Your order status will update to confirmed once approved.
            </p>
          </div>
        )}

        {/* WhatsApp Direct Receipt Dispatch Button */}
        {placedOrderWaUrl && (
          <div className="mt-6">
            <a
              href={placedOrderWaUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-semibold shadow-md transition-all hover:scale-[1.02]"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Send Receipt / Screenshot to Admin on WhatsApp</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>
            <p className="text-[11px] text-muted-foreground mt-2">
              Tap above to send your order summary and payment screenshot directly to our official
              WhatsApp support.
            </p>
          </div>
        )}

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          {user && (
            <Link
              to="/account"
              className="px-5 py-2.5 bg-primary text-primary-foreground text-xs font-medium rounded-md hover:bg-primary/90 transition-colors"
            >
              View Order in Account
            </Link>
          )}
          <Link
            to="/shop"
            className="px-5 py-2.5 border border-input text-xs font-medium text-foreground rounded-md hover:bg-accent transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-6 py-32 text-center">
        <h1 className="font-display text-4xl">Your bag is empty</h1>
        <Link to="/shop" className="mt-6 inline-block underline">
          Browse the collection
        </Link>
      </div>
    );
  }

  const steps = [
    { n: 1 as const, label: "Contact" },
    { n: 2 as const, label: "Shipping" },
    { n: 3 as const, label: "Payment" },
  ];

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-12 lg:py-20 grid lg:grid-cols-3 gap-12">
      <div className="lg:col-span-2">
        <header className="mb-10">
          <p className="eyebrow">Checkout</p>
          <h1 className="mt-3 font-display text-4xl lg:text-5xl">Almost there</h1>
        </header>

        <nav className="flex items-center gap-2 mb-10 text-sm">
          {steps.map((s, i) => (
            <div key={s.n} className="flex items-center gap-2">
              <span
                className={`h-7 w-7 rounded-full flex items-center justify-center text-xs ${
                  step >= s.n ? "bg-peacock text-ivory" : "bg-parchment text-muted-foreground"
                }`}
              >
                {step > s.n ? <Check className="h-3.5 w-3.5" /> : s.n}
              </span>
              <span className={step === s.n ? "text-foreground" : "text-muted-foreground"}>
                {s.label}
              </span>
              {i < steps.length - 1 && <span className="w-8 h-px bg-border mx-2" />}
            </div>
          ))}
        </nav>

        {step === 1 && (
          <section className="space-y-4">
            <Field
              label="Email"
              type="email"
              placeholder="you@email.com"
              value={contact.email}
              onChange={(e) => setContact({ ...contact, email: e.currentTarget.value })}
              error={contactErr.email}
            />
            <Field
              label="Phone"
              type="tel"
              placeholder="+91 98765 43210"
              value={contact.phone}
              onChange={(e) => setContact({ ...contact, phone: e.currentTarget.value })}
              error={contactErr.phone}
            />
            <button
              onClick={submitContact}
              className="mt-6 bg-foreground text-ivory px-7 py-3 rounded-full text-sm"
            >
              Continue to shipping
            </button>
          </section>
        )}

        {step === 2 && (
          <section className="space-y-4">
            <Field
              label="Full name"
              placeholder="Priya Sharma"
              value={shipping.name}
              onChange={(e) => setShipping({ ...shipping, name: e.currentTarget.value })}
              error={shipErr.name}
            />
            <Field
              label="Address line 1"
              placeholder="House / Flat / Street"
              value={shipping.address1}
              onChange={(e) => setShipping({ ...shipping, address1: e.currentTarget.value })}
              error={shipErr.address1}
            />
            <Field
              label="Address line 2"
              placeholder="Area / Landmark (optional)"
              value={shipping.address2}
              onChange={(e) => setShipping({ ...shipping, address2: e.currentTarget.value })}
            />
            <div className="grid grid-cols-3 gap-4">
              <Field
                label="City"
                placeholder="Mumbai"
                value={shipping.city}
                onChange={(e) => setShipping({ ...shipping, city: e.currentTarget.value })}
                error={shipErr.city}
              />
              <Field
                label="State"
                placeholder="Maharashtra"
                value={shipping.state}
                onChange={(e) => setShipping({ ...shipping, state: e.currentTarget.value })}
                error={shipErr.state}
              />
              <Field
                label="Pincode"
                placeholder="400001"
                value={shipping.pincode}
                onChange={(e) => setShipping({ ...shipping, pincode: e.currentTarget.value })}
                error={shipErr.pincode}
              />
            </div>

            {/* Pincode Delivery Checker */}
            {shipping.pincode.length === 6 && (
              <div className="mt-4 p-4 rounded-lg border border-border bg-parchment/30">
                {pincodeLoading ? (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Checking delivery availability...</span>
                  </div>
                ) : shippingResult ? (
                  <div className="space-y-2">
                    {shippingResult.isServiceable ? (
                      <>
                        <div className="flex items-center gap-2 text-xs">
                          <Truck className="h-4 w-4 text-peacock" />
                          <span className="font-medium text-foreground">
                            Delivery available to {shipping.pincode}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-xs">
                          <div className="bg-white p-2.5 rounded border border-border">
                            <span className="text-[10px] text-muted-foreground block mb-0.5">
                              Shipping Fee
                            </span>
                            <span className="font-semibold text-foreground">
                              {shippingResult.freeShipping ? (
                                <span className="text-emerald-600">FREE</span>
                              ) : (
                                inr(shippingResult.fee)
                              )}
                            </span>
                            {!shippingResult.freeShipping &&
                              shippingResult.remainingForFreeShipping > 0 && (
                                <span className="text-[10px] text-muted-foreground block mt-0.5">
                                  Free above {inr(shippingResult.freeShippingMin)}
                                </span>
                              )}
                          </div>
                          <div className="bg-white p-2.5 rounded border border-border">
                            <span className="text-[10px] text-muted-foreground block mb-0.5">
                              Estimated Delivery
                            </span>
                            <span className="font-semibold text-foreground">
                              {shippingResult.estimatedDays.min}–{shippingResult.estimatedDays.max}{" "}
                              days
                            </span>
                          </div>
                          <div className="bg-white p-2.5 rounded border border-border">
                            <span className="text-[10px] text-muted-foreground block mb-0.5">
                              Cash on Delivery
                            </span>
                            <span className="font-semibold text-foreground">
                              {shippingResult.codAvailable ? (
                                <span className="text-emerald-600">Available</span>
                              ) : (
                                <span className="text-rose">Not available</span>
                              )}
                            </span>
                          </div>
                        </div>
                        {!shippingResult.freeShipping &&
                          shippingResult.remainingForFreeShipping > 0 && (
                            <p className="text-[11px] text-muted-foreground">
                              Add {inr(shippingResult.remainingForFreeShipping)} more for free
                              shipping
                            </p>
                          )}
                      </>
                    ) : (
                      <div className="flex items-center gap-2 text-xs">
                        <Ban className="h-4 w-4 text-rose" />
                        <span className="font-medium text-rose">
                          Sorry, we don't deliver to this pincode yet
                        </span>
                      </div>
                    )}
                  </div>
                ) : pincodeChecked ? (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>Enter a valid 6-digit pincode to check delivery</span>
                  </div>
                ) : null}
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 rounded-full text-sm border border-border"
              >
                Back
              </button>
              <button
                onClick={submitShipping}
                className="bg-foreground text-ivory px-7 py-3 rounded-full text-sm"
              >
                Continue to payment
              </button>
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="space-y-6">
            {/* Payment Method Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-all ${
                  pay === "upi"
                    ? "border-peacock bg-peacock/5 shadow-sm ring-1 ring-peacock"
                    : "border-border hover:bg-parchment/40"
                }`}
              >
                <input
                  type="radio"
                  name="pay"
                  checked={pay === "upi"}
                  onChange={() => {
                    setPay("upi");
                    setUtrErr("");
                  }}
                  className="accent-peacock mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">Direct UPI / QR Code</span>
                    <span className="text-[10px] uppercase tracking-wider font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                      Recommended
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    GPay, PhonePe, Paytm, BHIM • Instant & 0% Fee
                  </p>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-all ${
                  pay === "cod"
                    ? "border-peacock bg-peacock/5 shadow-sm ring-1 ring-peacock"
                    : "border-border hover:bg-parchment/40"
                }`}
              >
                <input
                  type="radio"
                  name="pay"
                  checked={pay === "cod"}
                  onChange={() => {
                    setPay("cod");
                    setUtrErr("");
                  }}
                  className="accent-peacock mt-1"
                />
                <div className="flex-1">
                  <span className="font-semibold text-sm">Cash on Delivery</span>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Pay cash upon delivery • +₹49 handling
                  </p>
                </div>
              </label>
            </div>

            {/* DIRECT UPI PAYMENT PANEL */}
            {pay === "upi" && (
              <div className="p-6 rounded-xl border border-amber-200 bg-gradient-to-b from-amber-50/50 to-ivory shadow-sm space-y-6">
                {/* Beneficiary & Amount Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/80">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-peacock block">
                      Admin Payment Details
                    </span>
                    <h4 className="font-display text-base font-semibold text-foreground">
                      {PAYMENT_CONFIG.upiName}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-xs font-mono bg-white px-2.5 py-1 rounded border border-border text-foreground font-semibold">
                        {PAYMENT_CONFIG.upiId}
                      </code>
                      <button
                        type="button"
                        onClick={copyUpi}
                        className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 bg-white hover:bg-neutral-100 rounded border border-border transition-colors text-neutral-700"
                      >
                        {copiedUpi ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-700 font-semibold">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy ID</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="sm:text-right">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">
                      Amount Payable
                    </span>
                    <span className="font-display text-2xl font-bold text-peacock">
                      {inr(totalPayable)}
                    </span>
                  </div>
                </div>

                {/* QR Code & Mobile Pay Section */}
                <div className="flex flex-col md:flex-row items-center gap-6 justify-center bg-white p-5 rounded-lg border border-border">
                  {/* QR Code */}
                  <div className="flex flex-col items-center">
                    <div className="p-3 bg-white rounded-lg border-2 border-dashed border-amber-300 shadow-sm relative group">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                          upiUri,
                        )}&margin=8`}
                        alt="Admin UPI QR Code"
                        className="w-44 h-44 object-contain rounded"
                      />
                    </div>
                    <span className="text-[11px] text-muted-foreground font-medium mt-2 flex items-center gap-1">
                      <QrCode className="w-3.5 h-3.5 text-peacock" />
                      Scan with any UPI Scanner
                    </span>
                  </div>

                  {/* Step-by-Step Instructions & Mobile App Trigger */}
                  <div className="flex-1 space-y-3 max-w-sm">
                    <h5 className="font-semibold text-xs uppercase tracking-wider text-foreground">
                      How to complete payment:
                    </h5>
                    <ol className="text-xs text-muted-foreground space-y-2 list-decimal list-inside leading-relaxed">
                      <li>
                        Open <strong>Google Pay, PhonePe, Paytm, or BHIM</strong>.
                      </li>
                      <li>
                        Scan the QR code or transfer <strong>{inr(totalPayable)}</strong> to{" "}
                        <strong className="font-mono text-foreground">
                          {PAYMENT_CONFIG.upiId}
                        </strong>
                        .
                      </li>
                      <li>
                        Copy the <strong>12-digit UTR / UPI Transaction ID</strong> from your
                        payment receipt and enter it below.
                      </li>
                    </ol>

                    {/* Direct Mobile Deep Link Button */}
                    <div className="pt-2">
                      <a
                        href={upiUri}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-foreground text-ivory hover:bg-peacock text-xs font-semibold rounded-md transition-colors shadow-sm"
                      >
                        <Smartphone className="w-4 h-4" />
                        <span>Tap to Pay in UPI App (Mobile)</span>
                        <ExternalLink className="w-3 h-3 opacity-70" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* UTR Input Field */}
                <div className="bg-white p-4 rounded-lg border border-border space-y-2">
                  <label className="block">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                        <span>12-Digit Transaction / UTR / Reference ID</span>
                        <span className="text-rose font-bold">*</span>
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        Required for order verification
                      </span>
                    </div>
                    <input
                      type="text"
                      value={utr}
                      onChange={(e) => {
                        setUtr(e.target.value);
                        if (utrErr) setUtrErr("");
                      }}
                      placeholder="e.g. 423985712948 or UPI Ref ID"
                      className={`w-full bg-ivory border rounded-md px-3.5 py-2.5 text-xs font-mono tracking-wider focus:outline-none focus:ring-1 focus:ring-peacock ${
                        utrErr ? "border-rose" : "border-border"
                      }`}
                    />
                  </label>
                  {utrErr ? (
                    <p className="text-xs text-rose flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {utrErr}
                    </p>
                  ) : (
                    <p className="text-[11px] text-muted-foreground">
                      Found in your GPay / PhonePe / Paytm receipt under "UPI Transaction ID" or
                      "Bank Ref No."
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* COD NOTICE */}
            {pay === "cod" && (
              <div className="p-4 bg-muted/50 border border-border rounded-lg text-xs text-muted-foreground space-y-1">
                <p className="font-semibold text-foreground">Cash on Delivery Terms:</p>
                <p>
                  Please keep <strong>{inr(totalPayable)}</strong> in exact cash ready at the time
                  of delivery. A ₹49 handling charge is included.
                </p>
                {!shippingResult?.codAvailable && (
                  <p className="text-rose font-medium">
                    Note: COD may not be available for your pincode. Please check delivery terms.
                  </p>
                )}
                {shippingResult?.isServiceable && (
                  <p>
                    Expected delivery:{" "}
                    <strong>
                      {shippingResult.estimatedDays.min}–{shippingResult.estimatedDays.max} business
                      days
                    </strong>
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-3 mt-8">
              <button
                onClick={place}
                disabled={isSubmittingOrder}
                className="flex-1 bg-peacock text-ivory px-7 py-3 rounded-full text-sm tracking-wider flex items-center justify-center gap-2 hover:bg-peacock-deep transition-colors disabled:opacity-50"
              >
                <Lock className="h-3.5 w-3.5" />
                {isSubmittingOrder
                  ? "Placing Order..."
                  : pay === "upi"
                    ? `Submit UTR & Place Order — ${inr(totalPayable)}`
                    : `Place COD Order — ${inr(totalPayable)}`}
              </button>
            </div>
          </section>
        )}
      </div>

      <aside className="lg:sticky lg:top-24 self-start bg-parchment/50 p-7 rounded-sm border border-border">
        <p className="eyebrow mb-4">Order summary</p>
        <ul className="space-y-4 max-h-72 overflow-y-auto">
          {lines.map((l) => (
            <li key={l.slug} className="flex gap-3">
              <div className="relative">
                <img src={l.image} alt="" className="h-16 w-14 object-cover" />
                <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-foreground text-ivory text-[10px] flex items-center justify-center">
                  {l.qty}
                </span>
              </div>
              <div className="flex-1 text-sm">
                <p className="font-medium leading-tight">{l.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{inr(l.price * l.qty)}</p>
              </div>
            </li>
          ))}
        </ul>

        {/* Coupon Code Input */}
        <div className="mt-5 pt-4 border-t border-border">
          {appliedCoupon ? (
            <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2">
              <div className="flex items-center gap-2">
                <Tag className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-xs font-semibold text-emerald-800">
                  {appliedCoupon.code} applied: -{inr(discount)}
                </span>
              </div>
              <button
                onClick={handleRemoveCoupon}
                className="text-emerald-600 hover:text-emerald-800"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => {
                    setCouponCode(e.target.value.toUpperCase());
                    if (couponError) setCouponError("");
                  }}
                  placeholder="Coupon code"
                  className="flex-1 bg-ivory border border-border rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-peacock uppercase tracking-wider"
                />
                <button
                  onClick={handleApplyCoupon}
                  disabled={couponLoading || !couponCode.trim()}
                  className="px-4 py-2 bg-foreground text-ivory rounded-md text-xs font-semibold hover:bg-peacock-deep transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  {couponLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Apply"}
                </button>
              </div>
              {couponError && (
                <p className="mt-1.5 text-[11px] text-rose flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {couponError}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Referral Code Input */}
        <div className="mt-4 pt-4 border-t border-border">
          {referralApplied ? (
            <div className="flex items-center justify-between bg-peacock/5 border border-peacock/20 rounded-md px-3 py-2">
              <span className="text-xs font-semibold text-peacock">
                Referral: -₹{referralDiscount}
              </span>
              <button
                onClick={handleRemoveReferral}
                className="text-peacock hover:text-peacock-deep"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => {
                    setReferralCode(e.target.value.toUpperCase());
                    if (referralError) setReferralError("");
                  }}
                  placeholder="Referral code"
                  className="flex-1 bg-ivory border border-border rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-peacock uppercase tracking-wider"
                />
                <button
                  onClick={handleApplyReferral}
                  disabled={referralLoading || !referralCode.trim()}
                  className="px-4 py-2 bg-foreground text-ivory rounded-md text-xs font-semibold hover:bg-peacock-deep transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  {referralLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Apply"}
                </button>
              </div>
              {referralError && (
                <p className="mt-1.5 text-[11px] text-rose flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {referralError}
                </p>
              )}
            </div>
          )}
        </div>

        <dl className="mt-4 pt-4 border-t border-border space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd>{inr(subtotal)}</dd>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-emerald-700">
              <dt>Discount</dt>
              <dd>-{inr(discount)}</dd>
            </div>
          )}
          {referralDiscount > 0 && (
            <div className="flex justify-between text-peacock">
              <dt>Referral</dt>
              <dd>-₹{referralDiscount}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Shipping</dt>
            <dd>{ship === 0 ? "Free" : inr(ship)}</dd>
          </div>
          {shippingResult?.isServiceable && (
            <div className="flex justify-between text-xs text-muted-foreground">
              <dt>Estimated Delivery</dt>
              <dd>
                {shippingResult.estimatedDays.min}–{shippingResult.estimatedDays.max} business days
              </dd>
            </div>
          )}
          <div className="flex justify-between font-display text-lg pt-2 border-t border-border">
            <dt>Total</dt>
            <dd>{inr(totalPayable)}</dd>
          </div>
        </dl>
      </aside>
    </div>
  );
}

function Field({
  label,
  error,
  ...rest
}: { label: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="block text-xs eyebrow mb-2">{label}</span>
      <input
        {...rest}
        className={`w-full bg-ivory border rounded-sm px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-peacock ${error ? "border-rose" : "border-border"}`}
      />
      {error && <p className="mt-1 text-xs text-rose">{error}</p>}
    </label>
  );
}
