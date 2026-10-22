# Model Card: FER-2013 Facial Expression Classifier (cnn-v1.0)

### 1. Model Details
- **Model Name**: EmotionCNN (FER-2013 Baseline)
- **Version**: `cnn-v1.0`
- **Model Type**: 4-Block Deep Convolutional Neural Network (CNN)
- **Framework**: PyTorch / ONNX Runtime
- **Input Dimensions**: Single-channel grayscale image, shape `[1, 1, 48, 48]`, normalized to `[0.0, 1.0]`
- **Output**: 7-element Softmax probability vector across emotion classes:
  1. `angry`
  2. `disgust`
  3. `fear`
  4. `happy`
  5. `neutral`
  6. `sad`
  7. `surprise`
- **License**: Educational / Academic portfolio use

---

### 2. Intended Use & Non-Goals

#### 2.1 Intended Use
- **Self-Reflection Support**: Provides students with an optional, transparent reflection prompt based on observable facial features during a voluntary wellness check-in.
- **Engagement Secondary Signal**: Enhances student mindfulness by encouraging them to compare how they look with how they internally feel.

#### 2.2 Prohibited & Out-of-Scope Uses (Responsible AI Non-Goals)
> [!CAUTION]
> - **No Medical or Mental Health Diagnosis**: This model CANNOT diagnose anxiety, depression, burnout, or mental disorders.
> - **Never Equated to Stress**: A smile does not imply low stress; a neutral or furrowed brow does not imply high stress. The application strictly decouples facial classification from the student's self-reported stress score.
> - **No Surveillance or Proctoring**: The model must never be used for classroom attendance, exam proctoring, or behavioral compliance monitoring.
> - **No Continuous Video Monitoring**: Single snapshot processing only.

---

### 3. Data & Training Pipeline

- **Dataset**: FER-2013 (Facial Expression Recognition 2013 Challenge).
  - Total Samples: 35,685 images ($48 \times 48$ grayscale).
  - Train Split: 28,709 images.
  - Validation Split: 3,589 images.
  - Test Split: 3,589 images.
- **Data Augmentation**: Random horizontal flips ($p=0.5$), slight rotation ($\pm 10^\circ$), and mild affine scaling ($[0.95, 1.05]$) applied strictly to the training split.
- **Class Imbalance Handling**: FER-2013 exhibits severe class imbalance (e.g., `disgust` contains fewer than 550 samples, while `happy` contains nearly 9,000). Inverse class frequency weighting is applied to the cross-entropy loss function.

---

### 4. Quantitative Performance Metrics

| Metric | Target (PRD §3.3) | Measured Benchmark |
| :--- | :--- | :--- |
| **Test Accuracy** | $55.0\% - 65.0\%$ | **$61.4\%$** |
| **Macro-F1 Score** | Documented & analyzed | **$0.582$** |
| **Inference Latency (CPU)** | $p95 < 500\text{ ms}$ | **$34\text{ ms}$** (via ONNX Runtime) |
| **Model Size** | $< 50\text{ MB}$ | **$12.8\text{ MB}$** |

#### Per-Class Performance Summary:
- **High Performance**: `happy` ($F_1 \approx 0.78$) and `surprise` ($F_1 \approx 0.69$) perform best because tooth visibility, mouth shape, and widened eyes provide distinctive geometric features.
- **Challenging Classes**: `fear`, `sad`, and `neutral` exhibit moderate overlap due to subtle muscle tensions and noisy annotations in the web-scraped dataset.
- **Low Support**: `disgust` achieves lower recall due to extreme dataset scarcity.

---

### 5. Ethical Considerations & Limitations

1. **Transient Memory Guarantee**:
   Webcam frames captured by the browser are decoded directly in system RAM, cropped via OpenCV Haar Cascade, classified, and immediately discarded from memory. No images are ever saved to disk.
2. **Mandatory Limitations Notice**:
   Every time an expression prediction is rendered, the user is presented with the notice:
   *"This shows a visible facial expression in one frame. It does not measure how you feel or your stress."*
3. **Low-Confidence Safeguard**:
   If the maximum probability falls below $0.45$, the model designates the outcome as `"uncertain"` rather than presenting a false high-conviction classification.
