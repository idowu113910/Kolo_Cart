import { useEffect, useState } from "react";
import type { FC, MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import { IoChevronForward } from "react-icons/io5";
import icecold from "../assets/icecold bird.svg";
import { IoIosArrowForward } from "react-icons/io";
import icecold2 from "../assets/icecold 2.svg";
import dove from "../assets/dove.svg";
import donut from "../assets/donut.svg";

/* ========================================================================== */
/*                                   TYPES                                    */
/* ========================================================================== */

export type FulfilmentType = "delivery" | "pickup";

export type OrderStatus =
  | "confirmed"
  | "preparing"
  | "out-for-delivery"
  | "ready"
  | "delivered"
  | "cancelled";

// Same shape as the cart items, so `cartItems` can be passed straight in
export interface OrderItem {
  product: {
    id: string;
    name: string;
    price: number;
    unit: string;
    imageUrl: string;
  };
  quantity: number;
  addedAt: string;
}

export interface DeliveryAddress {
  label?: string;
  address: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  supermarketId: string;
  supermarketName: string;
  items: OrderItem[];
  fulfilmentType: FulfilmentType;
  deliveryAddress?: DeliveryAddress;
  deliveryTime: string;
  paymentMethod: string;
  productTotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  estimatedTime: string;
}

export interface PlaceOrderParams {
  supermarketId: string;
  supermarketName: string;
  items: OrderItem[];
  fulfilmentType: FulfilmentType;
  deliveryAddress?: DeliveryAddress;
  deliveryTime: string;
  paymentMethod: string;
  productTotal: number;
  deliveryFee: number;
  total: number;
}

type Listener = () => void;

/* ========================================================================== */
/*                                   UTILS                                    */
/* ========================================================================== */

function generateOrderNumber(): string {
  return `KC-${Math.floor(100000 + Math.random() * 900000)}`;
}

function formatPrice(amount: number): string {
  const hasDecimals = amount % 1 !== 0;
  return `N${amount.toLocaleString("en-NG", {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}

/* ========================================================================== */
/*                              ORDER STORE (STATE)                           */
/* ========================================================================== */

const STORAGE_KEY = "kolocart_orders_history";
const listeners = new Set<Listener>();

// Paste your seed / demo orders in here if you want some to show up by default
const initialOrders: Order[] = [];

function loadOrders(): Order[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error("Failed to load orders", e);
  }
  return initialOrders;
}

let ordersState: Order[] = loadOrders();

function emitChange() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ordersState));
  } catch (e) {
    console.error("Failed to save orders", e);
  }
  listeners.forEach((l) => l());
}

export const orderStore = {
  getOrders(): Order[] {
    return ordersState;
  },

  getOrderById(id: string): Order | undefined {
    return ordersState.find((o) => o.id === id || o.orderNumber === id);
  },

  placeOrder(params: PlaceOrderParams): Order {
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: generateOrderNumber(),
      supermarketId: params.supermarketId,
      supermarketName: params.supermarketName,
      items: [...params.items],
      fulfilmentType: params.fulfilmentType,
      deliveryAddress: params.deliveryAddress,
      deliveryTime: params.deliveryTime,
      paymentMethod: params.paymentMethod,
      productTotal: params.productTotal,
      deliveryFee: params.deliveryFee,
      total: params.total,
      status: "confirmed",
      createdAt: new Date().toISOString(),
      estimatedTime:
        params.fulfilmentType === "delivery"
          ? "20 - 30 mins"
          : "Ready in 15 mins",
    };

    ordersState = [newOrder, ...ordersState];
    emitChange();

    // NOTE: the cart is no longer cleared in here. After calling placeOrder(),
    // call clearCart() from useCartStore() in the checkout page.

    return newOrder;
  },

  updateStatus(orderId: string, status: OrderStatus) {
    ordersState = ordersState.map((o) =>
      o.id === orderId ? { ...o, status } : o,
    );
    emitChange();
  },

  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

export function useOrderStore() {
  const [orders, setOrders] = useState<Order[]>(orderStore.getOrders());

  useEffect(() => {
    return orderStore.subscribe(() => {
      setOrders(orderStore.getOrders());
    });
  }, []);

  return {
    orders,
    getOrderById: orderStore.getOrderById,
    placeOrder: orderStore.placeOrder,
    updateStatus: orderStore.updateStatus,
  };
}

/* ========================================================================== */
/*                                 COMPONENTS                                 */
/* ========================================================================== */

/** "55m ago", "3h ago", "2d ago" */
function timeAgo(isoDate: string): string {
  const minutes = Math.max(
    0,
    Math.floor((Date.now() - new Date(isoDate).getTime()) / 60000),
  );
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

/* ------------------------------- OrderCard ------------------------------ */

interface OrderCardProps {
  order: Order;
  onClick: () => void;
}

export const OrderCard: FC<OrderCardProps> = ({ order, onClick }) => {
  const firstItem = order.items[0];
  const extraItems = order.items.length - 1;

  const title = firstItem
    ? extraItems > 0
      ? `${firstItem.product.name} +${extraItems} more`
      : firstItem.product.name
    : order.supermarketName;

  const handleOpen = (e: MouseEvent) => {
    e.stopPropagation();
    onClick();
  };

  return (
    <div
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter") onClick();
      }}
      role="button"
      tabIndex={0}
      className="flex h-full cursor-pointer flex-col rounded-2xl border border-[#F1F5F9] bg-white p-2.5 shadow-[0_2px_10px_rgba(0,0,0,0.04)]"
    >
      {/* Image */}
      <div className="relative mb-2.5 w-full pt-[75%]">
        {firstItem && (
          <img
            src={firstItem.product.imageUrl}
            alt={firstItem.product.name}
            loading="lazy"
            className="absolute left-0 top-0 h-full w-full rounded-xl bg-[#F8FAFC] object-cover"
          />
        )}
      </div>

      {/* Name */}
      <p className="line-clamp-2 min-h-[34px] text-[13px] font-semibold leading-[1.3] text-[#1E293B]">
        {title}
      </p>

      {/* Price */}
      <p className="mt-1.5 text-[14px] font-bold text-[#162544]">
        {formatPrice(order.total)}
      </p>

      {/* Ordered time + open button */}
      <div className="mt-1.5 flex items-center justify-between">
        <span className="text-[11px] text-[#94A3B8]">
          Ordered {timeAgo(order.createdAt)}
        </span>

        <button
          type="button"
          onClick={handleOpen}
          aria-label={`Open order ${order.orderNumber}`}
          className="flex h-[26px] w-[26px] cursor-pointer items-center justify-center rounded-lg bg-[#EEF0FD] text-[16px] text-[#162544]"
        >
          <IoChevronForward />
        </button>
      </div>
    </div>
  );
};

/* ========================================================================== */
/*                                    PAGE                                    */
/* ========================================================================== */

type OrderTab = "all" | "ongoing" | "completed" | "cancelled";

const tabs: { key: OrderTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "ongoing", label: "Ongoing" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

// The status words shown in the orders list
type OrderListStatus = "Ongoing" | "Completed" | "Cancelled";

interface OrderSummary {
  id: string;
  orderNumber: string;
  supermarketName: string;
  status: OrderListStatus;
  total: number;
  time: string;
  image: string;
}

// Builds an image URL from an Unsplash photo id
const img = (id: string): string =>
  `https://images.unsplash.com/${id}?w=150&auto=format&fit=crop&q=80`;

// Mock "API" response: 7 orders, each with its own image
const orderSummaries: OrderSummary[] = [
  {
    id: "1",
    orderNumber: "KC - 704512",
    supermarketName: "IceCold Supermarket",
    status: "Ongoing",
    total: 5350,
    time: "20 - 30 mins",
    image: icecold,
  },
  {
    id: "2",
    orderNumber: "KC - 704498",
    supermarketName: "Roban Stores Enugu",
    status: "Completed",
    total: 12800,
    time: "Delivered on  05/02/2026",
    image: icecold2,
  },
  {
    id: "3",
    orderNumber: "KC - 704455",
    supermarketName: "Market Square",
    status: "Cancelled",
    total: 8450.5,
    time: "02/02/2026",
    image: icecold,
  },
  {
    id: "4",
    orderNumber: "KC - 704421",
    supermarketName: "Shoprite Polo Park",
    status: "Completed",
    total: 21900,
    time: "Delivered on  05/02/2026",
    image: dove,
  },
  {
    id: "5",
    orderNumber: "KC - 704397",
    supermarketName: "SPAR Enugu",
    status: "Completed",
    total: 3200,
    time: "Delivered on  08/02/2026",
    image: img("photo-1588964895597-cfccd6e2dbf9"),
  },
  {
    id: "6",
    orderNumber: "KC - 704360",
    supermarketName: "IceCold Supermarket",
    status: "Completed",
    total: 15600,
    time: "Delivered on  08/02/2026",
    image: donut,
  },
  {
    id: "7",
    orderNumber: "KC - 704318",
    supermarketName: "Roban Stores Enugu",
    status: "Cancelled",
    total: 6750,
    time: "20 - 30 mins",
    image: dove,
  },
];

// Status text colors (Ongoing keeps the orange from your design)
const statusColors: Record<string, string> = {
  Ongoing: "text-[#FF8C00]",
  Completed: "text-[#2ECC71]",
  Cancelled: "text-[#E5322D]",
};

const formatNaira = (amount: number): string =>
  `N${amount.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const Orders: FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<OrderTab>("all");

  const filteredOrders = orderSummaries.filter((o) => {
    if (activeTab === "ongoing") return o.status === "Ongoing";
    if (activeTab === "completed") return o.status === "Completed";
    if (activeTab === "cancelled") return o.status === "Cancelled";
    return true;
  });

  return (
    <div className="min-h-dvh bg-[#F9F9F9] font-jakarta">
      <div className="mx-auto max-w-160 px-4 pb-28 pt-6">
        {/* Heading */}
        <h1 className="text-[20px] font-semibold text-[#1A2B4C]">My Orders</h1>

        {/* Tabs */}
        <div className="mt-4 flex items-center justify-between">
          {tabs.map(({ key, label }) => {
            const isActive = activeTab === key;

            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                aria-current={isActive ? "true" : undefined}
                className={`cursor-pointer text-[14px] ${
                  isActive ? "text-[#2F80ED] underline" : "text-[#1A2B4C]"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Orders list */}
        <ul className="mt-4 flex flex-col gap-3">
          {filteredOrders.map((order) => (
            <li key={order.id}>
              <button
                type="button"
                onClick={() => navigate(`/order/${order.id}`)}
                className="flex min-h-20 w-full items-center gap-2 rounded-[5px] border border-white bg-white px-2.5 py-2 text-left min-[360px]:gap-3 min-[360px]:px-3"
              >
                <img
                  src={order.image}
                  alt={order.supermarketName}
                  className="h-9 w-9 shrink-0 object-cover min-[360px]:h-10 min-[360px]:w-10"
                />

                {/* Left column: takes the leftover space and truncates long text */}
                <div className="flex min-w-0 flex-1 flex-col">
                  <p className="h-5 truncate font-semibold leading-5 text-[15px] text-[#2C3E50] min-[360px]:text-[16px]">
                    {order.orderNumber}
                  </p>
                  <p className="h-5 truncate font-normal leading-5 text-[13px] text-[#1A2B4C] min-[360px]:text-[14px]">
                    {order.supermarketName}
                  </p>
                  <p
                    className={`h-5 truncate font-medium leading-5 text-[12px] ${
                      statusColors[order.status] ?? "text-[#FF8C00]"
                    }`}
                  >
                    {order.status}
                  </p>
                </div>

                {/* Right column: never shrinks or wraps */}
                <div className="flex shrink-0 flex-col items-end whitespace-nowrap ">
                  <p className="h-5 leading-5 font-semibold text-[16px] text-[#2C3E50]">
                    {formatNaira(order.total)}
                  </p>

                  <span className="flex h-5 items-center">
                    <IoIosArrowForward />
                  </span>

                  <p className="h-5 leading-5 font-medium text-[12px] text-[#2C3E50]">
                    {order.time}
                  </p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Orders;
