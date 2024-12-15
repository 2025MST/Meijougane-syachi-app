import React, {useEffect} from "react";
import { Box } from "@mui/material";
import useFaceDetection from "../../hooks/useFaceDetection";

export const SettingModal = () => {

    const { videoRef,canvasRef } = useFaceDetection();

    useEffect(() => {
        if ( !videoRef.current || !canvasRef.current ) {
            console.error("ビデオとキャンバスが初期化されていません");
        }
    },[videoRef,canvasRef]);

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
