import { useContext } from "react";
import { Stack } from "react-bootstrap";
import avatar from '../../assets/avatar.svg';
import moment from "moment";
import { useFetchRecipientUser } from "../../hooks/useFetchRecipientUser";
import { ChatContext } from "../../context/ChatContext";
import { getUnreadNotifications } from "../../utils/getUnreadNotifications";
import { useFetchLatestMessage } from "../../hooks/useFetchLatestMessage";

const UserChat = ({ chat, user }) => {
    const { recipientUser } = useFetchRecipientUser(chat, user);
    const { onlineUsers, notifications, markThisUserNotificationsAsRead } = useContext(ChatContext);
    const isOnline = onlineUsers?.some((user) => user?.userId === recipientUser?._id);

    const unreadNotifications = getUnreadNotifications(notifications);
    const thisUserNotifications = unreadNotifications?.filter((notification) => notification.senderId === recipientUser?._id)
    const { latestMessage } = useFetchLatestMessage(chat);

    const truncateText = (text) => {
        let shortString = text.substring(0, 20);
        if (text.length > 20) {
            shortString += "...";
        }
        return shortString;
    };

    if (!recipientUser) return <div>Loading...</div>;

    return (
        <Stack
            direction='horizontal'
            gap={3}
            className='user-card align-items-center p-2 justify-content-between'
            role='button'
            onClick={() => {
                if (thisUserNotifications?.length !== 0) {
                    markThisUserNotificationsAsRead(thisUserNotifications, notifications);
                }
            }}
        >
            <div className='d-flex align-items-center'>
                <div className="me-2">
                    <img src={avatar} height='35px' />
                </div>
                <div className='text-content'>
                    <div className="name">{recipientUser.name}</div>
                    <div className="text-message">
                        {latestMessage?.text && <span>{truncateText(latestMessage.text)}</span>}
                    </div>
                </div>
            </div>
            <div className='d-flex flex-column align-items-end'>
                <div className='date'>
                    {moment(latestMessage?.createdAt).calendar()}
                </div>
                <div className={thisUserNotifications.length ? 'this-user-notifications' : ''}>
                    {thisUserNotifications.length ? thisUserNotifications.length : null}
                </div>
                <span className={isOnline ? "user-online" : ""}
                >
                </span>
            </div>
        </Stack>
    );
}

export default UserChat;