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

        # Create floor (XY plane, Z=0)
        floor = Rectangle(
            width=8,
            height=8,
            fill_color=GRAY,
            fill_opacity=0.5,
            stroke_width=1
        )

        floor.move_to(ORIGIN)
        self.add(floor)

        # Set camera orientation for clear vertical view
        self.set_camera_orientation(
            phi=70 * DEGREES,  # Angle from vertical
            theta=-45 * DEGREES,  # Rotation around vertical axis
            distance=10  # Adjusted to keep ball in frame
        )

        # Create ball
        ball = Sphere(radius=0.5, resolution=(24, 24))
        self.add(ball)

        # Create text objects for height and velocity
        height_text = Text("Height: 0.0 m", font_size=24, color=WHITE)
        velocity_text = Text("Velocity: 0.0 m/s", font_size=24, color=WHITE)

        # Position text relative to ball
        height_text.next_to(ball, RIGHT + UP, buff=0.5)
        velocity_text.next_to(height_text, DOWN, buff=0.2)

        self.add(height_text, velocity_text)

        # Parameters for bounce simulation
        gravity = 9.8

        for phase in motions:
            # Set ball color
            color_str = phase.get("color")
            if isinstance(color_str, str) and color_str.upper() in COLOR_MAP:
                color = COLOR_MAP[color_str.upper()]
            else:
                color = WHITE
            ball.set_color(color)

            # Get parameters with defaults
            z0 = float(phase.get("initial_position", 0.0))
            v0 = float(phase.get("initial_velocity", 0.0))
            a = float(phase.get("acceleration", gravity))
            if a == 0:
                a = gravity
            duration = float(phase.get("time", 1.0))
            if duration <= 0:
                duration = 1.0
            bounce_height = float(phase.get("bounce_height", 0.0))

            # Place ball at initial position (Z-coordinate for height)
            ball.move_to(np.array([0, 0, z0]))

            # Create a smooth path for the ball to follow
            def position_function(t):
                # Calculate height using physics equation
                z = z0 + v0 * t - 0.5 * a * t**2
                # Ensure ball doesn't go below ground
                z = max(z, 0)
                return np.array([0, 0, z])

            def velocity_function(t):
                # Calculate velocity using physics equation
                vz = v0 - a * t
                return vz

            # Create a parametric function for the path
            path_func = ParametricFunction(
                position_function,
                t_range=[0, duration],
                dt=0.01
            )

            # Create value trackers for time
            time_tracker = ValueTracker(0)

            # Function to update text based on current time
            def update_texts():
                current_time = time_tracker.get_value()
                current_height = position_function(current_time)[2]
                current_velocity = velocity_function(current_time)

                # Update height text
                new_height_text = Text(
                    f"Height: {current_height:.1f} m", font_size=24, color=WHITE)
                new_height_text.next_to(ball, RIGHT + UP, buff=0.5)
                height_text.become(new_height_text)

                # Update velocity text
                new_velocity_text = Text(
                    f"Velocity: {current_velocity:.1f} m/s", font_size=24, color=WHITE)
                new_velocity_text.next_to(height_text, DOWN, buff=0.2)
                velocity_text.become(new_velocity_text)

            # Add updater to texts
            height_text.add_updater(lambda m: update_texts())

            # Animate the ball along the path and update time tracker
            self.play(
                MoveAlongPath(ball, path_func, rate_func=linear),
                time_tracker.animate.set_value(duration),
                run_time=duration
            )

            # Remove updater
            height_text.remove_updater(update_texts)

            # Prepare for next bounce
            if bounce_height > 0:
                # Calculate velocity needed to reach bounce_height
                v_bounce = np.sqrt(2 * abs(a) * bounce_height)

                # Calculate time for complete bounce (up and down)
                bounce_time = 2 * v_bounce / abs(a)
                if bounce_time <= 0:
                    bounce_time = 1.0

                # Create bounce path function
                def bounce_position_function(t):
                    # For upward motion (first half of time)
                    if t <= bounce_time/2:
                        z = v_bounce * t - 0.5 * a * t**2
                    else:
                        # For downward motion (second half of time)
                        t_fall = t - bounce_time/2
                        z = bounce_height - 0.5 * a * t_fall**2

                    # Ensure z is not below ground
                    z = max(z, 0)
                    return np.array([0, 0, z])

                def bounce_velocity_function(t):
                    # For upward motion (first half of time)
                    if t <= bounce_time/2:
                        vz = v_bounce - a * t
                    else:
                        # For downward motion (second half of time)
                        t_fall = t - bounce_time/2
                        vz = -a * t_fall
                    return vz

                # Create a parametric function for the bounce path
                bounce_path = ParametricFunction(
                    bounce_position_function,
                    t_range=[0, bounce_time],
                    dt=0.01
                )

                # Reset time tracker for bounce
                time_tracker.set_value(0)

                # Function to update text during bounce
                def update_bounce_texts():
                    current_time = time_tracker.get_value()
                    current_height = bounce_position_function(current_time)[2]
                    current_velocity = bounce_velocity_function(current_time)

                    # Update height text
                    new_height_text = Text(
                        f"Height: {current_height:.1f} m", font_size=24, color=WHITE)
                    new_height_text.next_to(ball, RIGHT + UP, buff=0.5)
                    height_text.become(new_height_text)

                    # Update velocity text
                    new_velocity_text = Text(
                        f"Velocity: {current_velocity:.1f} m/s", font_size=24, color=WHITE)
                    new_velocity_text.next_to(height_text, DOWN, buff=0.2)
                    velocity_text.become(new_velocity_text)

                # Add updater for bounce
                height_text.add_updater(lambda m: update_bounce_texts())

                # Animate the ball along the bounce path
                self.play(
                    MoveAlongPath(ball, bounce_path, rate_func=linear),
                    time_tracker.animate.set_value(bounce_time),
                    run_time=bounce_time
                )

                # Remove updater
                height_text.remove_updater(update_bounce_texts)

            # Small pause between phases
            self.wait(0.3)
