import { useState } from "react";
import { useNavigate } from "react-router-dom";
// Export the map picture from your design and put it here (adjust the file name if different)
import mapImg from "../assets/location.svg";

// Change this to the page users should land on after this screen
const NEXT_PATH = "/home";

type Status = "idle" | "loading" | "error";

// Turns coordinates into a place name, e.g. "Enugu State".
// Returns undefined if the lookup fails, so the user can still continue.
const getPlaceName = async (
  lat: number,
  lng: number,
): Promise<string | undefined> => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=10&accept-language=en&lat=${lat}&lon=${lng}`,
      { signal: AbortSignal.timeout(5000) },
    );
    if (!res.ok) return undefined;

    const data = (await res.json()) as { address?: Record<string, string> };
    const a = data.address ?? {};
    return a.state ?? a.city ?? a.town ?? a.county ?? a.village;
  } catch {
    return undefined;
  }
};

const AllowLocation = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleAllow = () => {
    if (!("geolocation" in navigator)) {
      setStatus("error");
      setErrorMsg("Your device or browser doesn't support location.");
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        // The button keeps showing "Getting location..." while this runs
        const name = await getPlaceName(lat, lng);

        const location = {
          lat,
          lng,
          accuracy: position.coords.accuracy,
          name, // e.g. "Enugu State" (undefined if the lookup failed)
        };
        // Saved so other pages can read it, and also passed along to the next page
        localStorage.setItem("userLocation", JSON.stringify(location));
        navigate(NEXT_PATH, { state: { location } });
      },
      (error) => {
        setStatus("error");
        if (error.code === error.PERMISSION_DENIED) {
          setErrorMsg(
            "Location is blocked. Turn it on in your browser or device settings, then try again.",
          );
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setErrorMsg(
            "We couldn't find your location. Check your connection or GPS and try again.",
          );
        } else {
          setErrorMsg("Getting your location took too long. Please try again.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  };

  const handleNotNow = () => navigate(NEXT_PATH);

  return (
    <>
      <div className="flex flex-col min-h-dvh bg-[#FAFAFA]">
        {/* Map */}
        <div className="flex-1 min-h-[40dvh] w-full overflow-hidden">
          <img
            src={mapImg}
            alt=""
            className="w-full h-full object-cover object-top"
          />
        </div>

        {/* Bottom card */}
        <div className="bg-[#1A2B4C]  rounded-tl-[20px]  rounded-tr-[20px]   relative px-6 pt-25 pb-[max(4rem,env(safe-area-inset-bottom))] flex flex-col items-center">
          <h5 className="font-bold text-[28px] text-white text-center ">
            Allow location access
          </h5>
          <p className="font-normal text-[16px] text-white text-center  max-w-72">
            We use your location to show nearby supermarkets and delivery
            options.
          </p>

          <button
            type="button"
            onClick={handleAllow}
            disabled={status === "loading"}
            className={`w-68 h-12 p-3 rounded-lg mt-8 bg-white
                 text-[#1A2B4C] text-[16px] font-semibold ${
                   status === "loading"
                     ? "opacity-70 cursor-not-allowed"
                     : "cursor-pointer "
                 }`}
          >
            {status === "loading"
              ? "Getting location..."
              : "Allow While Using App"}
          </button>

          <button
            type="button"
            onClick={handleNotNow}
            className="w-68 h-12 rounded-md mt-4 bg-white text-[#1A2B4C] text-[16px] font-semibold cursor-pointer"
          >
            Not Now
          </button>

          {status === "error" && (
            <p className="mt-4 text-center text-[12px] font-normal text-[#FFB4AB] max-w-72">
              {errorMsg}
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default AllowLocation;
