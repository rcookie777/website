import React, { useRef, useEffect } from 'react';
import * as faceapi from 'face-api.js';

const expressionToEmoji = {
  happy: '😊',
  sad: '😢',
  angry: '😠',
  surprised: '😲',
  disgusted: '🤢',
  fearful: '😱',
  neutral: '😐',
};

function FaceToEmoji() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    async function loadModels() {
      try {
        const MODEL_URL = process.env.PUBLIC_URL + '/models';
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
        console.log('Models loaded successfully');
        startVideo();
      } catch (error) {
        console.error('Error loading models:', error);
      }
    }

    loadModels();
  }, []);

  const startVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: {} })
      .then((stream) => {
        videoRef.current.srcObject = stream;
        console.log('Camera started successfully');
      })
      .catch((err) => {
        console.error('Error accessing webcam: ', err);
      });
  };

  const handleVideoOnPlay = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    // Adjust canvas size to match the video dimensions
    const displaySize = {
      width: video.videoWidth,
      height: video.videoHeight,
    };
    faceapi.matchDimensions(canvas, displaySize);

    setInterval(async () => {
      if (video.readyState === 4) {
        // Detect single face and expressions
        const detections = await faceapi
          .detectSingleFace(
            video,
            new faceapi.TinyFaceDetectorOptions()
          )
          .withFaceExpressions();

        if (detections){
        const resizedDetections = faceapi.resizeResults(detections, displaySize);

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (resizedDetections) {
          const { expressions, detection } = resizedDetections;

          const maxExpression = Object.keys(expressions).reduce((a, b) =>
            expressions[a] > expressions[b] ? a : b
          );

          const emoji = expressionToEmoji[maxExpression] || '😐';

          const { x, y, width, height } = detection.box;

          ctx.font = `${height}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(emoji, x + width / 2, y + height / 2);
        }
      }
      }
    }, 100);
  };

  return (
    <div style={styles.videoContainer}>
      <video
        ref={videoRef}
        autoPlay
        muted
        onPlay={handleVideoOnPlay}
        style={styles.videoFeed}
      />
      <canvas ref={canvasRef} style={styles.videoCanvas} />
    </div>
  );
}

const styles = {
  videoContainer: {
    position: 'relative',
    width: '100%',
    maxWidth: '640px',
    margin: '0 auto',
  },
  videoFeed: {
    width: '100%',
    height: 'auto',
  },
  videoCanvas: {
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
  },
};

export default FaceToEmoji;
