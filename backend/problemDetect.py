from baml_client import b


if __name__ == "__main__":
    problem = """A spring with spring constant 𝑘=200N/m is compressed 0.3 m.

(a) How much potential energy is stored in the spring?

(b) If the spring launches a 1 kg mass on a frictionless surface, what is its speed just as it leaves the spring?"""

problem_Data = b.Extract_ProblemData(problem)
print(problem_Data)
