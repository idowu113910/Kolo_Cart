import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoArrowBackSharp } from "react-icons/io5";
import { BsEyeFill, BsEyeSlashFill } from "react-icons/bs";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";

// Change this to the page users should land on after signing in
const HOME_PATH = "/location";

// The declarator: add, remove or reorder fields here and the form follows.
const fields = [
  {
    name: "phone",
    label: "Phone Number",
    type: "tel",
    placeholder: "+234 ********",
  },
  {
    name: "password",
    label: "Password",
    type: "password",
    placeholder: "*********",
  },
] as const;

type FieldName = (typeof fields)[number]["name"];

const SignIn = () => {
  const navigate = useNavigate();
  const [values, setValues] = useState<Record<FieldName, string>>({
    phone: "",
    password: "",
  });
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (name: FieldName, value: string) => {
    // Phone accepts digits only (also cleans up pasted text)
    const cleaned = name === "phone" ? value.replace(/\D/g, "") : value;
    setValues((prev) => ({ ...prev, [name]: cleaned }));
  };

  const isValid = values.phone.trim() !== "" && values.password !== "";

  const handleSubmit = () => {
    if (!isValid) return;
    navigate(HOME_PATH);
  };

  return (
    <>
      <div className="p-6 min-h-screen bg-[#FAFAFA]">
        <IoArrowBackSharp
          onClick={() => navigate(-1)}
          className="text-[#1D1B20] w-6 h-6 cursor-pointer"
        />

        <div className="flex flex-col mt-10 gap-1.25">
          <h5 className="font-semibold text-[20px] text-[#1A2B4C]">
            Welcome Back
          </h5>
          <p className="font-normal text-[14px] text-[#2C3E50] ">
            Sign in to continue to KoloCart
          </p>
        </div>

        <div className="h-151.25 bg-white mt-4 max-w-87.5 ml-4 border border-[#D9D9D9] px-6 pt-8 pb-10 flex flex-col">
          {/* Fields mapped from the declarator */}
          <div className="flex flex-col gap-4">
            {fields.map((field) => (
              <div key={field.name}>
                <div className="flex items-end justify-between mb-2">
                  <label className="text-[14px] font-medium text-[#1E1E1E]">
                    {field.label}
                  </label>
                  {field.name === "password" && (
                    <span className="text-[11px] font-medium text-[#1E1E1E] cursor-pointer">
                      Forgot password?
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={
                      field.name === "password" && showPassword
                        ? "text"
                        : field.type
                    }
                    inputMode={field.name === "phone" ? "numeric" : undefined}
                    placeholder={field.placeholder}
                    value={values[field.name]}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    className={`w-full h-11 rounded-md border border-[#D9D9D9] px-4 py-3 
                  h-[40px] text-[16px] text-[#1A2B4C] font-normal placeholder:text-[#B3B3B3] focus:outline-none focus:border-[#1A2B4C] ${
                    field.name === "password" ? "pr-11" : ""
                  }`}
                  />
                  {field.name === "password" && (
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7F8C8D] cursor-pointer"
                    >
                      {showPassword ? (
                        <BsEyeFill className="w-5 h-5" />
                      ) : (
                        <BsEyeSlashFill className="w-5 h-5" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Remember me */}
          <label className="flex items-center gap-2 mt-3 text-[13px] text-[#1A2B4C] cursor-pointer">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="w-3.5 h-3.5 accent-[#1A2B4C]"
            />
            Remember me
          </label>

          {/* Sign In button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isValid}
            className={`w-full h-11 rounded-md mt-6 text-white text-[14px] font-medium ${
              isValid
                ? "bg-[#1A2B4C] cursor-pointer"
                : "bg-[#1A2B4C]/60 cursor-not-allowed"
            }`}
          >
            Sign In
          </button>

          <p className="text-center font-semibold text-[16px] text-[#2C3E50] mt-5">OR</p>

          {/* Social buttons */}
          <button
            type="button"
            className="w-full h-11 rounded-md mt-5 border border-[#1A2B4C] bg-white flex items-center justify-center gap-2 text-[16px] font-semibold text-[#1A2B4C] cursor-pointer"
          >
            <FcGoogle className="w-6 h-6" />
            Continue with Google
          </button>
          <button
            type="button"
            className="w-full h-11 rounded-md mt-3 border border-[#1A2B4C] bg-white flex items-center justify-center gap-2 text-[16px] font-semibold text-[#1A2B4C] cursor-pointer"
          >
            <FaApple className="w-6 h-6 text-black" />
            Continue with Apple
          </button>

          {/* Bottom link, pushed to the bottom of the card */}
          <p className="mt-auto text-center text-[16px] font-semibold text-[#1A2B4C]">
            Don't have an account?{" "}
            <span
              onClick={() => {
                navigate("/signup");
              }}
              className="font-semibold text-[16px] cursor-pointer"
            >
              Sign up
            </span>
          </p>
        </div>
      </div>
    </>
  );
};

export default SignIn;
