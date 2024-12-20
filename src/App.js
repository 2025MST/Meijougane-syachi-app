import React, { useState } from 'react';
import Live2DView from './components/Live2DView';
import { Modal, Stack, } from '@mui/material';
import { Comment, CommentsDisabled, Mic, MicOff, Settings, Videocam, VideocamOff } from '@mui/icons-material';
import { TogleButton } from './components/TogleButton';
import { SettingModal } from './components/SettingModal';
import { ChatBox } from './components/ChatBox';
import useChatgpt from './hooks/useChatgpt';
import useVoiceVox from './hooks/useVoiceVox';
import useYoutubeComment from './hooks/useYoutubeComment';
import YoutubeCommentBox from './components/YoutubeCommentBox';
const App = () => {

	const [settingOpen, setSettingOpen] = useState(false);
	const [toggleMic, setToggleMic] = useState(false);
	const [toggleCamera, setToggleCamera] = useState(false);
	const [toggleComment, setToggleComment] = useState(false);
	const [toggleYoutubeCommentDetection, setToggleYoutubeCommentDetection] = useState(false);
	const [toggleYoutubeCommentBox, setToggleYoutubeCommentBox] = useState(false);
	const [videoId, setVideoId] = useState('');

	const chatgpt = useChatgpt();
	const voicevox = useVoiceVox();
	//const youtubeComment = useYoutubeComment(videoId);

	return (
		<div>
			<Stack direction="column" spacing={1} sx={{
				alignItems: 'center',
				alignContent: 'center',
				position: 'absolute',
				margin: '10px'
			}}>
				<TogleButton
					label={"setting"} 
					onClick={() => setSettingOpen(!settingOpen)}
					innerIcon={<Settings fontSize='inherit' />}
				/>
				<TogleButton
					label={"audioMute"}
					onClick={() => setToggleMic(!toggleMic)}
					style={{
						backgroundColor : toggleMic ? 'white' : 'black',
						color : toggleMic ? 'black' : 'white',
					}}
					innerIcon={toggleMic ? <Mic fontSize='inherit' /> : <MicOff fontSize='inherit' />}
				/>
				<TogleButton
					label={"camera"}
					onClick={() => setToggleCamera(!toggleCamera)}
					style={{
						backgroundColor : toggleCamera ? 'white' : 'black',
						color : toggleCamera ? 'black' : 'white',
					}}
					innerIcon={toggleCamera ? <Videocam fontSize='inherit' /> : <VideocamOff fontSize='inherit' />}
				/>
				<TogleButton
					label={"commentBox"}
					onClick={() => setToggleComment(!toggleComment)}
					style={{
						background : toggleComment ? 'white' : 'black',
						color : toggleComment ? 'black' : 'white',
					}}
					innerIcon={toggleComment ? <Comment fontSize="inherit" /> : <CommentsDisabled fontSize="inherit" />}
				/>
			</Stack>

			<Modal
				open={settingOpen}
				onClose={() => setSettingOpen(false)}
			>
				<SettingModal
					// videoId={videoId}
					// setVideoId={setVideoId}
					// toggleYoutubeCommentDetection={toggleYoutubeCommentDetection}
					// setToggleYoutubeCommentDetection={toggleYoutubeCommentDetection}
				/>
			</Modal>

			{toggleComment && (
				<ChatBox chatgpt={chatgpt} voicevox={voicevox} isMicOn={toggleMic} />
			)}

			{/* {toggleYoutubeCommentBox && (
				<YoutubeCommentBox useYoutubeComment={youtubeComment} />
			)} */}

			<Live2DView voicevox={voicevox} isCameraOn={toggleCamera} />

		</div>
	);
}

export default App;
