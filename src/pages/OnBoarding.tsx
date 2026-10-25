import { useState } from "react";
import { useNavigate } from "react-router-dom";
import on1 from "../assets/OnBoarding one.svg";
import on2 from "../assets/OnBoarding 2.svg";
import on3 from "../assets/OnBoarding 3.svg";

// Change this if your sign-in page uses a different path
const SIGN_IN_PATH = "/login";

const slides = [
  {
    img: on1,
    title: "Shop from trusted supermarkets",
    text: "Find fresh products, great price and shop with confidence",
  },
  {
    img: on2,
    title: "Fast easy & convenient delivery or pick up",
    text: "Choose delivery or pick up that works best for you",
  },
  {
    img: on3,
    title: "Plan Today save tomorrow ",
    text: "Coming soon: Smart savings to help you reach your grocery goals",
  },
];

const OnBoarding = () => {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  const isLast = current === slides.length - 1;

  const handleNext = () => {
    if (isLast) {
      navigate(SIGN_IN_PATH);
    } else {
      setCurrent((prev) => prev + 1);
    }
  };

  const handleSkip = () => navigate(SIGN_IN_PATH);

  return (
    <>
      <div className="flex flex-col items-center justify-between max-w-112.5 w-full mt-[min(6rem,12dvh)]">
        <button
          type="button"
          onClick={handleSkip}
          className="self-end font-semibold text-[#2C3E50] text-[min(16px,4.3vw)] flex justify-end text-end items-end pr-6 cursor-pointer underline"
        >
          Skip
        </button>

        {/* Sliding area: all slides sit side by side and the track moves left */}
        <div className="w-full overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${current * 100}%)` }}
          >
            {slides.map((slide, index) => (
              <div
                key={index}
                className="flex flex-col items-center justify-center w-full shrink-0"
              >
                <img
                  src={slide.img}
                  alt=""
                  className="max-w-100 w-[calc(100%-2.5rem)] max-h-[40dvh] object-contain mt-4 "
                />
                <div className="flex flex-col max-w-112.5 w-full pl-5 pr-5 pt-[min(1.75rem,3.5dvh)]">
                  <h3 className="text-[min(28px,7vw)] text-[#1A2B4C] font-bold">
                    {slide.title}
                  </h3>
                  <p className="font-semibold text-[#2C3E50] text-[min(16px,4.3vw)] mt-2">
                    {slide.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mt-[min(4rem,8dvh)] -ml-12">
          {slides.map((_, index) => (
            <span
              key={index}
              className={`w-3 h-3 rounded-full transition-colors duration-500 ${
                current === index ? "bg-[#27AE60]" : "bg-[#7F8C8D]"
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={handleNext}
          className="bg-[#1A2B4C] text-white rounded-lg w-68 max-w-[90%] p-3 mt-[min(4.5rem,9dvh)]
         text-[min(20px,5.2vw)] font-semibold cursor-pointer active:scale-95 transition-transform"
        >
          {isLast ? "Get Started" : "Next"}
        </button>
      </div>
    </>
  );
};

export default OnBoarding;
