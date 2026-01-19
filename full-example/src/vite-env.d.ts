/// <reference types="vite/client" />

// MuzieClient global types (loaded from CDN)
interface MuzieClientConstructorOptions {
  roomToken: string;
}

interface CreateRoomOptions {
  roomName: string;
  userId: string;
  options?: {
    requireWaitingRoom?: boolean;
  };
}

interface JoinRoomWithTokenOptions {
  joinToken: string;
  userId: string;
  password?: string;
  roomRegion?: string;
}

interface ConnectTransportsOptions {
  localVideoElementId?: string | null;
  options?: {
    enableAudioInputMonitor?: boolean;
    enableAudioGainControl?: boolean;
  };
  audioOnly?: boolean;
}

interface RoomInfo {
  id: string;
  name: string;
  owner: string;
  users: string[];
  created: string;
}

interface DeviceInfo {
  deviceId: string;
  label: string;
  kind: string;
}

interface MuzieClientInstance {
  // Room operations
  createRoom(options: CreateRoomOptions): Promise<RoomInfo>;
  joinRoomWithToken(options: JoinRoomWithTokenOptions): Promise<RoomInfo>;
  closeConnection(): void;

  // Transport operations
  connectTransports(options: ConnectTransportsOptions): Promise<void>;

  // Device management
  listVideoDevices(): Promise<DeviceInfo[]>;
  listAudioInputDevices(): Promise<DeviceInfo[]>;
  listAudioOutputDevices(): Promise<DeviceInfo[]>;
  setLocalVideoDevice(options: { videoDeviceId: string }): Promise<void>;
  setLocalAudioInputDevice(options: {
    audioInputDeviceId: string;
    constraints?: MediaTrackConstraints;
  }): Promise<void>;
  setAudioOutputDevice(options: { audioOutputDeviceId: string }): Promise<void>;

  // Media controls
  pauseAudio(): Promise<void>;
  resumeAudio(): Promise<void>;
  pauseVideo(): Promise<void>;
  resumeVideo(): Promise<void>;
  startScreenShare(): Promise<void>;
  stopScreenShare(): Promise<void>;

  // Event handling
  addEventListener(event: string, handler: (event: CustomEvent) => void): void;
  removeEventListener(event: string, handler: (event: CustomEvent) => void): void;
}

interface MuzieClientModule {
  Client: new (options: MuzieClientConstructorOptions) => MuzieClientInstance;
  ClientEvents: {
    CONNECTED: string;
    DISCONNECTED: string;
    ROOM_JOINED: string;
    ROOM_CLOSED: string;
    USER_JOINED_ROOM: string;
    USER_DISCONNECTED: string;
    MEDIA_TRACK_ADDED: string;
    MEDIA_TRACK_REMOVED: string;
    AUDIO_MUTED: string;
    VIDEO_MUTED: string;
    RECEIVE_CHAT_MESSAGE: string;
    RECORDING_STARTED: string;
    RECORDING_STOPPED: string;
    ERROR: string;
    [key: string]: string;
  };
  DeviceCheck: unknown;
}

declare global {
  interface Window {
    MuzieClient: MuzieClientModule;
  }
}
