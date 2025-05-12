from manim import *


class MyScene(Scene):
    def construct(self):
        circle = Circle(color=RED)
        circle.set_fill(RED, opacity=0.5)
        self.play(Create(circle))
