# Ship Detection in SAR Imagery - User Guide

## What We Built

We trained a **YOLOv8n (nano) deep learning model** to detect ships in Synthetic Aperture Radar (SAR) satellite imagery. The model was trained in Google Colab using a SSDD dataset with labeled ship locations.

## Model Performance

Our model achieves excellent detection accuracy:

| Dataset | mAP@50 | mAP@50-95 | Precision | Recall |
|---------|--------|-----------|-----------|--------|
| **Overall Test** | 97.00% | 72.74% | 95.76% | 94.14% |
| **Inshore Waters** | 91.91% | 67.36% | 90.13% | 84.91% |
| **Offshore Waters** | 98.95% | 75.22% | 97.87% | 98.06% |

**What this means:**
- **mAP@50**: 97% accuracy at detecting ships correctly
- **Precision**: 95.76% of detected objects are actually ships (low false positives)
- **Recall**: 94.14% of ships are found (low false negatives)
- **Best at**: Offshore ship detection (98.95% accuracy)

## How to Use

1. **Open the notebook** in Google Colab
2. **Update Cell 1** with your SAR image dataset path
3. **Run all cells** - pre-trained weights download automatically
4. **Get results** with detected ships marked with confidence scores
5. **Download outputs** with ship locations and bounding boxes

## Performance by Region

- **Offshore ships**: Detected with 98.95% accuracy (near-perfect)
- **Inshore ships**: Detected with 91.91% accuracy (excellent for coastal waters)
- Works best on clear, high-resolution SAR imagery