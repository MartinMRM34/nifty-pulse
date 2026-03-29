"use server";

import { PulseSnapshot, IndexId } from "@/types";
import { getDb } from "@/lib/mongodb";

const COLLECTION = "pulse_snapshots";

/**
 * Get a pulse snapshot for a specific index and date from MongoDB.
 */
export async function getSnapshot(indexId: IndexId, date: string): Promise<PulseSnapshot | null> {
  try {
    const db = await getDb();
    const doc = await db.collection(COLLECTION).findOne({ indexId, date });
    if (!doc) return null;
    return {
      indexId: doc.indexId,
      date: doc.date,
      pePercentile: doc.pePercentile,
      pbPercentile: doc.pbPercentile,
      dyPercentile: doc.dyPercentile,
      yieldGap: doc.yieldGap,
      dmaDistance: doc.dmaDistance,
      signal: doc.signal,
    };
  } catch (error) {
    console.error("Failed to fetch snapshot:", error);
    return null;
  }
}

/**
 * Get all available snapshot dates for an index (for the date picker).
 */
export async function getSnapshotDates(indexId: IndexId): Promise<string[]> {
  try {
    const db = await getDb();
    const docs = await db
      .collection(COLLECTION)
      .find({ indexId }, { projection: { date: 1, _id: 0 } })
      .sort({ date: 1 })
      .toArray();
    return docs.map((d) => d.date);
  } catch (error) {
    console.error("Failed to fetch snapshot dates:", error);
    return [];
  }
}
