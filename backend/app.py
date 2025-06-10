from flask import Flask, request, jsonify
from flask_cors import CORS
import traceback
from datetime import datetime
import schemaDetect
from baml_client import b
import json
import re

app = Flask(__name__)
CORS(app)


def clean_and_parse_json(raw_data):
    """
    Clean and parse JSON data that might be wrapped in markdown code blocks
    """
    if isinstance(raw_data, dict):
        return raw_data

    if not isinstance(raw_data, str):
        return raw_data

    # Remove markdown code blocks if present
    cleaned_data = raw_data.strip()

    # Check if it starts with ```json and ends with ```
    if cleaned_data.startswith('```json') and cleaned_data.endswith('```'):
        # Extract JSON content between the code blocks
        json_content = cleaned_data[7:-3].strip()  # Remove ```json and ```
        try:
            return json.loads(json_content)
        except json.JSONDecodeError as e:
            print(f"❌ Failed to parse JSON content: {e}")
            return None

    # Check if it starts with ``` and ends with ```
    elif cleaned_data.startswith('```') and cleaned_data.endswith('```'):
        # Extract content between the code blocks
        json_content = cleaned_data[3:-3].strip()  # Remove ``` and ```
        try:
            return json.loads(json_content)
        except json.JSONDecodeError as e:
            print(f"❌ Failed to parse JSON content: {e}")
            return None

    # Try to parse as regular JSON
    else:
        try:
            return json.loads(cleaned_data)
        except json.JSONDecodeError as e:
            print(f"❌ Failed to parse as regular JSON: {e}")
            return None


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
            'baml_available': True
        }
    })


@app.route('/api/test', methods=['GET'])
def test_endpoint():
    """Even simpler test endpoint"""
    print("🧪 TEST ENDPOINT HIT!")
    return jsonify({
        'message': 'Test successful!',
        'time': str(datetime.now()),
        'baml_available': True
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
        'baml_available': True
    })


@app.route('/api/solve', methods=['POST'])
def solve_problem():
    print("🔬 SOLVE ENDPOINT HIT!")

    try:
        if not request.is_json:
            return jsonify({'error': 'Request must contain JSON data'}), 400

        data = request.get_json()
        problem = data.get('problem', '')
        if not problem:
            return jsonify({'error': 'No problem provided in request'}), 400

        print(f"🤖 Processing problem: {problem}")

        # Step 1: Extract animation data from problem
        try:
            print("🔍 Extracting animation data...")
            animation_data = b.Extract_animation_data(problem)
            animation_dict = animation_data.model_dump()
            print(f"✅ Animation data extracted: {animation_dict}")
        except Exception as e:
            print(f"❌ Animation data extraction failed: {e}")
            return jsonify({
                'error': 'Animation data extraction failed',
                'message': str(e)
            }), 500

        # Step 2: Load and process schemas
        try:
            print("📋 Loading schemas...")
            all_schemas = schemaDetect.load_all_schemas(animation_dict)
            print("✅ Schemas loaded successfully")
        except Exception as e:
            print(f"❌ Schema loading failed: {e}")
            return jsonify({
                'error': 'Schema loading failed',
                'message': str(e)
            }), 500

        # Step 3: Update animation data with problem-specific values
        try:
            print("🔄 Updating animation data with problem values...")
            json_string = json.dumps(all_schemas)
            updated_animation_data_raw = b.Update_Animation_Data(
                json_string, problem)

            print(f"Raw response from BAML: {updated_animation_data_raw}")
            print(f"Raw response type: {type(updated_animation_data_raw)}")

            # Since BAML returns a string, we need to parse it
            if isinstance(updated_animation_data_raw, str):
                # Use the improved parsing function to handle markdown-wrapped JSON
                updated_animation_data = clean_and_parse_json(
                    updated_animation_data_raw)

                if updated_animation_data is None:
                    print("❌ Failed to parse updated animation data, using fallback")
                    updated_animation_data = all_schemas
                else:
                    print("✅ Successfully parsed updated animation data from string")
                    print(f"Parsed data type: {type(updated_animation_data)}")
                    if isinstance(updated_animation_data, dict):
                        print(
                            f"Parsed data keys: {list(updated_animation_data.keys())}")
            else:
                # If it's already a dict, use it directly
                updated_animation_data = updated_animation_data_raw
                print("✅ Animation data was already in correct format")

        except Exception as e:
            print(f"❌ Animation data update failed: {e}")
            print(f"📋 Traceback: {traceback.format_exc()}")
            # Use fallback data
            updated_animation_data = all_schemas

        # Step 4: Extract problem data (solution steps, formulas, etc.)
        try:
            print("📝 Extracting problem solution data...")
            problem_data = b.Extract_ProblemData(problem)
            problem_dict = problem_data.model_dump()
            print("✅ Problem solution data extracted")
        except Exception as e:
            print(f"❌ Problem data extraction failed: {e}")
            return jsonify({
                'error': 'Problem data extraction failed',
                'message': str(e)
            }), 500

        # Ensure we have a proper dictionary for animation_data
        final_animation_data = updated_animation_data
        if not isinstance(final_animation_data, dict):
            print("❌ Final animation data is not a dict, using schemas fallback")
            final_animation_data = all_schemas

        # Return comprehensive response with animation_data as a direct JSON object
        response_data = {
            'status': 'success',
            # This should be a dict with forces, interactions, motions, objects
            'animation_data': final_animation_data,
            'problem_solution': problem_dict,
            'message': 'Problem processed successfully'
        }

        print(
            f"🎯 Final response animation_data keys: {list(final_animation_data.keys()) if isinstance(final_animation_data, dict) else 'Not a dict'}")

        return jsonify(response_data)

    except Exception as e:
        print(f"❌ Unexpected error in solve_problem: {e}")
        print(f"📋 Traceback: {traceback.format_exc()}")
        return jsonify({
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500


if __name__ == '__main__':
    try:
        print("🚀 Starting Flask server...")
        print("📡 BAML client integration enabled")
        app.run(debug=True, port=5000, host='0.0.0.0')
    except Exception as e:
        print(f"❌ Failed to start server: {e}")
        print(f"📋 Traceback: {traceback.format_exc()}")
