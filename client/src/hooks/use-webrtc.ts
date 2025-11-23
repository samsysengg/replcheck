import { useState, useEffect, useRef } from "react";
import { useSocket } from "@/contexts/SocketContext";
import SimplePeer from "simple-peer";

export function useWebRTC() {
  const { socket } = useSocket();
  const [peers, setPeers] = useState<Map<string, SimplePeer.Instance>>(new Map());
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);

  const createPeer = (initiator: boolean, stream: MediaStream, targetId: string) => {
    const peer = new SimplePeer({
      initiator,
      stream,
      trickle: true,
      config: {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      },
    });

    peer.on("signal", (signal) => {
      if (signal.type === "offer") {
        socket?.emit("webrtc_offer", { to: targetId, offer: signal });
      } else if (signal.type === "answer") {
        socket?.emit("webrtc_answer", { to: targetId, answer: signal });
      }
    });

    peer.on("stream", (remoteStream) => {
      setRemoteStreams((prev) => new Map(prev).set(targetId, remoteStream));
    });

    peer.on("error", (err) => {
      console.error("Peer error:", err);
    });

    return peer;
  };

  useEffect(() => {
    if (!socket) return;

    socket.on("webrtc_offer", ({ from, offer }) => {
      if (!localStreamRef.current) return;

      const peer = createPeer(false, localStreamRef.current, from);
      peer.signal(offer);
      setPeers((prev) => new Map(prev).set(from, peer));
    });

    socket.on("webrtc_answer", ({ from, answer }) => {
      const peer = peers.get(from);
      if (peer) {
        peer.signal(answer);
      }
    });

    socket.on("webrtc_ice_candidate", ({ from, candidate }) => {
      const peer = peers.get(from);
      if (peer) {
        peer.signal(candidate);
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

      participantIds.forEach((participantId) => {
        const peer = createPeer(true, stream, participantId);
        setPeers((prev) => new Map(prev).set(participantId, peer));
      });

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

    peers.forEach((peer) => peer.destroy());
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
