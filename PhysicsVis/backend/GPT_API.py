import re
from openai import OpenAI

# Map to convert ^# to its subscript equivalent
subscript_map = {
    "-30": "₋³⁰", "-29": "₋²⁹", "-28": "₋²⁸", "-27": "₋²⁷", "-26": "₋²⁶", "-25": "₋²⁵",
    "-24": "₋²⁴", "-23": "₋²³", "-22": "₋²²", "-21": "₋²¹", "-20": "₋²⁰", "-19": "₋¹⁹",
    "-18": "₋¹⁸", "-17": "₋¹⁷", "-16": "₋¹⁶", "-15": "₋¹⁵", "-14": "₋¹⁴", "-13": "₋¹³",
    "-12": "₋¹²", "-11": "₋¹¹", "-10": "₋¹⁰", "-9": "₋⁹", "-8": "₋⁸", "-7": "₋⁷",
    "-6": "₋⁶", "-5": "₋⁵", "-4": "₋⁴", "-3": "₋³", "-2": "₋²", "-1": "₋¹", "0": "₀",
    "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸",
    "9": "⁹", "10": "¹⁰", "11": "¹¹", "12": "¹²", "13": "¹³", "14": "¹⁴", "15": "¹⁵",
    "16": "¹⁶", "17": "¹⁷", "18": "¹⁸", "19": "¹⁹", "20": "²⁰", "21": "²¹", "22": "²²",
    "23": "²³", "24": "²⁴", "25": "²⁵", "26": "²⁶", "27": "²⁷", "28": "²⁸", "29": "²⁹",
    "30": "³⁰"
}


def standardize_physics_variables(text):
    # Dictionary of replacements
    replacements = {
        r'\bu\b': 'v₀',  # Replace 'u' with 'v₀' for initial velocity
        r'\bv_0\b': 'v₀',  # Replace 'v_0' with 'v₀'
        r'\bv_i\b': 'v₀',  # Replace 'v_i' with 'v₀'
        r'\ba\b': 'a',  # Keep 'a' for acceleration
        r'\bg\b': 'g',  # Keep 'g' for gravitational acceleration
        r'\bm\b': 'm',  # Keep 'm' for mass
        r'\bh\b': 'h',  # Keep 'h' for height
        r'\bt\b': 't',  # Keep 't' for time
        r'\bF\b': 'F',  # Keep 'F' for force
        r'\bE\b': 'E',  # Keep 'E' for energy
        r'\bp\b': 'p',  # Keep 'p' for momentum
    }

    for old, new in replacements.items():
        text = re.sub(old, new, text)

    return text


def replace_with_subscripts(text):
    # Replace occurrences of ^ followed by numbers with the subscript equivalent
    def subscript_replacement(match):
        number = match.group(1)  # Get the number after ^
        # Return the corresponding subscript or original if not found
        return subscript_map.get(number, match.group(0))

    return re.sub(r'\^(-?\d+)', subscript_replacement, text)


def process_physics_response(problem):
    # Print the problem to debug
    print(f"Processing problem in GPT_API: {problem[:100]}")

    client = OpenAI(api_key="sk-b654dd017af24441a99b9708346c98a3",
                    base_url="https://api.deepseek.com")

    response = client.chat.completions.create(
        model="deepseek-chat",
        messages=[
            {
                "role": "system",
                "content": """
        You are a physics expert. Every time a user submits a problem, respond using **exactly three sections**, and label each section using the following headers exactly as written:

        1. Formulas:
        - Start this section with: 'Formulas:'
        - List only the formulas required to solve the problem.
        - Do not include explanations or the problem itself.

        2. Solution:
        - Start this section with: 'Solution:'
        - Give only the final numeric or symbolic answer.
        - No steps or justifications here.

        3. Step-by-step:
        - Start this section with: 'Step-by-step:'
        - Explain the full method clearly in steps.
        - Break it down so a high school student can follow.
        - Do not restate the original problem.

        ⚠️ Always start each section with its label: 'Formulas:', 'Solution:', and 'Step-by-step:'. Never merge sections. Never restate the problem. Format for readability.
        """
            },
            {"role": "user", "content": problem}
        ],
        stream=False
    )

    messages = [choice.message.content for choice in response.choices]

    # Debug the raw response
    print("Raw response from API:")
    for msg in messages:
        print(msg[:500] + "..." if len(msg) > 500 else msg)

    # Initialize variables to store the parsed content
    solution = ""
    step_by_step = ""
    formulas = ""

    # Process each message from the API
    for message in messages:
        # Apply text replacements and formatting
        message = apply_text_formatting(message)

        # Split the message by the section headers
        # This is a more robust way to parse the sections
        sections = re.split(
            r'(Formulas:|Solution:|Step-by-step:)', message, flags=re.IGNORECASE)

        # Debug the sections
        print(f"Found {len(sections)} sections")

        # Process each section
        current_section = None
        for section in sections:
            section = section.strip()
            if not section:
                continue

            # Check if this is a section header
            if section.lower() == "formulas:":
                current_section = "formulas"
                continue
            elif section.lower() == "solution:":
                current_section = "solution"
                continue
            elif section.lower() == "step-by-step:":
                current_section = "step_by_step"
                continue

            # Add content to the appropriate section
            if current_section == "formulas":
                formulas += section + "\n"
            elif current_section == "solution":
                solution += section + "\n"
            elif current_section == "step_by_step":
                step_by_step += section + "\n"

    # If the section splitting didn't work, try a different approach
    if not formulas and not solution and not step_by_step:
        print("Section splitting failed, trying alternative parsing")
        formulas, solution, step_by_step = alternative_parsing(message)

    # Trim whitespace
    solution = solution.strip()
    step_by_step = step_by_step.strip()
    formulas = formulas.strip()

    # Debug output
    print("Step by Step:", step_by_step[:100] +
          "..." if len(step_by_step) > 100 else step_by_step)
    print("Solution:", solution[:100] +
          "..." if len(solution) > 100 else solution)
    print("Formulas:", formulas[:100] +
          "..." if len(formulas) > 100 else formulas)

    # If any section is empty, provide a default
    if not formulas:
        formulas = "No formulas provided by the AI."
    if not solution:
        solution = "No solution provided by the AI."
    if not step_by_step:
        step_by_step = "No step-by-step explanation provided by the AI."

    return solution, step_by_step, formulas


def apply_text_formatting(message):
    """Apply all text formatting to the message"""
    # Remove the "---" separators
    message = message.replace("---", "")

    # Handle LaTeX-style text commands
    message = re.sub(r'\\text\{([^}]+)\}', r'\1', message)

    # Handle fractions and square roots
    message = re.sub(r'\\frac\{([^}]+)\}\{([^}]+)\}', r'(\1/\2)', message)
    message = re.sub(r'(\d+)/(\d+)', r'(\1/\2)', message)
    message = re.sub(r'sqrt\{([^}]+)\}', r'√{\1}', message)
    message = re.sub(r'sqrt\s*(\d+)', r'√{\1}', message)
    message = re.sub(r'√\{([^}]+)\}', r'√\1', message)

    # Replace cdot with x
    message = message.replace("cdot", "×")

    # Other replacements
    message = re.sub(r'\(\(', '(', message)  # Replace ((
    message = re.sub(r'\)\)', ')', message)

    # Add multiplication signs between numbers and parentheses
    message = re.sub(r'(\d+)\s*($$|$$)', r'\1 × \2', message)
    message = re.sub(r'($$|$$)\s*(\d+)', r'\1 × \2', message)

    # Add multiplication signs between adjacent numbers
    message = re.sub(r'(\d+)\s+(\d+)', r'\1 × \2', message)

    # Ensure proper spacing around × symbol
    message = re.sub(r'(\S)\s*×\s*(\S)', r'\1 × \2', message)

    # Improve handling of decimal fractions
    message = re.sub(r'(\d+)\.(\d+)\s*/\s*(\d+)\.(\d+)',
                     r'(\1.\2/\3.\4)', message)
    message = re.sub(
        r'(\d+(?:\.\d+)?)\s*/\s*(\d+(?:\.\d+)?)', r'(\1/\2)', message)

    message = standardize_physics_variables(message)

    # Apply subscript replacements
    message = replace_with_subscripts(message)

    message = (message.replace("*", "×")
               .replace("###", "")
               .replace("\\", "")
               .replace("times", "×")
               .replace("××", "×")
               .replace("[", "")
               .replace("]", "")
               .replace("((", "(")
               .replace("))", ")")
               .replace("sqrt", "√")
               .replace("cdot", "×")
               .replace(" , ", "")
               .replace("/", " / ")
               .replace("^2", "²")
               .replace(" lambda", " λ")
               .replace("  ", " ")
               .replace("pi", "π")
               .replace(".(", ".")
               .replace(").", ".")
               .replace(". ×", ". ")
               .replace("^circ", "°")
               .replace("theta", "θ")
               .replace("v_{y}", "Vy")
               .replace("v_{0y}", "v₀y")
               .replace("v_{0x}", "v₀x")
               .replace("v_y", "vy")
               .replace("v_x", "vx")
               .replace("t_{total}", "Ttotal")
               .replace("}}", "} / ")
               .replace("mu", "μ")
               .replace("Omega", "Ω")
               .replace("Phi", "Φ")
               .replace("Forμlas", "Formulas"))

    message = re.sub(r'^\s*×|\s*×\s*$', '', message, flags=re.MULTILINE)
    # Standardize physics variables
    message = message.replace("((", "(").replace("))", ")")

    return message


def alternative_parsing(message):
    """Alternative parsing method if the section splitting fails"""
    formulas = ""
    solution = ""
    step_by_step = ""

    # Try to extract each section using regex
    formulas_match = re.search(
        r'Formulas:(.*?)(?=Solution:|Step-by-step:|$)', message, re.DOTALL | re.IGNORECASE)
    if formulas_match:
        formulas = formulas_match.group(1).strip()

    solution_match = re.search(
        r'Solution:(.*?)(?=Formulas:|Step-by-step:|$)', message, re.DOTALL | re.IGNORECASE)
    if solution_match:
        solution = solution_match.group(1).strip()

    step_match = re.search(
        r'Step-by-step:(.*?)(?=Formulas:|Solution:|$)', message, re.DOTALL | re.IGNORECASE)
    if step_match:
        step_by_step = step_match.group(1).strip()

    # If still no match, try to identify sections by content patterns
    if not formulas and not solution and not step_by_step:
        lines = message.split('\n')
        current_section = None

        for line in lines:
            line = line.strip()
            if not line:
                continue

            # Try to guess the section based on content
            if re.search(r'=|equation|law', line, re.IGNORECASE) and not current_section:
                current_section = "formulas"
                formulas += line + "\n"
            elif re.search(r'answer|result|=', line, re.IGNORECASE) and not solution:
                current_section = "solution"
                solution += line + "\n"
            elif re.search(r'step|first|begin|start', line, re.IGNORECASE) and not step_by_step:
                current_section = "step_by_step"
                step_by_step += line + "\n"
            elif current_section == "formulas":
                formulas += line + "\n"
            elif current_section == "solution":
                solution += line + "\n"
            elif current_section == "step_by_step":
                step_by_step += line + "\n"

    return formulas, solution, step_by_step


if __name__ == '__main__':
    test_problem = "A circular loop of radius R = 0.1m and resistance Rloop = 2.0 ohm is placed in a time-varying magnetic field B(t) = 0.01t^2 T where t is in seconds. 1. Derive an expression for the induced EMF in the loop. 2. Find the current induced in the loop at t = 5s"
    process_physics_response(test_problem)
