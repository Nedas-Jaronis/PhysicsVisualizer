from manim import *


class MyScene(Scene):
    def construct(self):
        circle = Circle(color=RED)  # Sets stroke (outline) color
        circle.set_fill(GREEN, opacity=0.5)  # Sets fill color and opacity
        self.play(Create(circle))
