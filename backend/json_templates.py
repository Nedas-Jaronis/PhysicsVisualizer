import json


def get_json_template(problem_type):
    templates = {
        "1D Kinematics": {
            "initial_position": None,
            "final_position": None,
            "initial_velocity": None,
            "final_velocity": None,
            "acceleration": None,
            "bounce_height": None,
            "elasticity": None,
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
    templates = {
        "1D Kinematics": """
            color: null
            initial_position: null
            final_position: null
            initial_velocity: null
            final_velocity: null
            acceleration: null
            bounce_height: null
            time: null
            """,
        "2D Kinematics": """
            initial_position: {"x": null, "y": null}
            final_position: {"x": null, "y": null}
            initial_velocity: {"x": null, "y": null}
            acceleration: {"x": null, "y": null}
            time: null
            """,
        "Forces and Newton's Laws": """
            mass: null
            force: null
            acceleration: null
        """
    }
    return templates.get(problem_type, "")


def clean_key(key):
    key = key.strip().lower().replace(" ", "_")
    if key.startswith('"') and key.endswith('"'):
        key = key[1:-1]
    return key


def clean_value(value):
    value = value.strip()
    # Remove trailing commas
    if value.endswith(','):
        value = value[:-1].strip()

    # Remove wrapping quotes if any
    if (value.startswith('"') and value.endswith('"')) or (value.startswith("'") and value.endswith("'")):
        value = value[1:-1]

    if value.lower() == 'null':
        return None

    # Try to convert to float if possible
    try:
        return float(value)
    except ValueError:
        return value


def fill_template_from_raw(raw_data, problem_type):
    template = get_json_template(problem_type)
    filled_data = template.copy()

    lines = raw_data.strip().split("\n")

    for line in lines:
        if ':' not in line:
            continue

        key_part, value_part = line.split(":", 1)
        key = clean_key(key_part)
        value = clean_value(value_part)

        # Handle nested dicts for 2D Kinematics (if value looks like a dict)
        if isinstance(filled_data.get(key), dict) and isinstance(value, str):
            try:
                nested_data = json.loads(value.replace("'", "\""))
                if isinstance(nested_data, dict):
                    filled_data[key].update(nested_data)
                    continue  # processed nested dict, skip simple assignment
            except json.JSONDecodeError:
                pass

        filled_data[key] = value

    return filled_data
