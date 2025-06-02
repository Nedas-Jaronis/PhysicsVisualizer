import re
from openai import OpenAI
import json
from json_templates import *


problem = """Your physics problem text here"""
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


def detect_problem_category(problem):
    client = OpenAI(api_key="sk-40bc61c061c14be1a62008a4405f2207",
                    base_url="https://api.deepseek.com")
    response = client.chat.completions.create(
        model="deepseek-chat",
        messages=[
            {
                "role": "system",
                "content": "You are a physics problem classifier. Given a problem, classify it as one of the following categories: 1D Kinematics, 2D Kinematics, Forces and Newton's Laws, Work, Energy, Power, Momentum and Collisions, Rotational Motion, Simple Harmonic Motion, Gravitation and Orbits. Only respond with the exact problem category."
            },
            {
                "role": "user",
                "content": problem
            }
        ],
        stream=False
    )

    return response.choices[0].message.content.strip()


def detect_problem_type(problem):
    category = detect_problem_category(problem)
    problemTypeContent = getProblemType(category)
    client = OpenAI(api_key="sk-40bc61c061c14be1a62008a4405f2207",
                    base_url="https://api.deepseek.com")
    response = client.chat.completions.create(
        model="deepseek-chat",
        messages=[
            {
                "role": "system", "content": f"""You are a physics problem type detector, given a category you will determine the type of problem it is, this will be regarding the animation specifically. Use these topics to determine what type of animation it is.{problemTypeContent}

                ⚠️⚠️⚠️You will only respond with the type of problem, do not add anything extra to the response!!!"""
            },
            {
                "role": "user", "content": problem
            }
        ],
        stream=False

    )
    return response.choices[0].message.content.strip()


def detect_num_motions(problem):
    client = OpenAI(api_key="sk-40bc61c061c14be1a62008a4405f2207",
                    base_url="https://api.deepseek.com")
    response = client.chat.completions.create(
        model="deepseek-chat",
        messages=[
            {
                "role": "system", "content": "You are a physics motion detector. Given a problem, classify how many motions is undergoes. For example a ball falling then bouncing to a height, is two motions. Detect only the amount of motions that would be present in an animation to animate the problem. Only respond with the number of motions like this '#' so if there are 2 motions respond with '2' always make the number surrounded by no quotes, just the number."
            },
            {
                "role": "user", "content": problem
            }
        ],
        stream=False

    )
    return response.choices[0].message.content.strip()


def process_physics_response(problem):

    problem_category = detect_problem_category(problem)
    num_motions = detect_num_motions(problem)
    num_motions = int(num_motions)
    problem_type = detect_problem_type(problem)
    print("Here are the number of motions:", num_motions)
    print("Here is the problem Type: ", problem_type)
    dynamic_content = API_Content(problem_category, num_motions)

    print(f"Detected Problem Type: {problem_category}")
    # # Print the problem to debug
    # print(f"Processing problem in GPT_API: {problem[:100]}")

    client = OpenAI(api_key="sk-40bc61c061c14be1a62008a4405f2207",
                    base_url="https://api.deepseek.com")

    response = client.chat.completions.create(
        model="deepseek-chat",
        messages=[
            {
                "role": "system",
                "content": f"""
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

        4. Animation Data (JSON):
        - Use this to give me all the key details, write them **only** using the exact names provided below. **Do not add, change, or remove any names.** The values should be **null** if not present in the problem.
        {dynamic_content}⚠️⚠️⚠️Do exactly what the dynamic content says to to nothing more and nothing less. Fill each variable in exactly as it says to. Only use the variables within the dynamic_content and nothing more and nothing less, if there is no value for the variable, fill it with null, also the times are in motion phases as well as all variables prefixed with a #_ starting with 1 to show which phase its on. Make sure to define the time for all of these. *Any strings as values,surround them with quotes!!!* 

        ⚠️ Always start each section with its label: 'Formulas:', 'Solution:', 'Step-by-step:' and 'Animation Data (JSON):'. Never merge sections. Never restate the problem. Format for readability.
        """
            },
            {"role": "system", "content": "In terms of formatting keep this in mind everytime. Formulas will be formatted by bullet points in the the start. Solution will be formatted without bulletpoints or any numbers this will be in a paragraph. The step by step is different then the solution, this will be formated in a bulleted list and these numbers should be separate paragraphs all bulleted and easily readable and udnerstood."
             ""
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
    animation_data = {}

    # Process each message from the API
    for message in messages:
        # Apply text replacements and formatting
        # message = apply_text_formatting(message)

        # Split the message by the section headers
        # This is a more robust way to parse the sections
        # Use a more robust section splitting approach
        sections = re.split(
            r'(Formulas:\s*|Solution:\s*|Step-by-step:\s*|Animation Data \(JSON\):\s*)', message, flags=re.IGNORECASE)

        formulas, solution, step_by_step, animation_data = "", "", "", ""

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
            elif section.lower() == "animation data (json):":
                current_section = "animation_data"
                continue
            # Add content to the appropriate section
            if current_section == "formulas":
                formulas += section + "\n"
            elif current_section == "solution":
                solution += section + "\n"
            elif current_section == "step_by_step":
                step_by_step += section + "\n"
            elif current_section == "animation_data":
                animation_data = section.strip()
                animation_data = fill_template_from_raw(
                    animation_data, problem_category, num_motions)

    # If the section splitting didn't work, try a different approach
    full_text = "\n".join(messages)
    if not formulas and not solution and not step_by_step:
        print("Section splitting failed, trying alternative parsing")
        formulas, solution, step_by_step = alternative_parsing(full_text)

    # Trim whitespace
    solution = solution.strip()
    step_by_step = step_by_step.strip()
    formulas = formulas.strip()

    # # Debug output
    # print("Formulas:", formulas)
    # print("Solution:", solution)
    # print("Step-by-Step:", step_by_step)
    print("Animation Data:", animation_data)

    # If any section is empty, provide a default
    if not formulas:
        formulas = "No formulas provided by the AI."
    if not solution:
        solution = "No solution provided by the AI."
    if not step_by_step:
        step_by_step = "No step-by-step explanation provided by the AI."
    if not animation_data:
        animation_data = {"error": "No animation data provided by the AI."}

    return solution, step_by_step, formulas, animation_data, num_motions


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
    # Only remove brackets around LaTeX-like commands, not JSON arrays

    message = re.sub(r'\\text\{([^}]+)\}', r'\1', message)
    message = re.sub(r'\[([^\[\]]+)\]', r'\1', message)

    message = standardize_physics_variables(message)

    # Apply subscript replacements
    message = replace_with_subscripts(message)

    message = (message.replace("*", "×")
               .replace("###", "")
               .replace("\\", "")
               .replace("times", "×")
               .replace("××", "×")
               .replace("((", "(")
               .replace("))", ")")
               .replace("sqrt", "√")
               .replace("cdot", "×")
               .replace("/", " / ")
               .replace("^2", "²")
               .replace(" lambda", " λ")
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
    animation_data = ""

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

    return formulas, solution, step_by_step, animation_data
