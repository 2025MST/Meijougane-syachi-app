import { useEffect, useRef, useState } from "react";

/**
 * Custom hook for speech recognition using Web Speech API.
 * @param {boolean} isMicOn - Whether the microphone is active.
 * @param {function} onRecognized - Callback for handling recognized text.
 * @returns {object} - Contains the current recognition state, interim text, and error (if any).
 */
const useSpeechRecognition = (isMicOn, onRecognized) => {
    const [isRecognizing, setIsRecognizing] = useState(false);
    const [interimText, setInterimText] = useState("");
    const [error, setError] = useState(null);
    const recognitionRef = useRef(null);

    useEffect(() => {
        // Check for browser support
        if (!('webkitSpeechRecognition' in window)) {
            setError("Speech recognition not supported in this browser.");
            return;
        }

        // Initialize SpeechRecognition instance if not already done
        if (!recognitionRef.current) {
            const recognition = new window.webkitSpeechRecognition();
            recognition.lang = "ja-JP"; // Set language to Japanese
            recognition.interimResults = true; // Process interim results
            recognition.continuous = true; // Keep listening until manually stopped
            recognitionRef.current = recognition;

        // Handle recognition events
            recognition.onresult = (event) => {

                let interim = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {

                    if (!event.results[i].isFinal) {
                        interim += event.results[i][0].transcript;
                    }else{
                        onRecognized(event.results[i][0].transcript);
                        setInterimText("");
                        interim = '';
                    }
                }

                setInterimText(interim);
            };

            recognition.onerror = (event) => {
                console.error("Speech recognition error:", event.error);
                setError(event.error);
            };

            recognition.onstart = () => {
                setIsRecognizing(true);
                setInterimText("");
            };

            recognition.onend = () => {
                setIsRecognizing(false);
                setInterimText("");
            };
        }
    }, [isMicOn, onRecognized]);

    useEffect(() => {
        const recognition = recognitionRef.current;
        if (recognition) {
            if (isMicOn && !isRecognizing) {
                try {
                    recognition.start();
                    setIsRecognizing(true);
                } catch (error) {
                    console.error("Error starting recognition:", error);
                }
            } else if (!isMicOn && isRecognizing) {
                recognition.stop();
                setIsRecognizing(false);
            }
        }
    }, [isMicOn, isRecognizing]);

    return { isRecognizing, interimText, error };
};

export default useSpeechRecognition;
