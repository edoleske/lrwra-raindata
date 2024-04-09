import Image from "next/image";
import { MdMenu, MdClose } from "react-icons/md";

interface AppNavbarProps {
	menuOpen: boolean;
	onMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const AppNavbar = ({ menuOpen, onMenuOpen }: AppNavbarProps) => {
	return (
		<div className="navbar bg-primary text-primary-content h-16">
			<div className="flex-none lg:hidden">
				<label className="swap-rotate swap btn-ghost btn-circle btn">
					<input
						type="checkbox"
						checked={menuOpen}
						onChange={(e) => onMenuOpen(e.target.checked)}
					/>
					<MdMenu className="swap-off fill-current" size={26} />
					<MdClose className="swap-on fill-current" size={26} />
				</label>
			</div>
			<a
				href="https://www.lrwra.com/"
				target="_blank"
				rel="noopener noreferrer"
				className="ml-2"
				title="LRWRA Home"
			>
				<Image
					src="/LRWRA_LogoColor.png"
					width={28}
					height={32}
					style={{ height: "auto" }}
					alt="Little Rock Water Reclamation Authority Logo"
				/>
			</a>
			<div className="flex-1">
				<span className="ml-4 text-lg sm:text-2xl font-bold">Rain Data</span>
			</div>
		</div>
	);
};

export default AppNavbar;
