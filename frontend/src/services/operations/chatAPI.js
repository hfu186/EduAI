import { apiConnector } from "../apiConnector";
import { conversationEndpoints } from "../apis";

const {
  CREATE_OR_GET_CHAT_API,
  GET_MY_CHATS_API,
  GET_CHAT_BY_ID_API,
  DELETE_CHAT_API,
  SEND_MESSAGE_API,
  GET_MESSAGES_API,
  MARK_READ_API,
} = conversationEndpoints;
export const uploadChatFile = async (chatId, file, token) => {
  try {
    const formData = new FormData();
    formData.append("chatId", chatId);
    formData.append("file", file);

    const response = await apiConnector(
      "POST",
      conversationEndpoints.UPLOAD_CHAT_FILE_API, 
      formData,
      {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      }
    );
    return response.data.data;
  } catch (error) {
    console.error("UPLOAD_CHAT_FILE_API ERROR:", error);
    return null;
  }
};
export const createOrGetChat = async (instructorId, token) => {
  try {
    const response = await apiConnector(
      "POST",
      CREATE_OR_GET_CHAT_API,
      { instructorId },
      { Authorization: `Bearer ${token}` }
    );
    if (!response.data.success) throw new Error(response.data.message);
    return response.data.data;
  } catch (error) {
    console.error("CREATE_OR_GET_CHAT_API ERROR:", error);
    return null;
  }
};

export const getMyChats = async (token) => {
  try {
    const response = await apiConnector(
      "GET",
      GET_MY_CHATS_API,
      null,
      { Authorization: `Bearer ${token}` }
    );
    return response.data.data;
  } catch (error) {
    console.error("GET_MY_CHATS_API ERROR:", error);
    return [];
  }
};

export const getChatById = async (chatId, token) => {
  try {
    const response = await apiConnector(
      "GET",
      `${GET_CHAT_BY_ID_API}/${chatId}`,
      null,
      { Authorization: `Bearer ${token}` }
    );
    return response.data.data;
  } catch (error) {
    console.error("GET_CHAT_BY_ID_API ERROR:", error);
    return null;
  }
};

export const deleteChat = async (chatId, token) => {
  try {
    const response = await apiConnector(
      "DELETE",
      `${DELETE_CHAT_API}/${chatId}`,
      null,
      { Authorization: `Bearer ${token}` }
    );
    return response.data.success;
  } catch (error) {
    console.error("DELETE_CHAT_API ERROR:", error);
    return false;
  }
};

export const getMessages = async (chatId, token, page = 1) => {
  try {
    const response = await apiConnector(
      "GET",
      `${GET_MESSAGES_API}/${chatId}?page=${page}`,
      null,
      { Authorization: `Bearer ${token}` }
    );
    return response.data.data;
  } catch (error) {
    console.error("GET_MESSAGES_API ERROR:", error);
    return [];
  }
};

export const sendMessageREST = async (chatId, content, token) => {
  try {
    const response = await apiConnector(
      "POST",
      SEND_MESSAGE_API,
      { chatId, content },
      { Authorization: `Bearer ${token}` }
    );
    return response.data.data;
  } catch (error) {
    console.error("SEND_MESSAGE_API ERROR:", error);
    return null;
  }
};

export const markMessageAsRead = async (messageId, token) => {
  try {
    const response = await apiConnector(
      "PATCH",
      `${MARK_READ_API}/${messageId}/read`,
      null,
      { Authorization: `Bearer ${token}` }
    );
    return response.data.success;
  } catch (error) {
    console.error("MARK_READ_API ERROR:", error);
    return false;
  }
};