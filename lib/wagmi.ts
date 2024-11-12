import { http, createConfig } from "wagmi";
import { mainnet, base } from "wagmi/chains";
import { appFrame } from "./connector";

export const config = createConfig({
  chains: [mainnet, base],
  connectors: [appFrame()],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(base.rpcUrls.default.http[0]),
  },
});
