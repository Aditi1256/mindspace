"""
Face Preprocessor Module for Facial Expression Analysis.
Adheres strictly to PRD Section 11.2 & 11.3:
- In-memory processing only (never saves to disk).
- OpenCV Haar Cascade frontal face detection.
- Converts to 48x48 single-channel grayscale.
- Normalizes pixel values to [0.0, 1.0].
"""

import base64
import cv2
import numpy as np


class FacePreprocessor:
    def __init__(self):
        # Load OpenCV's pre-trained frontal face Haar cascade
        cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        self.face_cascade = cv2.CascadeClassifier(cascade_path)
        if self.face_cascade.empty():
            raise RuntimeError(f"Failed to load Haar Cascade from {cascade_path}")

    def decode_image(self, image_input) -> np.ndarray:
        """
        Decodes image bytes or base64 dataURL in memory without saving to disk.
        Returns a BGR numpy image array.
        """
        if isinstance(image_input, str):
            # Check for base64 data URL prefix (e.g. 'data:image/jpeg;base64,...')
            if ',' in image_input:
                image_input = image_input.split(',', 1)[1]
            image_bytes = base64.b64decode(image_input)
        elif isinstance(image_input, (bytes, bytearray)):
            image_bytes = bytes(image_input)
        elif isinstance(image_input, np.ndarray):
            return image_input
        else:
            raise ValueError(f"Unsupported image input type: {type(image_input)}")

        # Decode directly from memory buffer
        np_arr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        if img is None:
            raise ValueError("Could not decode image from provided memory buffer.")
        return img

    def preprocess_face(self, image_input, target_size=(48, 48), return_format="nchw"):
        """
        Detects primary face, crops with slight margin, converts to 48x48 grayscale,
        and normalizes intensities to [0.0, 1.0].

        Returns:
            dict: {
                "face_detected": bool,
                "processed_tensor": np.ndarray (normalized, shape [1, 1, 48, 48] if NCHW),
                "bounding_box": tuple (x, y, w, h) or None
            }
        """
        img = self.decode_image(image_input)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # Detect faces in frame
        faces = self.face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.15,
            minNeighbors=5,
            minSize=(60, 60),
            flags=cv2.CASCADE_SCALE_IMAGE
        )

        if len(faces) == 0:
            # Fallback: center crop if no face was cleanly separated by Haar cascade
            h, w = gray.shape
            side = min(h, w)
            top = (h - side) // 2
            left = (w - side) // 2
            face_roi = gray[top:top+side, left:left+side]
            face_detected = False
            bbox = None
        else:
            # Pick the largest detected face
            largest_face = max(faces, key=lambda f: f[2] * f[3])
            x, y, w, h = largest_face
            bbox = (int(x), int(y), int(w), int(h))

            # Add a slight 10% padding around the bounding box
            pad_h = int(0.10 * h)
            pad_w = int(0.10 * w)
            y1 = max(0, y - pad_h)
            y2 = min(gray.shape[0], y + h + pad_h)
            x1 = max(0, x - pad_w)
            x2 = min(gray.shape[1], x + w + pad_w)

            face_roi = gray[y1:y2, x1:x2]
            face_detected = True

        # Resize to FER-2013 standard 48x48
        resized = cv2.resize(face_roi, target_size, interpolation=cv2.INTER_AREA)

        # Normalize pixel values to range [0.0, 1.0]
        normalized = resized.astype(np.float32) / 255.0

        # Reshape according to requested format
        if return_format.lower() == "nchw":
            # [Batch=1, Channels=1, Height=48, Width=48]
            processed_tensor = normalized[np.newaxis, np.newaxis, :, :]
        else:
            # [Batch=1, Height=48, Width=48, Channels=1]
            processed_tensor = normalized[np.newaxis, :, :, np.newaxis]

        return {
            "face_detected": face_detected,
            "processed_tensor": processed_tensor,
            "bounding_box": bbox,
            "original_shape": (img.shape[0], img.shape[1])
        }
