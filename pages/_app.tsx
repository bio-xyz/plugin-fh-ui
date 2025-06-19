import { PrivyProvider } from "@privy-io/react-auth";
import type { AppProps } from "next/app";
import "@/styles/global.scss";

export default function App({ Component, pageProps }: AppProps) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  if (appId) {
    return (
      <PrivyProvider appId={appId}>
        <Component {...pageProps} />
      </PrivyProvider>
    );
  }
  return <Component {...pageProps} />;
}
