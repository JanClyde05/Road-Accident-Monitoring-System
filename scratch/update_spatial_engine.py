import sys

file_path = "apps/android_app/app/src/main/java/com/example/ai/TuguegaraoOfflineSpatialEngine.kt"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace LANDMARKS block
old_landmarks_start = "    val LANDMARKS = listOf("
old_landmarks_end = "    val TUGUEGARAO_VOCABULARY_BIASING = arrayOf("

new_landmarks_block = """    val LANDMARKS = listOf(
        Landmark(
            id = "sm_city",
            name = "SM City Tuguegarao",
            lat = 17.62805,
            lon = 121.71890,
            barangay = "Caritan Norte",
            corridor = "Bagay Road / Diversion Road II",
            category = "MALL",
            aliases = listOf("sm city", "sm city tuguegarao", "sm caritan", "sm bagay", "bagay road sm", "new sm"),
            navigationTips = "Accessible via Bagay Road from Centro or through the Caritan bypass road. Major tricycle terminal located at the main transport bay."
        ),
        Landmark(
            id = "sm_center",
            name = "SM Center Tuguegarao Downtown",
            lat = 17.61275,
            lon = 121.72379,
            barangay = "Ugac Sur / Centro 01",
            corridor = "Luna Street cor. Mabini Street",
            category = "MALL",
            aliases = listOf("sm downtown", "sm center", "sm centro", "old sm", "sm mall downtown"),
            navigationTips = "Located in the heart of Centro downtown commercial district. One-way traffic rules apply along Luna and Mabini streets."
        ),
        Landmark(
            id = "robinsons",
            name = "Robinsons Place Tuguegarao",
            lat = 17.62806,
            lon = 121.73350,
            barangay = "Tanza",
            corridor = "Maharlika Highway (AH26)",
            category = "MALL",
            aliases = listOf("robinsons", "robinsons place", "rob", "robinsons tuguegarao", "robinsons tanza"),
            navigationTips = "Positioned along Maharlika Highway in Brgy. Tanza with direct arterial access and dedicated transport terminal."
        ),
        Landmark(
            id = "mcnp",
            name = "Medical Colleges of Northern Philippines (MCNP / ISAP)",
            lat = 17.64210,
            lon = 121.76150,
            barangay = "Alimannao Hills",
            corridor = "Maharlika Highway / Alimannao Road",
            category = "UNIVERSITY",
            aliases = listOf("mcnp", "isap", "mcnp isap", "medical college of northern philippines", "medical colleges of northern philippines", "alimannao", "alimannao hills"),
            navigationTips = "Head east toward Alimannao Hills along Maharlika Highway/Alimannao road. Serviced by eastern line tricycles and Alimannao-Peñablanca PUJs."
        ),
        Landmark(
            id = "csu_carig",
            name = "Cagayan State University - Carig Campus",
            lat = 17.65905,
            lon = 121.75318,
            barangay = "Carig Sur",
            corridor = "Regional Government Center Avenue",
            category = "UNIVERSITY",
            aliases = listOf("csu carig", "csu carig campus", "carig campus", "csu engineering", "cagayan state university carig"),
            navigationTips = "Head north along Maharlika Highway through Balzain and Caritan. Turn right into Carig Sur at Dalan na Pavvurulun. Red and green line tricycles service this route."
        ),
        Landmark(
            id = "csu_andrews",
            name = "Cagayan State University - Andrews Campus",
            lat = 17.61860,
            lon = 121.72250,
            barangay = "Caritan Centro",
            corridor = "Andrews Road / Caritan",
            category = "UNIVERSITY",
            aliases = listOf("csu andrews", "csu main", "andrews campus", "csu caritan"),
            navigationTips = "Located in Caritan Centro, easily reached from Centro via Bonifacio or Rizal street."
        ),
        Landmark(
            id = "usl",
            name = "University of Saint Louis Tuguegarao (USL)",
            lat = 17.61016,
            lon = 121.72327,
            barangay = "Ugac Norte / Balzain",
            corridor = "Mabini Street cor. College Avenue",
            category = "UNIVERSITY",
            aliases = listOf("usl", "saint louis", "st louis", "university of saint louis", "louisian"),
            navigationTips = "Major university hub along Mabini Street near Balzain junction. High pedestrian crossing density."
        ),
        Landmark(
            id = "spup",
            name = "Saint Paul University Philippines (SPUP)",
            lat = 17.61733,
            lon = 121.72351,
            barangay = "Balzain West / Mabini",
            corridor = "Mabini Street cor. College Avenue",
            category = "UNIVERSITY",
            aliases = listOf("spup", "saint paul", "st paul", "paulinian"),
            navigationTips = "Situated along western Mabini Street leading directly toward Buntun Bridge."
        ),
        Landmark(
            id = "ucv",
            name = "University of Cagayan Valley (UCV)",
            lat = 17.62402,
            lon = 121.72871,
            barangay = "Balzain West",
            corridor = "Balzain Highway",
            category = "UNIVERSITY",
            aliases = listOf("ucv", "cagayan valley university", "university of cagayan valley", "ucv balzain"),
            navigationTips = "Located along Balzain Highway between Centro and Caritan. Main academic campus."
        ),
        Landmark(
            id = "cvmc",
            name = "Cagayan Valley Medical Center (CVMC)",
            lat = 17.65661,
            lon = 121.74702,
            barangay = "Carig Sur",
            corridor = "Dalan na Pagayaya / Maharlika Highway",
            category = "HOSPITAL",
            aliases = listOf("cvmc", "cagayan valley medical center", "provincial hospital", "carig hospital", "regional hospital", "ospital"),
            navigationTips = "Primary tertiary government hospital in Region 02. Located in Carig Sur with 24/7 trauma emergency room."
        ),
        Landmark(
            id = "buntun_bridge",
            name = "Buntun Bridge",
            lat = 17.61437,
            lon = 121.68643,
            barangay = "Buntun",
            corridor = "Luna Extension / Santiago-Tuguegarao Road",
            category = "BRIDGE",
            aliases = listOf("buntun bridge", "buntun", "tulay ng buntun", "cagayan river bridge", "tulay"),
            navigationTips = "The second longest bridge in the Philippines spanning the Cagayan River toward Solana. Strong crosswinds; two-wheelers must maintain lane discipline."
        ),
        Landmark(
            id = "cathedral",
            name = "Saint Peter Metropolitan Cathedral",
            lat = 17.61359,
            lon = 121.73050,
            barangay = "Centro 02",
            corridor = "Rizal Street",
            category = "HISTORIC",
            aliases = listOf("cathedral", "st peter cathedral", "saint peter cathedral", "simbahan ng tuguegarao", "simbahan"),
            navigationTips = "18th-century Baroque cathedral facing the central plaza in downtown Centro."
        ),
        Landmark(
            id = "city_hall",
            name = "Tuguegarao City Hall (People's Gymnasium)",
            lat = 17.65053,
            lon = 121.75381,
            barangay = "Carig Sur",
            corridor = "Enrile Boulevard / Carig",
            category = "GOVERNMENT",
            aliases = listOf("city hall", "tuguegarao city hall", "peoples gym", "people's gym", "peoples gymnasium", "gym"),
            navigationTips = "Located inside the Carig Regional Government Center. Houses the City Traffic Management Group (TMG) and Mayor's Office."
        ),
        Landmark(
            id = "capitol",
            name = "Cagayan Provincial Capitol",
            lat = 17.64848,
            lon = 121.76037,
            barangay = "Carig Sur / Caggay",
            corridor = "Capitol Drive / Regional Government Center",
            category = "GOVERNMENT",
            aliases = listOf("capitol", "provincial capitol", "cagayan capitol", "kapitolyo"),
            navigationTips = "Provincial government seat in Carig Sur with large public park grounds."
        ),
        Landmark(
            id = "airport",
            name = "Tuguegarao Domestic Airport (TUG)",
            lat = 17.64374,
            lon = 121.73407,
            barangay = "Pengue-Ruyu",
            corridor = "Badaje Avenue / Airport Road",
            category = "TRANSIT",
            aliases = listOf("airport", "tuguegarao airport", "paliparan"),
            navigationTips = "Commercial airport terminal in Pengue-Ruyu with direct flights to Manila."
        ),
        Landmark(
            id = "mall_of_the_valley",
            name = "Mall of the Valley",
            lat = 17.61449,
            lon = 121.72806,
            barangay = "Centro 04",
            corridor = "Bonifacio Street cor. Luna Street",
            category = "MALL",
            aliases = listOf("mall of the valley", "mov", "mall valley"),
            navigationTips = "Historic shopping center in Centro near St. Peter Cathedral."
        ),
        Landmark(
            id = "brickstone",
            name = "Brickstone Mall",
            lat = 17.62850,
            lon = 121.73249,
            barangay = "Tanza",
            corridor = "Maharlika Highway",
            category = "MALL",
            aliases = listOf("brickstone", "brickstone mall", "unitop centro"),
            navigationTips = "Commercial shopping mall along Maharlika Highway near Robinsons Place."
        ),
        Landmark(
            id = "don_domingo",
            name = "Don Domingo Public Market",
            lat = 17.62499,
            lon = 121.73296,
            barangay = "Centro II / Tanza",
            corridor = "Liban Street / Balzain Highway",
            category = "MARKET",
            aliases = listOf("don domingo", "don domingo market", "balzain market", "pamilihan"),
            navigationTips = "Major wet and dry market and northern provincial bus/van dispatch station."
        )
    )

"""

idx_start = content.find(old_landmarks_start)
idx_end = content.find(old_landmarks_end)

if idx_start != -1 and idx_end != -1:
    content = content[:idx_start] + new_landmarks_block + content[idx_end:]
    print("LANDMARKS block replaced successfully.")
else:
    print(f"Error finding landmarks block: idx_start={idx_start}, idx_end={idx_end}")
    sys.exit(1)

# Add MCNP, ISAP, UCV to vocabulary biasing
old_vocab = 'val TUGUEGARAO_VOCABULARY_BIASING = arrayOf(\n        "Tuguegarao", "Tuguegarao City", "SM City", "SM City Tuguegarao", "SM Downtown",'
new_vocab = 'val TUGUEGARAO_VOCABULARY_BIASING = arrayOf(\n        "Tuguegarao", "Tuguegarao City", "SM City", "SM City Tuguegarao", "SM Downtown", "MCNP", "ISAP", "Alimannao", "UCV",'
content = content.replace(old_vocab, new_vocab)

# Add phonetic misrecognition rules for MCNP, ISAP, UCV
old_phonetics = '        // SM City misrecognitions'
new_phonetics = """        // MCNP & ISAP misrecognitions
        text = text.replace(Regex("(?i)\\\\b(m c n p|em see en pee|em c n p|mcnp isap|mcnp-isap|medical college)\\\\b"), "MCNP")
        text = text.replace(Regex("(?i)\\\\b(i s a p|eye sap|isap)\\\\b"), "ISAP")
        text = text.replace(Regex("(?i)\\\\b(you see vee|u c v)\\\\b"), "UCV")
        // SM City misrecognitions"""
content = content.replace(old_phonetics, new_phonetics)

# Fix longitude typo 17.7289 -> 121.7289
content = content.replace("val fromLon = if (userLon != 0.0) userLon else 17.7289", "val fromLon = if (userLon != 0.0) userLon else 121.7289")

with open(file_path, "w", encoding="utf-8", newline="\n") as f:
    f.write(content)

print("Updated TuguegaraoOfflineSpatialEngine.kt successfully.")

