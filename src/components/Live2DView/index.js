import React, { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';
import { Live2DModel } from 'pixi-live2d-display-lipsyncpatch';
import useFaceDetection from '../../hooks/useFaceDetection';

window.PIXI = PIXI;

const Live2DView = ({ voicevox, isCameraOn }) => {
    const appCanvasRef = useRef(null);
    const appRef = useRef(null); // PIXI.Applicationのインスタンスを保持
    const modelRef = useRef(null); // Live2Dモデルを保持
    const idleTimeoutRef = useRef(null); // idleタイムアウトを保持
    const animationFrameRef = useRef(null); // アニメーションフレームを保持
    const isDraggingRef = useRef(false); // ドラッグ状態を保持
    const dragStartRef = useRef({ x: 0, y: 0 }); // ドラッグ開始位置を保持
    const modelStartRef = useRef({ x: 0, y: 0 }); // モデルの開始位置を保持
    const scaleRef = useRef(1); // スケールを保持
    const initialScaleRef = useRef(1); // 初期スケールを保持

    const [isIdle, setIsIdle] = useState(false);

    const { videoRef, canvasRef, coordinates } = useFaceDetection();

    const IDLE_TIME = 3000;

    useEffect(() => {
        const app = new PIXI.Application({
            view: appCanvasRef.current,
            width: window.innerWidth * 0.7,
            height: window.innerHeight * 0.95,
            backgroundColor: 0x1099bb,
        });
        appRef.current = app;

        const smoothResetFocus = () => {
            if (modelRef.current) {
                const focusController = modelRef.current.internalModel.focusController;

                const resetStep = () => {
                    const currentX = focusController.targetX || 0;
                    const currentY = focusController.targetY || 0;
                    const dx = -currentX;
                    const dy = -currentY;
                    const speed = 0.05;

                    const newX = currentX + dx * speed;
                    const newY = currentY + dy * speed;

                    focusController.targetX = newX;
                    focusController.targetY = newY;

                    if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01) {
                        cancelAnimationFrame(animationFrameRef.current);
                        focusController.targetX = 0;
                        focusController.targetY = 0;
                        return;
                    }

                    animationFrameRef.current = requestAnimationFrame(resetStep);
                };

                resetStep();
            }
        };

        const onMouseMove = (event) => {
            if (isIdle) setIsIdle(false);

            if (modelRef.current && !isIdle) {
                modelRef.current.focus(event.clientX, event.clientY);
                clearTimeout(idleTimeoutRef.current);
                idleTimeoutRef.current = setTimeout(() => {
                    setIsIdle(true);
                    smoothResetFocus();
                }, IDLE_TIME);
            }

            // ドラッグ中の場合、モデルを移動
            if (isDraggingRef.current && modelRef.current) {
                const dx = event.clientX - dragStartRef.current.x;
                const dy = event.clientY - dragStartRef.current.y;
                modelRef.current.position.set(
                    modelStartRef.current.x + dx,
                    modelStartRef.current.y + dy
                );
            }
        };

        const onMouseDown = (event) => {
            if (modelRef.current) {
                isDraggingRef.current = true;
                dragStartRef.current = { x: event.clientX, y: event.clientY };
                modelStartRef.current = {
                    x: modelRef.current.position.x,
                    y: modelRef.current.position.y,
                };
            }
        };

        const onMouseUp = () => {
            isDraggingRef.current = false;
        };

        const onMouseOut = () => {
            isDraggingRef.current = false; // ウィンドウ外でドラッグ状態を解除
        };

        const onWheel = (event) => {
            if (modelRef.current) {
                const scaleFactor = 0.01; // 1回のホイール操作での拡大縮小率
                const delta = event.deltaY > 0 ? -scaleFactor : scaleFactor; // スクロール方向で拡大・縮小
                const newScale = Math.min(Math.max(scaleRef.current + delta, initialScaleRef.current * 0.5), initialScaleRef.current * 2); // 最小0.5倍、最大2倍
                scaleRef.current = newScale;
                modelRef.current.scale.set(newScale, newScale);
            }
        };

        const Live2DLoader = async () => {
            try {
                // 背景画像を読み込んでスプライトを作成
                const backgroundTexture = PIXI.Texture.from('/images/1.png'); // 背景画像のパスを指定
                const background = new PIXI.Sprite(backgroundTexture);
        
                // 背景のサイズをステージサイズに合わせる
                background.width = appRef.current.view.width;
                background.height = appRef.current.view.height;
        
                // 背景をステージに追加
                appRef.current.stage.addChild(background);

                //モデル追加
                const model = await Live2DModel.from('/live2d-models/Meijougane_syachi/meijougane_syachi.model3.json');
                modelRef.current = model;
                appRef.current.stage.addChild(model);

                const scaleX = (appRef.current.view.width) / model.width;
                const scaleY = (appRef.current.view.height) / model.height;
                initialScaleRef.current = Math.min(scaleX, scaleY); // 初期スケールを保持

                modelRef.current.scale.set(Math.min(scaleX, scaleY));
                modelRef.current.anchor.set(0, 0);
                modelRef.current.position.set(0, 0);

                window.addEventListener('resize', () => {
                    if (modelRef.current) modelRef.current.position.set(0, 0);
                });
                window.addEventListener('mousemove', onMouseMove);
                window.addEventListener('mousedown', onMouseDown);
                window.addEventListener('mouseup', onMouseUp);
                window.addEventListener('mouseout', onMouseOut);
                window.addEventListener('wheel', onWheel);
            } catch (error) {
                console.error('Error loading model:', error);
            }
        };

        Live2DLoader();

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mousedown', onMouseDown);
            window.removeEventListener('mouseup', onMouseUp);
            window.removeEventListener('mouseout', onMouseOut);
            window.removeEventListener('wheel', onWheel);
            cancelAnimationFrame(animationFrameRef.current);
            if (modelRef.current) {
                modelRef.current.destroy();
            }
        };
    }, []);

    useEffect(() => {
        if (voicevox.isSpeech && modelRef.current) {
            const audioBlob = new Blob([voicevox.audioData], { type: 'audio/wav' });
            const audioURL = URL.createObjectURL(audioBlob);

            modelRef.current.speak(audioURL,{
                onFinish: () => {
                    voicevox.setSpeech(false);
                }
            });
        }
    },[voicevox]);

    useEffect(() => {

        if (isCameraOn && coordinates) {

            const focusX = coordinates.focusX;
            const focusY = coordinates.focusY;

            const updateFocus = () => {
                if (modelRef.current) {
                    const focusController = modelRef.current.internalModel.focusController;

                    focusController.targetX = focusX;
                    focusController.targetY = focusY;
                }
            }

            const interval = setInterval(updateFocus, 100);
            return () => clearInterval(interval);
        }
    }, [coordinates]);

    return (
        <>
            <canvas ref={appCanvasRef} />
            <div style={{ visibility:"hidden", position: "absolute", top: "0", left:"0" }}>
                <video
                    ref={videoRef}
                    autoPlay
                    muted
                />
                <canvas
                    ref={canvasRef}
                />
            </div>
        </>
    );
};

export default Live2DView;
