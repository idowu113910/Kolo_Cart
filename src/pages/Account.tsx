import pic from "../assets/picture.svg";
import { FaShoppingCart } from "react-icons/fa";
import { IoIosArrowForward } from "react-icons/io";
import { CiSettings } from "react-icons/ci";
import { IoMdNotifications } from "react-icons/io";
import { CiCreditCard1 } from "react-icons/ci";

const Account = () => {
  return (
    <>
      <div className="bg-[#1A2B4C] rounded-tl-[20px] rounded-tr-[20px] w-full h-26.25 p-4 mt-10">
        <div className="flex justify-between">
          <div className="flex gap-4">
            <img src={pic} alt="" />

            <div className="flex flex-col mt-2.5">
              <h6 className="font-semibold text-white text-[16px]">
                Good Morning Mrs. Helen
              </h6>
              <p className="font-semibold text-[16px] text-[#FF8C00]">
                09132515670
              </p>
            </div>
          </div>

          <p className="fot-semibold text-[14px] text-white mt-5">Edit</p>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-2 mt-3">
        <div
          className="flex bg-[#F3EDF7] w-full rounded-xl shadow-[0_2px_6px_2px_rgba(0,0,0,0.15),0_1px_2px_0_rgba(0,0,0,0.3)] justify-between px-2 
        h-8.75 mt-4 mx-auto"
        >
          <div className="flex gap-1.25 p-1.5">
            <FaShoppingCart className="mt-1 text-[#2C3E50]" />
            <p className="font-semibold text-[#2C3E50] text-[16px]">
              My Address
            </p>
          </div>

          <IoIosArrowForward className="mt-2" />
        </div>
        <div
          className="flex bg-[#F3EDF7] w-full rounded-xl shadow-[0_2px_6px_2px_rgba(0,0,0,0.15),0_1px_2px_0_rgba(0,0,0,0.3)] justify-between px-2 
        h-8.75 mt-4 mx-auto"
        >
          <div className="flex gap-1.25 p-1.5">
            <CiCreditCard1 className="mt-1 text-[#2C3E50]" />
            <p className="font-semibold text-[#2C3E50] text-[16px]">
              Payment Method
            </p>
          </div>

          <IoIosArrowForward className="mt-2" />
        </div>
        <div
          className="flex bg-[#F3EDF7] w-full rounded-xl shadow-[0_2px_6px_2px_rgba(0,0,0,0.15),0_1px_2px_0_rgba(0,0,0,0.3)] justify-between px-2 
        h-8.75 mt-4 mx-auto"
        >
          <div className="flex gap-1.25 p-1.5">
            <FaShoppingCart className="mt-1 text-[#2C3E50]" />
            <p className="font-semibold text-[#2C3E50] text-[16px]">
              KoloCart Savings (Coming Soon)
            </p>
          </div>

          <IoIosArrowForward className="mt-2" />
        </div>
        <div
          className="flex bg-[#F3EDF7] w-full rounded-xl shadow-[0_2px_6px_2px_rgba(0,0,0,0.15),0_1px_2px_0_rgba(0,0,0,0.3)] justify-between px-2 
        h-8.75 mt-4 mx-auto"
        >
          <div className="flex gap-1.25 p-1.5">
            <IoMdNotifications className="mt-1 text-[#2C3E50]" />
            <p className="font-semibold text-[#2C3E50] text-[16px]">
              Notification
            </p>
          </div>

          <IoIosArrowForward className="mt-2" />
        </div>
        <div
          className="flex bg-[#F3EDF7] w-full rounded-xl shadow-[0_2px_6px_2px_rgba(0,0,0,0.15),0_1px_2px_0_rgba(0,0,0,0.3)] justify-between px-2 
        h-8.75 mt-4 mx-auto"
        >
          <div className="flex gap-1.25 p-1.5">
            <FaShoppingCart className="mt-1 text-[#2C3E50]" />
            <p className="font-semibold text-[#2C3E50] text-[16px]">
              Help & Support
            </p>
          </div>

          <IoIosArrowForward className="mt-2" />
        </div>
        <div
          className="flex bg-[#F3EDF7] w-full rounded-xl shadow-[0_2px_6px_2px_rgba(0,0,0,0.15),0_1px_2px_0_rgba(0,0,0,0.3)] justify-between px-2 
        h-8.75 mt-4 mx-auto"
        >
          <div className="flex gap-1.25 p-1.5">
            <FaShoppingCart className="mt-1 text-[#2C3E50]" />
            <p className="font-semibold text-[#2C3E50] text-[16px]">
              About KoloCart
            </p>
          </div>

          <IoIosArrowForward className="mt-2" />
        </div>
        <div
          className="flex bg-[#F3EDF7] w-full rounded-xl shadow-[0_2px_6px_2px_rgba(0,0,0,0.15),0_1px_2px_0_rgba(0,0,0,0.3)] justify-between px-2 
        h-8.75 mt-4 mx-auto"
        >
          <div className="flex gap-1.25 p-1.5">
            <CiSettings className="mt-1 text-[#2C3E50]" />
            <p className="font-semibold text-[#2C3E50] text-[16px]">Settings</p>
          </div>

          <IoIosArrowForward className="mt-2" />
        </div>
      </div>
    </>
  );
};

export default Account;
