import { useEffect, useState } from "react";
import type { FC } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  IoChevronForward,
  IoSearchOutline,
  IoCloseCircle,
} from "react-icons/io5";
import fruits from "../assets/Search Tab 2.svg";
import protein from "../assets/Search Tab.svg";
import snacks from "../assets/Search Tab 3.svg";
import beverages from "../assets/Search Tab 4.svg";
import grains from "../assets/Search Tab 5.svg";
import bakery from "../assets/Search Tab 6.svg";
import drinks from "../assets/Search Tab 7.svg";
import fresh from "../assets/Search Tab 8.svg";
import click from "../assets/vegetables.svg";
import { IoArrowBackOutline } from "react-icons/io5";
import { AiOutlineSearch } from "react-icons/ai";
import waffles from "../assets/waffles.svg";
import juice from "../assets/juice.svg";
import okro from "../assets/okro.svg";
import saint from "../assets/juice 2.svg";
import cucumber from "../assets/cucumber.svg";
import curry from "../assets/curry.svg";
import hot from "../assets/fresh hotdog.svg";
import juicee from "../assets/dried okro.svg";
import big from "../assets/big cucumber.svg";
import veggiess from "../assets/veggies.png";
import grainss from "../assets/grains.png";
import fruitss from "../assets/fruits.png";
import beveragess from "../assets/beverages.png";
import plus from "../assets/plus.svg";
import { FaShoppingCart } from "react-icons/fa";
import { FaMinus } from "react-icons/fa6";
import { FaPlus } from "react-icons/fa6";
import { addToCart } from "./Cart";

/* ========================================================================== */
/*                                    DATA                                    */
/* ========================================================================== */

interface Category {
  id: string;
  name: string;
  image: string;
}

const categories: Category[] = [
  { id: "fruits-vegetables", name: "Fruits & Vegetables", image: fruits },
  { id: "protein-dairy", name: "Protein & Dairy", image: protein },
  { id: "snacks", name: "Snacks", image: snacks },
  { id: "beverages", name: "Beverages", image: beverages },
  { id: "grains-pasta", name: "Grains and Pasta", image: grains },
  { id: "bakery", name: "Bakery", image: bakery },
  { id: "drinks", name: "Drinks", image: drinks },
  { id: "fresh-produce", name: "Fresh Produce", image: fresh },
];

interface Product {
  id: string;
  name: string;
  price: string;
  image: string;
  uploaded: string;
}

// Every product uses `waffles` for now: swap in each product's own image
const products: Product[] = [
  {
    id: "1",
    name: "Fresh Tomatoes (1kg)",
    price: "N1,450.07",
    image: waffles,
    uploaded: "55m ago",
  },
  {
    id: "2",
    name: "Fresh Okro (1kg)",
    price: "N550.00",
    image: juice,
    uploaded: "51m ago",
  },
  {
    id: "3",
    name: "Dried Okro (1kg)",
    price: "N400.02",
    image: okro,
    uploaded: "55m ago",
  },
  {
    id: "4",
    name: "Saint Leave (1kg)",
    price: "N1,450.07",
    image: saint,
    uploaded: "55m ago",
  },
  {
    id: "5",
    name: "Cucumber (1kg)",
    price: "N700.00",
    image: cucumber,
    uploaded: "55m ago",
  },
  {
    id: "6",
    name: "Curry Leave (1kg)",
    price: "N200.00",
    image: curry,
    uploaded: "55m ago",
  },
  {
    id: "7",
    name: "Grapes 1pk (500g)",
    price: "N5,998.02",
    image: juice,
    uploaded: "55m ago",
  },
  {
    id: "8",
    name: "Sweet Bananas (1 Bunch)",
    price: "N1,200.00",
    image: okro,
    uploaded: "15m ago",
  },
];

interface OptionProduct {
  id: number;
  name: string;
  price: string;
  uploaded: string;
  image: string;
}

const optionProducts: OptionProduct[] = [
  {
    id: 1,
    name: "Fresh Tomatoes (1kg)",
    price: "N1,450.07",
    uploaded: "55m ago",
    image: hot,
  },
  {
    id: 2,
    name: "Dried Okro (1kg)",
    price: "N400.02",
    uploaded: "55m ago",
    image: juicee,
  },
  {
    id: 3,
    name: "Cucumber  (1kg)",
    price: "N1,450.07",
    uploaded: "55m ago",
    image: big,
  },
  {
    id: 4,
    name: "Dried Okro (1kg)",
    price: "N1,450.07",
    uploaded: "55m ago",
    image: hot,
  },
  {
    id: 5,
    name: "Cucumber  (1kg)",
    price: "N1,450.07",
    uploaded: "55m ago",
    image: juicee,
  },
  {
    id: 6,
    name: "Fresh Tomatoes (1kg)",
    price: "N1,450.07",
    uploaded: "55m ago",
    image: hot,
  },
  {
    id: 7,
    name: "Dried Okro (1kg)",
    price: "N1,450.07",
    uploaded: "55m ago",
    image: juicee,
  },
  {
    id: 8,
    name: "Cucumber  (1kg)",
    price: "N1,450.07",
    uploaded: "55m ago",
    image: hot,
  },
];

interface HomeCategory {
  id: number;
  label: string;
  image: string;
}

const homeCategories: HomeCategory[] = [
  { id: 1, label: "Beans", image: grainss },
  { id: 2, label: "Fruits", image: fruitss },
  { id: 3, label: "Veggies", image: veggiess },
  { id: 4, label: "Drinks", image: beveragess },
];

/* ========================================================================== */
/*                          REFRESH PERSISTENCE HELPERS                       */
/* ========================================================================== */

const SELECTED_CATEGORY_KEY = "categoryPageSelectedId";

// True only when the browser was actually refreshed (F5 / pull-to-refresh).
// A normal visit (e.g. tapping "Category" in the footer) still starts on the list.
const isPageReload = () => {
  const navEntries = performance.getEntriesByType(
    "navigation",
  ) as PerformanceNavigationTiming[];
  if (navEntries.length > 0) {
    return navEntries[0].type === "reload";
  }
  return false;
};

/* ========================================================================== */
/*                                 COMPONENTS                                 */
/* ========================================================================== */

/* ------------------------------- SearchBar ------------------------------ */

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

const SearchBar: FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = "Search supermarkets, produ......",
}) => {
  return (
    <label
      htmlFor="categorySearch"
      className="flex h-11 w-full items-center gap-3 rounded-full border border-transparent bg-[#F3EDF7] px-4"
    >
      <IoSearchOutline className="h-[18px] w-[18px] shrink-0 text-[#49454F]" />
      <input
        id="categorySearch"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search categories"
        className="w-full min-w-0 bg-transparent font-jakarta text-[12px] text-[#1A2B4C] outline-none placeholder:text-[#7F8C8D]"
      />
      {value.length > 0 && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="flex shrink-0 items-center text-[#7F8C8D]"
        >
          <IoCloseCircle className="h-[18px] w-[18px]" />
        </button>
      )}
    </label>
  );
};

/* ------------------------------ CategoryRow ----------------------------- */

interface CategoryRowProps {
  category: Category;
  onClick: () => void;
}

const CategoryRow: FC<CategoryRowProps> = ({ category, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-11.25 w-full items-center gap-3 rounded-lg border border-[#E5E5EA] bg-white px-3 text-left min-[360px]:gap-4 min-[360px]:px-4"
    >
      <span className="rounded-full w-[39.04px] h-[39.04px] shrink-0 bg-[#E6E6E6] items-center flex justify-center">
        <img src={category.image} alt="" />
      </span>

      <span className="min-w-0 flex-1 truncate font-jakarta text-[15px] font-semibold text-[#1A2B4C] min-[360px]:text-[16px]">
        {category.name}
      </span>

      <IoChevronForward className="h-[18px] w-[18px] shrink-0 text-[#1A2B4C]" />
    </button>
  );
};

/* ------------------- Second screen (opened by the click icon) ------------- */

interface CategoryScreenProps {
  category: Category;
  onBack: () => void;
}

type Screen = "products" | "options" | "detail";

interface View {
  screen: Screen;
  itemId: number | null;
}

// Only these cards open the detail screen
const CLICKABLE_IDS = [1, 2, 3];

// Read the view from the browser history state (survives a refresh, URL untouched)
const getViewFromState = (state: unknown): View => {
  const s = (state as { screen?: string; item?: number } | null) ?? {};
  if (s.screen === "detail" && s.item && CLICKABLE_IDS.includes(s.item)) {
    return { screen: "detail", itemId: s.item };
  }
  if (s.screen === "options" || s.screen === "detail") {
    return { screen: "options", itemId: null };
  }
  return { screen: "products", itemId: null };
};

const CategoryScreen: FC<CategoryScreenProps> = ({ onBack }) => {
  const navigate = useNavigate();

  const [view, setView] = useState<View>(() =>
    getViewFromState(window.history.state),
  );
  const { screen, itemId } = view;

  // One-time cleanup: remove any leftover ?screen=... from the address bar
  // while keeping the history state, so the URL reads plain /category
  useEffect(() => {
    if (window.location.search) {
      window.history.replaceState(
        window.history.state,
        "",
        window.location.pathname,
      );
    }
  }, []);

  const goTo = (next: Screen, id?: number) => {
    // Already on that screen (e.g. focus and click both fire): do nothing
    const current = window.history.state;
    if (current?.screen === next && (current?.item ?? null) === (id ?? null)) {
      return;
    }

    window.history.pushState(
      { ...(window.history.state ?? {}), screen: next, item: id ?? null },
      "",
      window.location.pathname, // no query string, so the URL stays /category
    );
    setView({ screen: next, itemId: id ?? null });
  };

  const goBack = () => {
    if (window.history.state?.screen) {
      // The popstate listener below updates the view
      window.history.back();
    } else {
      setView({ screen: "products", itemId: null });
    }
  };

  // Keep in sync with the browser/phone back and forward buttons
  useEffect(() => {
    const onPopState = (e: PopStateEvent) => setView(getViewFromState(e.state));
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const handleBack = () => {
    if (screen === "products")
      onBack(); // back to the category list
    else goBack(); // detail -> options -> products
  };

  const selectedItem = optionProducts.find((p) => p.id === itemId);

  // ---- Quantity and cart total (must live inside the component) ----
  const [quantity, setQuantity] = useState(1);

  // Back to 1 whenever a different item is opened
  useEffect(() => {
    setQuantity(1);
  }, [itemId]);

  // "N1,450.07" -> 145007 (kept in kobo so the maths has no decimal errors)
  const unitKobo = selectedItem
    ? Math.round(parseFloat(selectedItem.price.replace(/[^0-9.]/g, "")) * 100)
    : 0;

  const totalPrice = ((unitKobo * quantity) / 100).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // Save the item with the quantity chosen, then open the cart page
  const handleAddToCart = () => {
    if (!selectedItem) return;

    addToCart({
      id: selectedItem.id,
      name: selectedItem.name,
      price: selectedItem.price, // unit price; the cart multiplies by quantity
      image: selectedItem.image,
      quantity,
    });

    navigate("/cart");
  };

  return (
    <>
      <div className="min-h-dvh w-full overflow-x-hidden bg-[#F9F9F9] px-4 pb-24">
        {/* Header: back arrow, title, grid icon (stays on all screens) */}
        <div className="flex items-center justify-between gap-2 px-2 pt-6 min-[360px]:px-4">
          <div className="flex min-w-0 items-center gap-3 min-[360px]:gap-4.5">
            <button
              type="button"
              onClick={handleBack}
              aria-label="Go back"
              className="flex shrink-0 items-center"
            >
              <IoArrowBackOutline className="h-6 w-6 text-[#121212]" />
            </button>

            <h1 className="min-w-0 truncate font-semibold text-[#2C3E50] text-[16px]">
              {screen === "detail" && selectedItem
                ? selectedItem.name
                : "Vegetables"}
            </h1>
          </div>

          <button
            type="button"
            onClick={() => (screen === "products" ? goTo("options") : goBack())}
            aria-label="Open options"
            className="mt-2 shrink-0 min-[360px]:mr-4"
          >
            <img src={click} alt="" className="h-6 w-6" />
          </button>
        </div>

        {screen === "products" ? (
          <>
            {/* Search pill: tapping it opens the options screen */}
            <div className="mt-6 px-2 min-[360px]:px-4">
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  onFocus={() => goTo("options")}
                  onClick={() => goTo("options")}
                  placeholder="Search fruits & vegetables"
                  aria-label="Search fruits and vegetables"
                  className="h-11 w-full min-w-0 cursor-pointer rounded-full bg-[#F3EDF7] pl-11 pr-4 text-[12px] font-medium text-[#1A2B4C] outline-none placeholder:text-[#9A9AA3]"
                />

                <AiOutlineSearch className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#121212]" />
              </div>
            </div>

            {/* Products: 8 cards, 2 per row */}
            <div className="mt-6 grid grid-cols-2 gap-2 min-[360px]:gap-3">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="min-h-52 w-full min-w-0 rounded-lg border border-[#D9D9D9] bg-white pb-3"
                >
                  <img
                    src={product.image}
                    alt=""
                    className="mx-auto mt-4 flex h-24.5 w-35.75 max-w-[90%] items-center justify-center object-contain"
                  />

                  <div className="ml-3 flex min-w-0 flex-col text-[#1A2B4C]">
                    <h4 className="truncate pr-3 text-[14px] font-normal text-[#1A2B4C] min-[380px]:text-[16px]">
                      {product.name}
                    </h4>
                    <p className="text-[13px] font-normal min-[380px]:text-[14px]">
                      {product.price}
                    </p>
                  </div>

                  <div className="mt-2 flex justify-between gap-2 px-3">
                    <p className="min-w-0 truncate text-[11px] font-medium text-[#7F8C8D] min-[380px]:text-[12px]">
                      Uploaded {product.uploaded}
                    </p>
                    <div className="flex h-6.5 w-6.5 shrink-0 items-center justify-center rounded-[7.43px] bg-[#E8DEF8] pb-1 text-[#4A4459]">
                      <button
                        type="button"
                        aria-label={`Add ${product.name} to cart`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : screen === "options" ? (
          /* Options screen: stays here after a refresh (kept in history state) */
          <div className="mt-6 px-2 min-[360px]:px-4">
            <div className="relative">
              <input
                type="text"
                autoFocus
                placeholder="Search fruits & vegetables"
                aria-label="Search fruits and vegetables"
                className="h-11 w-full min-w-0 rounded-full bg-[#F3EDF7] pl-11 pr-4 text-[12px] font-medium text-[#1A2B4C] outline-none placeholder:text-[#9A9AA3]"
              />

              <AiOutlineSearch className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#121212]" />
            </div>

            <div className="mt-6 flex flex-col gap-4 pb-6">
              {optionProducts.map((item) => {
                const clickable = CLICKABLE_IDS.includes(item.id);

                return (
                  <div
                    key={item.id}
                    role={clickable ? "button" : undefined}
                    tabIndex={clickable ? 0 : undefined}
                    onClick={
                      clickable ? () => goTo("detail", item.id) : undefined
                    }
                    onKeyDown={
                      clickable
                        ? (e) => e.key === "Enter" && goTo("detail", item.id)
                        : undefined
                    }
                    className={`min-h-50.75 w-full max-w-70.75 rounded-lg border border-[#D9D9D9] bg-white pb-3 ${
                      clickable ? "cursor-pointer" : ""
                    }`}
                  >
                    <img
                      src={item.image}
                      alt=""
                      className="mx-auto mt-4 h-24.5 w-full max-w-62.75 object-contain"
                    />

                    <div className="mx-auto flex w-[85%] min-w-0 flex-col items-start justify-center text-[#1A2B4C]">
                      <h4 className="wrap-break-word text-[16px] font-normal">
                        {item.name}
                      </h4>
                      <p className="text-[14px] font-normal">{item.price}</p>
                    </div>

                    <div className="mx-auto flex w-[85%] items-center justify-between gap-2">
                      <p className="min-w-0 truncate text-[12px] font-medium text-[#7F8C8D]">
                        Uploaded {item.uploaded}
                      </p>
                      <div className="flex h-6.5 w-6.5 shrink-0 items-center justify-center rounded-[7.43px] bg-[#E8DEF8] pb-1 text-[#4A4459]">
                        <button
                          type="button"
                          aria-label={`Add ${item.name} to cart`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Detail screen: opened by the first and second cards */
          <div className="mt-6 px-2 pb-6 min-[360px]:px-4">
            {selectedItem && (
              <>
                <div className="rounded-lg pb-4">
                  <img
                    src={selectedItem.image}
                    alt=""
                    className="mx-auto mt-4 h-auto max-h-41.75 w-full max-w-90.25 object-contain"
                  />
                </div>
                <div className="flex min-w-0 flex-col px-2 min-[360px]:px-4">
                  <h2 className="wrap-break-word text-[18px] font-semibold text-[#2C3E50] min-[380px]:text-[20px]">
                    {selectedItem.name}
                  </h2>
                  {/* Live amount: changes with the quantity chosen below */}
                  <p className="text-[15px] font-semibold text-[#1A2B4C] min-[380px]:text-[16px]">
                    N{totalPrice}
                  </p>
                  <p className="mt-1 text-[12px] font-medium text-[#7F8C8D]">
                    Uploaded {selectedItem.uploaded}
                  </p>
                </div>

                <p className="mt-8 px-2 text-[16px] font-semibold text-black min-[360px]:px-4">
                  Product Details
                </p>

                <p className="mt-2 px-2 text-[12px] font-medium leading-relaxed text-[#2C3E50] min-[360px]:px-4">
                  Freshly harvested tomatoes, carefully sorted and packed to
                  keep their natural taste. Ideal for stews, sauces, salads and
                  everyday cooking.
                </p>

                <p className="mt-10 px-2 text-[12px] font-bold text-[#1A2B4C] min-[360px]:px-4">
                  You may also like
                </p>
                <div className="mt-2 grid grid-cols-4 gap-2 min-[360px]:px-2">
                  {homeCategories.map((cat) => (
                    <div
                      key={cat.id}
                      className="mt-1 min-h-17 w-full min-w-0 rounded-lg border border-[#D9D9D9] bg-white pb-1"
                    >
                      <img
                        src={cat.image}
                        alt=""
                        className="mx-auto mt-1 h-auto max-w-full"
                      />
                      <div className="flex items-center justify-center gap-1 px-0.5">
                        <span className="block min-w-0 truncate text-center text-[10px] font-medium leading-tight text-[#2C3E50] min-[380px]:text-[11px]">
                          {cat.label}
                        </span>

                        <img src={plus} alt="" className="shrink-0" />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-14 flex gap-5.5">
                  <div className="ml-2.5 mt-0.5 flex h-10 w-31.25 items-center justify-center gap-2.5 rounded-[10px] border border-[#1A2B4C] bg-white text-[#2C3E50]">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      disabled={quantity === 1}
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="p-1 disabled:opacity-40"
                    >
                      <FaMinus />
                    </button>

                    <p className="min-w-5 text-center">{quantity}</p>

                    <button
                      type="button"
                      aria-label="Increase quantity"
                      onClick={() => setQuantity((q) => q + 1)}
                      className="p-1"
                    >
                      <FaPlus />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddToCart}
                    aria-label={`Add ${quantity} ${selectedItem.name} to cart`}
                    className="flex h-11 w-55.5 cursor-pointer items-center justify-center gap-3 rounded-[10px] border bg-[#1A2B4C] text-white active:scale-[0.98]"
                  >
                    <p className="text-[16px] font-semibold">Add To Cart</p>
                    <FaShoppingCart className="h-5 w-5" />
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
};

/* ========================================================================== */
/*                                    PAGE                                    */
/* ========================================================================== */

const CategoryPage: FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  // Category id sent by the Home page: navigate("/category", { state: { category: "..." } })
  const stateCategoryId = (location.state as { category?: string } | null)
    ?.category;

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    () => {
      // Coming from the Home page card
      const fromState = categories.find((c) => c.id === stateCategoryId);
      if (fromState) return fromState;

      // Browser refresh: reopen the screen that was open before it
      if (!isPageReload()) return null;
      const savedId = sessionStorage.getItem(SELECTED_CATEGORY_KEY);
      return categories.find((c) => c.id === savedId) ?? null;
    },
  );

  // Open the category from the router state (also covers the page already
  // being mounted when the state arrives), then clear the state so the route
  // stays a plain /category and a later refresh doesn't reopen it by itself.
  useEffect(() => {
    const match = categories.find((c) => c.id === stateCategoryId);
    if (match) {
      setSelectedCategory(match);
      navigate(location.pathname, { replace: true, state: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateCategoryId]);

  // Remember the open screen so a refresh can bring it back.
  // The cleanup clears it when the screen is closed or the page is left,
  // so the next normal visit starts on the category list again.
  useEffect(() => {
    if (selectedCategory) {
      sessionStorage.setItem(SELECTED_CATEGORY_KEY, selectedCategory.id);
    }
    return () => sessionStorage.removeItem(SELECTED_CATEGORY_KEY);
  }, [selectedCategory]);

  // Search filters the category list by name
  const q = searchQuery.trim().toLowerCase();
  const visibleCategories = q
    ? categories.filter((c) => c.name.toLowerCase().includes(q))
    : categories;

  // Second screen: shown instead of the category list, same page
  if (selectedCategory) {
    return (
      <CategoryScreen
        category={selectedCategory}
        onBack={() => setSelectedCategory(null)}
      />
    );
  }

  return (
    <div className="min-h-dvh w-full overflow-x-hidden bg-[#F9F9F9] pb-28 font-jakarta">
      <main className="mx-auto max-w-[640px] px-4 pt-6">
        {/* Search Bar */}
        <SearchBar value={searchQuery} onChange={setSearchQuery} />

        {visibleCategories.length === 0 ? (
          <p className="px-4 py-10 text-center text-[14px] text-[#7F8C8D]">
            No categories found for "{searchQuery}".
          </p>
        ) : (
          <ul className="mt-6 flex flex-col gap-4">
            {visibleCategories.map((cat) => (
              <li key={cat.id}>
                <CategoryRow
                  category={cat}
                  onClick={() => {
                    // Only "Fruits & Vegetables" opens the second screen for now
                    if (cat.id === "fruits-vegetables")
                      setSelectedCategory(cat);
                  }}
                />
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
};

export default CategoryPage;
