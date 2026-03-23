import express from "express";
import authMiddleware from "../middleware/auth.js";
import {
  getAiSuggestions,
  postSummarizeMeeting,
  postSuggestAssignment,
  getDeadlineInsightsHandler,
  postChat,
  getInactiveInsights,
  postExtractMeetingTasks,
  postTeamRoles,
} from "../controllers/aiController.js";

const router = express.Router();

router.get("/suggestions", authMiddleware, getAiSuggestions);
router.post("/summarize", authMiddleware, postSummarizeMeeting);
router.post("/suggest-assignment", authMiddleware, postSuggestAssignment);
router.get("/deadline-insights", authMiddleware, getDeadlineInsightsHandler);
router.post("/chat", authMiddleware, postChat);
router.get("/inactive-insights", authMiddleware, getInactiveInsights);
router.post("/extract-meeting-tasks", authMiddleware, postExtractMeetingTasks);
router.post("/team-roles", authMiddleware, postTeamRoles);

export default router;
