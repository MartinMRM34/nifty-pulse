"use server";

import { getDb } from "@/lib/mongodb";

const COLLECTION = "gsec_yields";
const DEFAULT_YIELD = 7.0; // Fallback if no data available

/**
 * Get the latest 10-Year G-Sec yield from MongoDB.
 * Stored daily by the Python pipeline.
 */
export async function getLatestGSecYield(): Promise<number> {
  try {
    const db = await getDb();
    const doc = await db
      .collection(COLLECTION)
      .findOne({}, { sort: { date: -1 } });
    if (doc && typeof doc.yield === "number") {
      return doc.yield;
    }
    return DEFAULT_YIELD;
  } catch (error) {
    console.error("Failed to fetch G-Sec yield:", error);
    return DEFAULT_YIELD;
  }
}
