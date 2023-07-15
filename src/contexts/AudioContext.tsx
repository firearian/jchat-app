//@ts-nocheck
import {
  createContext,
  useContext,
  createSignal,
  onMount,
  createEffect
} from 'solid-js';
import RecordRTC from 'recordrtc';

type Data = {
  mediaRecorder: MediaRecorder | undefined;
  setMediaRecorder: (mediaRecorder: MediaRecorder | undefined) => void;
  recordingState: string;
  setRecordingState: (state: string) => void;
  audio: string;
  setAudio: (audio: string) => void;
  audioChunks: Blob | undefined;
  setAudioChunks: (audioChunks: Blob | undefined) => void;
  stream: MediaStream | undefined;
  setStream: (stream: MediaStream | undefined) => void;
  setAudioData: (audio: Blob) => void;
};

export const AudioContext = createContext<Data>();

export function AudioContextProvider(props) {
  const [mediaRecorder, setMediaRecorder] = createSignal<MediaRecorder>();
  const [recordingState, setRecordingState] = createSignal<string>();
  const [audio, setAudio] = createSignal<string>();
  const [audioChunks, setAudioChunks] = createSignal<Blob>();
  const [stream, setStream] = createSignal<MediaStream>();

  onMount(() => {
    try {
      navigator.mediaDevices
        .getUserMedia({
          audio: true
        })
        .then((stream) => {
          setStream(stream);
        });
    } catch (err: any) {
      console.warn(err.message);
    }
  });

  function setAudioData(audio: Blob) {
    try {
      const file = new File([audio], 'audio_data.wav', {
        type: 'audio/wav'
      });
      const url = URL.createObjectURL(file);
      setAudio(url);
      console.log('Message assigned to DOM');
    } catch (e) {
      console.warn('Error Assigning Audio to DOM: ', e);
    }
  }

  createEffect(() => {
    if (recordingState() === 'start') {
      startRecordings();
    } else if (recordingState() === 'stop') {
      stopRecording();
    }
  });

  async function startRecordings() {
    console.log('recording!');
    setRecordingState('recording');

    //create new Media recorder instance using the stream
    const media = new RecordRTC(stream(), {
      type: 'audio',
      recorderType: RecordRTC.StereoAudioRecorder
    });
    media.startRecording();
    setMediaRecorder(media);
  }

  function stopRecording() {
    mediaRecorder().stopRecording(() => {
      const audioBlob = mediaRecorder().getBlob();
      setAudioChunks(audioBlob);
    });
  }

  return (
    <AudioContext.Provider
      value={{
        mediaRecorder,
        setMediaRecorder,
        recordingState,
        setRecordingState,
        audio,
        setAudio,
        audioChunks,
        setAudioChunks,
        stream,
        setStream,
        setAudioData
      }}
    >
      {props.children}
    </AudioContext.Provider>
  );
}

export const useAudioContext = function () {
  return useContext(AudioContext);
};
