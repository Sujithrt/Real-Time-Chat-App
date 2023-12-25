import { useContext } from 'react';
import { Container, Stack } from 'react-bootstrap';
import UserChat from '../components/chat/UserChat';
import { AuthContext } from '../context/AuthContext';
import PotentiatChats from '../components/chat/PotentialChats';
import ChatBox from '../components/chat/Chatbox';
import { ChatContext } from '../context/ChatContext';

const Chat = () => {
    const { user } = useContext(AuthContext);
    const { userChats, isUserChatsLoading, updateCurrentChat } = useContext(ChatContext);
    if (!user) return <p style={{ textAlign: "center", width: "100%" }}>Loading User...</p>
    return (
        <Container>
            <PotentiatChats />
            {userChats?.length < 1 ? <p style={{ textAlign: "center", width: "100%" }}>No Chats yet. Start a chat...</p> :
                <Stack direction="horizontal" gap={4} className='align-items-start'>
                    <Stack className='messages-box flex-grow-0 pe-3' gap={3}>
                        {isUserChatsLoading && <p>Loading Chats...</p>}
                        {userChats?.map((chat, index) => {
                            return (
                                <div key={index} onClick={() => updateCurrentChat(chat)}>
                                    <UserChat chat={chat} user={user} />
                                </div>
                            )
                        })}
                    </Stack>
                    <ChatBox />
                </Stack>}
        </Container>
    );
}

export default Chat;