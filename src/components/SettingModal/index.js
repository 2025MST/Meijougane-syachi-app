import React, {useEffect} from "react";
import { Box, FormControl, TextField } from "@mui/material";
import useFaceDetection from "../../hooks/useFaceDetection";
import { VideoFileRounded } from "@mui/icons-material";

export const SettingModal = () => {

    const { videoRef,canvasRef } = useFaceDetection();

    useEffect(() => {
        if ( !videoRef.current || !canvasRef.current ) {
            console.error("ビデオとキャンバスが初期化されていません");
        }
    },[videoRef,canvasRef]);

    // const handleVideoIdChange = (event) => {
    //     setVideoId(event.target.value);
    // }

    return(
        <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'white',
            width: '80%',
            height: '80%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            overflowY: "auto"
        }}>
            <h2>設定</h2>
            {/* <FormControl>
                <h3>ライブID</h3>
                <TextField label="Video ID" value={videoId} onChange={handleVideoIdChange}></TextField>
            </FormControl> */}
            <div style={{ position: "relative", width: "640px", height: "480px" }}>
                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                    }}
                />
                <canvas
                    ref={canvasRef}
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                    }}
                />
            </div>
        </Box>
    )
};
