import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { IoArrowBackSharp, IoBackspaceOutline } from "react-icons/io5";

// Change this to the page users should land on after verifying
const AFTER_VERIFY_PATH = "/home";
// Change this if your sign up page uses a different path
const SIGN_UP_PATH = "/signup";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 45;

// Keypad layout: digit + the small letters shown under it in the design
const keypadRows = [
  [
    { digit: "1", letters: "" },
    { digit: "2", letters: "ABC" },
    { digit: "3", letters: "DEF" },
  ],
  [
    { digit: "4", letters: "GHI" },
    { digit: "5", letters: "JKL" },
    { digit: "6", letters: "MNO" },
  ],
  [
    { digit: "7", letters: "PQRS" },
    { digit: "8", letters: "TUV" },
    { digit: "9", letters: "WXYZ" },
  ],
];

const OtpVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Phone number passed from the sign up page (falls back to the design's sample number)
  const phone: string = location.state?.phone ?? "omoteshoidowu@gmail.com";

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus the first box when the page opens
  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  // Countdown for "Resend Code"
  useEffect(() => {
    if (seconds === 0) return;
    const id = setTimeout(() => setSeconds((prev) => prev - 1), 1000);
    return () => clearTimeout(id);
  }, [seconds]);

  // Verify automatically once all digits are entered
  useEffect(() => {
    if (otp.every((digit) => digit !== "")) {
      // TODO: send otp.join("") to your API here before navigating
      navigate(AFTER_VERIFY_PATH);
    }
  }, [otp, navigate]);

  const handleChange = (index: number, value: string) => {
    // Digits only, keep the last digit typed
    const digit = value.replace(/\D/g, "").slice(-1);

    setOtp((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });

    if (digit && index < OTP_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      setOtp((prev) => {
        const next = [...prev];
        next[index - 1] = "";
        return next;
      });
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const digits = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    if (!digits) return;

    const next = Array(OTP_LENGTH).fill("");
    digits.split("").forEach((d, i) => (next[i] = d));
    setOtp(next);
    inputs.current[Math.min(digits.length, OTP_LENGTH - 1)]?.focus();
  };

  // Keypad: fills the first empty box
  const handleKeypadPress = (digit: string) => {
    const index = otp.findIndex((d) => d === "");
    if (index === -1) return;

    setOtp((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
    inputs.current[Math.min(index + 1, OTP_LENGTH - 1)]?.focus();
  };

  // Keypad: clears the last filled box
  const handleKeypadBackspace = () => {
    let index = -1;
    for (let i = OTP_LENGTH - 1; i >= 0; i--) {
      if (otp[i] !== "") {
        index = i;
        break;
      }
    }
    if (index === -1) return;

    setOtp((prev) => {
      const next = [...prev];
      next[index] = "";
      return next;
    });
    inputs.current[index]?.focus();
  };

  const handleResend = () => {
    if (seconds > 0) return;
    // TODO: call your API to resend the code here
    setOtp(Array(OTP_LENGTH).fill(""));
    setSeconds(RESEND_SECONDS);
    inputs.current[0]?.focus();
  };

  const timeLabel = `00 : ${String(seconds).padStart(2, "0")}`;

  return (
    <>
      <div className="p-6 pb-72 min-h-screen bg-[#FAFAFA]">
        <IoArrowBackSharp
          onClick={() => navigate(SIGN_UP_PATH)}
          className="text-[#1D1B20] w-6 h-6 cursor-pointer"
        />
        <div className="flex flex-col mt-4 gap-1.25">
          <h5 className="font-semibold text-[20px] text-[#1A2B4C]">
            Verify your number
          </h5>
          <p className="font-normal text-[14px] text-[#2C3E50]">
            Enter the 6 digit code sent to
          </p>
          <p className="font-semibold text-[16px] text-[#1A2B4C]">{phone}</p>
        </div>
        {/* OTP boxes */}
        <div className="flex items-center justify-between gap-2 mt-10 max-w-87.5 mx-auto">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputs.current[index] = el;
              }}
              type="text"
              inputMode="none"
              autoComplete={index === 0 ? "one-time-code" : "off"}
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              aria-label={`Digit ${index + 1}`}
              className={`flex-1 min-w-0 max-w-11 h-12 rounded-md bg-[#E6E6E6] border text-center text-[20px] font-semibold text-[#1A2B4C] focus:outline-none focus:border-[#1A2B4C] ${
                digit ? "border-[#1A2B4C]" : "border-transparent"
              }`}
            />
          ))}
        </div>
        {/* Resend code */}
        <p className="text-center text-[14px] font-medium text-[#1E1E1E] mt-8">
          {seconds > 0 ? (
            <>
              <span className="opacity-60">Resend Code in </span>
              {"    "}
              <span className="font-semibold text-[12px] text-[#1A2B4C]">
                {timeLabel}
              </span>
            </>
          ) : (
            <span
              onClick={handleResend}
              className="font-semibold text-[16px] text-[#1A2B4C] cursor-pointer"
            >
              Resend Code
            </span>
          )}
        </p>{" "}
      </div>

      {/* Custom keypad, pinned to the bottom of the screen */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#D3D6DC] rounded-t-[20px] px-2 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="max-w-md mx-auto flex flex-col gap-2">
          {keypadRows.map((row, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-3 gap-2">
              {row.map((key) => (
                <button
                  key={key.digit}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleKeypadPress(key.digit)}
                  className="h-11 rounded-md bg-white shadow-[0_1px_0_rgba(0,0,0,0.25)] flex flex-col items-center justify-center cursor-pointer
                   active:bg-[#E6E6E6]"
                >
                  <span
                    className="text-[23px] leading-none font-bold
                   text-[#1A2B4C]"
                  >
                    {key.digit}
                  </span>
                  {key.letters && (
                    <span className="text-[10px] leading-none mt-0.5 font-medium tracking-widest text-[#000000]">
                      {key.letters}
                    </span>
                  )}
                </button>
              ))}
            </div>
          ))}

          {/* Bottom row: empty slot, 0, backspace */}
          <div className="grid grid-cols-3 gap-2">
            <div />
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleKeypadPress("0")}
              className="h-11 rounded-md bg-white shadow-[0_1px_0_rgba(0,0,0,0.25)] flex items-center justify-center text-[20px] font-bold text-[#000000] cursor-pointer active:bg-[#E6E6E6]"
            >
              0
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleKeypadBackspace}
              aria-label="Delete"
              className="h-11 rounded-md flex items-center justify-center text-[#1E1E1E] cursor-pointer active:bg-[#C4C8CF]"
            >
              <IoBackspaceOutline className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default OtpVerification;
