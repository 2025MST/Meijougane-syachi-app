import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Box } from "@mui/material"

const DEFAULT_PHRASES = [
    "コメントしてくれたら嬉しいな～",
    "退屈じゃな～...もっとコメント来てほしいで！",
    "もっと沢山のコメントが来たら嬉しいで！"
];

const MAX_LIST_LENGTH = 15;
const VIDEO_API_URL = "https://www.googleapis.com/youtube/v3/videos";
const CHAT_API_URL = "https://www.googleapis.com/youtube/v3/liveChat/messages";


const YoutubeCommentBox = ({chatgpt, voicevox}) => {

    const [videoId, setVideoId] = useState("");
    const [liveChatId, setLiveChatId] = useState(null);
    const [isFetching, setIsFetching] = useState(false);
    const [comments, setComments] = useState([]);
    const [readedComments, setReadedComments] = useState(new Set());
    const intervalRef = useRef(null);

    const fetchLiveChatId = async (videoId) => {
        try {
            const response = await axios.get(VIDEO_API_URL, {
                params: {
                    part : "liveStreamingDetails",
                    id : videoId,
                    key: process.env.REACT_APP_YOUTUBE_API_KEY
                }
            });
            const chatId = response.data.items[0]?.liveStreamingDetails?.activeLiveChatId;

            if (chatId) {
                console.log(`Live chat id : ${chatId}`);
                return chatId;
            } else {
                console.error("LiveChatIdの取得に失敗しました");
                return null;
            }
        } catch (err) {
            console.error("LiveChatIdの取得中にエラーが発声しました : ", err);
            return null;
        }
    }

    const fetchComments = async () => {
        if (!liveChatId) return;
    
        try {
            const response = await axios.get(CHAT_API_URL, {
                params: {
                    liveChatId: liveChatId,
                    part: "snippet,authorDetails",
                    maxResults: 15,
                    key: process.env.REACT_APP_YOUTUBE_API_KEY
                }
            });

            const existingCommentIds = comments.reduce((acc, comment) => {
                acc[comment.id] = true;
                return acc;
            },{});
    
            const newComments = response.data.items
                .filter((item) => !existingCommentIds[item.id])
                .map((item) => ({
                    id: item.id,
                    imageUrl: item.authorDetails.profileImageUrl,
                    author: item.authorDetails.displayName,
                    message: item.snippet.displayMessage,
                    publishedAt: item.snippet.publishedAt,
                }));

            setComments(prev => [...newComments,...prev].slice(0, MAX_LIST_LENGTH));

        } catch (err) {
            console.error("コメント取得中にエラーが発生しました:", err);
        }
    };
    const selectComment = async () => {
        // ランダムなセリフを発話
        if (!videoId || !isFetching || comments.length === 0) {
            const fallbackMessage = DEFAULT_PHRASES[Math.floor(Math.random() * DEFAULT_PHRASES.length)];
            voicevox.generateVoice(fallbackMessage);
            return;
        }

        const unreadComments = comments.filter((comment) => !readedComments.has(comment.id));

        if (unreadComments.length > 0) {
            const randomComment = unreadComments[Math.floor(Math.random() * unreadComments.length)];

            setReadedComments(prev => new Set(prev).add(randomComment.id));
            voicevox.generateVoice(randomComment.message);
        } else {
            const fallbackMessage = DEFAULT_PHRASES[Math.floor(Math.random() * DEFAULT_PHRASES.length)];
            voicevox.generateVoice(fallbackMessage);
        }
    }

    return (
        <Box sx={{
            height: window.innerHeight * 0.97,
            width: window.innerWidth * 0.3,
            backgroundColor: '#f9f9f9',
            position: 'absolute',
            right: '0',
        }}>

        </Box>
    )
}

export default YoutubeCommentBox;