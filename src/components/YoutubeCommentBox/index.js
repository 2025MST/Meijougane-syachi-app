import React, { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import { Box, Paper, Typography, TextField, Button } from "@mui/material"

const DEFAULT_PHRASES = [
    "コメントしてくれたら嬉しいな～",
    "退屈じゃな～...もっとコメント来てほしいで！",
    "もっと沢山のコメントが来たら嬉しいで！"
];

const MAX_LIST_LENGTH = 15;
const VIDEO_API_URL = "https://www.googleapis.com/youtube/v3/videos";
const CHAT_API_URL = "https://www.googleapis.com/youtube/v3/liveChat/messages";


const YoutubeCommentBox = ({chatgpt, voicevox}) => {

    const [videoId, setVideoId] = useState(() => localStorage.getItem("videoId") || "");
    const [liveChatId, setLiveChatId] = useState(null);
    const [isFetching, setIsFetching] = useState(false);
    const [comments, setComments] = useState([]);
    const [readedComments, setReadedComments] = useState(new Set());
    const [selectedComment, setSelectedComment] = useState(null);
    const [responseText, setResponseText] = useState("");
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

    const handleFetchToggle = async () => {
        if (isFetching) {
            clearInterval(intervalRef.current);
            setIsFetching(false);
        } else {
            const chatId = await fetchLiveChatId(videoId);
            if (chatId) {
                setLiveChatId(chatId);
                setIsFetching(true);
                localStorage.setItem("videoId", videoId);
            }
        }
    }

    const displayComments = useMemo(() => {
        return comments.slice(0, MAX_LIST_LENGTH);
    }, [comments]);

    useEffect(() => {
        if (isFetching) {
            intervalRef.current = setInterval(async () => {

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

                    
                    const updateComments = [...newComments, ...comments].slice(0, MAX_LIST_LENGTH);

                    setComments(updateComments);

                    if (updateComments.length > 0) {
                        const unreadComments = updateComments.filter(comment => !readedComments.has(comment.id));
                        
                        console.log(unreadComments);

                        if (unreadComments.length > 0) {
                            const randomComment = unreadComments[Math.floor(Math.random() * unreadComments.length)];

                            setReadedComments(prev => new Set(prev).add(randomComment.id));
                            setSelectedComment(randomComment);

                            const aiResponse = await chatgpt.getChatgptResponse(randomComment.message);
                            setResponseText(aiResponse);
                            await voicevox.generateVoice(aiResponse);

                        } else {
                            const fallbackMessage = DEFAULT_PHRASES[Math.floor(Math.random() * DEFAULT_PHRASES.length)];
                            voicevox.generateVoice(fallbackMessage);
                        }
                    }
                    
                } catch (err) {
                    console.error(err);
                }
            }, 15000);
            return () => clearInterval(intervalRef.current);
        }
    },[chatgpt, comments, isFetching, liveChatId, readedComments, voicevox]);

    return (
        <Box sx={{
            height: window.innerHeight * 0.97,
            width: window.innerWidth * 0.3,
            backgroundColor: '#f9f9f9',
            position: 'absolute',
            right: '0',
            display: "flex",
            flexDirection: "column"
        }}>
            <Box sx={{ flex: 7, overflowY: "auto", backgroundColor: "#f9f9f9", p : 2}}>
                {displayComments.map((comment) => (
                    <Box key={comment.id} sx={{ display: "flex", marginBottom: 2 }}>
                        <img src={comment.imageUrl} alt="icon" style={{ width: 40, height: 40, borderRadius: "50%"}} />
                        <Box sx={{marginLeft: 2}}>
                            <Typography variant="displayName" sx={{ fontWeight: "bold" }}>{comment.author}</Typography>
                            <Typography variant="message">{comment.message}</Typography>
                        </Box>
                    </Box>
                ))}
            </Box>

            <Box sx={{ flex : 2, p: 2, backgroundColor: "#e0f7fa"}}>
                {selectedComment && (
                    <>
                        <Paper
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                padding: 2,
                                backgroundColor: "#d3f9d8",
                                borderRadius: 4,
                                marginBottom: 2,
                            }}
                        >
                            <img
                                src={selectedComment.imageUrl}
                                alt="icon"
                                style={{ width: 40, height: 40, borderRadius: "50%", marginRight: 10 }}
                            />
                            <Box>
                                <Typography variant="displayName" sx={{fontWeight: "bold"}}>{selectedComment.author}</Typography>
                                <Typography variant="message">{selectedComment.message}</Typography>
                            </Box>
                        </Paper>
                        <Paper
                            sx={{
                                alignSelf: "flex-end",
                                padding: 2,
                                backgroundColor: "#e3f2fd",
                                borderRadius: 4,
                            }}
                        >
                            <Typography sx={{ color : "#0d47a1"}}>
                                {responseText || "なし"}
                            </Typography>
                        </Paper>
                    </>
                )}
            </Box>

            <Box sx={{ flex : 1, p: 2 , display: "flex", alignItems: "center"}}>
                
                <TextField
                    value={videoId}
                    onChange={(e) => setVideoId(e.target.value)}
                    label="Video ID"
                    variant="outlined"
                    fullWidth
                    sx={{ marginRight: 2 }}
                />
                <Button variant="contained" onClick={handleFetchToggle}>
                    {isFetching ? "取得中" : "取得"}
                </Button>
            </Box>

        </Box>
    )
}

export default YoutubeCommentBox;