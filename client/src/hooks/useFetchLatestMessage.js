import { useState, useEffect, useContext } from 'react';
import { ChatContext } from '../context/ChatContext';
import { baseUrl, getRequest } from '../utils/services';

export const useFetchLatestMessage = (chat) => {
    const { newMessage, notifications, messages } = useContext(ChatContext);
    const [latestMessage, setLatestMessage] = useState(null);

    useEffect(() => {
        const getMessages = async () => {
            const response = await getRequest(`${baseUrl}/messages/${chat._id}`);
            if (response.error) {
                return console.log("Error getting messages...", response.error);
            }
            const latestMessage = response[response?.length - 1];
            setLatestMessage(latestMessage);
        };
        getMessages();
    }, [newMessage, notifications, messages]);

    return { latestMessage };
};