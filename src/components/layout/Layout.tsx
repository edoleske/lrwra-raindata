import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import AppNavbar from "~/components/layout/AppNavbar";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const router = useRouter();

  const [drawerOpen, setDrawerOpen] = useState(false);

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
            <li>
              <Link href="/" className={router.asPath === "/" ? "active" : ""}>
                Gauge Map
              </Link>
            </li>
            <li>
              <Link
                href="/table"
                className={router.asPath === "/table" ? "active" : ""}
              >
                Table
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
            <li>
              <Link
                href="/download"
                className={router.asPath === "/download" ? "active" : ""}
              >
                Download
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default Layout;
