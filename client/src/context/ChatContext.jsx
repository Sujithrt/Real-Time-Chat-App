import { createContext, useCallback, useEffect, useState } from "react";
import { getRequest, postRequest, baseUrl } from "../utils/services";
import { io } from "socket.io-client";

export const ChatContext = createContext();

export const ChatContextProvider = ({ children, user }) => {
    const [userChats, setUserChats] = useState(null);
    const [isUserChatsLoading, setIsUserChatsLoading] = useState(false);
    const [userChatsError, setUserChatsError] = useState(null);
    const [potentialChats, setPotentialChats] = useState([]);
    const [currentChat, setCurrentChat] = useState(null);
    const [messages, setMessages] = useState(null);
    const [isMessagesLoading, setIsMessagesLoading] = useState(false);
    const [messagesError, setMessagesError] = useState(null);
    const [sendTextMessageError, setSendTextMessageError] = useState(null);
    const [newMessage, setNewMessage] = useState(null);
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [allUsers, setAllUsers] = useState([]);

    useEffect(() => {
        const newSocket = io("http://localhost:3000");
        setSocket(newSocket);
        return () => {
            newSocket.disconnect();
        }
    }, [user]);

    // update online users
    useEffect(() => {
        if (socket === null) return;
        socket.emit("addNewUser", user?._id)
        socket.on("getOnlineUsers", (res) => {
            setOnlineUsers(res);
        });
        return () => {
            socket.off("getOnlineUsers");
        };
    }, [socket]);

    // send message
    useEffect(() => {
        if (socket === null) return;
        const recipientId = currentChat?.members.find((id) => id !== user?._id);
        socket.emit("sendMessage", { ...newMessage, recipientId });
    }, [newMessage]);

    // receive message and notification
    useEffect(() => {
        if (socket === null) return;
        socket.on("getMessage", (res) => {
            if (currentChat?._id !== res.chatId) return;
            setMessages((prevMessages) => {
                return [...prevMessages, res];
            });
        });

        socket.on("getNotifications", (res) => {
            const isChatOpen = currentChat?.members.includes(res.senderId);
            if (isChatOpen) {
                setNotifications((prevNotifications) => [{ ...res, isRead: true }, ...prevNotifications]);
            } else {
                setNotifications((prevNotifications) => [res, ...prevNotifications]);
            }
        });
        return () => {
            socket.off("getMessage");
            socket.off("getNotifications");
        };
    }, [socket, currentChat]);

    useEffect(() => {
        const getUsers = async () => {
            const response = await getRequest(`${baseUrl}/users`);
            if (response?.error) {
                return console.log("Error fetching users", response);
            }
            const pChats = response.filter((u) => {
                let isChatCreated = false;
                if (user?._id === u._id) return false;
                if (userChats) {
                    isChatCreated = userChats?.some((chat) => {
                        return chat.members[0] === u._id || chat.members[1] === u._id
                    })
                }
                return !isChatCreated;
            })
            setAllUsers(response);
            setPotentialChats(pChats);
        };
        getUsers();
    }, [userChats]);

    useEffect(() => {
        const getUserChats = async () => {
            if (user?._id) {
                setIsUserChatsLoading(true);
                setUserChatsError(null);
                const response = await getRequest(`${baseUrl}/chats/${user._id}`);
                setIsUserChatsLoading(false);
                if (response?.error) {
                    setUserChatsError(response.error);
                }
                setUserChats(response);
            }
        };
        getUserChats();
    }, [user, notifications]);

    useEffect(() => {
        const getMessages = async () => {
            setIsMessagesLoading(true);
            setMessagesError(null);
            const response = await getRequest(`${baseUrl}/messages/${currentChat?._id}`);
            setIsMessagesLoading(false);
            if (response?.error) {
                setMessagesError(response.error);
            }
            setMessages(response);
        };
        getMessages();
    }, [currentChat]);

    const sendTextMessage = useCallback(async (textMessage, sender, currentChatId, setTextMessage) => {
        if (!textMessage) return console.log("You must type something");
        const response = await postRequest(`${baseUrl}/messages`, { chatId: currentChatId, senderId: sender, text: textMessage });
        if (response?.error) {
            return setSendTextMessageError(response.error);
        }
        setNewMessage(response);
        setMessages((prevMessages) => {
            return [...prevMessages, response];
        });
        setTextMessage("");
    }, []);

    const updateCurrentChat = useCallback((chat) => {
        setCurrentChat(chat);
    }, []);

    const createChat = useCallback(async (firstId, secondId) => {
        const response = await postRequest(`${baseUrl}/chats`, { firstId, secondId });
        if (response?.error) {
            return console.log("Error creating chat", response);
        }
        setUserChats((prevChats) => {
            return [...prevChats, response];
        });
    }, []);

    const markAllNotificationsAsRead = useCallback((notifications) => {
        const modifiedNotifications = notifications.map((notification) => {
            return { ...notification, isRead: true };
        });
        setNotifications(modifiedNotifications);
    }, []);

    const markNotificationAsRead = useCallback((notification, userChats, user, notifications) => {
        // find chat to open
        const desiredChat = userChats.find((chat) => {
            const chatMembers = [user._id, notification.senderId];
            const isDesiredChat = chat?.members.every((member) => {
                return chatMembers.includes(member);
            })
            return isDesiredChat;
        });

        // mark notification as read
        const modifiedNotifications = notifications.map((n) => {
            if (n.senderId === notification.senderId) {
                return { ...n, isRead: true };
            } else {
                return n;
            }
        });
        setNotifications(modifiedNotifications);
        updateCurrentChat (desiredChat);
    }, []);

    const markThisUserNotificationsAsRead = useCallback((thisUserNotifications, notifications) => {
        const modifiedNotifications = notifications.map((notification) => {
            if (thisUserNotifications.includes(notification)) {
                return { ...notification, isRead: true };
            } else {
                return notification;
            }
        });
        setNotifications(modifiedNotifications);
    }, []);

    return (
        <ChatContext.Provider
            value={{
                userChats,
                isUserChatsLoading,
                userChatsError,
                allUsers, 
                potentialChats,
                createChat,
                updateCurrentChat,
                currentChat,
                messages,
                isMessagesLoading,
                messagesError,
                sendTextMessage,
                onlineUsers,
                notifications,
                markAllNotificationsAsRead,
                markNotificationAsRead,
                markThisUserNotificationsAsRead,
            }}
        >
            {children}
        </ChatContext.Provider>
    );
}

