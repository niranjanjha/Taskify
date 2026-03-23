import { getHindsightClient, bankIdForUser, ensureUserBank } from "../utils/hindsight.js";
import { getGroq, getGroqModel } from "../utils/groq.js";

function recallTexts(recallResponse) {
  if (!recallResponse?.results?.length) return "";
  return recallResponse.results.map((m) => m.text).join("\n");
}

async function groqComplete(system, user) {
  const groq = getGroq();
  const model = getGroqModel();
  const response = await groq.chat.completions.create({
    model,
    messages: [
      ...(system ? [{ role: "system", content: system }] : []),
      { role: "user", content: user },
    ],
  });
  return response.choices[0]?.message?.content ?? "";
}

export async function generateAISuggestions(userId) {
  try {
    await ensureUserBank(userId);
    const bankId = bankIdForUser(userId);
    const hindsight = getHindsightClient();
    const memories = await hindsight.recall(
      bankId,
      "project tasks, progress, team roles, deadlines, meetings",
      { maxTokens: 4096, budget: "mid" }
    );
    const context = recallTexts(memories);
    if (!context.trim()) {
      return (
        "No memories yet. Create tasks, assign people, or add a meeting summary so the AI has context."
      );
    }
    return await groqComplete(
      "You are a concise project assistant. Use only the context given; if something is unknown, say so.",
      `Based on this project context:\n\n${context}\n\nSuggest:\n1. Next tasks\n2. Who should do them\n3. Suggested deadlines\n\nKeep the answer short and actionable.`
    );
  } catch (err) {
    console.error("generateAISuggestions:", err);
    return "Error generating suggestions. Check HINDSIGHT_API_KEY and GROQ_API_KEY.";
  }
}

export async function storeTaskCreatedMemory(userId, task) {
  try {
    await ensureUserBank(userId);
    const bankId = bankIdForUser(userId);
    const hindsight = getHindsightClient();
    const assignees =
      task.assignedTo?.length > 0
        ? task.assignedTo
            .map((a) => a.user?.name || a.user?.email || "")
            .filter(Boolean)
            .join(", ") || "team"
        : "unassigned";
    await hindsight.retain(
      bankId,
      `Task created: "${task.title}" assigned to ${assignees}. Priority: ${task.priority || "Low"}. Due: ${task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : "none"}.`,
      {
        metadata: {
          type: "task",
          status: "created",
          taskId: String(task._id),
        },
      }
    );
  } catch (err) {
    console.error("storeTaskCreatedMemory:", err);
  }
}

export async function storeTaskCompletedMemory(userId, task) {
  try {
    await ensureUserBank(userId);
    const bankId = bankIdForUser(userId);
    const hindsight = getHindsightClient();
    const names =
      task.assignedTo?.length > 0
        ? task.assignedTo
            .map((a) => a.user?.name || a.user?.email || "teammate")
            .join(", ")
        : "owner";
    await hindsight.retain(
      bankId,
      `${names} completed task: "${task.title}".`,
      {
        metadata: {
          type: "task_update",
          status: "completed",
          taskId: String(task._id),
        },
      }
    );
  } catch (err) {
    console.error("storeTaskCompletedMemory:", err);
  }
}

export async function storeAssignmentMemory(userId, taskTitle, assigneeName, role) {
  try {
    await ensureUserBank(userId);
    const bankId = bankIdForUser(userId);
    const hindsight = getHindsightClient();
    await hindsight.retain(
      bankId,
      `Assignment: ${assigneeName} added to "${taskTitle}" as ${role || "Member"}.`,
      {
        metadata: {
          type: "assignment",
        },
      }
    );
  } catch (err) {
    console.error("storeAssignmentMemory:", err);
  }
}

export async function storeTeamRoles(userId, rolesText) {
  try {
    await ensureUserBank(userId);
    const bankId = bankIdForUser(userId);
    const hindsight = getHindsightClient();
    await hindsight.retain(bankId, `Team roles: ${rolesText}`, {
      metadata: { type: "team_roles" },
    });
  } catch (err) {
    console.error("storeTeamRoles:", err);
    throw err;
  }
}

export async function summarizeMeeting(userId, text) {
  if (!text?.trim()) {
    throw new Error("Meeting text is required");
  }
  const summary = await groqComplete(
    "Summarize meetings clearly. Extract decisions and owners when possible.",
    `Summarize this meeting and extract key decisions:\n\n${text}`
  );
  try {
    await ensureUserBank(userId);
    const bankId = bankIdForUser(userId);
    const hindsight = getHindsightClient();
    await hindsight.retain(bankId, summary, {
      metadata: { type: "meeting_summary" },
    });
  } catch (err) {
    console.error("summarizeMeeting retain:", err);
  }
  return summary;
}

export async function suggestAssignment(userId, taskDescription) {
  if (!taskDescription?.trim()) {
    throw new Error("Task description is required");
  }
  try {
    await ensureUserBank(userId);
    const bankId = bankIdForUser(userId);
    const hindsight = getHindsightClient();
    const memories = await hindsight.recall(
      bankId,
      "team roles and skills assignments workload",
      { maxTokens: 4096, budget: "mid" }
    );
    const context = recallTexts(memories);
    return await groqComplete(
      "Recommend one primary assignee and a short rationale. If context is empty, give general guidance.",
      `Task: ${taskDescription}\n\nTeam / memory context:\n${context || "(no stored team context yet)"}\n\nWho should do this task? Reply in 2–4 sentences.`
    );
  } catch (err) {
    console.error("suggestAssignment:", err);
    return "Could not suggest an assignment. Check API keys and try again.";
  }
}

export async function getDeadlineInsights(userId) {
  try {
    await ensureUserBank(userId);
    const bankId = bankIdForUser(userId);
    const hindsight = getHindsightClient();
    const memories = await hindsight.recall(
      bankId,
      "pending tasks deadlines urgent overdue",
      { maxTokens: 4096, budget: "mid" }
    );
    const context = recallTexts(memories);
    return await groqComplete(
      "Prioritize clearly. Mention urgency and ordering.",
      `Analyze these task-related memories:\n\n${context || "(no memory yet — remind user to create tasks and sync memory)"}\n\nWhich items sound urgent? What should happen first?`
    );
  } catch (err) {
    console.error("getDeadlineInsights:", err);
    return "Error loading deadline insights.";
  }
}

export async function chatWithProjectAI(userId, message) {
  if (!message?.trim()) {
    throw new Error("Message is required");
  }
  try {
    await ensureUserBank(userId);
    const bankId = bankIdForUser(userId);
    const hindsight = getHindsightClient();
    const memories = await hindsight.recall(bankId, message, {
      maxTokens: 4096,
      budget: "mid",
    });
    const context = recallTexts(memories);
    return await groqComplete(
      "You are the Taskify project copilot. Ground answers in the MEMORY CONTEXT when relevant; otherwise answer generally and say what is missing.",
      `MEMORY CONTEXT:\n${context || "(empty)"}\n\nUSER:\n${message}`
    );
  } catch (err) {
    console.error("chatWithProjectAI:", err);
    return "Chat failed. Verify HINDSIGHT_API_KEY and GROQ_API_KEY.";
  }
}

export async function getInactiveMemberInsights(userId, tasksSummary) {
  try {
    return await groqComplete(
      "Flag likely inactive or overloaded members based only on the data. Be tactful and suggest one follow-up action.",
      `Here is a compact summary of tasks by assignee and recency:\n\n${tasksSummary}\n\nWhich members look inactive or at risk, and what should the lead do?`
    );
  } catch (err) {
    console.error("getInactiveMemberInsights:", err);
    return "Could not analyze team activity.";
  }
}

export async function extractTasksFromMeeting(userId, meetingText) {
  if (!meetingText?.trim()) {
    throw new Error("Meeting text is required");
  }
  const raw = await groqComplete(
    "Return ONLY valid JSON, no markdown.",
    `From this meeting transcript, propose concrete follow-up tasks. Return JSON: {"tasks":[{"title":"...","suggestedAssignee":"...","dueHint":"..."}]}\n\nTranscript:\n${meetingText}`
  );
  let parsed;
  try {
    parsed = JSON.parse(raw.replace(/```json\s*|\s*```/g, "").trim());
  } catch {
    return { tasks: [], note: raw };
  }
  try {
    await ensureUserBank(userId);
    const bankId = bankIdForUser(userId);
    const hindsight = getHindsightClient();
    await hindsight.retain(
      bankId,
      `Auto-extracted tasks from meeting: ${JSON.stringify(parsed.tasks || [])}`,
      { metadata: { type: "meeting_tasks" } }
    );
  } catch (err) {
    console.error("extractTasksFromMeeting retain:", err);
  }
  return parsed;
}
