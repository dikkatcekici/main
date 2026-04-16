import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Request } from "@/types";

export function listenToSearchingRequests(
  callback: (requests: Request[]) => void
): Unsubscribe {
  const q = query(
    collection(db, "requests"),
    where("status", "==", "searching")
  );

  return onSnapshot(q, (snapshot) => {
    const requests: Request[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Request[];
    callback(requests);
  });
}

export function listenToRequest(
  requestId: string,
  callback: (request: Request | null) => void
): Unsubscribe {
  return onSnapshot(doc(db, "requests", requestId), (snap) => {
    if (snap.exists()) {
      callback({ id: snap.id, ...snap.data() } as Request);
    } else {
      callback(null);
    }
  });
}

export function listenToDriverLocation(
  driverId: string,
  callback: (location: { lat: number; lng: number } | null) => void
): Unsubscribe {
  return onSnapshot(doc(db, "drivers", driverId), (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      callback(data.location || null);
    } else {
      callback(null);
    }
  });
}
