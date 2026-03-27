import os
import shutil
import time
import uuid
from pathlib import Path

from fastapi import FastAPI, File, HTTPException, Query, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from ultralytics import YOLO


BASE_DIR = Path(__file__).resolve().parents[1]
MODEL_DIR = BASE_DIR / "model_weights"
DEFAULT_MODEL_PATH = MODEL_DIR / "ssdd_yolov8n_best.pt"
UPLOADS_DIR = BASE_DIR / "backend" / "uploads"
OUTPUTS_DIR = BASE_DIR / "backend" / "outputs"

UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
OUTPUTS_DIR.mkdir(parents=True, exist_ok=True)


def resolve_model_path() -> Path:
    env_model = os.getenv("YOLO_MODEL_PATH")
    if env_model:
        candidate = Path(env_model).expanduser()
        if not candidate.is_absolute():
            candidate = (BASE_DIR / candidate).resolve()
        if candidate.exists():
            return candidate

    if DEFAULT_MODEL_PATH.exists():
        return DEFAULT_MODEL_PATH

    if MODEL_DIR.exists():
        pt_files = sorted(MODEL_DIR.glob("*.pt"))
        if pt_files:
            return pt_files[0]

    fallback = sorted(BASE_DIR.rglob("*.pt"))
    if fallback:
        return fallback[0]

    raise FileNotFoundError(
        "No .pt model found. Place your weights inside 'model_weights/' "
        "or set YOLO_MODEL_PATH."
    )


try:
    MODEL_PATH = resolve_model_path()
    MODEL = YOLO(str(MODEL_PATH))
except Exception as exc:
    MODEL_PATH = None
    MODEL = None
    MODEL_LOAD_ERROR = str(exc)
else:
    MODEL_LOAD_ERROR = None


app = FastAPI(title="Glance YOLO Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/outputs", StaticFiles(directory=str(OUTPUTS_DIR)), name="outputs")


def ensure_model_loaded() -> YOLO:
    if MODEL is None:
        raise HTTPException(
            status_code=500,
            detail=f"Model is not loaded: {MODEL_LOAD_ERROR}",
        )
    return MODEL


@app.get("/health")
def health():
    return {
        "status": "ok",
        "model_loaded": MODEL is not None,
        "model_path": str(MODEL_PATH) if MODEL_PATH else None,
        "model_error": MODEL_LOAD_ERROR,
    }


@app.post("/detect/image")
async def detect_image(
    request: Request,
    file: UploadFile = File(...),
    conf: float = Query(0.25, ge=0.0, le=1.0),
):
    model = ensure_model_loaded()

    ext = Path(file.filename or "image.jpg").suffix or ".jpg"
    input_name = f"{uuid.uuid4().hex}{ext}"
    input_path = UPLOADS_DIR / input_name

    with input_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    run_id = uuid.uuid4().hex
    run_dir = OUTPUTS_DIR / f"predict_{run_id}"

    try:
        t0 = time.perf_counter()
        results = model.predict(
            source=str(input_path),
            conf=conf,
            save=True,
            project=str(OUTPUTS_DIR),
            name=f"predict_{run_id}",
            exist_ok=True,
            verbose=False,
        )
        inference_time = round(time.perf_counter() - t0, 4)
    finally:
        # Do not retain user uploads on disk after processing.
        if input_path.exists():
            input_path.unlink()

    if not run_dir.exists() or not run_dir.is_dir():
        raise HTTPException(status_code=500, detail="Processed output directory not found.")

    output_image = None
    for candidate in run_dir.iterdir():
        if candidate.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}:
            output_image = candidate
            break

    if output_image is None:
        raise HTTPException(status_code=500, detail="Processed image not found.")

    assert output_image is not None
    detections = int(len(results[0].boxes)) if results[0].boxes is not None else 0
    rel_path = output_image.relative_to(OUTPUTS_DIR).as_posix()

    return {
        "output_url": str(request.url_for("outputs", path=rel_path)),
        "inference_time_s": inference_time,
        "total_detections": detections,
    }


@app.post("/detect/video")
async def detect_video(
    request: Request,
    file: UploadFile = File(...),
    conf: float = Query(0.25, ge=0.0, le=1.0),
):
    model = ensure_model_loaded()

    ext = Path(file.filename or "video.mp4").suffix or ".mp4"
    input_name = f"{uuid.uuid4().hex}{ext}"
    input_path = UPLOADS_DIR / input_name

    with input_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    run_id = uuid.uuid4().hex
    run_dir = OUTPUTS_DIR / f"predict_{run_id}"

    try:
        t0 = time.perf_counter()
        results = model.predict(
            source=str(input_path),
            conf=conf,
            save=True,
            project=str(OUTPUTS_DIR),
            name=f"predict_{run_id}",
            exist_ok=True,
            verbose=False,
        )
        inference_time = round(time.perf_counter() - t0, 4)
    finally:
        # Do not retain user uploads on disk after processing.
        if input_path.exists():
            input_path.unlink()

    if not run_dir.exists() or not run_dir.is_dir():
        raise HTTPException(status_code=500, detail="Processed output directory not found.")

    output_video = None
    for candidate in run_dir.iterdir():
        if candidate.suffix.lower() in {".mp4", ".avi", ".mov", ".mkv"}:
            output_video = candidate
            break

    if output_video is None:
        raise HTTPException(status_code=500, detail="Processed video not found.")

    total_detections: int = 0
    for r in results:
        if r.boxes is not None:
            total_detections = total_detections + int(len(r.boxes))

    assert output_video is not None
    rel_path = output_video.relative_to(OUTPUTS_DIR).as_posix()
    return {
        "output_url": str(request.url_for("outputs", path=rel_path)),
        "inference_time_s": inference_time,
        "total_detections": total_detections,
        "total_frames": len(results),
    }
