import json


def get_json_template(problem_category, numMotions):
    if problem_category == "1D Kinematics":
        template = {}
        for i in range(1, numMotions + 1):
            prefix = f"{i}_"
            template.update({
                f"{prefix}color": "null",
                f"{prefix}initial_position": 0.0,
                f"{prefix}final_position": 0.0,
                f"{prefix}initial_velocity": 0.0,
                f"{prefix}final_velocity": 0.0,
                f"{prefix}acceleration": 0.0,
                f"{prefix}bounce_height": 0.0,
                f"{prefix}time": 0.0,
                f"{prefix}restitutionCoeff": 0.0,
            })
        return template
    templates = {
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
    return templates.get(problem_category, {})


def API_Content(problem_category, num_motions):
    if problem_category == "1D Kinematics":
        motion_template = """
        {prefix}color: "null"
        {prefix}initial_position: 0.0
        {prefix}final_position: 0.0
        {prefix}initial_velocity: 0.0
        {prefix}final_velocity: 0.0
        {prefix}acceleration: 0.0
        {prefix}bounce_height: 0.0
        {prefix}time: 1.0
        {prefix}restitutionCoeff: 0.0
        """
        content = "Use the variables exactly as shown below. Each set of variables is a motion phase, prefixed with '1_', '2_', etc. Fill out each variable exactly. If not given in the problem, set it to null. Use quotes for string values. Do not add or change variable names.\n\n Also if the restitutionCoeff is a percent change it to a decimal!!!"
        for i in range(1, int(num_motions) + 1):
            content += motion_template.format(prefix=f"{i}_") + "\n"
        return content

    templates = {
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
    return templates.get(problem_category, "")


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


def fill_template_from_raw(raw_data, problem_category, numMotions):
    template = get_json_template(problem_category, numMotions)
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


def getProblemType(problem_category):
    if problem_category == "1D Kinematics":
        content = (
            "Constant Acceleration Motion\n"
            "Free Fall and Vertical Projectile Motion\n"
            "Velocity-Time Graph Interpretation\n"
            "Position-Time Graph Interpretation\n"
            "Stopping and Starting Motion\n"
            "Relative Motion in 1D\n"
            "Motion with Piecewise Acceleration\n"
            "Instantaneous Velocity and Acceleration\n"
            "Displacement from Graphs"
        )
    else:
        content = "Problem category not recognized."

    return content
