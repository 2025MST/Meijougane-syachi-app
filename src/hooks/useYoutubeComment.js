import { useState, useRef, useEffect } from "react";
import axios from "axios";

const VIDEO_API_URL = "https://www.googleapis.com/youtube/v3/videos";
const CHAT_API_URL = "https://www.googleapis.com/youtube/v3/liveChat/messages";

const useYoutubeComment = ({videoId, interval=15000}) => {

    const [liveChatId, setLiveChatId] = useState(null);
    const [comments, setComments] = useState([]);
    const [isLoadComment, setIsLoadComment] = useState(false);
    const intervalRef = useRef(null);

    const fetchLiveChatId = async () => {
        try {
            const res = await axios.get(VIDEO_API_URL, {
                params: {
                    part: "liveStreamingDetails",
                    id: videoId,
                    key: process.env.REACT_APP_YOUTUBE_API_KEY,
                },
            });

            const liveChatId = res.data.item[0]?.liveStreamingDetails?.activeLiveChatId;

            if (liveChatId) {
                console.log('Live Chat ID : ', liveChatId);
                setLiveChatId(liveChatId);
                setIsLoadComment(true);
            } else {
                console.error("Live Chat IDが見つかりませんでした。");
            }
        } catch (error) {
            console.error("ライブチャットID取得中にエラーが発声しました : ", error.message);
            setIsLoadComment(false);
        }
    }

    const fetchLiveComments = async (liveChatId) => {
        try {
            const res = await axios.get(CHAT_API_URL, {
                params: {
                    liveChatId: liveChatId,
                    part: "snippet,authorDetails",
                    maxResults: 20,
                    key: process.env.REACT_APP_YOUTUBE_API_KEY,
                }
            });

            const comments = res.data.items.map((item) => ({
                author: item.authorDetails.displayName,
                message: item.snippet.displayMessage,
                publishedAt: item.snippet.publishedAt,
            }));

            setComments(comments);

        } catch (error) {
            console.error("コメント取得中にエラーが発生しました : ", error.message);
            setComments([]);
            setIsLoadComment(false);
        }
    }

    useEffect(() => {
        if (videoId) {
            fetchLiveChatId(videoId);
        }
    },[videoId]);

    useEffect(() => {
        if (liveChatId && isLoadComment) {
            intervalRef.current = setInterval(() => {
                fetchLiveComments(liveChatId);
                console.log(comments);
            }, interval);
            return () => clearInterval(intervalRef.current);
        }
    },[liveChatId, isLoadComment, interval]);

    return {comments, isLoadComment};

}

export default useYoutubeComment;