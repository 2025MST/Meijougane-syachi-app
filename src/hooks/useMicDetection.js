import { useEffect, useRef, useState } from 'react';

export const useMicDetection = ({ isMicOn, onRecognized }) => {
  const recognitionRef = useRef(null); // SpeechRecognitionインスタンス
  const [lastRecognizeText, setLastRecognizeText] = useState('');
  const [interimText, setInterimText] = useState('');

  useEffect(() => {
        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            console.error('Web Speech API is not supported in this browser.');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'ja-JP'; // 日本語設定
        recognition.interimResults = true; // 暫定結果を受け取らない
        recognition.continuous = true; // 継続的な音声認識

        recognition.onresult = (event) => {
            for (let i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    console.log("発話終了 : ", event.results[i][0].transcript);
                    onRecognized(event.results[i][0].transcript);
                    setLastRecognizeText(event.results[i][0].transcript);
                    setInterimText('');
                } else {
                    console.log("発話中 : ", event.results[i][0].transcript);
                    setInterimText(event.results[i][0].transcript);
                }
            }
        };

        recognition.onspeechend = () => {
            console.log("発話を終了しました : ", lastRecognizeText);
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event);
        };

        recognitionRef.current = recognition;

        return () => {
            recognition.stop();
            recognitionRef.current = null;
        };
    }, []);

    useEffect(() => {

        console.log("マイクオン");

        const recognition = recognitionRef.current;

        if (isMicOn && recognition) {
            recognition.start();
        } else if (recognition) {
            recognition.stop();
        }

        return () => {
            if (recognition) {
                recognition.stop();
            }
        };
    }, [isMicOn]);

    return { interimText };
}
