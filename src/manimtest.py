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
        # Load animation data from environment
        # Load animation data from environment variable
        animation_data_str = os.getenv("ANIMATION_DATA", "{}")
        animation_data = json.loads(animation_data_str)

        color = animation_data.get('color', WHITE)

        radius = 0.5
        ball = Sphere(radius=radius, color=color)
        self.set_camera_orientation(phi=75 * DEGREES, theta=30 * DEGREES)

        )
