import { useSyncExternalStore } from "react";

export type NetworkStatus = "online" | "offline";

function assinar(notificar: () => void) {
  window.addEventListener("online", notificar);
  window.addEventListener("offline", notificar);
  return () => {
    window.removeEventListener("online", notificar);
    window.removeEventListener("offline", notificar);
  };
}

const lerStatus = (): NetworkStatus =>
  navigator.onLine ? "online" : "offline";

/** Estado da conexão. O servidor presume `online`, e a hidratação parte dele. */
export function useNetworkStatus(): NetworkStatus {
  return useSyncExternalStore(assinar, lerStatus, () => "online");
}
