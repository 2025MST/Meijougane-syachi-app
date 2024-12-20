import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { InputTextBox } from './InputTextBox';
import { ChatLog } from './ChatLog';
import useSpeechDetection from '../../hooks/useSpeechDetection';

export const ChatBox = ({ chatgpt, voicevox, isMicOn }) => {
    const [chatData, setChatData] = useState(() => {
        const savedChatData = localStorage.getItem('chatData');
        return savedChatData ? JSON.parse(savedChatData) : [];
    });

    useEffect(() => {
        // チャットデータが変更されたときにlocalStorageに保存
        localStorage.setItem('chatData', JSON.stringify(chatData));
    }, [chatData]);

    const handleSendInputText = async (inputData) => {
        if (inputData.trim()) {
            setChatData((prev) => {
                const newChatData = [...prev, { from: 'user', text: inputData }];
                localStorage.setItem('chatData', JSON.stringify(newChatData)); // 更新後に保存
                return newChatData;
            });

            const aiResponse = await chatgpt.getChatgptResponse(inputData);

            setChatData((prev) => {
                const newChatData = [...prev, { from: 'ai', text: aiResponse}];
                localStorage.setItem('chatData', JSON.stringify(newChatData));
                return newChatData;
            });

            voicevox.generateVoice(aiResponse);
        }
    };

    const { interimText } = useSpeechDetection(isMicOn,handleSendInputText);

    return (
        <Box
            sx={{
                height: window.innerHeight * 0.97,
                width: window.innerWidth * 0.3,
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
