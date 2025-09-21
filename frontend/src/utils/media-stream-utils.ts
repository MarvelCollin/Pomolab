export const createMediaStreamFromTrack = (track: MediaStreamTrack): MediaStream => {
  const mediaStream = new MediaStream();
  
  if (track) {
    mediaStream.addTrack(track);
  }
  
  return mediaStream;
};

export const attachMediaStreamToElement = (
  element: HTMLVideoElement | HTMLAudioElement | null,
  stream: MediaStream | null
): void => {
  if (element && stream) {
    element.srcObject = stream;
    element.play().catch(error => {
      console.warn('Failed to play media stream:', error);
    });
  }
};