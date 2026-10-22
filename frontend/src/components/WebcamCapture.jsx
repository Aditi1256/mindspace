import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, AlertCircle, Check, Slash } from 'lucide-react';

export default function WebcamCapture({ onCapture, onSkip }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraState, setCameraState] = useState('idle'); // idle, starting, active, captured, error
  const [errorMessage, setErrorMessage] = useState('');
  const [capturedImage, setCapturedImage] = useState(null);

  const startCamera = async () => {
    setErrorMessage('');
    setCameraState('starting');
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Webcam is not supported in this browser environment.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setCameraState('active');
        };
      }
    } catch (err) {
      console.warn('Camera access error:', err);
      let msg = 'Could not access camera. You can proceed with questionnaire only.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = 'Camera permission was denied. You can continue check-in without the webcam.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        msg = 'No camera device found on your system. You can continue without webcam.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        msg = 'Camera is already in use by another app. Please close other apps and retry.';
      }
      setErrorMessage(msg);
      setCameraState('error');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    // Mirror image for natural webcam orientation
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedImage(dataUrl);
    setCameraState('captured');
    stopCamera();

    if (onCapture) {
      onCapture(dataUrl);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };

  return (
    <div className="webcam-panel">
      <div className="webcam-viewport-wrap">
        {cameraState === 'error' ? (
          <div className="webcam-error-box">
            <AlertCircle size={36} className="error-icon" />
            <p className="error-title">Camera Unavailable</p>
            <p className="error-desc">{errorMessage}</p>
            <div className="error-actions">
              <button type="button" className="btn btn-secondary" onClick={startCamera}>
                <RefreshCw size={16} /> Try Again
              </button>
              <button type="button" className="btn btn-primary" onClick={onSkip}>
                Continue Without Webcam
              </button>
            </div>
          </div>
        ) : capturedImage ? (
          <div className="webcam-captured-preview">
            <img src={capturedImage} alt="Captured face frame" className="captured-img" />
            <div className="captured-badge">
              <Check size={14} /> Frame Captured for In-Memory Analysis
            </div>
          </div>
        ) : (
          <div className="webcam-live-box">
            <video
              ref={videoRef}
              playsInline
              muted
              className="webcam-video"
              style={{ transform: 'scaleX(-1)' }}
            />
            {cameraState === 'starting' && (
              <div className="webcam-loading-overlay">
                <RefreshCw size={24} className="spin-icon" />
                <span>Starting Camera Preview...</span>
              </div>
            )}
            <div className="face-guide-overlay">
              <div className="face-guide-oval"></div>
              <span className="face-guide-text">Position face inside oval</span>
            </div>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div className="webcam-controls">
        {capturedImage ? (
          <div className="controls-row">
            <button type="button" className="btn btn-secondary" onClick={handleRetake}>
              <RefreshCw size={16} /> Retake Photo
            </button>
          </div>
        ) : cameraState === 'active' ? (
          <div className="controls-row">
            <button type="button" className="btn btn-secondary" onClick={onSkip}>
              <Slash size={16} /> Skip Webcam
            </button>
            <button type="button" className="btn btn-primary capture-btn" onClick={handleCapture}>
              <Camera size={18} /> Capture Expression Frame
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
