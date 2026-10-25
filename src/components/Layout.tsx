import type { FC } from "react";
import { Outlet } from "react-router-dom";
import Footer from "./Footer";

const MainLayout: FC = () => (
  <>
    <div className="pb-24">
      <Outlet />
    </div>
    <Footer />
  </>
);

export default MainLayout;
