import AppNavbar from "~/components/layout/AppNavbar";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <>
      <AppNavbar />
      <main className="height-minus-appbar">{children}</main>
    </>
  );
};

export default Layout;
