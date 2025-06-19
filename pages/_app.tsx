import { PrivyProvider } from "@privy-io/react-auth";
import type { AppProps } from "next/app";
import { Provider } from "react-redux";
import SocketInitializer from "@/components/SocketInitializer";
import { store } from "@/store";
import "@/styles/global.scss";

export default function App({ Component, pageProps }: AppProps) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  const Inner = (
    <>
      <SocketInitializer />
      <Component {...pageProps} />
    </>
  );

  return (
    <Provider store={store}>
      {appId ? <PrivyProvider appId={appId}>{Inner}</PrivyProvider> : Inner}
    </Provider>
  );
}
