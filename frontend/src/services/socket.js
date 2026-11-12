import { io } from "socket.io-client";
import { APP_URL } from "../utils/appUrl";
let socket = null;

export const initSocket = (token) => {
    socket = io(APP_URL, {
        auth: { token },
        transports: ["websocket"],
    });
    return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) socket.disconnect();
};