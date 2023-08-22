import { useTheme } from "next-themes";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { MdOutlineDarkMode, MdOutlineLightMode } from "react-icons/md";
import AppNavbar from "~/components/layout/AppNavbar";
import GlobalAlertProvider from "../globalAlerts/GlobalAlertProvider";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const router = useRouter();

  const { theme, setTheme } = useTheme();

  const [drawerOpen, setDrawerOpen] = useState(false);

  const body = () => {
    return (
      <>
        <AppNavbar menuOpen={drawerOpen} onMenuOpen={setDrawerOpen} />
        <div className="height-minus-appbar drawer-mobile drawer">
          <input
            id="app-drawer"
            type="checkbox"
            className="drawer-toggle"
            checked={drawerOpen}
            onChange={(e) => setDrawerOpen(e.target.checked)}
          />
          <div className="drawer-content">
            <main className="height-minus-appbar">{children}</main>
          </div>
          <div className="drawer-side">
            <label htmlFor="app-drawer" className="drawer-overlay"></label>
            <ul className="menu w-60 overflow-y-auto bg-base-300 p-4 font-semibold text-base-content">
              <li className="menu-title">Visualizations</li>
              <li>
                <Link
                  href="/"
                  className={router.asPath === "/" ? "active" : ""}
                >
                  Gauge Map
                </Link>
              </li>
              <li>
                <Link
                  href="/graph"
                  className={router.asPath === "/graph" ? "active" : ""}
                >
                  Graph
                </Link>
              </li>
              <li className="menu-title">Data</li>
              <li>
                <Link
                  href="/table"
                  className={router.asPath === "/table" ? "active" : ""}
                >
                  Totals
                </Link>
              </li>
              <li>
                <Link
                  href="/download"
                  className={router.asPath === "/download" ? "active" : ""}
                >
                  Download
                </Link>
              </li>
              <li className="menu-title">Misc</li>
              <li>
                <Link
                  href="/gauges"
                  className={router.asPath === "/gauges" ? "active" : ""}
                >
                  Gauge Info
                </Link>
              </li>
              <label className="swap-rotate swap btn-ghost btn-circle btn mt-auto">
                <input
                  type="checkbox"
                  onChange={() =>
                    setTheme(theme === "corporate" ? "business" : "corporate")
                  }
                />
                <MdOutlineLightMode className="swap-on" size={26} />
                <MdOutlineDarkMode className="swap-off" size={26} />
              </label>
            </ul>
          </div>
        </div>
      </>
    );
  };

  return (
    <>
      <Head>
        <title>LRWRA Rain Data</title>
        <meta
          name="description"
          content="Application to display data collected by rain gauges maintained by the Little Rock Water Reclamation Authority for utility and public use."
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <GlobalAlertProvider>{body()}</GlobalAlertProvider>
    </>
  );
};

export default Layout;
