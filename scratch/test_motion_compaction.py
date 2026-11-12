class Pattern:
    def __init__(self, id, speed, max_svm, tilt, occurrences=1):
        self.id = id
        self.speed = speed
        self.max_svm = max_svm
        self.tilt = tilt
        self.occurrences = occurrences

def compact_patterns(patterns):
    clustered = []
    for candidate in patterns:
        merged = False
        for existing in clustered:
            dG = abs(existing.max_svm - candidate.max_svm)
            dTilt = abs(existing.tilt - candidate.tilt)
            dSpeed = abs(existing.speed - candidate.speed)
            if dG < 0.7 and dTilt < 14.0 and dSpeed < 15.0:
                total = existing.occurrences + candidate.occurrences
                existing.max_svm = ((existing.max_svm * existing.occurrences) + (candidate.max_svm * candidate.occurrences)) / total
                existing.tilt = ((existing.tilt * existing.tilt) + (candidate.tilt * candidate.occurrences)) / total
                existing.occurrences = total
                merged = True
                break
        if not merged:
            clustered.append(candidate)
    return clustered

# Test with 5 patterns, 3 of which are similar wind flutters
patterns = [
    Pattern("1", 45.0, 3.2, 12.0, 1),
    Pattern("2", 48.0, 3.4, 14.0, 1),
    Pattern("3", 44.0, 3.1, 11.0, 1),
    Pattern("4", 0.0, 2.1, 80.0, 1), # phone drop
    Pattern("5", 25.0, 2.5, 5.0, 1),  # bump
]

res = compact_patterns(patterns)
print(f"Original {len(patterns)} -> Compacted {len(res)}")
for p in res:
    print(f"ID {p.id}: speed={p.speed}, max_svm={p.max_svm:.2f}, occurrences={p.occurrences}")

