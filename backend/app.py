from flask import Flask, request, jsonify
from flask_cors import CORS
import traceback
import math
from datetime import datetime
import baml_py

# Try to import GPT_API, but handle gracefully if it fails
try:
    import GPT_API
    GPT_API_AVAILABLE = True
    print("✅ GPT_API imported successfully")
except ImportError as e:
    print(f"⚠️ GPT_API import failed: {e}")
    print("📝 Server will run without GPT_API functionality")
    GPT_API = None
    GPT_API_AVAILABLE = False

app = Flask(__name__)
CORS(app)

# # Add startup logging
# print("="*50)
# print("🚀 FLASK SERVER STARTING...")
# print(f"📅 Timestamp: {datetime.now()}")
# print(f"🤖 GPT_API Available: {GPT_API_AVAILABLE}")
# print("="*50)


def fix_animation_data(animation_data, num_motions):
    """Fix and validate animation data before sending to frontend"""
    print(f"🔧 Fixing animation data for {num_motions} motions")
    if not animation_data:
        print("⚠️ No animation data provided, creating empty structure")
        animation_data = {}

    default_colors = ["RED", "BLUE", "GREEN", "YELLOW", "PURPLE", "ORANGE"]
    fixed_data = {}

    for i in range(1, int(num_motions) + 1):
        prefix = f"{i}_"

        # Get raw values with proper default handling
        color = animation_data.get(f"{i}_color")
        initial_pos = animation_data.get(f"{i}_initial_position", 0)
        final_pos = animation_data.get(f"{i}_final_position", 0)
        initial_vel = animation_data.get(f"{i}_initial_velocity", 0)
        final_vel = animation_data.get(f"{i}_final_velocity", 0)
        acceleration = animation_data.get(f"{i}_acceleration", 9.8)
        bounce_height = animation_data.get(f"{i}_bounce_height", 0)
        time_duration = animation_data.get(f"{i}_time", 1.0)

        # Convert to float only if not None, otherwise use defaults
        try:
            initial_pos = float(
                initial_pos) if initial_pos is not None else 0.0
            final_pos = float(final_pos) if final_pos is not None else 0.0
            initial_vel = float(
                initial_vel) if initial_vel is not None else 0.0
            final_vel = float(final_vel) if final_vel is not None else 0.0
            acceleration = float(
                acceleration) if acceleration is not None else 9.8
            bounce_height = float(
                bounce_height) if bounce_height is not None else 0.0
            time_duration = float(
                time_duration) if time_duration is not None else 1.0
        except (ValueError, TypeError) as e:
            print(f"⚠️ Warning: Error converting values for motion {i}: {e}")
            initial_pos = 0.0
            final_pos = 0.0
            initial_vel = 0.0
            final_vel = 0.0
            acceleration = 9.8
            bounce_height = 0.0
            time_duration = 1.0

        # Fix color - assign default if None
        if color is None or color == "None":
            color = default_colors[(i-1) % len(default_colors)]

        # Fix acceleration - make positive (gravity magnitude)
        if acceleration < 0:
            acceleration = abs(acceleration)

        # Calculate proper time duration based on physics
        if initial_pos > final_pos:  # Falling phase
            height_diff = initial_pos - final_pos
            if height_diff > 0:
                time_duration = math.sqrt(2 * height_diff / acceleration)
        elif final_pos > initial_pos:  # Rising phase (after bounce)
            height_diff = final_pos - initial_pos
            if height_diff > 0:
                time_duration = math.sqrt(2 * height_diff / acceleration)

        # Ensure minimum time
        time_duration = max(time_duration, 0.1)

        # Calculate proper velocities based on physics
        if initial_pos > final_pos:  # Falling
            initial_vel = 0 if i == 1 else abs(final_vel)
            final_vel = -math.sqrt(2 * acceleration *
                                   (initial_pos - final_pos))
        elif final_pos > initial_pos:  # Rising
            initial_vel = math.sqrt(
                2 * acceleration * (final_pos - initial_pos))
            final_vel = 0

        # Store fixed values
        fixed_data[f"{i}_color"] = color
        fixed_data[f"{i}_initial_position"] = initial_pos
        fixed_data[f"{i}_final_position"] = final_pos
        fixed_data[f"{i}_initial_velocity"] = initial_vel
        fixed_data[f"{i}_final_velocity"] = final_vel
        fixed_data[f"{i}_acceleration"] = acceleration
        fixed_data[f"{i}_bounce_height"] = bounce_height
        fixed_data[f"{i}_time"] = round(time_duration, 2)

    print(f"✅ Animation data fixed successfully")
    return fixed_data


# Enhanced logging middleware with error handling
@app.before_request
def log_request_info():
    try:
        print(f"\n📨 INCOMING REQUEST:")
        print(f"   Method: {request.method}")
        print(f"   URL: {request.url}")
        print(f"   Path: {request.path}")
        print(f"   Remote Address: {request.remote_addr}")

        user_agent = request.headers.get('User-Agent', 'Unknown')
        print(f"   User Agent: {user_agent[:50]}...")

        if request.method == 'POST' and request.is_json:
            try:
                json_data = request.get_json()
                print(f"   JSON Data: {json_data}")
            except Exception as e:
                print(f"   JSON Data: Failed to parse - {e}")

        print("-" * 30)
    except Exception as e:
        print(f"❌ Error in before_request: {e}")

    # Must return None to continue processing
    return None


@app.after_request
def log_response_info(response):
    try:
        print(f"📤 OUTGOING RESPONSE:")
        print(f"   Status: {response.status}")
        print(f"   Content Type: {response.content_type}")
        print("=" * 50)
    except Exception as e:
        print(f"❌ Error in after_request: {e}")

    # Must return the response object
    return response


# Add error handler
@app.errorhandler(Exception)
def handle_exception(e):
    print(f"❌ Unhandled exception: {e}")
    print(f"📋 Traceback: {traceback.format_exc()}")
    return jsonify({
        'error': 'Internal server error',
        'message': str(e)
    }), 500


@app.route('/api/health', methods=['GET'])
def health_check():
    """Simple health check endpoint"""
    print("🏥 HEALTH CHECK ENDPOINT HIT!")
    print(f"   Timestamp: {datetime.now()}")
    print(f"   Request came from: {request.remote_addr}")

    return jsonify({
        'status': 'healthy',
        'message': 'Backend is running',
        'timestamp': str(datetime.now()),
        'server_info': {
            'flask_version': '2.x',
            'python_version': '3.x',
            'port': 5000,
            'gpt_api_available': GPT_API_AVAILABLE
        }
    })


@app.route('/api/test', methods=['GET'])
def test_endpoint():
    """Even simpler test endpoint"""
    print("🧪 TEST ENDPOINT HIT!")
    return jsonify({
        'message': 'Test successful!',
        'time': str(datetime.now()),
        'gpt_api_available': GPT_API_AVAILABLE
    })


@app.route('/', methods=['GET'])
def root():
    """Root endpoint to verify server is running"""
    print("🏠 ROOT ENDPOINT HIT!")
    return jsonify({
        'message': 'Flask server is running!',
        'available_endpoints': [
            '/api/health',
            '/api/test',
            '/api/solve'
        ],
        'gpt_api_available': GPT_API_AVAILABLE
    })


@app.route('/api/solve', methods=['POST'])
def solve_problem():
    print("🔬 SOLVE ENDPOINT HIT!")

    try:
        # Check if GPT_API is available
        if not GPT_API_AVAILABLE:
            print("❌ GPT_API not available")
            return jsonify({
                'error': 'GPT_API module not available',
                'message': 'Please check if GPT_API.py exists and imports correctly'
            }), 503

        # Get request data
        if not request.is_json:
            print("❌ No JSON data in request")
            return jsonify({'error': 'Request must contain JSON data'}), 400

        data = request.get_json()
        if not data:
            print("❌ Empty JSON data")
            return jsonify({'error': 'Empty JSON data'}), 400

        problem = data.get('problem', '')
        if not problem:
            print("❌ No problem provided")
            return jsonify({'error': 'No problem provided in request'}), 400

        print(f"🤖 Processing problem: {problem}")

        # Generate physics solution
        try:
            solution, step_by_step, formulas, animation_data, num_motions = GPT_API.process_physics_response(
                problem)
            print(f"✅ GPT response received")
        except Exception as gpt_error:
            print(f"❌ GPT_API error: {gpt_error}")
            return jsonify({
                'error': 'GPT_API processing failed',
                'message': str(gpt_error),
                'traceback': traceback.format_exc()
            }), 500

        print(f"📊 Number of motions: {num_motions}")
        print(f"📊 Raw animation data type: {type(animation_data)}")

        # Check if animation_data is None or empty
        if not animation_data:
            print("⚠️ Warning: animation_data is None or empty")
            animation_data = {}

        # Fix animation data
        try:
            fixed_animation_data = fix_animation_data(
                animation_data, num_motions)
            print(f"✅ Animation data fixed")
        except Exception as fix_error:
            print(f"❌ Error fixing animation data: {fix_error}")
            fixed_animation_data = {}

        # Return response with fixed data
        response_data = {
            'solution': solution,
            'step_by_step': step_by_step,
            'formulas': formulas,
            'animation_data': fixed_animation_data,
            'num_motions': num_motions
        }

        print("✅ Sending successful response")
        return jsonify(response_data)

    except Exception as e:
        print(f"❌ Error in solve_problem: {e}")
        print(f"📋 Traceback: {traceback.format_exc()}")
        return jsonify({
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500


if __name__ == '__main__':
    print("\n🎯 Starting Flask development server...")
    print("🌐 Server will be available at:")
    print("   - http://localhost:5000")
    print("   - http://127.0.0.1:5000")
    print("\n🧪 Test endpoints:")
    print("   - GET  http://localhost:5000/")
    print("   - GET  http://localhost:5000/api/health")
    print("   - GET  http://localhost:5000/api/test")
    print("   - POST http://localhost:5000/api/solve")
    print("\n" + "="*50)

    try:
        app.run(debug=True, port=5000, host='0.0.0.0')
    except Exception as e:
        print(f"❌ Failed to start server: {e}")
        print(f"📋 Traceback: {traceback.format_exc()}")
