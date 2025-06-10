class ProblemData {
    problem string
    stepByStep string
    formulas string
    solution string
}

function Extract_ProblemData(data: string) -> ProblemData {
    client "DeepseekChatClient"
    prompt #"""
        Given the physics problem:

        {{data}}

        Please respond ONLY with a JSON object containing the following fields:

        {
        "problem": "<brief restatement of the problem as a plain string>",
        "stepByStep": "<a very detailed, bullet-pointed step-by-step guide to solving the problem. Each step should be a clear, separate bullet starting with '- ', explaining exactly what to do and why. Include any intermediate calculations and reasoning.>",
        "formulas": "<a bullet pointed list of different formulas, dont indent them with any kind of bullet just make sure they are all separate.>",
        "solution": "<a thorough explanation of the final solution, explaining what the answer means physically and why it makes sense>"
        }

        Example for stepByStep:

        "- First, identify known quantities and what is asked.\n- Then, write down the key formulas related to the problem.\n- Next, substitute the known values into the formulas.\n- Calculate intermediate values step by step.\n- Finally, solve for the unknown and check units."

        Make sure to return only the JSON object with no additional text or commentary.
        """#
}
