import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoArrowBackOutline, IoAdd, IoCheckmark } from "react-icons/io5";
import tap from "../assets/vegetables.svg";
import { FaPlus } from "react-icons/fa6";
import { FaMinus } from "react-icons/fa6";
import confirmed from "../assets/order confirm.svg";
import track from "../assets/track ice.svg";
import circle1 from "../assets/confirm order.svg";
import circle2 from "../assets/Empty.svg";
import { FaShoppingCart } from "react-icons/fa";

/* ========================================================================== */
/*                           CART DATA AND HELPERS                            */
/* ========================================================================== */

// Flat delivery fee in kobo (N500.00). Change it here.
// The rider's phone number. Use the international format: +234 and drop the
// leading 0. Later, take this from the order data instead.
const RIDER_PHONE = "+2348012345678";
const DELIVERY_FEE_KOBO = 50000;

interface DeliveryOption {
  id: "delivery" | "collect";
  title: string;
  description: string;
  feeKobo: number; // delivery fee for this option, in kobo
}

// Mock "API" response: the two delivery options
const deliveryOptions: DeliveryOption[] = [
  {
    id: "delivery",
    title: "🚚 Delivery Available",
    description: "Deliver to your doorstep",
    feeKobo: DELIVERY_FEE_KOBO,
  },
  {
    id: "collect",
    title: "📦 Click & Collect",
    description: "Pick up at the supermarket",
    feeKobo: 0,
  },
];

// The address / time / payment text that changes with the chosen option
const checkoutDetails = {
  delivery: {
    addressLabel: "Delivery Address",
    addressTitle: "Home",
    addressText: "No 3 Precious road Upper meniru busstop agbani road,enugu",
    timeLabel: "Delivery Time",
    timeTitle: "As soon as possible",
    timeText: "20 - 30 mins",
    payment: "Cash on delivery",
    titleSize: "text-[18px]",
  },
  collect: {
    addressLabel: "Pickup Address",
    addressTitle: "Supermarket",
    addressText: "No 3 Precious road Upper oneday busstop agbani road,enugu",
    timeLabel: "Pickup Time",
    timeTitle: "Meet receptionist",
    timeText: "Any time before 9pm",
    payment: "Pay at the supermarket",
    titleSize: "text-[15px]",
  },
};

// The steps shown on the Track Order screen. The wording of the last two
// depends on whether the order is delivered or collected.
const getTrackingSteps = (option: string | null) => [
  { title: "Order Confirmed", text: "We’ve received your order" },
  { title: "Preparing Your Order", text: "Your items are being packed" },
  option === "collect"
    ? {
        title: "Ready for Pickup",
        text: "Come and collect it at the supermarket",
      }
    : { title: "Out for Delivery", text: "Your rider is on the way" },
  option === "collect"
    ? { title: "Picked Up", text: "Enjoy your order" }
    : { title: "Delivered", text: "Enjoy your order" },
];

// Which step the order is on right now (0 = first). Mock value: replace it
// with the real status from your API when you have one.
const TRACKING_ACTIVE_STEP = 1;

export interface CartItem {
  id: number;
  name: string;
  price: string; // unit price as shown, e.g. "N400.02"
  image: string;
  quantity: number;
  addedAt: number; // timestamp, used for "Added 5s ago"
}

const CART_KEY = "cartItems";

// Where the screen you were on is remembered while you visit other pages
const SCREEN_KEY = "cartScreen";
const OPTION_KEY = "cartOption";

// How long the dots show after tapping Check Out (milliseconds)
const CHECKOUT_LOADING_MS = 1500;

// How long the dots show after tapping Place Order (milliseconds)
const PLACE_ORDER_LOADING_MS = 1500;

// How long the blue spinner shows after tapping Track Order (milliseconds)
const TRACK_ORDER_LOADING_MS = 1500;

// Fired whenever the cart changes, so the footer badge can update
export const CART_UPDATED_EVENT = "cart-updated";

export const getCart = (): CartItem[] => {
  try {
    const raw = localStorage.getItem(CART_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveCart = (items: CartItem[]) => {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  } catch {
    // storage unavailable: the cart just won't persist
  }
  // Tell the footer (and anything else listening) that the cart changed
  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
};

// Used by the Category page. Adding the same product again adds to its quantity.
export const addToCart = (item: Omit<CartItem, "addedAt">) => {
  const cart = getCart();
  const existing = cart.find((c) => c.id === item.id);
  if (existing) {
    existing.quantity += item.quantity;
    existing.addedAt = Date.now();
  } else {
    cart.push({ ...item, addedAt: Date.now() });
  }
  saveCart(cart);
};

const updateQuantity = (id: number, quantity: number) => {
  saveCart(
    getCart().map((c) =>
      c.id === id ? { ...c, quantity: Math.max(1, quantity) } : c,
    ),
  );
};

// "N1,450.07" -> 145007 (kobo, so the maths has no decimal errors)
const toKobo = (price: string) =>
  Math.round(parseFloat(price.replace(/[^0-9.]/g, "")) * 100);

// 145007 -> "N1,450.07"
const formatNaira = (kobo: number) =>
  "N" +
  (kobo / 100).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

// timestamp -> "Added 5s ago"
const timeAgo = (ts?: number) => {
  if (!ts) return "Added earlier";
  const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (s < 5) return "Added just now";
  if (s < 60) return `Added ${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `Added ${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `Added ${h}h ago`;
  return `Added ${Math.floor(h / 24)}d ago`;
};

/* ========================================================================== */
/*                               SUMMARY ROWS                                 */
/* ========================================================================== */

// Product / Delivery Fee / Total, used on both the cart and checkout screens
const SummaryRows = ({
  productKobo,
  deliveryKobo,
  totalKobo,
  className = "mt-8",
}: {
  productKobo: number;
  deliveryKobo: number;
  totalKobo: number;
  className?: string;
}) => {
  const rows = [
    { label: "Product", value: productKobo },
    { label: "Delivery Fee", value: deliveryKobo },
    { label: "Total", value: totalKobo },
  ];

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex items-center justify-between gap-3"
        >
          <p className="text-[16px] font-semibold text-[#2C3E50] min-[380px]:text-[20px]">
            {row.label}
          </p>
          <p className="whitespace-nowrap text-[16px] font-semibold text-[#2C3E50] min-[380px]:text-[20px]">
            {formatNaira(row.value)}
          </p>
        </div>
      ))}
    </div>
  );
};

/* ========================================================================== */
/*                                 THREE DOTS                                 */
/* ========================================================================== */

// Three bouncing dots, used as the loading state on the Check Out and
// Place Order buttons
const LoadingDots = () => (
  <span
    className="flex items-center gap-1.5"
    role="status"
    aria-label="Loading"
  >
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className="h-2 w-2 animate-bounce rounded-full bg-white"
        style={{ animationDelay: `${i * 150}ms` }}
      />
    ))}
  </span>
);

/* ========================================================================== */
/*                                    PAGE                                    */
/* ========================================================================== */

type Step = "cart" | "checkout" | "confirmation" | "tracking";

// What we store in the browser history so a refresh or back/forward stays put
interface HistoryState {
  cartStep?: Step;
  option?: string; // the delivery option that was chosen
}

// Work out which screen a history entry belongs to
const getStep = (state: HistoryState | null): Step => {
  const wanted = state?.cartStep;
  if (wanted === "confirmation" || wanted === "tracking") {
    // These screens need to know what was ordered; without it, go back a step
    return state?.option ? wanted : "checkout";
  }
  if (state?.cartStep === "checkout") return "checkout";
  return "cart";
};

// The screen saved the last time the cart page was open (survives leaving the
// page and coming back, and lasts until the browser tab is closed)
const readSavedScreen = (): HistoryState => {
  try {
    const step = sessionStorage.getItem(SCREEN_KEY);
    const option = sessionStorage.getItem(OPTION_KEY) ?? undefined;
    if (step === "checkout" || step === "confirmation" || step === "tracking") {
      return { cartStep: step, option };
    }
  } catch {
    // storage unavailable: the page just opens on the cart screen
  }
  return {};
};

// Where the page should start. A history entry that already knows its screen
// (refresh, back/forward) wins. Otherwise use the saved screen.
const getStartState = (): HistoryState => {
  const fromHistory = window.history.state as HistoryState | null;
  const saved = readSavedScreen();
  if (fromHistory?.cartStep) {
    return {
      cartStep: fromHistory.cartStep,
      option: fromHistory.option ?? saved.option,
    };
  }
  return saved;
};

const Cart = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<CartItem[]>(getCart);

  // Which screen is showing. Restored from history or from what was saved.
  const [step, setStep] = useState<Step>(() => getStep(getStartState()));

  // Which delivery option is chosen on the checkout screen (null = none yet)
  const [selectedOption, setSelectedOption] = useState<string | null>(
    () => getStartState().option ?? null,
  );

  // The order total, kept on screen after the cart has been emptied
  const [orderTotalKobo, setOrderTotalKobo] = useState<number | null>(null);

  // ---- Loading dots on the Check Out and Place Order buttons ----
  const [isLoading, setIsLoading] = useState(false);
  const [isPlacing, setIsPlacing] = useState(false);
  const [isOpeningTracking, setIsOpeningTracking] = useState(false);
  const loadingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopLoading = () => {
    if (loadingTimer.current) {
      clearTimeout(loadingTimer.current);
      loadingTimer.current = null;
    }
    setIsLoading(false);
    setIsPlacing(false);
    setIsOpeningTracking(false);
  };

  const openCheckout = () => {
    // Pass the current URL so the route stays /cart, and keep the router's own state
    window.history.pushState(
      { ...(window.history.state ?? {}), cartStep: "checkout" },
      "",
      window.location.href,
    );
    setStep("checkout");
    window.scrollTo(0, 0);
  };

  // The confirmation screen replaces the checkout entry in the history, so
  // pressing back from it goes straight to the cart (not back to Place Order).
  const openConfirmation = () => {
    window.history.replaceState(
      {
        ...(window.history.state ?? {}),
        cartStep: "confirmation",
        option: selectedOption,
      },
      "",
      window.location.href,
    );
    setStep("confirmation");
    window.scrollTo(0, 0);
  };

  // Track Order is a new history entry on top of the confirmation screen,
  // so back from it returns to the confirmation screen.
  const openTracking = () => {
    window.history.pushState(
      {
        ...(window.history.state ?? {}),
        cartStep: "tracking",
        option: selectedOption,
      },
      "",
      window.location.href,
    );
    setStep("tracking");
    window.scrollTo(0, 0);
  };

  const closeTracking = () => {
    if (window.history.state?.cartStep === "tracking") {
      window.history.back(); // the popstate listener below updates the screen
    } else {
      setStep("confirmation");
    }
  };

  const closeConfirmation = () => {
    if (window.history.state?.cartStep === "confirmation") {
      window.history.back(); // the popstate listener below updates the screen
    } else {
      setStep("cart");
    }
  };

  const closeCheckout = () => {
    if (window.history.state?.cartStep === "checkout") {
      window.history.back(); // the popstate listener below updates the screen
    } else {
      setStep("cart"); // page was opened directly on the checkout screen
    }
  };

  const handleCheckout = () => {
    if (isLoading || items.length === 0) return; // ignore repeat taps

    setIsLoading(true);

    // Dots show briefly, then the loading state always clears and checkout opens.
    // If you later call an API here, replace the timeout with `await yourRequest()`.
    loadingTimer.current = setTimeout(() => {
      stopLoading();
      openCheckout();
    }, CHECKOUT_LOADING_MS);
  };

  const handlePlaceOrder = () => {
    if (isPlacing || !selectedOption) return; // ignore repeat taps

    setIsPlacing(true);

    // Dots show briefly, then the loading state clears and the confirmation
    // screen opens. If you later call an API here, replace the timeout with
    // `await yourRequest()` and only open the confirmation when it succeeds.
    loadingTimer.current = setTimeout(() => {
      stopLoading();
      openConfirmation();
    }, PLACE_ORDER_LOADING_MS);
  };

  const handleTrackOrder = () => {
    if (isOpeningTracking) return; // ignore repeat taps

    setIsOpeningTracking(true);

    // The white spinner screen shows briefly, then it clears and the Track
    // Order screen opens. If you later load the order status from an API,
    // replace the timeout with `await yourRequest()`.
    loadingTimer.current = setTimeout(() => {
      stopLoading();
      openTracking();
    }, TRACK_ORDER_LOADING_MS);
  };

  // Clear any pending timer if the page is left, so nothing fires afterwards
  useEffect(() => {
    return () => {
      if (loadingTimer.current) clearTimeout(loadingTimer.current);
    };
  }, []);

  // Keep in sync with the browser/phone back and forward buttons.
  // Going back also clears the dots, so they can never stay stuck.
  useEffect(() => {
    const onPopState = (e: PopStateEvent) => {
      stopLoading();
      const state = e.state as HistoryState | null;
      setStep(getStep(state));
      if (state?.option) setSelectedOption(state.option);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const handleQuantity = (id: number, quantity: number) => {
    updateQuantity(id, quantity);
    setItems(getCart());
  };

  // ---- Summary: always calculated from the items in the cart ----
  const productKobo = items.reduce(
    (sum, item) => sum + toKobo(item.price) * item.quantity,
    0,
  );
  const deliveryKobo = items.length > 0 ? DELIVERY_FEE_KOBO : 0;
  const totalKobo = productKobo + deliveryKobo;

  // ---- Checkout summary: same product total as the cart page, plus the
  //      delivery fee of the option that was chosen (N0.00 until one is) ----
  const chosenOption = deliveryOptions.find((o) => o.id === selectedOption);
  const checkoutDeliveryKobo = chosenOption?.feeKobo ?? 0;
  const checkoutTotalKobo = productKobo + checkoutDeliveryKobo;

  // Delivery shows the delivery info. Click & Collect (or nothing selected
  // yet) shows the pickup info.
  const details =
    selectedOption === "delivery"
      ? checkoutDetails.delivery
      : checkoutDetails.collect;

  // An empty cart has nothing to check out, so show the cart screen. The one
  // exception: an order that was just delivered stays on its own screens.
  const orderDone =
    orderTotalKobo !== null && (step === "confirmation" || step === "tracking");
  const screen: Step = items.length === 0 && !orderDone ? "cart" : step;

  // Remember the screen and the chosen option, so leaving the cart page (to
  // Home, for example) and coming back puts you exactly where you were.
  useEffect(() => {
    try {
      sessionStorage.setItem(SCREEN_KEY, screen);
      if (selectedOption) {
        sessionStorage.setItem(OPTION_KEY, selectedOption);
      } else {
        sessionStorage.removeItem(OPTION_KEY);
      }
    } catch {
      // storage unavailable: the page just opens on the cart screen next time
    }
  }, [screen, selectedOption]);

  // When the page opens straight onto the checkout or confirmation screen
  // (restored from the saved screen), give that screen its own history entry
  // so the phone/browser back button goes to the cart screen first.
  useEffect(() => {
    const current = window.history.state as HistoryState | null;
    if (screen !== "cart" && current?.cartStep !== screen) {
      // Track Order sits on top of the confirmation screen, so rebuild both
      if (screen === "tracking") {
        window.history.pushState(
          {
            ...(current ?? {}),
            cartStep: "confirmation",
            option: selectedOption,
          },
          "",
          window.location.href,
        );
      }
      window.history.pushState(
        {
          ...(current ?? {}),
          cartStep: screen,
          ...(screen !== "checkout" ? { option: selectedOption } : {}),
        },
        "",
        window.location.href,
      );
    }
    // Runs once on open, using the screen the page started on
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Track Order animation: wait a moment, then each line draws down to the next
  // circle (one after the other). The tick shows when its line arrives.
  const TRACK_START_MS = 1000; // pause before the first line starts
  const TRACK_LINE_MS = 1500; // how long each line takes to draw
  const TRACK_LINES_TO_DRAW = 3; // one line down to each circle after the first

  /* -------------------------------------------------------------------------- */
  /* PART 2: add this inside Cart, above the first `if (screen === ...)`.        */
  /* Good spot: right after the "Remember the screen..." useEffect.              */
  /* -------------------------------------------------------------------------- */

  // Track Order: how many lines have been drawn so far (0 = none yet)
  const [linesDrawn, setLinesDrawn] = useState(0);

  // Becomes true the moment the last line touches the "Delivered" circle
  const [isDelivered, setIsDelivered] = useState(false);

  // When the order is delivered: keep its total, then empty the cart.
  // saveCart also tells the footer, so its badge updates by itself.
  useEffect(() => {
    if (!isDelivered) return;
    setOrderTotalKobo((prev) => prev ?? checkoutTotalKobo);
    saveCart([]);
    setItems([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDelivered]);

  useEffect(() => {
    if (screen !== "tracking") return;

    const timers: ReturnType<typeof setTimeout>[] = [];

    for (let drawn = 1; drawn <= TRACK_LINES_TO_DRAW; drawn++) {
      timers.push(
        setTimeout(
          () => setLinesDrawn(drawn),
          TRACK_START_MS + (drawn - 1) * TRACK_LINE_MS,
        ),
      );
    }

    // The last line finishes drawing TRACK_LINE_MS after it starts. That is the
    // moment it touches "Delivered", so the message changes then.
    timers.push(
      setTimeout(
        () => setIsDelivered(true),
        TRACK_START_MS + TRACK_LINES_TO_DRAW * TRACK_LINE_MS,
      ),
    );

    // Leaving the screen stops the timers and resets it for next time
    return () => {
      timers.forEach(clearTimeout);
      setLinesDrawn(0);
      setIsDelivered(false);
    };
  }, [screen]);

  /* ------------------------------ Tracking screen --------------------------- */

  if (screen === "tracking") {
    const trackingSteps = getTrackingSteps(selectedOption);

    // The 2nd, 3rd and 4th circles show their tick once the line above them has
    // been drawn. The tick waits for that line to finish.
    const secondTicked = linesDrawn >= 1;
    const thirdTicked = linesDrawn >= 2;
    const fourthTicked = linesDrawn >= 3;
    const tickDelay = { transitionDelay: `${TRACK_LINE_MS}ms` };
    const lineTime = { transitionDuration: `${TRACK_LINE_MS}ms` };

    return (
      <>
        <div className="w-full overflow-x-hidden p-4 ">
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={closeTracking}
              aria-label="Back to order confirmation"
              className="flex shrink-0 items-center"
            >
              <IoArrowBackOutline className="h-6 w-6 shrink-0 text-[#121212]" />
            </button>

            <p className="text-[16px] text-black font-semibold">Track Order</p>
          </div>
        </div>
        <div className="bg-[#1A2B4C] rounded-tr-[20px] rounded-tl-[20px] w-full min-h-42.5 flex p-3 mt-3">
          <img
            src={track}
            alt=""
            className="h-auto max-w-[40%] shrink-0 object-contain"
          />

          <div className="flex flex-col gap-7.5 ml-2 min-w-0 flex-1">
            <div className="flex flex-col font-semibold mt-2">
              <h5 className="truncate font-semibold text-[18px] min-[380px]:text-[20px] text-white">
                KC - 704512
              </h5>
              <p className="truncate font-semibold text-[#FF8C00] text-[14px] min-[380px]:text-[16px]">
                IceCold Supermarket
              </p>
            </div>

            <p className="font-bold text-[20px] min-[380px]:text-[22px] text-white -mt-6">
              {formatNaira(orderTotalKobo ?? checkoutTotalKobo)}
            </p>
            <div className="flex flex-wrap -mt-2 gap-x-8 gap-y-1">
              <p className="font-normal text-[#FF8C00] text-[14px]">Ongoing</p>
              <p className="font-normal text-[14px] text-white">20 - 30 mins</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-12 p-5 min-[380px]:p-8">
          {/* 1st circle: always ticked. Its line draws first. */}
          <div className="flex gap-4 min-[380px]:gap-6">
            <div className="-mb-12 flex flex-col items-center">
              <img src={circle1} alt="" className="shrink-0" />
              <span className="relative w-0.5 flex-1 overflow-hidden bg-[#E0E0E0]">
                <span
                  className={`absolute inset-0 origin-top bg-[#1A2B4C] transition-transform ease-linear ${
                    secondTicked ? "scale-y-100" : "scale-y-0"
                  }`}
                  style={lineTime}
                />
              </span>
            </div>
            <div className="flex flex-col min-w-0">
              <h4 className="font-semibold text-[15px] min-[380px]:text-[16px] text-[#27AE60]">
                Order Confirmed
              </h4>

              <p className="font-normal text-[13px] min-[380px]:text-[14px] text-[#7F8C8D]">
                May 12,2026 02 : 31pm
              </p>
            </div>
          </div>

          {/* 2nd circle: empty until the first line reaches it */}
          <div className="flex gap-4 min-[380px]:gap-6">
            <div className="-mb-12 flex flex-col items-center">
              <div className="relative shrink-0">
                <img src={circle2} alt="" />
                <img
                  src={circle1}
                  alt=""
                  className={`absolute left-0 top-0 transition-opacity duration-300 ${
                    secondTicked ? "opacity-100" : "opacity-0"
                  }`}
                  style={tickDelay}
                />
              </div>
              <span className="relative w-0.5 flex-1 overflow-hidden bg-[#E0E0E0]">
                <span
                  className={`absolute inset-0 origin-top bg-[#1A2B4C] transition-transform ease-linear ${
                    thirdTicked ? "scale-y-100" : "scale-y-0"
                  }`}
                  style={lineTime}
                />
              </span>
            </div>
            <div className="flex flex-col min-w-0">
              <h4 className="font-semibold text-[15px] min-[380px]:text-[16px] text-[#27AE60]">
                Preparing Your Order
              </h4>

              <p className="font-normal text-[13px] min-[380px]:text-[14px] text-[#7F8C8D]">
                May 12,2026 02 : 36pm
              </p>
            </div>
          </div>

          {/* 3rd circle: empty until the second line reaches it */}
          <div className="flex gap-4 min-[380px]:gap-6">
            <div className="-mb-12 flex flex-col items-center">
              <div className="relative shrink-0">
                <img src={circle2} alt="" />
                <img
                  src={circle1}
                  alt=""
                  className={`absolute left-0 top-0 transition-opacity duration-300 ${
                    thirdTicked ? "opacity-100" : "opacity-0"
                  }`}
                  style={tickDelay}
                />
              </div>
              <span className="relative w-0.5 flex-1 overflow-hidden bg-[#E0E0E0]">
                <span
                  className={`absolute inset-0 origin-top bg-[#1A2B4C] transition-transform ease-linear ${
                    fourthTicked ? "scale-y-100" : "scale-y-0"
                  }`}
                  style={lineTime}
                />
              </span>
            </div>
            <div className="flex flex-col min-w-0">
              <h4 className="font-semibold text-[15px] min-[380px]:text-[16px] text-[#27AE60]">
                Out For Delivery
              </h4>

              <p className="font-normal text-[13px] min-[380px]:text-[14px] text-[#7F8C8D]">
                May 12,2026 02 : 39pm
              </p>
            </div>
          </div>

          {/* 4th circle: empty until the last line touches it, then it gets its
            tick and "Pending" changes to the thank-you message */}
          <div className="flex gap-4 min-[380px]:gap-6">
            <div className="relative shrink-0">
              <img src={circle2} alt="" />
              <img
                src={circle1}
                alt=""
                className={`absolute left-0 top-0 transition-opacity duration-300 ${
                  fourthTicked ? "opacity-100" : "opacity-0"
                }`}
                style={tickDelay}
              />
            </div>
            <div className="flex flex-col min-w-0">
              <h4 className="font-semibold text-[15px] min-[380px]:text-[16px] text-[#2C3E50]">
                Delivered
              </h4>

              {isDelivered ? (
                <p className="font-normal text-[13px] min-[380px]:text-[14px] text-[#27AE60]">
                  Successfully delivered. Thank you
                </p>
              ) : (
                <p className="font-normal text-[13px] min-[380px]:text-[14px] text-[#FF8C00]">
                  Pending
                </p>
              )}
            </div>
          </div>
        </div>
        <a
          href={`tel:${RIDER_PHONE}`}
          aria-label="Call rider"
          className="flex bg-[#1A2B4C] rounded-[10px] text-white
   max-w-95 w-[calc(100%-2rem)] h-10 items-center justify-center mx-auto gap-6.25 mt-8 mb-28"
        >
          <span className="font-semibold text-[16px]">Call Rider</span>

          <FaShoppingCart className="" />
        </a>
      </>
    );
  }

  /* ---------------------------- Confirmation screen ------------------------- */
  if (screen === "confirmation") {
    return (
      <>
        <div className="flex flex-col items-center justify-center min-h-screen">
          {/* Blank white screen with a blue spinning circle, shown while the
            Track Order screen is loading */}
          {isOpeningTracking && (
            <div className="fixed inset-0 z-100 flex items-center justify-center bg-white">
              <div
                role="status"
                aria-label="Loading"
                className="h-12 w-12 animate-spin rounded-full border-4 border-[#2F80ED]/20 border-t-[#2F80ED]"
              />
            </div>
          )}

          <img src={confirmed} alt="" />

          <h5 className="font-bold text-[28px] text-[#2C3E50]">
            Order Confirmed!
          </h5>

          <div className="flex flex-col font-normal text-[14px] text-black items-center justify-center">
            <p>Thank you for shopping with KoloCart</p>
            <p className="w-69.5 text-center">
              We’ve received your order and it will be on the way soon
            </p>
          </div>

          <div className="flex w-full gap-40.5 items-center justify-center mt-12">
            <div className="flex flex-col">
              <h4 className="font-normal text-[14px] text-[#7F8C8D]">
                Order Number
              </h4>

              <p className="font-semibold text-[16px] text-[#2C3E50]">
                KC-784652
              </p>
            </div>

            <div className="flex flex-col">
              <h4 className="font-normal text-[14px] text-[#7F8C8D]">
                Estimated Time
              </h4>

              <p className="font-semibold text-[16px] text-[#2C3E50]">
                20 - 30 mins
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleTrackOrder}
            disabled={isOpeningTracking}
            aria-busy={isOpeningTracking}
            className="bg-[#1A2B4C] rounded-[10px] w-full text-white h-12 font-semibold text-[16px] max-w-90.25 mt-9"
          >
            Track Order
          </button>

          <p className="font-semibold text-[#7F8C8D] text-[16px] mt-6">
            Continue Shopping
          </p>
        </div>
      </>
    );
  }

  /* ------------------------------ Checkout screen --------------------------- */
  if (screen === "checkout") {
    return (
      <div className="w-full overflow-x-hidden p-4 pb-28">
        <div className="flex items-center gap-5 justify-between max-w-55.75">
          <button
            type="button"
            onClick={closeCheckout}
            aria-label="Back to cart"
            className="flex shrink-0 items-center"
          >
            <IoArrowBackOutline className="h-6 w-6 shrink-0 text-[#121212]" />
          </button>

          <p className="text-[16px] text-black font-semibold">Checkout</p>
        </div>

        {/* Delivery options: tap one to select it */}
        <div className="flex flex-col mt-6">
          {deliveryOptions.map((option, index) => {
            const isSelected = selectedOption === option.id;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setSelectedOption(option.id)}
                disabled={isPlacing}
                aria-pressed={isSelected}
                className={`flex border border-black bg-[#F3EDF7] pl-8 pr-4 pt-0.5 w-full gap-4 min-h-13.75 rounded-[10px] text-left ${
                  index > 0 ? "mt-6" : ""
                } ${isSelected ? "ring-2 ring-[#2F80ED]" : ""}`}
              >
                {/* Radio circle: outer ring, with a gap before the filled dot */}
                <span
                  aria-hidden="true"
                  className="mt-1.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-[#2C3E50] p-0.5"
                >
                  <span
                    className={`h-full w-full rounded-full ${
                      isSelected ? "bg-[#2C3E50]" : "bg-transparent"
                    }`}
                  />
                </span>

                <div className="flex-col flex min-w-0">
                  <p className="font-semibold text-[#2C3E50] text-[16px] -ml-2">
                    {option.title}
                  </p>
                  <p className="font-normal text-[14px] text-[#2C3E50] -ml-8">
                    {option.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Address: Delivery Address or Pickup Address */}
        <h6 className="text-black font-medium text-[12px] mt-4">
          {details.addressLabel}
        </h6>

        <div className="rounded-xl w-full gap-2 bg-[#F3EDF7] flex justify-between min-h-15 p-2 py-2 shadow-[0_2px_6px_2px_rgba(0,0,0,0.15),0_1px_2px_0_rgba(0,0,0,0.3)] mt-1">
          <div className="flex min-w-0 flex-1 flex-col">
            <h4 className={`font-semibold text-[#2C3E50] ${details.titleSize}`}>
              {details.addressTitle}
            </h4>
            <p className="font-medium text-[#7F8C8D] text-[12px]">
              {details.addressText}
            </p>
          </div>

          <p className="shrink-0 whitespace-nowrap font-medium text-[12px] text-[#7F8C8D]">
            Change
          </p>
        </div>

        {/* Time: Delivery Time or Pickup Time */}
        <h6 className="text-black font-medium text-[12px] mt-4">
          {details.timeLabel}
        </h6>

        <div className="rounded-xl w-full gap-2 bg-[#F3EDF7] flex min-h-15 p-2 py-2 shadow-[0_2px_6px_2px_rgba(0,0,0,0.15),0_1px_2px_0_rgba(0,0,0,0.3)] mt-1 justify-between">
          <div className="flex min-w-0 flex-1 flex-col">
            <h4 className={`font-semibold text-[#2C3E50] ${details.titleSize}`}>
              {details.timeTitle}
            </h4>
            <p className="font-medium text-[#7F8C8D] text-[12px]">
              {details.timeText}
            </p>
          </div>

          <p className="shrink-0 whitespace-nowrap font-medium text-[12px] text-[#7F8C8D]">
            Change
          </p>
        </div>

        {/* Payment method */}
        <h6 className="text-black font-medium text-[12px] mt-4">
          Payment Method
        </h6>

        <div className="rounded-xl w-full gap-2 bg-[#F3EDF7] flex min-h-10 items-center p-2 shadow-[0_2px_6px_2px_rgba(0,0,0,0.15),0_1px_2px_0_rgba(0,0,0,0.3)] mt-1">
          <div className="flex w-full items-center justify-between gap-2">
            <h4 className="font-medium text-[#7F8C8D] text-[12px]">
              {details.payment}
            </h4>
            <p className="shrink-0 whitespace-nowrap font-medium text-[12px] text-[#7F8C8D]">
              Change
            </p>
          </div>
        </div>

        <h5 className="font-bold text-[#2C3E50] text-[22px] mt-6">
          Order Summary
        </h5>

        <SummaryRows
          productKobo={productKobo}
          deliveryKobo={checkoutDeliveryKobo}
          totalKobo={checkoutTotalKobo}
          className="mt-6 gap-4"
        />

        {/* Disabled until Delivery or Click & Collect is selected.
            Shows the dots while the order is being placed. */}
        <button
          type="button"
          onClick={handlePlaceOrder}
          disabled={!selectedOption || isPlacing}
          aria-busy={isPlacing}
          className="mt-4 flex h-12 w-full items-center justify-center rounded-[10px] bg-[#1A2B4C] text-[16px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPlacing ? <LoadingDots /> : "Place Order"}
        </button>
      </div>
    );
  }

  /* -------------------------------- Cart screen ----------------------------- */
  return (
    <>
      <div className="w-full overflow-x-hidden p-4 pb-28">
        <div className="flex justify-between gap-2">
          <div className="flex min-w-0 gap-3 min-[360px]:gap-4.5">
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label="Go back"
              className="flex shrink-0 items-center"
            >
              <IoArrowBackOutline className="h-6 w-6 shrink-0 text-[#121212]" />
            </button>

            <p className="min-w-0 truncate font-semibold">
              My Cart ({items.length})
            </p>
          </div>

          <img src={tap} alt="" className="h-9 w-9 shrink-0" />
        </div>

        {items.length === 0 && (
          <p className="mt-16 text-center text-[14px] text-[#7F8C8D]">
            Your cart is empty.
          </p>
        )}

        {items.map((item) => (
          /* Card */
          <div
            key={item.id}
            className="relative mt-8 min-h-32 w-full rounded-[5px] border-2 border-[#F3EDF7] px-2.5 py-2"
          >
            {/* Top row: image + product details.
                pr-18 keeps the text clear of the pinned right column. */}
            <div className="flex gap-2.75 pr-18">
              <img
                src={item.image}
                alt=""
                className="h-14 w-14 shrink-0 rounded-xl object-cover"
              />

              <div className="-mt-0.5 flex min-w-0 flex-1 flex-col">
                <h6 className="wrap-break-word text-[15px] font-semibold text-[#2C3E50] min-[380px]:text-[16px]">
                  {item.name}
                </h6>

                {/* Exact amount: unit price x quantity */}
                <p className="text-[14px] font-normal text-[#1A2B4C]">
                  {formatNaira(toKobo(item.price) * item.quantity)}
                </p>

                <p className="text-[12px] font-medium text-[#7F8C8D]">
                  {timeAgo(item.addedAt)}
                </p>
              </div>
            </div>

            {/* Plus button + "View details", pinned to the top-right corner */}
            <div className="absolute right-2.75 top-1.5 flex flex-col items-center">
              <button
                type="button"
                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8DEF8]"
              >
                <IoAdd className="h-6 w-6 text-[#4A4459]" />
              </button>
              <p className="whitespace-nowrap text-[12px] font-medium text-[#2C3E50]">
                View details
              </p>
            </div>

            {/* Quantity row */}
            <div className="mt-4.5 flex items-center justify-between gap-2">
              <div className="ml-16.75 flex shrink-0 gap-0.5 text-[#2C3E50]">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  disabled={item.quantity === 1}
                  onClick={() => handleQuantity(item.id, item.quantity - 1)}
                  className="flex h-7.5 w-9.25 items-center justify-center rounded-[5px] border border-[#7F8C8D] disabled:opacity-40"
                >
                  <FaMinus className="h-3 w-3" />
                </button>

                <div className="flex h-7.5 min-w-12 items-center justify-center rounded-[5px] border border-[#7F8C8D] px-1 text-[22px] font-semibold leading-none">
                  {item.quantity}
                </div>

                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => handleQuantity(item.id, item.quantity + 1)}
                  className="flex h-7.5 w-9.25 items-center justify-center rounded-[5px] border border-[#7F8C8D]"
                >
                  <FaPlus className="h-3 w-3" />
                </button>
              </div>

              <img
                src={tap}
                alt=""
                className="h-7 w-7 shrink-0 object-contain"
              />
            </div>
          </div>
        ))}

        {/* Summary: matches the items above and updates as the cart changes */}
        <SummaryRows
          productKobo={productKobo}
          deliveryKobo={deliveryKobo}
          totalKobo={totalKobo}
        />

        <button
          type="button"
          onClick={handleCheckout}
          disabled={items.length === 0 || isLoading}
          aria-busy={isLoading}
          className="mt-6 flex h-12 w-full items-center justify-center rounded-[10px] bg-[#1A2B4C] text-[16px] font-semibold text-white disabled:opacity-60"
        >
          {isLoading ? <LoadingDots /> : "Check Out"}
        </button>
      </div>
    </>
  );
};

export default Cart;
