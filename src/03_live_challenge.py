import os

# --- LIVE CHALLENGE ---
# Goal: Write a 'Custom Tool' (Function) that the AI can call.
# Azure AI Foundry lets you register functions as 'Tools'.

def calculate_gpa(grades):
    """
    A simple GPA calculator tool.
    Students: Complete the logic below!
    """
    points = {"A": 4, "B": 3, "C": 2, "D": 1, "F": 0}
    # TODO: Calculate the average of the grades list
    if not grades: return 0.0
    
    total = sum([points.get(g.upper(), 0) for g in grades])
    return total / len(grades)

def get_tuition_estimate(residency_type):
    """
    A tool to return tuition based on residency.
    """
    # TODO: Students, write this logic:
    # 'in-state' -> $5,000
    # 'out-of-state' -> $15,000
    pass

def main():
    print("--- 03: LIVE CODING CHALLENGE ---")
    print("Scenario: The AI needs to calculate a student's GPA.")
    
    student_grades = ["A", "B", "A", "C"]
    gpa = calculate_gpa(student_grades)
    
    print(f"Student Grades: {student_grades}")
    print(f"Calculated GPA: {gpa}")
    
    print("\nHow this works in Azure AI Foundry:")
    print("1. You define these Python functions.")
    print("2. You pass them to the 'agent' or 'model' as available tools.")
    print("3. When a student asks 'What is my GPA?', the AI decides to RUN this code and gives the answer.")

if __name__ == "__main__":
    main()
