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
            "List me all these varaibles in this exact same formatting and fill in the value as needed if there is no value fill it with 'null' as the value, 'Initial Position: ', 'Final Position: ', 'Initial Velocity: ', 'Final Velocity: ', 'Acceleration: ', 'Time: '"
        }
    }
    return content.get(problem_type, {})
