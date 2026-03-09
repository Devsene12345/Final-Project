import {
  DataSnapshot,
  Unsubscribe,
  equalTo,
  get,
  onValue,
  orderByChild,
  push,
  query,
  ref,
  remove,
  serverTimestamp,
  set,
  update,
} from "firebase/database";
import { rtdb } from "../FirebaseConfig";

export type RiskLevel = "Low" | "Medium" | "High";
export type HealthStatus = "healthy" | "at-risk" | "critical";
export type VerificationStatus = "pending" | "verified" | "rejected";

export type MarkerRecord = {
  id: number;
  description: string;
  latitude: number;
  longitude: number;
  height: number;
  risklevel: RiskLevel;
  imageUrl?: string | null;
  createdAt?: unknown;
};

export type TreeRecord = {
  id: string;
  species: string;
  notes: string;
  health: HealthStatus;
  riskLevel: RiskLevel;
  latitude: number;
  longitude: number;
  photoUrls: string[];
  verified: boolean;
  verificationStatus: VerificationStatus;
  verifiedAt?: unknown | null;
  verifiedBy?: string | null;
  createdBy: string;
  createdByName?: string | null;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type AlertType = "info" | "warning" | "critical";

export type AlertRecord = {
  id: string;
  treeId: string;
  level: RiskLevel;
  type: AlertType;
  message: string;
  latitude: number;
  longitude: number;
  resolved: boolean;
  resolvedAt?: unknown | null;
  resolvedBy?: string | null;
  createdAt?: unknown;
};

export type UserRole = "user" | "admin";

export type UserProfile = {
  uid: string;
  name: string;
  email: string | null;
  role: UserRole;
  createdAt?: unknown;
  lastLoginAt?: unknown;
};

function snapshotToObject<T>(snap: DataSnapshot): Record<string, T> {
  return (snap.val() ?? {}) as Record<string, T>;
}

function snapshotToArray<T extends { id: string }>(snap: DataSnapshot): T[] {
  const obj = snapshotToObject<Omit<T, "id">>(snap);
  return Object.entries(obj).map(([id, value]) => ({
    id,
    ...(value as object),
  })) as T[];
}

/* -------------------- Users -------------------- */

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const userRef = ref(rtdb, `users/${uid}`);
  const snap = await get(userRef);
  return snap.exists() ? (snap.val() as UserProfile) : null;
}

export async function upsertUserProfile(profile: UserProfile) {
  const userRef = ref(rtdb, `users/${profile.uid}`);
  const existing = await get(userRef);

  const payload: UserProfile = {
    uid: profile.uid,
    name: profile.name ?? "",
    email: profile.email ?? null,
    role: profile.role ?? "user",
    createdAt: existing.exists()
      ? (existing.val()?.createdAt ?? serverTimestamp())
      : serverTimestamp(),
    lastLoginAt: serverTimestamp(),
  };

  await set(userRef, payload);
}

/* -------------------- Markers -------------------- */

export async function seedMarkersIfEmpty(markers: MarkerRecord[]) {
  const markersRef = ref(rtdb, "markers");
  const snap = await get(markersRef);

  if (snap.exists()) return;

  const payload: Record<string, MarkerRecord> = {};
  for (const marker of markers) {
    payload[String(marker.id)] = {
      ...marker,
      imageUrl: marker.imageUrl ?? null,
      createdAt: serverTimestamp(),
    };
  }

  await set(markersRef, payload);
}

export function subscribeMarkers(
  onData: (markers: MarkerRecord[]) => void,
  onError?: (error: unknown) => void,
): Unsubscribe {
  const markersRef = ref(rtdb, "markers");

  return onValue(
    markersRef,
    (snap) => {
      const obj = snapshotToObject<MarkerRecord>(snap);
      const list = Object.values(obj).sort((a, b) => a.id - b.id);
      onData(list);
    },
    (error) => onError?.(error),
  );
}

/* -------------------- Trees -------------------- */

export async function createTree(
  tree: Omit<TreeRecord, "id" | "createdAt" | "updatedAt">,
) {
  const treesRef = ref(rtdb, "trees");
  const newTreeRef = push(treesRef);

  if (!newTreeRef.key) {
    throw new Error("Failed to generate tree id.");
  }

  const payload: TreeRecord = {
    id: newTreeRef.key,
    species: tree.species,
    notes: tree.notes ?? "",
    health: tree.health,
    riskLevel: tree.riskLevel,
    latitude: tree.latitude,
    longitude: tree.longitude,
    photoUrls: tree.photoUrls ?? [],
    verified: tree.verified,
    verificationStatus: tree.verificationStatus,
    verifiedAt: tree.verifiedAt ?? null,
    verifiedBy: tree.verifiedBy ?? null,
    createdBy: tree.createdBy,
    createdByName: tree.createdByName ?? null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await set(newTreeRef, payload);
  return payload.id;
}

export async function updateTree(treeId: string, patch: Partial<TreeRecord>) {
  const treeRef = ref(rtdb, `trees/${treeId}`);

  const cleanPatch = Object.fromEntries(
    Object.entries({
      ...patch,
      updatedAt: serverTimestamp(),
    }).filter(([, value]) => value !== undefined),
  );

  await update(treeRef, cleanPatch);
}

export async function deleteTree(treeId: string) {
  await remove(ref(rtdb, `trees/${treeId}`));
}

export function subscribeAllTrees(
  onData: (trees: TreeRecord[]) => void,
  onError?: (error: unknown) => void,
): Unsubscribe {
  const treesRef = ref(rtdb, "trees");

  return onValue(
    treesRef,
    (snap) => {
      const list = snapshotToArray<TreeRecord>(snap).reverse();
      onData(list);
    },
    (error) => onError?.(error),
  );
}

export function subscribeVerifiedTrees(
  onData: (trees: TreeRecord[]) => void,
  onError?: (error: unknown) => void,
): Unsubscribe {
  const q = query(ref(rtdb, "trees"), orderByChild("verified"), equalTo(true));

  return onValue(
    q,
    (snap) => {
      const list = snapshotToArray<TreeRecord>(snap).reverse();
      onData(list);
    },
    (error) => onError?.(error),
  );
}

export function subscribePendingTrees(
  onData: (trees: TreeRecord[]) => void,
  onError?: (error: unknown) => void,
): Unsubscribe {
  const q = query(
    ref(rtdb, "trees"),
    orderByChild("verificationStatus"),
    equalTo("pending"),
  );

  return onValue(
    q,
    (snap) => {
      const list = snapshotToArray<TreeRecord>(snap).reverse();
      onData(list);
    },
    (error) => onError?.(error),
  );
}

export async function verifyTree(treeId: string, adminUid: string) {
  await updateTree(treeId, {
    verified: true,
    verificationStatus: "verified",
    verifiedBy: adminUid,
    verifiedAt: serverTimestamp(),
  });
}

export async function rejectTree(treeId: string, adminUid: string) {
  await updateTree(treeId, {
    verified: false,
    verificationStatus: "rejected",
    verifiedBy: adminUid,
    verifiedAt: serverTimestamp(),
  });
}

/* -------------------- Alerts -------------------- */

export async function createAlert(
  alert: Omit<
    AlertRecord,
    "id" | "resolved" | "createdAt" | "resolvedAt" | "resolvedBy"
  >,
) {
  const alertsRef = ref(rtdb, "alerts");
  const newAlertRef = push(alertsRef);

  if (!newAlertRef.key) {
    throw new Error("Failed to generate alert id.");
  }

  const payload: AlertRecord = {
    id: newAlertRef.key,
    treeId: alert.treeId,
    level: alert.level,
    type: alert.type,
    message: alert.message,
    latitude: alert.latitude,
    longitude: alert.longitude,
    resolved: false,
    resolvedAt: null,
    resolvedBy: null,
    createdAt: serverTimestamp(),
  };

  await set(newAlertRef, payload);
  return payload.id;
}

export function subscribeActiveAlerts(
  onData: (alerts: AlertRecord[]) => void,
  onError?: (error: unknown) => void,
): Unsubscribe {
  const q = query(
    ref(rtdb, "alerts"),
    orderByChild("resolved"),
    equalTo(false),
  );

  return onValue(
    q,
    (snap) => {
      const list = snapshotToArray<AlertRecord>(snap).reverse();
      onData(list);
    },
    (error) => onError?.(error),
  );
}

export async function resolveAlert(alertId: string, adminUid: string) {
  const alertRef = ref(rtdb, `alerts/${alertId}`);
  await update(alertRef, {
    resolved: true,
    resolvedBy: adminUid,
    resolvedAt: serverTimestamp(),
  });
}
