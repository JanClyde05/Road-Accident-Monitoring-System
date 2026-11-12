import math

nodes = {
    "csucarig": (17.65905, 121.75318),
    "carignorte_jct": (17.65350, 121.74850),
    "cvmc_jct": (17.65661, 121.74702),
    "caggay_jct": (17.64500, 121.75000),
    "capitol_jct": (17.64848, 121.76037),
    "mcnp_jct": (17.64210, 121.76150),
    "airport_jct": (17.63800, 121.74100),
    "airport_term": (17.64374, 121.73407),
    "pengueruyu_jct": (17.63200, 121.73950),
    "robinsons_tanza": (17.62806, 121.73350),
    "dondomingo_jct": (17.62499, 121.73296),
    "smcity_bagay": (17.62805, 121.71890),
    "caritan_jct": (17.62200, 121.72200),
    "ucv_balzain": (17.62402, 121.72871),
    "usl_mabini": (17.61016, 121.72327),
    "spup_mabini": (17.61733, 121.72351),
    "smcenter_luna": (17.61275, 121.72379),
    "cathedral_rizal": (17.61359, 121.73050),
    "centro_gomez": (17.61449, 121.72806),
    "buntun_hwy": (17.61360, 121.70500),
    "buntun_bridge": (17.61437, 121.68643)
}

edges = [
    ("csucarig", "carignorte_jct"),
    ("carignorte_jct", "cvmc_jct"),
    ("cvmc_jct", "caggay_jct"),
    ("caggay_jct", "airport_jct"),
    ("airport_jct", "pengueruyu_jct"),
    ("pengueruyu_jct", "robinsons_tanza"),
    ("robinsons_tanza", "dondomingo_jct"),
    
    # Alimannao corridor
    ("caggay_jct", "capitol_jct"),
    ("capitol_jct", "mcnp_jct"),
    
    # Airport corridor
    ("airport_jct", "airport_term"),
    
    # Bagay Road corridor
    ("carignorte_jct", "smcity_bagay"),
    ("smcity_bagay", "caritan_jct"),
    ("caritan_jct", "spup_mabini"),
    
    # Balzain connector
    ("dondomingo_jct", "ucv_balzain"),
    ("ucv_balzain", "caritan_jct"),
    
    # Downtown Centro grid
    ("dondomingo_jct", "cathedral_rizal"),
    ("cathedral_rizal", "centro_gomez"),
    ("centro_gomez", "smcenter_luna"),
    ("smcenter_luna", "usl_mabini"),
    ("smcenter_luna", "spup_mabini"),
    ("usl_mabini", "spup_mabini"),
    
    # Buntun corridor
    ("spup_mabini", "buntun_hwy"),
    ("buntun_hwy", "buntun_bridge")
]

def dist(p1, p2):
    dlat = (p2[0] - p1[0]) * 111.0
    dlon = (p2[1] - p1[1]) * 105.0
    return math.sqrt(dlat*dlat + dlon*dlon)

adj = {k: [] for k in nodes}
for u, v in edges:
    d = dist(nodes[u], nodes[v])
    adj[u].append((v, d))
    adj[v].append((u, d))

def dijkstra(start_node, end_node):
    import heapq
    pq = [(0, start_node, [start_node])]
    visited = set()
    while pq:
        d, curr, path = heapq.heappop(pq)
        if curr in visited:
            continue
        visited.add(curr)
        if curr == end_node:
            return path, d
        for neighbor, weight in adj[curr]:
            if neighbor not in visited:
                heapq.heappush(pq, (d + weight, neighbor, path + [neighbor]))
    return None, float('inf')

# Test routing from user (e.g. near Tuguegarao Centro) to MCNP
user_pt = (17.64998, 121.74413) # User location in screenshot
dest_pt = nodes["mcnp_jct"] # MCNP

# Find nearest nodes
start_node = min(nodes.keys(), key=lambda k: dist(user_pt, nodes[k]))
end_node = min(nodes.keys(), key=lambda k: dist(dest_pt, nodes[k]))

path, total_dist = dijkstra(start_node, end_node)
print(f"Routing from {start_node} to {end_node}:")
print(" -> ".join(path))
print(f"Total road distance: {total_dist:.2f} km")

