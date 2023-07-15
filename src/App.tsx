//@ts-nocheck
import AudioComponent from './components/AudioComponent';
import { AudioContextProvider } from './contexts/AudioContext';
import { WebSocketContextProvider } from './contexts/WebSocketContext';

const App = () => {
  return (
    <AudioContextProvider>
      <WebSocketContextProvider>
        <div>
          <AudioComponent />
        </div>
      </WebSocketContextProvider>
    </AudioContextProvider>
  );
};

export default App;
