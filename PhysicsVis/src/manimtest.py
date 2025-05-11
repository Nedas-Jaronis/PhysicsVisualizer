from manim import *


class MyScene(Scene):
    def construct(self):
        circle = Circle(color=GREEN)
        circle.set_fill(GREEN, opacity=0.5)
        self.play(Create(circle))
