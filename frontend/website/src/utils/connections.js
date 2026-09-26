const STORAGE_KEY = "syra_connections";
const SETTINGS_KEY = "syra_settings";

const DEFAULT_CONNECTIONS = {
  demo_erp: {
    url: "/erp-demo",
    connected_at: null,
    status: "connected",
  },
};

export function getApiKey() {
  try {
    const s = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
    return s.api_key || "internal";
  } catch {
    return "internal";
  }
}

export function loadConnections() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_CONNECTIONS };
    return { ...DEFAULT_CONNECTIONS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_CONNECTIONS };
  }
}

export function saveConnections(connections) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(connections));
}

export function markErpConnected(id, meta = {}) {
  const conns = loadConnections();
  conns[id] = {
    ...conns[id],
    ...meta,
    connected_at: new Date().toISOString(),
    status: "connected",
  };
  saveConnections(conns);
  return conns;
}

export function countReachableConnections(syraReachable, connections) {
  let n = 0;
  if (syraReachable) n += 1; // Demo ERP is online whenever SyRA is
  for (const [key, val] of Object.entries(connections || {})) {
    if (key === "demo_erp") continue;
    if (val?.status === "connected") n += 1;
  }
  return n;
}
