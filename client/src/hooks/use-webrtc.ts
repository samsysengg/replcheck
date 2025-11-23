import { useState, useEffect, useRef } from "react";
import { useSocket } from "@/contexts/SocketContext";

const ICE_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

export function useWebRTC() {
  const { socket } = useSocket();
  const [peers, setPeers] = useState<Map<string, RTCPeerConnection>>(new Map());
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);

  const createPeerConnection = (targetId: string, stream: MediaStream) => {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket?.emit("webrtc_ice_candidate", { to: targetId, candidate: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        setRemoteStreams((prev) => new Map(prev).set(targetId, event.streams[0]));
      }
    };

    pc.onconnectionstatechange = () => {
      console.log(`Peer ${targetId} connection state: ${pc.connectionState}`);
      if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
        setPeers((prev) => {
          const newPeers = new Map(prev);
          newPeers.delete(targetId);
          return newPeers;
        });
        setRemoteStreams((prev) => {
          const newStreams = new Map(prev);
          newStreams.delete(targetId);
          return newStreams;
        });
      }
    };

    return pc;
  };

  useEffect(() => {
    if (!socket) return;

    socket.on("webrtc_offer", async ({ from, offer }) => {
      if (!localStreamRef.current) return;

      const pc = createPeerConnection(from, localStreamRef.current);
      setPeers((prev) => new Map(prev).set(from, pc));

      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit("webrtc_answer", { to: from, answer });
    });

    socket.on("webrtc_answer", async ({ from, answer }) => {
      const pc = peers.get(from);
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    socket.on("webrtc_ice_candidate", async ({ from, candidate }) => {
      const pc = peers.get(from);
      if (pc && candidate) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (error) {
          console.error("Error adding ICE candidate:", error);
        }
      }
    });

    return () => {
      socket.off("webrtc_offer");
      socket.off("webrtc_answer");
      socket.off("webrtc_ice_candidate");
    };
  }, [socket, peers]);

  const startCall = async (participantIds: string[]) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      localStreamRef.current = stream;

      for (const participantId of participantIds) {
        const pc = createPeerConnection(participantId, stream);
        setPeers((prev) => new Map(prev).set(participantId, pc));

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socket?.emit("webrtc_offer", { to: participantId, offer });
      }

      return stream;
    } catch (error) {
      console.error("Failed to get media stream:", error);
      throw error;
    }
  };

  const endCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    peers.forEach((pc) => pc.close());
    setPeers(new Map());
    setRemoteStreams(new Map());
  };

  return {
    startCall,
    endCall,
    localStream: localStreamRef.current,
    remoteStreams,
  };
}
