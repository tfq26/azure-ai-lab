# EVALUATION DEMO
# Why use AI Foundry instead of just calling an API? -> Evaluation.

test_cases = [
    {"input": "When is tuition due?", "expected_keyword": "15th"},
    {"input": "What is for lunch on Monday?", "expected_keyword": "Chicken"},
    {"input": "Is there a coffee shop nearby?", "expected_keyword": "Study"},
]

def run_evaluation():
    print("--- 04: EVALUATION DEMO ---")
    print("Measuring AI accuracy against expected keywords...\n")
    
    passed = 0
    for test in test_cases:
        print(f"Testing Question: {test['input']}")
        # Simulated AI Response
        simulated_response = "Tuition is typically due by the 15th of the month." if "tuition" in test['input'].lower() else "I have identified a coffee shop called 'The Coffee Bean' nearby."
        
        if test['expected_keyword'].lower() in simulated_response.lower():
            print("Status: ✅ PASS")
            passed += 1
        else:
            print(f"Status: ❌ FAIL (Expected keyword '{test['expected_keyword']}' not found)")
        print("-" * 30)

    score = (passed / len(test_cases)) * 100
    print(f"FINAL ACCURACY SCORE: {score:.2f}%")
    print("\nIn Azure AI Foundry, you can run thousands of these tests automatically")
    print("and use another AI (a 'GPT-4 Evaluator') to grade nuance, tone, and safety!")

if __name__ == "__main__":
    run_evaluation()
