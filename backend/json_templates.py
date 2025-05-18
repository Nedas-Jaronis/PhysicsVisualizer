import json


def get_json_template(problem_type):
    templates = {
        "1D Kinematics": {
            "initial_position": None,
            "final_position": None,
            "initial_velocity": None,
            "final_velocity": None,
            "acceleration": None,
            "time": None
        },
        "2D Kinematics": {
            "initial_position": {"x": None, "y": None},
            "final_position": {"x": None, "y": None},
            "initial_velocity": {"x": None, "y": None},
            "acceleration": {"x": None, "y": None},
            "time": None
        },
        "Forces and Newton's Laws": {
            "mass": None,
            "force": None,
            "acceleration": None
        },
        # Add other types similarly
    }
    return templates.get(problem_type, {})


def API_Content(problem_type):
    content = {
        "1D Kinematics": {
            '''Structure it like this, make sure to get all these values, just replace the numbers, if there is not a value for it then replace it with null. Only worry about the objects and nothing else
            
            initial_position: 2.0  
            final_position: 1.6  
            initial_velocity: 0  
            final_velocity: null  
            acceleration: 9.8  
            time: null
            
            ⚠️Do not change any names keep them as initial_position, final_position, initial_velocity, final_velocity, acceleration, and time.
            '''

        }
    }
    return content.get(problem_type, {})


def fill_template_from_raw(raw_data, template):
    # Convert the raw data to a dictionary
    # Create a copy to prevent modifying the original template
    filled_data = template.copy()

    # Split the raw data into lines
    lines = raw_data.strip().split("\n")

    # Iterate over each line to process the key-value pairs
    for line in lines:
        if ':' in line:
            # Split the line into key and value
            key, value = line.split(":", 1)
            # Clean up the key, make it consistent with the template
            key = key.strip().lower().replace(" ", "_")
            value = value.strip()  # Clean up the value

            # Handle "null" as Python None
            if value.lower() == 'null':
                value = None
            else:
                # Try to convert value to a number (float or int)
                try:
                    value = float(value)
                except ValueError:
                    # If conversion fails, keep the value as a string
                    pass

            # If the key exists in the template, update its value
            if key in filled_data:
                filled_data[key] = value

    return filled_data
