import { type AppType } from "next/app";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import Layout from "~/components/layout/Layout";
import { ThemeProvider } from "next-themes";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ThemeProvider defaultTheme="business">
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </ThemeProvider>
  );
};

export default api.withTRPC(MyApp);
