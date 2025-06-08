from baml_client import b
import json
import os

# Set this to the root directory where your JSON schemas live
SCHEMA_DIR = os.path.join(os.path.dirname(__file__), "schemas")

# Map AnimationData categories to schema folder names
CATEGORY_TO_FOLDER = {
    "forces": "forces",
    "fields": "fields",
    "interactions": "interactions",
    "materials": "materials",
    "motions": "motions",
    "objects": "objects"
}


def load_schema_file(category: str, type_name: str) -> dict:
    """Loads a specific schema JSON based on category and type name."""
    folder = CATEGORY_TO_FOLDER.get(category)
    if not folder:
        raise ValueError(f"Unknown category: {category}")

    file_path = os.path.join(SCHEMA_DIR, folder, f"{type_name}.json")
    if not os.path.isfile(file_path):
        raise FileNotFoundError(f"Missing file: {file_path}")

    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)


def load_all_schemas(animation_dict: dict):
    all_schemas = {}

    for category, types in animation_dict.items():
        folder = category.lower()
        all_schemas[category] = []

        for type_name in types:
            clean_type_name = type_name.split('.')[-1]  # <-- Clean enum prefix
            schema = load_schema_file(folder, clean_type_name)
            all_schemas[category].append(schema)

    return all_schemas


# Example usage (you can remove this block if importing elsewhere)
if __name__ == "__main__":
    # Replace with your actual AnimationData output from BAML
    problem = "A rock is dropped from the top of a 45-meter tall cliff.Assume no air resistance and use 𝑔=9.8 m/s."
    schemes_data = b.Extract_animation_data(problem)
    # print(type(schemes_data))
    animation_dict = schemes_data.model_dump()
    all_loaded = load_all_schemas(animation_dict)
    print("You have got to this point checkpoint before json.dump")
    json_string = json.dumps(all_loaded)
    print("Finished checkpoint")
    print("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n")
    final_result = b.Update_Animation_Data(json_string, problem)
    print(final_result)
