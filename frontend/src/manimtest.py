import os
import json
import numpy as np
from manim import *

# Configure render resolution
config.pixel_height = 1080
config.pixel_width = 1920
config.frame_rate = 30
config.background_color = BLACK

# Map color names to Manim color constants
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

        # Determine the number of motion phases
        motion_count = int(os.getenv("NUM_MOTIONS", "0"))

        # Parse motion phases
        motions = []
        for i in range(1, motion_count + 1):
            prefix = f"{i}_"
            phase_data = {}
            for key, value in animation_data.items():
                if key.startswith(prefix):
                    clean_key = key[len(prefix):]
                    phase_data[clean_key] = value
            motions.append(phase_data)

        # Create the floor
        floor = Rectangle(width=8, height=8, fill_color=GRAY,
                          fill_opacity=0.5, stroke_width=1)
        floor.move_to([0, 0, 0])
        self.add(floor)
        self.set_camera_orientation(
            phi=70 * DEGREES, theta=-60 * DEGREES, distance=15)

        # Create the ball
        ball = Sphere(radius=0.3, resolution=(24, 24), color=RED)
        self.add(ball)

        # Create labels and numeric displays with absolute positions
        height_label = Text("Height:", font="Consolas",
                            font_size=24, color=WHITE).move_to([3, 3, 0])
        height_number = Text("0.00", font="Consolas",
                             font_size=24, color=WHITE).move_to([4, 3, 0])
        velocity_label = Text("Velocity:", font="Consolas",
                              font_size=24, color=WHITE).move_to([3, 2.5, 0])
        velocity_number = Text("0.00", font="Consolas",
                               font_size=24, color=WHITE).move_to([4, 2.5, 0])

        # Add to scene and fix in frame
        self.add(height_label, height_number, velocity_label, velocity_number)
        self.add_fixed_in_frame_mobjects(
            height_label, height_number, velocity_label, velocity_number)

        # Time tracker for animation
        time_tracker = ValueTracker(0)

        # Function to update ball position
        def update_ball(mob):
            t = time_tracker.get_value()
            z = displacement(t)
            mob.move_to([0, 0, z])

        # Function to update text displays
        def update_texts(mob):
            t = time_tracker.get_value()
            h = displacement(t)
            v = velocity(t)
            height_number.become(Text(f"{h:.2f}", font="Consolas",
                                      font_size=24, color=WHITE).move_to([4, 3, 0]))
            velocity_number.become(Text(f"{v:.2f}", font="Consolas",
                                        font_size=24, color=WHITE).move_to([4, 2.5, 0]))

        # Initialize physics parameters
        gravity = 9.8
        phases = []
        total_time = 0

        for phase in motions:
            # Set ball color
            color_str = phase.get("color", "WHITE")
            color = COLOR_MAP.get(color_str.upper(), WHITE)
            ball.set_color(color)

            # Get parameters with defaults
            z0 = float(phase.get("initial_position", 0.0))
            v0 = float(phase.get("initial_velocity", 0.0))
            a = float(phase.get("acceleration", gravity))
            duration = float(phase.get("time", 1.0))
            if duration <= 0:
                duration = 1.0

            # Append phase data
            phases.append({
                't_start': total_time,
                't_duration': duration,
                'z0': z0,
                'v0': v0,
                'a': a,
                't_end': total_time + duration
            })
            total_time += duration

        # Define displacement and velocity functions
        def displacement(t):
            t = float(t)
            for phase in phases:
                if phase['t_start'] <= t <= phase['t_end']:
                    t_phase = t - phase['t_start']
                    z = phase['z0'] + phase['v0'] * \
                        t_phase - 0.5 * phase['a'] * t_phase**2
                    return max(z, 0)
            return 0.0

        def velocity(t):
            t = float(t)
            for phase in phases:
                if phase['t_start'] <= t <= phase['t_end']:
                    t_phase = t - phase['t_start']
                    return phase['v0'] - phase['a'] * t_phase
            return 0.0

        # Add updaters
        ball.add_updater(update_ball)
        self.add_updater(update_texts)

        # Animate over total duration
        self.play(time_tracker.animate.set_value(total_time),
                  run_time=total_time, rate_func=linear)

        # Clean up
        ball.remove_updater(update_ball)
        self.remove_updater(update_texts)
        self.wait(1)
