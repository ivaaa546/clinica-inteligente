import { AccessToken, RoomServiceClient, TrackSource } from "livekit-server-sdk";

const ACCESS_TOKEN_TTL_SECONDS = 10 * 60;
const opaqueRoomPattern = /^video-room_[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const opaqueParticipantPattern =
  /^video-participant_[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;

export type LiveKitServerConfig = {
  url: string;
  apiKey: string;
  apiSecret: string;
};

export type VideoAccessRequest = {
  roomId: string;
  participantId: string;
};

export type VideoAccess = {
  url: string;
  token: string;
  expiresAt: Date;
};

// Los servicios dependen de esta interfaz para poder usar un doble sin SDK ni red en pruebas.
export interface VideoCallProvider {
  issueAccess(request: VideoAccessRequest): Promise<VideoAccess>;
  revokeParticipant(request: VideoAccessRequest): Promise<void>;
}

type Clock = () => Date;

// Este limite concentra el SDK y sus secretos exclusivamente en el backend.
export class LiveKitAdapter implements VideoCallProvider {
  private readonly roomService: RoomServiceClient;
  private readonly now: Clock;

  constructor(config: LiveKitServerConfig, now: Clock = () => new Date()) {
    this.roomService = new RoomServiceClient(config.url, config.apiKey, config.apiSecret);
    this.config = config;
    this.now = now;
  }

  private readonly config: LiveKitServerConfig;

  async issueAccess({ roomId, participantId }: VideoAccessRequest): Promise<VideoAccess> {
    assertOpaqueIdentifiers(roomId, participantId);

    const accessToken = new AccessToken(this.config.apiKey, this.config.apiSecret, {
      identity: participantId,
      ttl: ACCESS_TOKEN_TTL_SECONDS,
    });
    accessToken.addGrant({
      roomJoin: true,
      room: roomId,
      canPublish: true,
      canPublishSources: [TrackSource.CAMERA, TrackSource.MICROPHONE],
      canSubscribe: true,
      canPublishData: false,
    });

    const expiresAt = new Date(this.now().getTime() + ACCESS_TOKEN_TTL_SECONDS * 1000);
    return {
      url: this.config.url,
      token: await accessToken.toJwt(),
      expiresAt,
    };
  }

  async revokeParticipant({ roomId, participantId }: VideoAccessRequest): Promise<void> {
    assertOpaqueIdentifiers(roomId, participantId);

    // Expulsa la conexion actual e invalida tokens emitidos antes de esta revocacion.
    await this.roomService.removeParticipant(roomId, participantId, {
      revokeTokenTs: BigInt(Math.floor(this.now().getTime() / 1000)),
    });
  }
}

function assertOpaqueIdentifiers(roomId: string, participantId: string) {
  if (!opaqueRoomPattern.test(roomId)) {
    throw new Error("La sala de video debe usar un identificador opaco");
  }

  if (!opaqueParticipantPattern.test(participantId)) {
    throw new Error("El participante de video debe usar un identificador opaco");
  }
}
