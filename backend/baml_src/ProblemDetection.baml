class ProblemData {
    problem string
    stepByStep string
    formulas string
    solution string
}

function Extract_ProblemData(data: string) -> ProblemData {
    client "CustomSonnet"
    prompt #"""
        You are a physics tutor. Solve the following physics problem and provide a complete solution.

        PROBLEM:
        {{data}}

        You MUST respond with a valid JSON object containing EXACTLY these four fields:

        {
          "problem": "A brief restatement of the problem in one sentence",
          "formulas": "List each formula on a new line, e.g.:\nv = v₀ + at\nx = x₀ + v₀t + ½at²\nv² = v₀² + 2a(x - x₀)",
          "stepByStep": "- Step 1: Identify given values\n- Step 2: Choose the appropriate formula\n- Step 3: Substitute values\n- Step 4: Calculate the result",
          "solution": "The final answer with explanation of what it means physically"
        }

        CRITICAL REQUIREMENTS:
        1. ALL four fields (problem, formulas, stepByStep, solution) are REQUIRED
        2. Each field must be a non-empty string
        3. Return ONLY the JSON object - no markdown, no code blocks, no extra text
        4. Use \n for newlines within strings
        5. Escape any quotes within strings

        Solve the problem completely and show all work in stepByStep.
        """#
}
