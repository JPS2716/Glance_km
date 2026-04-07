# Glance - Ship Detection in SAR Imagery

Glance is a full-stack AI-powered web application designed to detect ships in Synthetic Aperture Radar (SAR) satellite imagery. Using a trained YOLOv8 deep learning model, users can upload satellite images and receive immediate, high-accuracy ship detections mapped onto an interactive interface.

## 🚀 Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Visualizations**: Cobe (interactive 3D globe)
- **Database/Auth**: Supabase JS

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/)
- **Server**: Uvicorn
- **AI/ML**: PyTorch, Ultralytics (YOLOv8)
- **Image Processing**: OpenCV (headless)

---

## 📁 Repository Structure

- `/frontend` - The React application (Vite, Tailwind, TypeScript).
- `/backend` - The FastAPI server and machine learning integration.
- `Dockerfile` - Containerization for the backend environment.
- `requirements.txt` - Python dependencies for the backend.

---

## 💻 Local Workspace Setup

Follow the steps below to run both the backend server and the frontend application locally.

### 1. Backend Setup (FastAPI & YOLOv8)

The backend handles image uploads, runs them through the trained YOLOv8 model, and returns the visualization and detection coordinates.

**Prerequisites**: Python 3.9+

```bash
# Navigate to the root directory
cd Glance_km

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate

# Install the dependencies
pip install -r requirements.txt

# Run the FastAPI server
cd backend
uvicorn main:app --reload
