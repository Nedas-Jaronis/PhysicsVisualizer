from flask import Flask, request, jsonify
from flask_cors import CORS
import GPT_API  # Make sure this matches your file name
import traceback

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes


@app.route('/api/solve', methods=['POST'])
def solve_problem():
    data = request.json
    problem = data.get('problem', '')

    if not problem:
        return jsonify({'error': 'No problem provided'}), 400

    try:
        print(f"Processing problem: {problem[:50]}...")
        # GPT_API.process_physics_response returns solution, step_by_step, formulas
        solution, step_by_step, formulas = GPT_API.process_physics_response(
            problem)
        print("Solution generated successfully")

        return jsonify({
            'solution': solution,
            # Changed from problem_and_step_by_step to step_by_step
            'step_by_step': step_by_step,
            'formulas': formulas
        })
    except Exception as e:
        error_traceback = traceback.format_exc()
        print(f"Error processing problem: {str(e)}")
        print(error_traceback)
        return jsonify({
            'error': str(e),
            'traceback': error_traceback
        }), 500


@app.route('/api/test', methods=['GET'])
def test_api():
    return jsonify({'status': 'API is working'})


if __name__ == '__main__':
    print("Starting Flask server...")
    app.run(debug=True, port=5000)
