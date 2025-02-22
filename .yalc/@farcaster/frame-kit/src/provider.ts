import { Provider, RpcRequest } from "ox";
import { appFrameHost } from "./appFrameHost";

const emitter = Provider.createEmitter();
const store = RpcRequest.createStore();

export const provider = Provider.from({
  ...emitter,
  async request(args) {
    return await appFrameHost.ethProviderRequest(
      // @ts-expect-error - from ox examples but our FetchFn needs better typing
      store.prepare(args),
    );
  },
});

export type ProviderType = typeof provider;

document.addEventListener("FarcasterAppFrameEvent", (event) => {
  if (event instanceof MessageEvent) {
    // TODO narrow to EventMap types and emit
    // emitter.emit(event.type as (keyof Provider.EventMap), event.data);
  }
});
