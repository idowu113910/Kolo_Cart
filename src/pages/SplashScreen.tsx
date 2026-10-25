import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import kolo from "../assets/kolo.svg";
import next from "../assets/Next-line.svg";

// Where the splash screen goes when its animation finishes.
// Change this if your onboarding route has a different path.
const ONBOARDING_PATH = "/onboarding";

// Timeline (ms): the entrance animations run, the progress line fills, the
// whole screen fades out, and only then does it navigate.
const SHOW_FOR_MS = 3000; // time before the exit fade starts
const EXIT_MS = 400; // length of the exit fade
const REDUCED_MOTION_MS = 1000; // short, static version for reduced motion

const SplashScreen = () => {
  const navigate = useNavigate();
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // People who prefer reduced motion get a plain, short splash
    const showFor = reduceMotion ? REDUCED_MOTION_MS : SHOW_FOR_MS;
    const exitFor = reduceMotion ? 0 : EXIT_MS;

    const leaveTimer = setTimeout(() => setLeaving(true), showFor);
    const navTimer = setTimeout(
      () => navigate(ONBOARDING_PATH, { replace: true }),
      showFor + exitFor,
    );

    return () => {
      clearTimeout(leaveTimer);
      clearTimeout(navTimer);
    };
  }, [navigate]);

  return (
    <>
      <style>{`
        @keyframes splash-logo-in {
          0%   { opacity: 0; transform: scale(0.85); }
          70%  { opacity: 1; transform: scale(1.04); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes splash-fade-up {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes splash-bar-fill {
          from { clip-path: inset(0 100% 0 0); opacity: 0.4; }
          to   { clip-path: inset(0 0 0 0);    opacity: 1; }
        }

        .splash-logo {
          opacity: 0;
          animation: splash-logo-in 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.1s forwards;
        }
        .splash-name {
          opacity: 0;
          animation: splash-fade-up 0.5s ease-out 0.55s forwards;
        }
        .splash-tagline {
          opacity: 0;
          animation: splash-fade-up 0.5s ease-out 0.75s forwards;
        }
        .splash-bar {
          opacity: 0;
          animation: splash-bar-fill 1.5s ease-in-out 0.8s forwards;
        }
        .splash-screen {
          transition: opacity 0.4s ease, transform 0.4s ease;
        }
        .splash-screen.splash-leaving {
          opacity: 0;
          transform: scale(1.03);
        }

        @media (prefers-reduced-motion: reduce) {
          .splash-logo,
          .splash-name,
          .splash-tagline,
          .splash-bar {
            animation: none;
            opacity: 1;
          }
          .splash-screen {
            transition: none;
          }
        }
      `}</style>

      <div
        className={`splash-screen flex flex-col min-h-screen items-center justify-center bg-white ${
          leaving ? "splash-leaving" : ""
        }`}
      >
        <img src={kolo} alt="KoloCart" className="splash-logo w-31.75 h-34.75" />

        <div className="flex flex-col items-center justify-center">
          <h4 className="splash-name text-[#1A2B4C] font-bold text-[28px]">
            KoloCart
          </h4>
          <p className="splash-tagline text-[16px] font-semibold text-[#2C3E50]">
            Plan Smart. Shop Better
          </p>
        </div>

        <img src={next} alt="" className="splash-bar mt-40" />
      </div>
    </>
  );
};

export default SplashScreen;