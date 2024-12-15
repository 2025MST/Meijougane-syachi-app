import React, { useState, useCallback } from 'react';
import { Box } from '@mui/material';
import { InputTextBox } from './InputTextBox';
import { ChatLog } from './ChatLog';
import { useMicDetection } from '../../hooks/useMicDetection';

export const ChatBox = ({ chatgpt, voicevox, isMicOn }) => {
    const [chatData, setChatData] = useState(() => {
        const savedChatData = localStorage.getItem('chatData');
        return savedChatData ? JSON.parse(savedChatData) : [];
    });

    const handleSendInputText = useCallback(
        async (inputData) => {
            if (inputData.trim()) {
                const userMessage = { from: 'user', text: inputData };
                const aiResponse = await chatgpt.getChatgptResponse(inputData);
                const aiMessage = { from: 'ai', text: aiResponse };

                const newChatData = [...chatData, userMessage, aiMessage];
                setChatData(newChatData);
                localStorage.setItem('chatData', JSON.stringify(newChatData));

                voicevox.generateVoice(aiResponse);
            }
        },
        [chatData, chatgpt, voicevox]
    );

    const { interimText } = useMicDetection(isMicOn,handleSendInputText);

    return (
        <Box
            sx={{
                height: '95%',
                width: '600px',
                backgroundColor: '#f9f9f9',
                position: 'absolute',
                right: '0',
            }}
        >
            <ChatLog chatData={chatData} />
            <InputTextBox
                onSend={handleSendInputText}
                isMicOn={isMicOn}
                interimText={interimText}
            />
        </Box>
    );
};
