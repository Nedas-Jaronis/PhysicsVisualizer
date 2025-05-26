import numpy as np
from manim import *
from manim import config

config.pixel_height = 1080
config.pixel_width = 1920
aspect_Ratio = config.pixel_width / config.pixel_height


class MyScene(Scene):
    def construct(self):
        g = 9.8  # gravity
        h0 = 10  # initial height
        bounces = 3
        decay = 0.6  # each bounce loses this fraction of height

        # Compute bounce times and heights
        times = []
        heights = [h0]
        total_time = 0
        for i in range(bounces):
            t = np.sqrt(2 * heights[i] / g)
            times.append((total_time, total_time + 2 * t))  # up and down
            total_time += 2 * t
            heights.append(heights[i] * decay)

        # Tracker for time
        time_tracker = ValueTracker(0)

        # Function to get position at given time
        def get_position(t):
            for i, (start_t, end_t) in enumerate(times):
                if start_t <= t <= end_t:
                    bounce_time = t - start_t
                    h = heights[i]
                    t_half = (end_t - start_t) / 2
                    if bounce_time <= t_half:
                        # Going up: v = sqrt(2gh), y = vt - 0.5gt^2
                        v0 = np.sqrt(2 * g * h)
                        return h - (v0 * bounce_time - 0.5 * g * bounce_time**2)
                    else:
                        # Falling down
                        t_fall = bounce_time - t_half
                        return 0.5 * g * t_fall**2
            return 0  # after all bounces

        # Create ball
        ball = Dot(point=[0, h0, 0], color=YELLOW).scale(5)

        # Update ball position continuously
        ball.add_updater(lambda m: m.move_to(
            [0, get_position(time_tracker.get_value()), 0]))
        self.add(ball)

        # Add label that follows ball
        label = always_redraw(lambda: Text(
            f"Time: {time_tracker.get_value():.2f}s",
            font_size=36
        ).next_to(ball, RIGHT))
        self.add(label)

        # Animate the time tracker in ONE smooth motion
        self.play(time_tracker.animate.set_value(total_time),
                  run_time=total_time, rate_func=linear)

        # Clean up
        ball.clear_updaters()
