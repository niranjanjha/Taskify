import { HindsightClient } from "@vectorize-io/hindsight-client";

let client = null;

export function getHindsightClient() {
  if (!client) {
    const baseUrl =
      process.env.HINDSIGHT_BASE_URL || "https://api.hindsight.vectorize.io";
    const apiKey = process.env.HINDSIGHT_API_KEY;
    if (!apiKey) {
      console.warn(
        "HINDSIGHT_API_KEY is not set; Hindsight memory calls will fail until configured."
      );
    }
    client = new HindsightClient({ baseUrl, apiKey });
  }
  return client;
}

/** One memory bank per logged-in user so AI context stays private. */
export function bankIdForUser(userId) {
  return `taskify-${String(userId)}`;
}

export async function ensureUserBank(userId) {
  if (!process.env.HINDSIGHT_API_KEY) return;
  const hindsight = getHindsightClient();
  const bankId = bankIdForUser(userId);
  try {
    await hindsight.getBankProfile(bankId);
  } catch {
    try {
      await hindsight.createBank(bankId, {
        name: "Taskify project memory",
        background:
          "Workspace for tasks, assignments, meetings, and team context.",
      });
    } catch (err) {
      await hindsight.getBankProfile(bankId).catch(() => {
        throw err;
      });
    }
  }
}
