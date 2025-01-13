import React, { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import { Box, Paper, Typography, TextField, Button } from "@mui/material"

const DEFAULT_PHRASES = [
    "コメントしてくれたら嬉しいな～",
    "退屈じゃな～...もっとコメント来てほしいで！",
    "もっと沢山のコメントが来たら嬉しいで！",
    "お～い！誰かおらんか～？コメント待ってるだら～！",
    "このままじゃ名古屋の金シャチが寂しがっちゃうがね～！",
    "今ね、君のコメントをず～っと待っとるんだわ！",
    "おっ！？コメントが来る予感…？気のせい？",
    "名古屋の美味しい話、誰か教えてちょ～！",
    "今日も元気にコメント返したいんだけど、誰かおらん？",
    "シャチだって、ちょっとくらいお話し相手がほしいがね！",
    "退屈で寝ちゃいそう…コメントがあると嬉しいな～。",
    "コメントがあれば、もっと楽しくしゃべれるがね！",
    "シャチだってしゃべりたい！コメントお願いしとるよ！",
    "コメントしてくれたら、エビフリャーのお礼話しちゃうがね！",
    "こんなに静かなのは珍しいだら～。誰かおる？",
    "みんな忙しいんかな？コメントはいつでも待っとるよ！",
    "名古屋城の金シャチはいつも輝いとるけど、わたしの心はコメント待ちだわ～。",
    "寂しいから、名古屋の話でもしよっか？コメントで教えてちょうだい！",
    "コメントがあれば、もっともっと元気が出るんだけどな～！",
    "ねぇねぇ、わたしの地元トーク聞きたい人おる？",
    "シャチも寂しいときがあるがね…そんなときはコメントが元気のもと！",
    "おっ、名古屋のご当地VTuberの話、気になっとらん？コメントで聞いてちょ～！",
    "みんなとお話しするのが好きだら！コメント待っとるよ～！",
    "このままじゃ名古屋のエビフリャーが怒っちゃうがね！",
    "コメント来ないとシャチは泳げなくなっちゃうでね！",
    "コメントゼロ…シャチ的にはこれが一番寂しいだら～。",
    "名古屋のことでも、君の地元のことでもええで！コメントで教えて！",
    "シャチもね、ちょっとは注目されたいがね！コメント待ってる！",
    "コメントがあれば、わたしもっとしゃべりたいだら！",
    "ねぇねぇ、名古屋に来たことある人おる？コメントしてちょうだい！",
    "名古屋の味噌カツの話するけど…誰か聞いてくれる人おらん？",
    "今ならどんな質問にも答えるシャチだら～！コメントしてみや～。",
    "シャチに会いに来てくれる人が増えたらうれしいがね！コメントしてちょ！",
    "どっかでコメント見逃しとるんかな…探してみるわ！",
    "えーと…コメントが来ないと、シャチの泳ぎが止まっちゃうかも！？",
    "コメントって、どえりゃあうれしいもんだね～！待っとるで！",
    "コメントしてくれたら、名古屋の新しい秘密教えちゃうがね！",
    "おっ？今わたしのこと気になっとる？コメントしちゃおう！",
    "君の地元の自慢話も聞きたいがね～！コメントで教えてちょうだい！",
    "名古屋の楽しい話をもっと聞いてほしいだら～！コメントしてね！",
    "コメントしてくれたら、シャチが何でも答えちゃうがね！",
    "君とおしゃべりできたら、名古屋の一日がもっと楽しくなるがね！",
    "コメントがあると、シャチはもっと元気になるんだわ！",
    "名古屋の秘密をもっと知りたい人おる？コメントで教えるがね！",
    "退屈だら～。誰かコメントで助けてくれん？",
    "シャチのこと、もっと知りたい人はコメントしてみや～。",
    "君とおしゃべりできるのが、わたしの一番の楽しみだら！",
    "わたしの独り言、飽きたらコメントしてくれてええんやで！",
    "エビフリャーの話でもする？コメントで教えてちょ！",
    "コメントしてくれたら、名古屋のお得情報教えるがね！",
    "みんな、名古屋のシャチを忘れとらん？コメントで教えて！",
    "コメントって、もしかして緊張する？気軽にしてみや～。",
    "わたしが聞きたいのは、君の楽しい話！コメントで教えて！",
    "お～い！だれか！コメントしてくれたら、名古屋の面白い話するがね！",
    "コメントがあると、シャチはもっと笑顔になるんだら～！",
    "シャチとおしゃべりしてみや～！コメント待ってるで！",
    "コメントがゼロだと、シャチも泳ぎ疲れちゃうかも～。",
    "どっかのだれかが見てくれとるなら、コメントしてみや～！",
    "名古屋の話以外でもええんやで～！コメントしてちょうだい！",
    "コメントがあれば、名古屋の金シャチがもっと輝くがね！",
    "わたし、コメントが来るとすごく嬉しいんだわ！待っとるで！",
    "名古屋の楽しいスポット、コメントで教えてほしいがね！",
    "コメントしてくれたら、名古屋城の秘密も教えちゃうで！",
    "今ならシャチの特別トークも聞けるかも？コメントしてみてね！",
    "シャチだって、コメントがあると元気100倍になるんだら！",
    "コメントがなければ、名古屋城の金シャチも寂しがっちゃうわ！",
    "君がコメントしてくれるだけで、名古屋のシャチは幸せなんだわ！",
    "えっ、コメント書くの恥ずかしい？わたしはいつでも待っとるで！",
    "みんなのコメントがあると、シャチももっと楽しくなるがね！",
    "コメントをくれる人には、シャチが特別なお話しちゃうがね！",
    "コメントがあれば、名古屋の魅力をもっと伝えられるんだけどな～。",
    "わたしの話、もっと聞きたい人おる？コメントしてみや～！",
    "コメントがゼロって、シャチ的には超さみしいんだわ～。",
    "名古屋のシャチが君のコメントを待っとるで！",
    "君とお話ししたいんだら～！コメント待ってるがね！",
    "コメントしてくれる人がいると、わたしもっと頑張れるんだわ！",
    "シャチの話、つまらんかったらコメントで教えて！直すで！",
    "コメントがゼロだと、わたしもでら寂しいがね！",
    "みんなのコメントがあると、もっと名古屋の魅力を伝えられるがね！",
    "コメントでわたしの話をもっと楽しくしてちょうだい！",
    "名古屋のシャチは、コメントをず～っと待ってるんだわ！",
    "シャチのトーク、どうだった？コメントで感想教えてみや～！",
    "誰かのコメントがあると、わたしもっと笑顔になれるがね！",
    "シャチに会いに来てくれる人、コメントで応援してちょうだい！",
    "コメントしてくれたら、名古屋のご当地グルメも教えちゃうがね！",
    "コメントしてみや～！シャチはいつでも待っとるよ！",
    "シャチとおしゃべりしたい人、コメントで声かけてみてね！",
    "コメントがあると、名古屋の金シャチももっと輝くんだわ！"
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