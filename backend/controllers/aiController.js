import Task from "../models/taskModel.js";
import {
  generateAISuggestions,
  summarizeMeeting,
  suggestAssignment,
  getDeadlineInsights,
  chatWithProjectAI,
  getInactiveMemberInsights,
  extractTasksFromMeeting,
  storeTeamRoles,
} from "../services/aiService.js";

export const getAiSuggestions = async (req, res) => {
  try {
    const data = await generateAISuggestions(req.user.id);
    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const postSummarizeMeeting = async (req, res) => {
  try {
    const { text } = req.body;
    const summary = await summarizeMeeting(req.user.id, text);
    res.json({ success: true, summary });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const postSuggestAssignment = async (req, res) => {
  try {
    const { task } = req.body;
    const suggestion = await suggestAssignment(req.user.id, task);
    res.json({ success: true, suggestion });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getDeadlineInsightsHandler = async (req, res) => {
  try {
    const insights = await getDeadlineInsights(req.user.id);
    res.json({ success: true, insights });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const postChat = async (req, res) => {
  try {
    const { message } = req.body;
    const reply = await chatWithProjectAI(req.user.id, message);
    res.json({ success: true, reply });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getInactiveInsights = async (req, res) => {
  try {
    const tasks = await Task.find({
      $or: [{ owner: req.user.id }, { "assignedTo.user": req.user.id }],
    })
      .populate("assignedTo.user", "name email")
      .lean();

    const lines = tasks.map((t) => {
      const assignees =
        t.assignedTo?.map((a) => a.user?.name || "unknown").join(", ") ||
        "unassigned";
      const due = t.dueDate
        ? new Date(t.dueDate).toISOString().slice(0, 10)
        : "no date";
      return `- "${t.title}" | assignees: ${assignees} | due: ${due} | done: ${t.completed}`;
    });

    const summary = lines.join("\n") || "No tasks in this workspace.";
    const insights = await getInactiveMemberInsights(req.user.id, summary);
    res.json({ success: true, insights });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const postExtractMeetingTasks = async (req, res) => {
  try {
    const { text } = req.body;
    const result = await extractTasksFromMeeting(req.user.id, text);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const postTeamRoles = async (req, res) => {
  try {
    const { roles } = req.body;
    if (!roles?.trim()) {
      return res.status(400).json({ success: false, message: "roles required" });
    }
    await storeTeamRoles(req.user.id, roles);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
