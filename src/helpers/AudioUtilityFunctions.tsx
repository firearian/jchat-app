//@ts-nocheck
import { useAudioContext } from '../contexts/AudioContext';
import { useWebSocketContext } from '../contexts/WebSocketContext';

const AudioUtilityFunctions = () => {
  const {
    mediaRecorder,
    setMediaRecorder,
    recordingState,
    setRecordingState,
    audioChunks,
    setAudioChunks,
    stream
  } = useAudioContext();
  const { sendData } = useWebSocketContext();
};
export default AudioUtilityFunctions;
