import Footer from "../components/Footer";
import crunchiesImg from "../assets/Crunchies.svg";
import koloSaving from "../assets/kolo saving.svg";
import search from "../assets/search.svg";
import loc from "../assets/location2.svg";
import grains from "../assets/grains.png";
import fruits from "../assets/fruits.png";
import veggies from "../assets/veggies.png";
import beverages from "../assets/beverages.png";
import { useLocation, useNavigate } from "react-router-dom";
import { IoArrowBackOutline } from "react-icons/io5";
import { useEffect, useState } from "react";
import ice from "../assets/ice.svg";
import green from "../assets/green.svg";
import red from "../assets/red.svg";
import cnc from "../assets/cancel.svg";
import check from "../assets/checkbox.svg";
import juice from "../assets/juice.svg";
import { FaPlus } from "react-icons/fa6";

// Shown when there is no saved location (user tapped "Not Now") or no name
const DEFAULT_LOCATION_NAME = "Enugu State";

// Reads the place name saved by the AllowLocation page
const getLocationName = (state: unknown): string => {
  const fromState = (state as { location?: { name?: string } } | null)?.location
    ?.name;
  if (fromState) return fromState;

  try {
    const raw = localStorage.getItem("userLocation");
    return (raw && JSON.parse(raw)?.name) || DEFAULT_LOCATION_NAME;
  } catch {
    return DEFAULT_LOCATION_NAME;
  }
};

const crunchies = [
  {
    name: "Crunchies",
    rating: "4.8 (1,240 reviews)",
    location: "Independence Layout, Enugu",
    opens: "Closes 9:00PM",
    store: "Browse Store",
    img: crunchiesImg,
  },
  {
    name: "Crunchies",
    rating: "4.8 (1,240 reviews)",
    location: "Independence Layout, Enugu",
    opens: "Closes 9:00PM",
    store: "Browse Store",
    img: crunchiesImg,
  },
];

interface StoreStat {
  id: number;
  label: string;
  value: string;
}

const storeStats: StoreStat[] = [
  { id: 1, label: "Add Products", value: "0 Added" },
  { id: 2, label: "Total Price", value: "N0.00" },
  { id: 3, label: "Order Type", value: "Click & Collect" },
];

//============================================
interface StoreProduct {
  id: number;
  name: string;
  price: string;
  uploaded: string;
  image: string;
}

const storeProducts: StoreProduct[] = [
  {
    id: 1,
    name: "Hollandia Yogurt (500cl)",
    price: "N1,450.07",
    uploaded: "55m ago",
    image: juice,
  },
  {
    id: 2,
    name: "Hollandia Yogurt (500cl)",
    price: "N1,450.07",
    uploaded: "55m ago",
    image: juice,
  },
  {
    id: 3,
    name: "Hollandia Yogurt (500cl)",
    price: "N1,450.07",
    uploaded: "55m ago",
    image: juice,
  },
];

interface HomeCategory {
  id: number;
  label: string;
  image: string;
  // Only set for categories that open the Category page
  categoryId?: string;
}

const homeCategories: HomeCategory[] = [
  { id: 1, label: "Beans", image: grains },
  { id: 2, label: "Fruits", image: fruits },
  {
    id: 3,
    label: "Veggies",
    image: veggies,
    categoryId: "fruits-vegetables",
  },
  { id: 4, label: "Drinks", image: beverages },
];

//==================================================================
// After a refresh, history.state still holds the store that was open
const getStoreFromHistory = (): number | null => {
  const idx = window.history.state?.store;
  return typeof idx === "number" && idx >= 0 && idx < crunchies.length
    ? idx
    : null;
};

const Home = () => {
  const navigate = useNavigate();

  // Start from history so a refresh stays on the same screen
  const [selectedStore, setSelectedStore] = useState<number | null>(
    getStoreFromHistory,
  );
  const { state } = useLocation();
  const locationName = getLocationName(state);

  const openStore = (index: number) => {
    // Keep the router's own history state, add ours on top of it,
    // and pass the current URL so the route doesn't change
    window.history.pushState(
      { ...(window.history.state ?? {}), store: index },
      "",
      window.location.href,
    );
    setSelectedStore(index);
  };

  const closeStore = () => {
    if (window.history.state?.store !== undefined) {
      window.history.back(); // the popstate listener below updates the screen
    } else {
      setSelectedStore(null);
    }
  };

  useEffect(() => {
    const onPopState = (e: PopStateEvent) => {
      setSelectedStore(e.state?.store ?? null);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const store = selectedStore !== null ? crunchies[selectedStore] : null;

  /* ------------------------------ Store screen ----------------------------- */
  if (store) {
    return (
      <>
        <div className="min-h-dvh w-full overflow-x-hidden bg-[#F9F9F9] pb-24">
          <div className="flex items-center">
            <button
              type="button"
              onClick={closeStore}
              aria-label="Go back"
              className="flex shrink-0 items-center p-4"
            >
              <IoArrowBackOutline className="h-6 w-6 text-[#121212]" />
            </button>
          </div>

          {/* Navy block: grows with its content instead of a fixed height */}
          <div className="mt-1.5 min-h-70.5 w-full rounded-tl-[30px] rounded-tr-[30px] bg-[#1A2B4C] p-5">
            <div className="flex gap-2">
              <img src={ice} alt="" className="shrink-0" />

              <div className="flex min-w-0 flex-col text-white">
                <h5 className="wrap-break-word">ICECOLD BIRD Supermarket</h5>
                <p className="wrap-break-word text-[13px] min-[380px]:text-[14px]">
                  No 5 GRA opp. May estate enugu, Enugu State Nig.
                </p>
              </div>
            </div>

            {/* Two columns; they wrap under each other if the screen is too narrow */}
            <div className="mt-4 flex flex-wrap justify-between gap-x-4 gap-y-3 text-white">
              <div className="min-w-0">
                <div className="flex gap-2">
                  <img src={green} alt="" className="shrink-0" />
                  <p className="text-[13px] font-semibold text-white min-[380px]:text-[16px]">
                    Open by 7am
                  </p>
                </div>
                <div className="flex gap-2">
                  <img src={red} alt="" className="shrink-0" />
                  <p className="text-[13px] font-semibold text-white min-[380px]:text-[16px]">
                    Closes 9 pm
                  </p>
                </div>
              </div>

              <div className="min-w-0">
                <div className="flex gap-2">
                  <img src={cnc} alt="" className="shrink-0" />
                  <p className="text-[13px] font-semibold text-white min-[380px]:text-[16px]">
                    🚚 Delivery Available
                  </p>
                </div>
                <div className="flex gap-2">
                  <img src={check} alt="" className="shrink-0" />
                  <p className="text-[13px] font-semibold text-white min-[380px]:text-[16px]">
                    📦 Click & Collect
                  </p>
                </div>
              </div>
            </div>

            <p className="mt-5 text-[13px] font-semibold text-white min-[380px]:text-[16px]">
              ⏱ Prices Updated 30 mins ago
            </p>

            {/* Three boxes share the row evenly on any width */}
            <div className="mt-4 flex items-stretch gap-2 min-[360px]:gap-2.75">
              {storeStats.map((stat) => (
                <div
                  key={stat.id}
                  className="flex min-h-10 min-w-0 flex-1 flex-col items-center justify-center rounded-lg border border-[#FF8C00] bg-white px-1 py-1 text-center"
                >
                  <p className="text-[11px] font-medium text-[#2C3E50] min-[380px]:text-[12px]">
                    {stat.label}
                  </p>
                  <p className="text-[10px] font-medium text-[#7F8C8D]">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <p className="px-4.5 pt-4 pb-2 text-[14px] font-normal text-[#1A2B4C]">
            Our Products
          </p>

          {/* Tabs scroll sideways instead of overflowing the screen */}
          <div className="flex gap-3 overflow-x-auto whitespace-nowrap px-4.5 pb-1 text-[14px] font-normal text-[#1A2B4C] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <p className="shrink-0 underline">Recent</p>
            <p className="shrink-0">Grains & Pasta</p>
            <p className="shrink-0">Fruits</p>
            <p className="shrink-0">Vegetable</p>
            <p className="shrink-0">Beverages</p>
          </div>

          <div className="mt-5 flex flex-col gap-4">
            {storeProducts.map((product) => (
              <div
                key={product.id}
                className="min-h-20 w-full rounded-[5px] border border-white"
              >
                <div className="flex items-center gap-3 px-4 py-2 min-[380px]:gap-4">
                  <img
                    src={product.image}
                    alt=""
                    className="h-20 w-20 shrink-0 object-contain min-[380px]:h-24 min-[380px]:w-23"
                  />

                  <div className="flex min-w-0 flex-1 flex-col gap-0.75">
                    <h5 className="wrap-break-word text-[14px] font-semibold text-[#2C3E50] min-[380px]:text-[16px]">
                      {product.name}
                    </h5>
                    <p className="text-[14px] font-normal text-[#1A2B4C]">
                      {product.price}
                    </p>
                    <p className="text-[12px] font-medium text-[#7F8C8D]">
                      Uploaded {product.uploaded}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-col items-center gap-1">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E8DEF8] min-[380px]:h-14 min-[380px]:w-14">
                      <button
                        type="button"
                        aria-label={`Add ${product.name}`}
                        className="text-[#4A4459]"
                      >
                        <FaPlus />
                      </button>
                    </div>
                    <p className="whitespace-nowrap text-center text-[11px] font-medium text-[#2C3E50] min-[380px]:text-[12px]">
                      View Details
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  /* -------------------------------- Home page ------------------------------ */
  return (
    <>
      <div className="min-h-dvh w-full overflow-x-hidden bg-[#F9F9F9] p-5 pb-24">
        <div className="flex items-center gap-3">
          <img src={loc} alt="Location Icon" className="shrink-0" />

          <h3 className="min-w-0 font-jakarta text-[16px] font-semibold leading-tight text-[#7F8C8D]">
            Available in <br />
            <span className="text-[16px] text-[#1A2B4C]">{locationName}</span>
          </h3>
        </div>

        <div className="searchContainer mt-4 w-full">
          <label
            htmlFor="searchBox"
            className="flex w-full items-center rounded-full border border-transparent bg-[#F3EDF7] px-4"
          >
            <img src={search} alt="" className="shrink-0" />
            {/* text-[16px] stops iOS Safari from zooming in when the input is focused */}
            <input
              type="search"
              name="searchBox"
              id="searchBox"
              aria-label="Search supermarkets and products"
              placeholder="Search supermarkets, produ......"
              className="w-full min-w-0 bg-transparent font-jakarta text-[16px] text-slate-800 outline-none"
            />
          </label>
        </div>

        <div className="mt-5 flex min-h-31 w-full max-w-xl items-center justify-center gap-3 rounded-3xl bg-[#1A2B4C] p-5 text-white min-[360px]:gap-5">
          <div className="min-w-0 flex-1">
            <p className="font-jakarta text-[16px] font-semibold leading-6">
              Kolo Saving(Coming soon)
            </p>
            <p className="text-[13px] text-[#F9F9F9] min-[380px]:text-[16px]">
              Plan your monthly grocery and save more
            </p>
            <p className="w-fit rounded-full bg-white px-4 text-center text-[#2ECC71]">
              Join Waitlist
            </p>
          </div>

          <img
            src={koloSaving}
            alt="Save Tomorrow"
            className="h-[72px] w-auto max-w-[40%] shrink-0 object-contain min-[380px]:h-[87px]"
          />
        </div>

        <section className="mt-8">
          <div className="flex justify-between gap-2">
            <p className="text-[12px] font-bold text-[#1A2B4C]">
              Popular Supermarkets
            </p>
            <p className="shrink-0 text-[12px] font-medium text-[#2C3E50]">
              View all
            </p>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-3">
            {crunchies.map((crunch, index) => {
              return (
                <button
                  type="button"
                  key={index}
                  onClick={() => openStore(index)}
                  className="min-w-0 wrap-break-word rounded-3xl border border-[#D9D9D9] bg-white p-3 text-left min-[400px]:p-5"
                >
                  <img src={crunch.img} alt="" className="h-auto w-full" />
                  <h2 className="mt-1 text-[16px] font-normal text-[#1A2B4C]">
                    {crunch.name}
                  </h2>
                  <p className="text-[12px] font-medium text-[#2C3E50]">
                    ⭐ {crunch.rating}
                  </p>
                  <p className="text-[12px] font-medium text-[#7F8C8D]">
                    📍 {crunch.location}
                  </p>
                  <p className="text-[12px] font-medium text-[#2C3E50]">
                    ⌚ Open . {crunch.opens}
                  </p>
                  <p className="text-[12px] font-medium text-[#2C3E50]">
                    🛒 {crunch.store}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-5">
          <h2 className="mt-4 text-[12px] font-bold text-[#1A2B4C]">
            Categories
          </h2>
          <div className="mt-2 grid grid-cols-4 gap-2 px-0.75 min-[360px]:gap-2.75">
            {homeCategories.map((cat) => {
              const content = (
                <>
                  <img
                    src={cat.image}
                    alt=""
                    className="mx-auto mt-1 w-auto max-w-full"
                  />
                  <span className="block px-0.5 text-center text-[10px] font-medium leading-tight text-[#2C3E50] min-[380px]:text-[12px]">
                    {cat.label}
                  </span>
                </>
              );

              const cardClass =
                "mx-auto min-h-15 w-full min-w-0 rounded-lg border border-[#D9D9D9] bg-white pb-1";

              return cat.categoryId ? (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() =>
                    navigate("/category", {
                      state: { category: cat.categoryId },
                    })
                  }
                  aria-label={`Open ${cat.label}`}
                  className={cardClass}
                >
                  {content}
                </button>
              ) : (
                <div key={cat.id} className={cardClass}>
                  {content}
                </div>
              );
            })}
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default Home;
