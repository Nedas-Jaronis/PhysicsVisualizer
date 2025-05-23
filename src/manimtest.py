import os
import json
import numpy as np
from manim import *
from manim import config

# Configure render resolution
config.pixel_height = 1080
config.pixel_width = 1920
aspect_Ratio = config.pixel_width / config.pixel_height


class MyScene(Scene):
    def construct(self):
        # Load animation data from environment variable
        animation_data_str = os.getenv("ANIMATION_DATA", "{}")
        animation_data = json.loads(animation_data_str)

        print("Animation Data:", animation_data)  # Debugging

        phases = []
        for i in range(1, 10):  # Support up to 9 motion phases
            prefix = f"{i}_"
            if f"{prefix}initial_position" in animation_data and f"{prefix}final_position" in animation_data:
                initial_position = animation_data.get(
                    f"{prefix}initial_position", 0)
                final_position = animation_data.get(
                    f"{prefix}final_position", 0)
                acceleration = animation_data.get(
                    f"{prefix}acceleration", -9.8)
                raw_time = animation_data.get(f"{prefix}time")
                raw_color = animation_data.get(f"{prefix}color")
                if not raw_color or raw_color.lower() == "null":
                    color = WHITE
                else:
                    color = raw_color

                # Estimate time if missing or None
                if raw_time is None:
                    try:
                        displacement = abs(final_position - initial_position)
                        raw_time = (2 * displacement /
                                    abs(acceleration)) ** 0.5
                    except Exception as e:
                        print(f"Phase {i} time estimation error: {e}")
                        raw_time = 1.0

                time = raw_time + 3.0  # Add 3 seconds buffer per phase

                phase = {
                    "initial_position": initial_position,
                    "final_position": final_position,
                    "acceleration": acceleration,
                    "time": time,
                    "color": color
                }
                phases.append(phase)

        if not phases:
            raise ValueError("No valid motion phases found in animation data!")

        # Determine vertical range for camera framing
        y_positions = [p["initial_position"]
                       for p in phases] + [p["final_position"] for p in phases]
        max_y = max(y_positions)
        min_y = min(y_positions)
        buffer = 5  # Add buffer space top and bottom

        frame_height = (max_y - min_y) + buffer

        frame_width = frame_height * aspect_Ratio
        self.camera.frame_height = frame_height
        self.camera.frame_width = frame_width

        # Center camera vertically on average position
        center_y = (max_y + min_y) / 2
        self.camera.frame_center = np.array([0, center_y, 0])

        # Create the ball at starting position
        ball = Dot(point=[0, phases[0]["initial_position"], 0],
                   color=phases[0]["color"]).scale(5)
        self.add(ball)

        # Animate each phase
        for i, phase in enumerate(phases, start=1):
            print(
                f"Animating phase {i}: {phase['initial_position']} → {phase['final_position']} in {phase['time']}s")
            self.play(
                ball.animate.move_to(
                    [0, phase["final_position"], 0]).set_color(phase["color"]),
                run_time=phase["time"],
                rate_func=linear
            )
