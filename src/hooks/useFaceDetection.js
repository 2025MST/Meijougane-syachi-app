import { useState, useRef, useEffect } from "react";
import * as faceapi from "face-api.js";

const SMOOTH_ALPHA = 0.4;

const useFaceDetection = () => {
    const videoRef = useRef(document.createElement("video"));
    const canvasRef = useRef(document.createElement("canvas"));
    const [forwardTimes, setForwardTimes] = useState([]);
    const [avgTime, setAvgTime] = useState(0);
    const [fps, setFps] = useState(0);
    const [coordinates, setCoordinates] = useState(null);
    const smoothFocus = useRef({focusX : 0, focusY: 0});

    const lerp = (current, target, alpha) => current + (target - current) * alpha;

    useEffect(() => {
        const loadModels = async () => {
            const MODEL_URL = "/face_models";
            await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        };

        loadModels();
    }, []);

    useEffect(() => {
        const startVideo = async () => {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        };

        startVideo();
    }, []);

    const updateTimeStats = (timeInMs) => {
        const updatedForwardTimes = [timeInMs, ...forwardTimes].slice(0, 30);
        const avgTimeInMs =
            updatedForwardTimes.reduce((total, t) => total + t, 0) /
            updatedForwardTimes.length;

        setForwardTimes(updatedForwardTimes);
        setAvgTime(Math.round(avgTimeInMs));
        setFps(Math.round(1000 / avgTimeInMs));
    };

    const onPlay = async () => {
        const videoEl = videoRef.current;
        const canvas = canvasRef.current;

        if (
            !videoEl ||
            videoEl.paused ||
            videoEl.ended ||
            !faceapi.nets.tinyFaceDetector.isLoaded
        ) {
            setTimeout(onPlay, 100);
            return;
        }

        const options = new faceapi.TinyFaceDetectorOptions({
            inputSize: 256,
            scoreThreshold: 0.5,
        });

        const ts = Date.now();
        const detections = await faceapi.detectAllFaces(videoEl, options);
        updateTimeStats(Date.now() - ts);

        const dims = faceapi.matchDimensions(canvas, videoEl, true);
        const resizedDetections = faceapi.resizeResults(detections, dims);

        const context = canvas.getContext("2d");
        context.clearRect(0, 0, canvas.width, canvas.height);

        if (resizedDetections.length > 0) {
            const largestFace = resizedDetections.reduce((largest, current) =>
            current.box.area > largest.box.area ? current : largest
            );

            faceapi.draw.drawDetections(canvas, [largestFace]);	

            const centerX = videoEl.videoWidth / 2;
            const centerY = videoEl.videoHeight / 2;
        
            const targetFocusX = -((Math.round(largestFace.box.x) + largestFace.box.width / 2 - centerX ) / centerX);
            const targetFocusY = -((Math.round(largestFace.box.y) + largestFace.box.height / 2 - centerY ) / centerY);

            const newFocusX = lerp(smoothFocus.current.focusX, targetFocusX, SMOOTH_ALPHA);
            const newFocusY = lerp(smoothFocus.current.focusY, targetFocusY, SMOOTH_ALPHA);

            smoothFocus.current = {
                focusX : newFocusX,
                focusY : newFocusY,
            }

            // 顔の座標を設定
            setCoordinates({
                x: Math.round(largestFace.box.x),
                y: Math.round(largestFace.box.y),
                focusX : Math.max(-1, Math.min(1, newFocusX)),
                focusY : Math.max(-1, Math.min(1, newFocusY)),
                width: Math.round(largestFace.box.width),
                height: Math.round(largestFace.box.height),
            });

        } else {
            setCoordinates(null);
        }

        setTimeout(onPlay, 100);
    };

    useEffect(() => {
        const videoEl = videoRef.current;
        
        videoEl?.addEventListener("play", onPlay);

        return () => {
            videoEl?.removeEventListener("play", onPlay);
        };
    }, [forwardTimes]);

    return {
        videoRef,
        canvasRef,
        avgTime,
        fps,
        coordinates,
    };
};

export default useFaceDetection;
