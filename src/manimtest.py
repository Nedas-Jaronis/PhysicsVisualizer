import os
import json
from manim import *


class MyScene(Scene):
    def construct(self):
        animation_data_str = os.getenv("ANIMATION_DATA", "{}")
        animation_data = json.loads(animation_data_str)
        print("Animation data:", animation_data)
        # This print helps debug whether the scene got the data properly.

        # Example: if data has a ball object, create and animate it
        for obj in animation_data.get("objects", []):
            if obj["type"] == "ball":
                start = obj["start_pos"]
                end = obj["end_pos"]
                duration = obj.get("duration", 2)

                ball = Dot(point=[start[0], start[1], 0])
                self.add(ball)

                # Animate the ball moving from start to end
                self.play(ball.animate.move_to(
                    [end[0], end[1], 0]), run_time=duration)
