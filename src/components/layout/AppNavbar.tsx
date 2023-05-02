import Image from "next/image";
import Link from "next/link";

const AppNavbar = () => {
  return (
    <div className="navbar bg-primary text-primary-content">
      <Link href="https://lrwra.com/" className="ml-2">
        <Image
          src="/LRWRA_LogoColor.png"
          width={28}
          height={32}
          alt="Little Rock Water Reclamation Authority Logo"
        />
      </Link>
      <div className="flex-1">
        <span className="ml-3 text-2xl font-bold">Rain Data</span>
      </div>
    </div>
  );
};

export default AppNavbar;
