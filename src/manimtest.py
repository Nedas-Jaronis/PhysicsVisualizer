import os
import json
import numpy as np
from manim import *

# Configure render resolution
config.pixel_height = 1080
config.pixel_width = 1920

COLOR_MAP = {
    "RED": RED,
    "GREEN": GREEN,
    "BLUE": BLUE,
    "YELLOW": YELLOW,
    "WHITE": WHITE,
    "BLACK": BLACK,
    "PURPLE": PURPLE,
    "ORANGE": ORANGE,
    "PINK": PINK,
    "TEAL": TEAL,
}


class MyScene(ThreeDScene):
    def construct(self):
        # Load animation data from environment variable
        animation_data_str = os.getenv("ANIMATION_DATA", "{}")
        animation_data = json.loads(animation_data_str)

        motion_data_str = os.getenv("NUM_MOTIONS", "0")
        motion_count = int(motion_data_str)

        motions = []
        for i in range(1, motion_count + 1):
            prefix = f"{i}_"
            phase_data = {}
            for key, value in animation_data.items():
                if key.startswith(prefix):
                    clean_key = key[len(prefix):]
                    phase_data[clean_key] = value
            motions.append(phase_data)

        # Add floor (XY plane, Z=0)
        floor = Square(side_length=6, fill_color=GRAY, fill_opacity=0.5)
        # No rotation needed; Square is already in XY plane in ThreeDScene
        floor.move_to(np.array([0, 0, 0]))
        self.add(floor)

        # Set camera orientation for clear vertical view
        self.set_camera_orientation(
            phi=70 * DEGREES, theta=-45 * DEGREES)

        # Create ball
        ball = Sphere(radius=0.5, color=WHITE)
        self.add(ball)

        # Parameters for bounce simulation
        gravity = -9.8

        for phase in motions:
            self.move_camera(focal_distance=500)
            # Set ball color
            color_str = phase.get("color")
            if isinstance(color_str, str):
                color = COLOR_MAP.get(color_str.upper(), WHITE)
            else:
                color = WHITE
            ball.set_color(color)

            # Get parameters with defaults
            z0 = phase.get("initial_position", 0.0)  # Changed to z0
            v0 = phase.get("initial_velocity", 0.0)
            a = phase.get("acceleration", gravity)
            if a == 0:
                a = gravity
            duration = phase.get("time", 1.0)
            if duration <= 0:
                duration = 1.0
            bounce_height = phase.get("bounce_height", 0.0)

            # Place ball at initial position (Z-coordinate for height)
            ball.move_to(np.array([0, 0, z0]))

            t = ValueTracker(0)

            def update_ball(mob):
                current_t = t.get_value()
                # Calculate vertical position (Z-axis) with kinematics
                z = z0 + v0 * current_t + 0.5 * a * current_t**2
                # Don't let the ball go below z=0 (the ground)
                if z < 0:
                    z = 0
                mob.move_to(np.array([0, 0, z]))

            ball.add_updater(update_ball)

            # Animate t from 0 to duration
            self.play(t.animate.set_value(duration),
                      run_time=duration, rate_func=linear)

            ball.remove_updater(update_ball)
            self.wait(0.3)

            # Prepare for next bounce
            if bounce_height > 0:
                # Calculate new initial velocity for bounce
                v_bounce = np.sqrt(2 * abs(a) * bounce_height)
                z0 = 0
                v0 = v_bounce
                duration = 2 * v_bounce / abs(a)
                if duration <= 0:
                    duration = 1.0

                # Move ball to ground before next bounce
                ball.move_to(np.array([0, 0, z0]))
                t = ValueTracker(0)

                def update_ball(mob):
                    t_val = t.get_value()
                    z = z0 + v0 * t_val + 0.5 * a * t_val**2
                    pos = np.array([0, 0, z])
                    print(f"At time {t_val:.2f}, position: {pos}")
                    mob.move_to(pos)

                ball.add_updater(update_ball)
                self.play(t.animate.set_value(duration),
                          run_time=duration, rate_func=linear)
                ball.remove_updater(update_ball)
                self.wait(0.3)
