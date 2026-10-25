import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { type JSX } from "react";
import SplashScreen from "./pages/SplashScreen";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import Verify from "./pages/Verification";
import OnBoarding from "./pages/OnBoarding";
import Location from "./pages/Location";
import Home from "./pages/Home";
import Category from "./pages/Category";
import MainLayout from "./components/Layout";
import Orders from "./pages/Orders";
import Cart from "./pages/Cart";
import Account from "./pages/Account";

const router = createBrowserRouter([
  // ---------- Pages WITHOUT the footer ----------
  {
    path: "/",
    element: <SplashScreen />,
  },
  {
    path: "/onboarding",
    element: <OnBoarding />,
  },
  {
    path: "/location",
    element: <Location />,
  },
  {
    path: "/login",
    element: <SignIn />,
  },
  {
    path: "/signup",
    element: <SignUp />,
  },
  {
    path: "/verify",
    element: <Verify />,
  },

  // ---------- Pages WITH the footer ----------
  {
    element: <MainLayout />,
    children: [
      {
        path: "/home",
        element: <Home />,
      },
      {
        path: "/category",
        element: <Category />,
      },
      {
        path: "/orders",
        element: <Orders />,
      },
      {
        path: "/cart",
        element: <Cart />,
      },
      {
        path: "/account",
        element: <Account />,
      },
    ],
  },

  // Unknown URLs go back to the splash screen
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

function App(): JSX.Element {
  return <RouterProvider router={router} />;
}

export default App;
