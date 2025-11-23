import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, Settings, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@shared/schema";

interface VideoCallProps {
  participants: User[];
  currentUser: User;
  onLeaveCall: () => void;
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
}

export function VideoCall({
  participants,
  currentUser,
  onLeaveCall,
  localStream,
  remoteStreams,
}: VideoCallProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    remoteStreams.forEach((stream, userId) => {
      const videoElement = remoteVideoRefs.current.get(userId);
      if (videoElement) {
        videoElement.srcObject = stream;
      }
    });
  }, [remoteStreams]);

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  return (
    <div className="relative h-screen w-full bg-black">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 h-full">
        {participants.map((participant) => {
          const stream = remoteStreams.get(participant._id);
          const isLocalUser = participant._id === currentUser._id;
          
          return (
            <div
              key={participant._id}
              className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video flex items-center justify-center"
              data-testid={`video-participant-${participant._id}`}
            >
              {stream || isLocalUser ? (
                <video
                  ref={isLocalUser ? localVideoRef : (el) => {
                    if (el) remoteVideoRefs.current.set(participant._id, el);
                  }}
                  autoPlay
                  playsInline
                  muted={isLocalUser}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Avatar className="w-24 h-24">
                  <AvatarImage src={participant.avatar} />
                  <AvatarFallback className="text-2xl">
                    {participant.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}
              <div className="absolute bottom-4 left-4 bg-black/70 px-3 py-1.5 rounded-md">
                <p className="text-white text-sm font-medium">{participant.username}</p>
              </div>
            </div>
          );
        })}
      </div>

      {localStream && (
        <div className="absolute bottom-8 right-8 w-48 h-32 bg-gray-900 rounded-lg overflow-hidden border-2 border-white/20">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover mirror"
            data-testid="video-self-preview"
          />
        </div>
      )}

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/80 px-6 py-4 rounded-full backdrop-blur-sm">
        <Button
          size="icon"
          variant={isMuted ? "destructive" : "secondary"}
          className="h-12 w-12 rounded-full"
          onClick={toggleMute}
          data-testid="button-toggle-mic"
        >
          {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </Button>
        <Button
          size="icon"
          variant={isVideoOff ? "destructive" : "secondary"}
          className="h-12 w-12 rounded-full"
          onClick={toggleVideo}
          data-testid="button-toggle-video"
        >
          {isVideoOff ? <VideoOff className="w-5 h-5" /> : <VideoIcon className="w-5 h-5" />}
        </Button>
        <Button
          size="icon"
          variant="destructive"
          className="h-12 w-12 rounded-full"
          onClick={onLeaveCall}
          data-testid="button-leave-call"
        >
          <PhoneOff className="w-5 h-5" />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          className="h-12 w-12 rounded-full"
          data-testid="button-call-participants"
        >
          <Users className="w-5 h-5" />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          className="h-12 w-12 rounded-full"
          data-testid="button-call-settings"
        >
          <Settings className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
