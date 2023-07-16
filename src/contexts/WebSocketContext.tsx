//@ts-nocheck
import {
  createContext,
  useContext,
  createSignal,
  createEffect
} from 'solid-js';
import { useAudioContext } from './AudioContext';
const MAX_RECONNECT_ATTEMPTS = 5; // Maximum number of reconnection attempts
const RECONNECT_DELAY_MS = 3000; // Delay between reconnection attempts in milliseconds

let reconnectAttempts = 0;

export const WebSocketContext = createContext();

export function WebSocketContextProvider(props) {
  const { setAudioData } = useAudioContext();
  const [socket, setSocket] = createSignal<string>();
  const [audio, setAudio] = createSignal<string>();

  createEffect(() => {
    console.log('audio!!!!!!!!', audio());
  });

  // https://2e96-2a00-23c7-2b28-1b01-49af-8b43-1314-da87.ngrok-free.app
  function connectWebSocket() {
    setSocket(
      new WebSocket(
        'wss://39ce-2a00-23c7-2b28-1b01-d9f2-d86f-d92f-9b44.ngrok-free.app'
      )
    );
    // setSocket(new WebSocket('ws://localhost:3001'));

    socket().onopen = () => {
      console.log('WebSocket connected');
      reconnectAttempts = 0; // Reset reconnection attempts on successful connection
    };

    // Connection opened event
    socket().addEventListener('open', () => {
      console.log('WebSocket connection established');
      // Send a message to the server
      socket().send('Hello, server!');
    });

    // Message received event
    socket().addEventListener('message', (event) => {
      setAudioData(event.data);
    });

    // Connection closed event
    socket().addEventListener('close', () => {
      console.log('WebSocket connection closed');
      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts++;
        console.log(
          `Reconnecting in ${RECONNECT_DELAY_MS}ms (attempt ${reconnectAttempts})`
        );
        setTimeout(connectWebSocket, RECONNECT_DELAY_MS);
      } else {
        console.log('Maximum reconnection attempts reached');
      }
    });

    // Error occurred event
    socket().addEventListener('error', (event) => {
      console.error('WebSocket error:', event.error);
    });
  }
  connectWebSocket();

  function sendData(data) {
    console.log('Sending data to WS server');
    socket().send(data);
  }

  return (
    <WebSocketContext.Provider
      value={{
        sendData,
        audio,
        setAudio
      }}
    >
      {props.children}
    </WebSocketContext.Provider>
  );
}

export const useWebSocketContext = function () {
  return useContext(WebSocketContext);
};
