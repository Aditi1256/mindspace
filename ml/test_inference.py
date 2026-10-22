import os
import sys
import time

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Ensure project root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


import cv2
import numpy as np
from ml.infer import EmotionInferenceService


def run_tests():
    print("--- Running ML Inference Pipeline Sanity Tests ---")
    service = EmotionInferenceService()

    # Create synthetic frame with a face-like oval and features
    canvas = np.ones((480, 640, 3), dtype=np.uint8) * 220
    # Draw face oval
    cv2.ellipse(canvas, (320, 240), (90, 120), 0, 0, 360, (180, 160, 150), -1)
    # Draw eyes
    cv2.circle(canvas, (285, 200), 14, (60, 40, 30), -1)
    cv2.circle(canvas, (355, 200), 14, (60, 40, 30), -1)
    # Draw smile
    cv2.ellipse(canvas, (320, 275), (45, 25), 0, 0, 180, (40, 30, 20), 4)

    # Encode to JPEG buffer in RAM
    success, buffer = cv2.imencode(".jpg", canvas)
    assert success, "Image encoding to buffer failed"
    img_bytes = buffer.tobytes()

    # Measure latency
    start_time = time.perf_counter()
    result = service.predict(img_bytes)
    latency_ms = (time.perf_counter() - start_time) * 1000

    print(f"\nInference execution latency: {latency_ms:.2f} ms (Target: p95 < 500 ms)")
    assert latency_ms < 500, f"Latency {latency_ms} ms exceeds 500 ms target"

    print("\nInference Output Dictionary:")
    for k, v in result.items():
        if k == "probabilities":
            print(f"  {k}:")
            for emo, p in v.items():
                print(f"    {emo:8s}: {p*100:5.2f}%")
        else:
            print(f"  {k}: {v}")

    # Verify PRD Contract
    assert "face_detected" in result
    assert "top_expression" in result
    assert "confidence" in result
    assert "probabilities" in result
    assert len(result["probabilities"]) == 7
    assert "model_version" in result
    assert "disclaimer" in result

    print("\n✅ All Phase 2 ML Pipeline verification checks passed successfully!")

if __name__ == "__main__":
    run_tests()
