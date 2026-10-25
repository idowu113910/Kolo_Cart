import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoArrowBackSharp } from "react-icons/io5";
import { BsEyeFill, BsEyeSlashFill } from "react-icons/bs";

// Change this to the page users should land on after creating an account
const AFTER_SIGNUP_PATH = "/home";

// The declarator: add, remove or reorder fields here and the form follows.
const fields = [
  {
    name: "fullName",
    label: "Full Name",
    type: "text",
    placeholder: "******  ****",
  },
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
  {
    name: "confirmPassword",
    label: "Confirm Password",
    type: "password",
    placeholder: "*********",
  },
] as const;

type FieldName = (typeof fields)[number]["name"];

// What makes a correct password. Add or edit rules here and the checklist follows.
const passwordRules = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter (A-Z)", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One lowercase letter (a-z)", test: (p: string) => /[a-z]/.test(p) },
  { label: "One number (0-9)", test: (p: string) => /\d/.test(p) },
  {
    label: "One special character (e.g. @ # ! $ %)",
    test: (p: string) => /[^A-Za-z0-9]/.test(p),
  },
];

const SignUp = () => {
  const navigate = useNavigate();
  const [values, setValues] = useState<Record<FieldName, string>>({
    fullName: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [agreed, setAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (name: FieldName, value: string) => {
    let cleaned = value;

    if (name === "phone") {
      // Phone accepts digits only (also cleans up pasted text)
      cleaned = value.replace(/\D/g, "");
    }

    if (name === "password" || name === "confirmPassword") {
      // Passwords can't contain spaces
      cleaned = value.replace(/\s/g, "");
    }

    if (name === "fullName") {
      // No leading space and no double spaces
      cleaned = value.replace(/^\s+/, "").replace(/\s{2,}/g, " ");

      // A capital letter typed right after a lowercase letter starts the next
      // name, so add the space automatically (IdowuD -> Idowu D)
      cleaned = cleaned.replace(/([a-z])([A-Z])/g, "$1 $2");
    }

    setValues((prev) => ({ ...prev, [name]: cleaned }));
  };

  const passwordsMatch = values.password === values.confirmPassword;
  const showMismatch = values.confirmPassword !== "" && !passwordsMatch;
  const passwordIsStrong = passwordRules.every((rule) =>
    rule.test(values.password),
  );

  const isValid =
    values.fullName.trim() !== "" &&
    values.phone.trim() !== "" &&
    passwordIsStrong &&
    values.confirmPassword !== "" &&
    passwordsMatch &&
    agreed;

  const handleSubmit = () => {
    if (!isValid) return;
    navigate(AFTER_SIGNUP_PATH);
  };

  return (
    <>
      <div className="p-6 min-h-screen bg-[#FAFAFA]">
        <IoArrowBackSharp
          onClick={() => navigate(-1)}
          className="text-[#1D1B20] w-6 h-6 cursor-pointer"
        />

        <div className="flex flex-col mt-4 gap-1.25">
          <h5 className="font-semibold text-[20px] text-[#1A2B4C]">
            Create Account
          </h5>
          <p className="font-normal text-[14px] text-[#2C3E50] ">
            Let's get you started
          </p>
        </div>

        <div className="min-h-151.25 bg-white mt-4 max-w-87.5 ml-4 border border-[#D9D9D9] px-6 pt-8 pb-10 flex flex-col">
          {/* Fields mapped from the declarator */}
          <div className="flex flex-col gap-4">
            {fields.map((field) => {
              const isPasswordField =
                field.name === "password" || field.name === "confirmPassword";
              const isVisible =
                field.name === "password" ? showPassword : showConfirmPassword;

              return (
                <div key={field.name}>
                  <label className="block mb-2 text-[14px] font-medium text-[#1E1E1E]">
                    {field.label}
                  </label>
                  <div className="relative">
                    <input
                      type={isPasswordField && isVisible ? "text" : field.type}
                      inputMode={field.name === "phone" ? "numeric" : undefined}
                      placeholder={field.placeholder}
                      value={values[field.name]}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      className={`w-full rounded-md border px-4 py-3 
                  h-[40px] text-[16px] text-[#1A2B4C] font-normal placeholder:text-[#B3B3B3] focus:outline-none focus:border-[#1A2B4C] ${
                    field.name === "confirmPassword" && showMismatch
                      ? "border-[#E74C3C]"
                      : "border-[#D9D9D9]"
                  } ${isPasswordField ? "pr-11" : ""}`}
                    />
                    {isPasswordField && (
                      <button
                        type="button"
                        onClick={() =>
                          field.name === "password"
                            ? setShowPassword((prev) => !prev)
                            : setShowConfirmPassword((prev) => !prev)
                        }
                        aria-label={
                          isVisible ? "Hide password" : "Show password"
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7F8C8D] cursor-pointer"
                      >
                        {isVisible ? (
                          <BsEyeFill className="w-5 h-5" />
                        ) : (
                          <BsEyeSlashFill className="w-5 h-5" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Password rules checklist */}
                  {field.name === "password" && (
                    <ul className="mt-2 flex flex-col gap-0.5">
                      {passwordRules.map((rule) => {
                        const met = rule.test(values.password);
                        return (
                          <li
                            key={rule.label}
                            className={`text-[12px] font-normal ${
                              met ? "text-[#27AE60]" : "text-[#7F8C8D]"
                            }`}
                          >
                            {met ? "✓" : "•"} {rule.label}
                          </li>
                        );
                      })}
                      <li className="text-[12px] font-normal text-[#7F8C8D]">
                        • No spaces allowed
                      </li>
                    </ul>
                  )}

                  {/* Mismatch error */}
                  {field.name === "confirmPassword" && showMismatch && (
                    <p className="mt-2 text-[12px] font-normal text-[#E74C3C]">
                      Passwords do not match
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Terms checkbox */}
          <label className="flex items-start gap-2 mt-5 text-[14px] pl-1.5 text-[#1E1E1E] cursor-pointer font-normal">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="w-4 h-4 shrink-0 accent-[#1A2B4C] mt-2"
            />
            I agree to the terms &amp; conditions and the privacy policy
          </label>

          {/* Create Account button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isValid}
            className={`w-full h-12 p-3 rounded-lg mt-10 text-white
               text-[16px] font-semibold ${
                 isValid
                   ? "bg-[#1A2B4C] cursor-pointer"
                   : "bg-[#1A2B4C]/60 cursor-not-allowed"
               }`}
          >
            Create Account
          </button>

          {/* Bottom link, pushed to the bottom of the card */}
          <p className="mt-2 text-center text-[16px] font-semibold text-[#1A2B4C]">
            Already have an account?{" "}
            <span
              onClick={() => {
                navigate("/login");
              }}
              className="font-semibold text-[16px] cursor-pointer whitespace-nowrap"
            >
              Sign In
            </span>
          </p>
        </div>
      </div>
    </>
  );
};

export default SignUp;
