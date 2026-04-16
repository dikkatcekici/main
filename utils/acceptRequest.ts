import {
  doc,
  updateDoc,
  runTransaction,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function acceptRequest(
  requestId: string,
  driverId: string,
  driverPhone: string
): Promise<boolean> {
  const requestRef = doc(db, "requests", requestId);

  try {
    let accepted = false;
    await runTransaction(db, async (transaction) => {
      const requestDoc = await transaction.get(requestRef);
      if (!requestDoc.exists()) throw new Error("İstek bulunamadı");

      const data = requestDoc.data();
      if (data.status !== "searching") {
        throw new Error("Bu iş zaten alınmış");
      }

      transaction.update(requestRef, {
        status: "accepted",
        driverId,
        driverPhone,
        acceptedAt: Date.now(),
      });
      accepted = true;
    });
    return accepted;
  } catch (error: any) {
    console.error("acceptRequest hatası:", error.message);
    return false;
  }
}

export async function updateRequestStatus(
  requestId: string,
  status: string
): Promise<void> {
  await updateDoc(doc(db, "requests", requestId), { status });
}
