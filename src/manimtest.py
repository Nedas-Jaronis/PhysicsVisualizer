import os
import json
from manim import *
from manim import config

# Configure render resolution
config.pixel_height = 1080
config.pixel_width = 1920


class MyScene(Scene):
    def construct(self):
        # Load animation data from environment
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
                color = animation_data.get(f"{prefix}color") or WHITE

                # Estimate time if missing or None
                if raw_time is None:
                    try:
                        displacement = abs(final_position - initial_position)
                        raw_time = (2 * displacement /
                                    abs(acceleration)) ** 0.5
                    except Exception as e:
                        print(f"Phase {i} time estimation error: {e}")
                        raw_time = 1.0

                time = raw_time + 3.0  # Add 3 seconds to each phase

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

        # Create the ball
        ball = Dot(point=[0, phases[0]["initial_position"], 0],
                   color=phases[0]["color"]).scale(5)
        self.add(ball)

        # Animate each phase
        for i, phase in enumerate(phases, start=1):
            print(
                f"Animating phase {i}: {phase['initial_position']} → {phase['final_position']} in {phase['time']}s")
            self.play(
                ball.animate.move_to([0, phase["final_position"], 0]),
                run_time=phase["time"],
                rate_func=linear
            )
