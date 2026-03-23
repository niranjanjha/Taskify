import axios from "axios";

const API_URL = "http://localhost:4000";

// Helper to get token (assuming it's stored in localStorage)
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

export const getAiSuggestions = async () => {
    const { data } = await axios.get(`${API_URL}/api/ai/suggestions`, getAuthHeaders());
    return data;
};

export const summarizeMeeting = async (text) => {
    const { data } = await axios.post(`${API_URL}/api/ai/summarize`, { text }, getAuthHeaders());
    return data;
};

export const suggestAssignment = async (taskDescription) => {
    const { data } = await axios.post(`${API_URL}/api/ai/suggest-assignment`, { task: taskDescription }, getAuthHeaders());
    return data;
};

export const getDeadlineInsights = async () => {
    const { data } = await axios.get(`${API_URL}/api/ai/deadline-insights`, getAuthHeaders());
    return data;
};

export const chatWithProjectAI = async (message) => {
    const { data } = await axios.post(`${API_URL}/api/ai/chat`, { message }, getAuthHeaders());
    return data;
};

export const getInactiveInsights = async () => {
    const { data } = await axios.get(`${API_URL}/api/ai/inactive-insights`, getAuthHeaders());
    return data;
};

export const extractMeetingTasks = async (text) => {
    const { data } = await axios.post(`${API_URL}/api/ai/extract-meeting-tasks`, { text }, getAuthHeaders());
    return data;
};

export const storeTeamRoles = async (roles) => {
    const { data } = await axios.post(`${API_URL}/api/ai/team-roles`, { roles }, getAuthHeaders());
    return data;
};
