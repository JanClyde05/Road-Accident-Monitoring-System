import re

# Mock Landmark and normalization matching TuguegaraoOfflineSpatialEngine
landmarks = [
    {"name": "SM City Tuguegarao", "lat": 17.62805, "lon": 121.71890, "aliases": ["sm city", "sm city tuguegarao", "sm caritan", "sm bagay", "bagay road sm", "new sm"]},
    {"name": "SM Center Tuguegarao Downtown", "lat": 17.61275, "lon": 121.72379, "aliases": ["sm downtown", "sm center", "sm centro", "old sm", "sm mall downtown"]},
    {"name": "Robinsons Place Tuguegarao", "lat": 17.62806, "lon": 121.73350, "aliases": ["robinsons", "robinsons place", "rob", "robinsons tuguegarao", "robinsons tanza"]},
    {"name": "Medical Colleges of Northern Philippines (MCNP / ISAP)", "lat": 17.64210, "lon": 121.76150, "aliases": ["mcnp", "isap", "mcnp isap", "medical college of northern philippines", "medical colleges of northern philippines", "alimannao", "alimannao hills"]},
    {"name": "Cagayan Valley Medical Center (CVMC)", "lat": 17.65661, "lon": 121.74702, "aliases": ["cvmc", "cagayan valley medical center", "provincial hospital", "carig hospital", "regional hospital", "ospital"]},
    {"name": "Saint Peter Metropolitan Cathedral", "lat": 17.61359, "lon": 121.73050, "aliases": ["cathedral", "st peter cathedral", "saint peter cathedral", "simbahan ng tuguegarao", "simbahan"]},
    {"name": "Buntun Bridge", "lat": 17.61437, "lon": 121.68643, "aliases": ["buntun bridge", "buntun", "tulay ng buntun", "cagayan river bridge", "tulay"]},
    {"name": "Cagayan Provincial Capitol", "lat": 17.64848, "lon": 121.76037, "aliases": ["capitol", "provincial capitol", "cagayan capitol", "kapitolyo"]},
    {"name": "University of Saint Louis Tuguegarao (USL)", "lat": 17.61016, "lon": 121.72327, "aliases": ["usl", "saint louis", "st louis", "university of saint louis", "louisian"]},
    {"name": "University of Cagayan Valley (UCV)", "lat": 17.62402, "lon": 121.72871, "aliases": ["ucv", "cagayan valley university", "university of cagayan valley", "ucv balzain"]}
]

def normalize_local_phonetics(raw):
    text = raw
    text = re.sub(r'(?i)\b(m c n p|em see en pee|em c n p|mcnp isap|mcnp-isap|medical college)\b', 'MCNP', text)
    text = re.sub(r'(?i)\b(i s a p|eye sap|isap)\b', 'ISAP', text)
    text = re.sub(r'(?i)\b(you see vee|u c v)\b', 'UCV', text)
    text = re.sub(r'(?i)\b(smct|s m city|es em city|es em|s m)\b', 'SM City', text)
    text = re.sub(r'(?i)\b(robin sons|robinson place)\b', 'Robinsons Place', text)
    return text

def parse_voice_route(query):
    lower = query.strip().lower()
    route_regex = re.compile(r'(?i).*(?:route to|route|navigate to|navigate|directions to|direction to|take me to|show route to|how to go to|paano pumunta sa|papunta sa|punta sa|dalhin mo ako sa|pin)\s+(.+)')
    match = route_regex.search(lower)
    if not match:
        return None
    raw_target = match.group(1)
    target = re.sub(r'(?i)\s+(on my map|on the map|on my phone|on map|on the app|please|sa mapa|sa phone|sa app)$', '', raw_target).strip()
    target = normalize_local_phonetics(target)
    
    # Landmark match
    target_lower = target.lower()
    for lm in landmarks:
        for alias in lm["aliases"]:
            if alias in target_lower:
                return {"input": query, "parsed_target": target, "matched": lm["name"], "coords": (lm["lat"], lm["lon"])}
        if lm["name"].lower() in target_lower:
            return {"input": query, "parsed_target": target, "matched": lm["name"], "coords": (lm["lat"], lm["lon"])}
    return {"input": query, "parsed_target": target, "matched": None}

test_queries = [
    "route to SM City",
    "and route MCNP on my map",
    "route MCNP",
    "please navigate to Robinsons Place on my phone",
    "directions to CVMC",
    "pin Cathedral",
    "punta sa Buntun Bridge sa mapa",
    "how to go to USL",
    "dalhin mo ako sa UCV",
    "route to Capitol"
]

all_passed = True
for q in test_queries:
    res = parse_voice_route(q)
    print(f"Query: '{q}' -> Matched: {res['matched']} at {res.get('coords')}")
    if not res or not res['matched']:
        all_passed = False

print(f"\nAll tests passed: {all_passed}")

