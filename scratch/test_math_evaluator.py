import re

NUMBER_WORDS = {
    "zero": 0, "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
    "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10,
    "eleven": 11, "twelve": 12, "thirteen": 13, "fourteen": 14, "fifteen": 15,
    "sixteen": 16, "seventeen": 17, "eighteen": 18, "nineteen": 19, "twenty": 20,
    "thirty": 30, "forty": 40, "fifty": 50, "sixty": 60, "seventy": 70, "eighty": 80, "ninety": 90, "hundred": 100,
    "isa": 1, "dalawa": 2, "tatlo": 3, "apat": 4, "lima": 5,
    "anim": 6, "pito": 7, "walo": 8, "siyam": 9, "sampu": 10
}

def evaluate_math(query: str):
    q = query.lower().strip()
    # Strip question wrappers
    q = re.sub(r'^(what is|calculate|solve|ano ang|compute|tell me|magkano ang|paki solve ang|how much is)\s+', '', q)
    q = q.replace('?', '').replace('=', '').strip()

    # Spoken number conversion
    for word, val in NUMBER_WORDS.items():
        q = re.sub(r'\b' + word + r'\b', str(val), q)

    # Percentage: e.g. "15 percent of 200" or "15% of 200"
    pct_match = re.search(r'([\d\.]+)\s*(?:%|percent)\s+(?:of|ng)\s+([\d\.]+)', q)
    if pct_match:
        pct = float(pct_match.group(1))
        base = float(pct_match.group(2))
        res = (pct * base) / 100.0
        res_str = f"{int(res)}" if res.is_integer() else f"{res:.2f}"
        return f"{pct_match.group(1)} percent of {pct_match.group(2)} is {res_str}."

    # Operator normalization
    q = q.replace('multiplied by', '*').replace('times', '*').replace('x', '*')
    q = q.replace('divided by', '/').replace('over', '/').replace('hati sa', '/')
    q = q.replace('plus', '+').replace('dagdag', '+')
    q = q.replace('minus', '-').replace('bawas', '-')

    # Binary arithmetic: A op B
    m = re.search(r'([\d\.]+)\s*([\+\-\*\/])\s*([\d\.]+)', q)
    if m:
        a = float(m.group(1))
        op = m.group(2)
        b = float(m.group(3))
        if op == '+':
            res = a + b
            op_word = "plus"
        elif op == '-':
            res = a - b
            op_word = "minus"
        elif op == '*':
            res = a * b
            op_word = "times"
        elif op == '/':
            if b == 0:
                return "Division by zero is undefined."
            res = a / b
            op_word = "divided by"
        else:
            return None
        
        a_str = f"{int(a)}" if a.is_integer() else f"{a}"
        b_str = f"{int(b)}" if b.is_integer() else f"{b}"
        res_str = f"{int(res)}" if res.is_integer() else f"{res:.2f}"
        return f"{a_str} {op_word} {b_str} is {res_str}."
    return None

test_cases = [
    "1+1",
    "what is 1 + 1",
    "ano ang 1+1",
    "one plus one",
    "isa plus isa",
    "dalawa times tatlo",
    "5 times 20",
    "100 / 4",
    "50 minus 15",
    "15 percent of 200",
    "10 divided by 0",
    "magkano ang 25 + 75",
    "1+1?"
]

for t in test_cases:
    print(f"'{t}' -> {evaluate_math(t)}")

