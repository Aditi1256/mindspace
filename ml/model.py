"""
Custom 4-Block CNN Architecture for FER-2013 Facial Expression Recognition.
Adheres strictly to PRD Section 11.2:
- 4 Convolutional blocks (Conv2D -> BatchNorm -> ReLU -> MaxPool -> Dropout)
- Fully connected Dense projection with Dropout
- Softmax output over 7 emotion classes
"""

EMOTION_CLASSES = [
    "angry",
    "disgust",
    "fear",
    "happy",
    "neutral",
    "sad",
    "surprise"
]

try:
    import torch
    import torch.nn as nn
    import torch.nn.functional as F

    class EmotionCNN(nn.Module):
        def __init__(self, num_classes=7):
            super().__init__()
            # Block 1: Input (1, 48, 48) -> (32, 24, 24)
            self.block1 = nn.Sequential(
                nn.Conv2d(1, 32, kernel_size=3, padding=1),
                nn.BatchNorm2d(32),
                nn.ReLU(inplace=True),
                nn.Conv2d(32, 32, kernel_size=3, padding=1),
                nn.BatchNorm2d(32),
                nn.ReLU(inplace=True),
                nn.MaxPool2d(2, 2),
                nn.Dropout2d(0.20)
            )

            # Block 2: (32, 24, 24) -> (64, 12, 12)
            self.block2 = nn.Sequential(
                nn.Conv2d(32, 64, kernel_size=3, padding=1),
                nn.BatchNorm2d(64),
                nn.ReLU(inplace=True),
                nn.Conv2d(64, 64, kernel_size=3, padding=1),
                nn.BatchNorm2d(64),
                nn.ReLU(inplace=True),
                nn.MaxPool2d(2, 2),
                nn.Dropout2d(0.25)
            )

            # Block 3: (64, 12, 12) -> (128, 6, 6)
            self.block3 = nn.Sequential(
                nn.Conv2d(64, 128, kernel_size=3, padding=1),
                nn.BatchNorm2d(128),
                nn.ReLU(inplace=True),
                nn.Conv2d(128, 128, kernel_size=3, padding=1),
                nn.BatchNorm2d(128),
                nn.ReLU(inplace=True),
                nn.MaxPool2d(2, 2),
                nn.Dropout2d(0.25)
            )

            # Block 4: (128, 6, 6) -> (256, 3, 3)
            self.block4 = nn.Sequential(
                nn.Conv2d(128, 256, kernel_size=3, padding=1),
                nn.BatchNorm2d(256),
                nn.ReLU(inplace=True),
                nn.MaxPool2d(2, 2),
                nn.Dropout2d(0.30)
            )

            # Dense Classification Head: 256 * 3 * 3 = 2304
            self.classifier = nn.Sequential(
                nn.Flatten(),
                nn.Linear(256 * 3 * 3, 256),
                nn.BatchNorm1d(256),
                nn.ReLU(inplace=True),
                nn.Dropout(0.50),
                nn.Linear(256, num_classes)
            )

        def forward(self, x):
            x = self.block1(x)
            x = self.block2(x)
            x = self.block3(x)
            x = self.block4(x)
            logits = self.classifier(x)
            return logits

        def predict_probabilities(self, x):
            self.eval()
            with torch.no_grad():
                logits = self.forward(x)
                probs = F.softmax(logits, dim=1)
            return probs

except ImportError:
    # Fallback placeholder definition if PyTorch is not yet in path
    EmotionCNN = None
