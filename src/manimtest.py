import os
import json
from manim import *


class MyScene(Scene):
    def construct(self):
        # Retrieve and parse the animation data from the environment variable
        animation_data_str = os.getenv("ANIMATION_DATA", "{}")
        animation_data = json.loads(animation_data_str)

        # Extract values with defaults to avoid errors if any data is missing
        initial_position = animation_data.get(
            "initial_position", 0)  # Default to 0 if not provided
        final_position = animation_data.get(
            "final_position", 0)      # Default to 0 if not provided
        # Default to 9.8 if not provided
        acceleration = animation_data.get("acceleration", 9.8)

        print("Animation Data:", animation_data)  # For debugging purposes

        # Make sure the positions are valid before using them
        if initial_position is None or final_position is None:
            raise ValueError("Initial and final positions must be provided!")

        # Create a ball at the initial position (in the Y direction)
        # X is 0, Y is the initial position
        ball = Dot(point=[0, initial_position, 0]).scale(5)

        self.add(ball)

        # Animate the ball based on the final position
        self.play(ball.animate.move_to([0, final_position, 0]), run_time=3)
