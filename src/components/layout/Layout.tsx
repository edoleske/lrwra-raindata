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
				<div className="height-minus-appbar lg:drawer-open drawer">
					<input
						id="app-drawer"
						type="checkbox"
						aria-label="Toggle Menu Open"
						aria-haspopup="menu"
						aria-expanded={drawerOpen}
						className="drawer-toggle"
						checked={drawerOpen}
						onChange={(e) => setDrawerOpen(e.target.checked)}
					/>
					<div className="drawer-content height-minus-appbar overflow-y-auto">
						<main className="h-full">{children}</main>
					</div>
					<div className="drawer-side lg:height-minus-appbar h-full">
						<label htmlFor="app-drawer" className="drawer-overlay" />
						<ul
							role="menu"
							className="menu w-60 overflow-y-auto bg-base-300 p-4 font-semibold text-base-content h-full"
						>
							<li className="menu-title">Visualizations</li>
							<li>
								<Link
									role="menuitem"
									href="/"
									className={router.asPath === "/" ? "active" : ""}
								>
									Gauge Map
								</Link>
							</li>
							<li>
								<Link
									role="menuitem"
									href="/line"
									className={router.asPath === "/line" ? "active" : ""}
								>
									Dynamic Line Graph
								</Link>
							</li>
							<li>
								<Link
									role="menuitem"
									href="/bar"
									className={router.asPath === "/bar" ? "active" : ""}
								>
									Bar Graph
								</Link>
							</li>
							<li className="menu-title">Data</li>
							<li>
								<Link
									role="menuitem"
									href="/table"
									className={router.asPath === "/table" ? "active" : ""}
								>
									Totals
								</Link>
							</li>
							<li>
								<Link
									role="menuitem"
									href="/download"
									className={router.asPath === "/download" ? "active" : ""}
								>
									Download
								</Link>
							</li>
							<li className="menu-title">Misc</li>
							<li>
								<Link
									role="menuitem"
									href="/gauges"
									className={router.asPath === "/gauges" ? "active" : ""}
								>
									Gauge Info
								</Link>
							</li>
              <li>
                <Link role="menuitem" href="/rjn" className={router.asPath === "/rjn" ? "active" : ""}>RJN Dashboard</Link>
              </li>
							<label className="swap btn-ghost swap-rotate btn-circle btn mt-auto">
								<span className="sr-only">Switch Theme</span>
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
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<GlobalAlertProvider>{body()}</GlobalAlertProvider>
		</>
	);
};

export default Layout;
