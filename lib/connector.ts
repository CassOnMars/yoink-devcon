import { provider } from "@farcaster/frame-kit";
import { SwitchChainError, fromHex, getAddress, numberToHex } from "viem";

import { ChainNotConfiguredError, createConnector } from "wagmi";

appFrame.type = "appFrame" as const;

export function appFrame() {
  let connected = true;
  let connectedChainId: number;

  return createConnector<typeof provider>((config) => ({
    id: "mock",
    name: "Farcaster Wallet",
    type: appFrame.type,
    async setup() {
      connectedChainId = config.chains[0].id;
    },
    async connect({ chainId } = {}) {
      const provider = await this.getProvider();
      const accounts = await provider.request({
        method: "eth_requestAccounts",
      });

      let currentChainId = await this.getChainId();
      if (chainId && currentChainId !== chainId) {
        const chain = await this.switchChain!({ chainId });
        currentChainId = chain.id;
      }

      connected = true;

      return {
        accounts: accounts.map((x) => getAddress(x)),
        chainId: currentChainId,
      };
    },
    async disconnect() {
      connected = false;
    },
    async getAccounts() {
      if (!connected) throw new Error("Not connected");
      const provider = await this.getProvider();
      const accounts = await provider.request({ method: "eth_accounts" });
      return accounts.map((x) => getAddress(x));
    },
    async getChainId() {
      const provider = await this.getProvider();
      const hexChainId = await provider.request({ method: "eth_chainId" });
      return fromHex(hexChainId, "number");
    },
    async isAuthorized() {
      if (!connected) return false;
      const accounts = await this.getAccounts();
      return !!accounts.length;
    },
    async switchChain({ chainId }) {
      const provider = await this.getProvider();
      const chain = config.chains.find((x) => x.id === chainId);
      if (!chain) throw new SwitchChainError(new ChainNotConfiguredError());

      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: numberToHex(chainId) }],
      });
      return chain;
    },
    onAccountsChanged(accounts) {
      if (accounts.length === 0) this.onDisconnect();
      else
        config.emitter.emit("change", {
          accounts: accounts.map((x) => getAddress(x)),
        });
    },
    onChainChanged(chain) {
      const chainId = Number(chain);
      config.emitter.emit("change", { chainId });
    },
    async onDisconnect(_error) {
      config.emitter.emit("disconnect");
      connected = false;
    },
    async getProvider({ chainId } = {}) {
      return provider;
    },
  }));
}
