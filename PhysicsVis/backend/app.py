from flask import Flask, request, jsonify
from flask_cors import CORS
import GPT_API
import traceback
import subprocess
import os
import shutil

app = Flask(__name__)
CORS(app)

# Paths
BASE_DIR = os.path.dirname(__file__)
MANIM_SCRIPT_PATH = os.path.abspath(
    os.path.join(BASE_DIR, "../src/manimtest.py"))

# Manim generates to its default output
MANIM_OUTPUT_PATH = os.path.abspath(os.path.join(
    BASE_DIR, "../media/videos/manimtest/480p15/MyScene.mp4"))

# Final public-facing location for React (in public folder)
FRONTEND_VIDEO_PATH = os.path.abspath(os.path.join(
    BASE_DIR, "../public/media/videos/manimtest/MyScene.mp4"))

# Make sure the public/video path exists
os.makedirs(os.path.dirname(FRONTEND_VIDEO_PATH), exist_ok=True)


@app.route('/api/solve', methods=['POST'])
def solve_problem():
    data = request.json
    problem = data.get('problem', '')

    if not problem:
        return jsonify({'error': 'No problem provided'}), 400

    try:
        # 1. Generate physics solution
        solution, step_by_step, formulas = GPT_API.process_physics_response(
            problem)
        print("✔ GPT solution generated")

        # 2. Run Manim to generate animation
        subprocess.run(
            ["python", "-m", "manim", MANIM_SCRIPT_PATH, "MyScene", "-ql"],
            check=True
        )
        print("✔ Manim video rendered")

        # 3. Move the video to React public folder
        if os.path.exists(MANIM_OUTPUT_PATH):
            shutil.move(MANIM_OUTPUT_PATH, FRONTEND_VIDEO_PATH)
            print("✔ Video moved to frontend/public")
        else:
            print("⚠ Video not found at expected location:", MANIM_OUTPUT_PATH)

        # 4. Return response
        return jsonify({
            'solution': solution,
            'step_by_step': step_by_step,
            'formulas': formulas,
            'video_path': '/media/videos/manimtest/MyScene.mp4'
        })

    except Exception as e:
        print("❌ Error:", e)
        return jsonify({
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)
