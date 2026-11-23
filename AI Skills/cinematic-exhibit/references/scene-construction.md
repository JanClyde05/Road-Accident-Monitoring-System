# Scene construction

## Land and vegetation

Block the stage in consistent units. Place the road, river, wall, equipment footprint or other focal feature first. Reuse its centerline or occupied footprint for camera targets, callouts and vegetation exclusion. Sample each trunk base from the same height field or mesh used to draw the ground. Rebuild instanced bounds if transforms change. Orbit to a low angle to reveal hovering roots, trunks poking through paths and clipped crowns.

Use vegetation at the distance the camera can resolve. Near the subject, find a licensed species-appropriate asset or model a branching silhouette with recognizable crowns and trunks. In the middle distance, instance a few compatible mesh/material variants inside spatial cells. Vary height, orientation, canopy width and density with a reproducible seed. Break up row-like periodicity with clusters, gaps and topographic changes. For distant ridges, a canopy silhouette, a textured impostor, or sparse point returns can convey scale. Limit alpha overlap from leaf cards on low-end GPUs. Keep an opening where the camera must see the subject. Examine a ground-level viewpoint as well as the establishing shot.

For a surveyed look, derive points by sampling triangles according to their surface area. Share the source transforms, including skinning or wind deformation when the object moves. A band traveling along one axis or away from a center uses the same coordinate space in the solid, line and point passes. A reversible scrub should reveal the same branches and edges in both directions. If a map or atlas is the primary artifact, a registered contour layer can carry the same visual idea over its image.

## Light and surfaces

Choose the key light by asking which pair of faces must read as different materials. Add a broad sky or environment contribution to the dark side. Use a practical source, such as a window or lamp, to justify any warm reflection or cool rim. Light the ground around the object and check contact shadows where it rests. Group surfaces by physical response: paint, bare metal, glass, rubber, bark and leaves each respond differently to an environment. Capture a dry, neutral frame while adjusting exposure. Apply tone mapping and display color conversion once.

For wet pavement, preserve a rough aggregate layer and broad areas of drier material. A licensed roughness or normal texture should tile at a plausible scale beside a wheel, shoe or curb. Mask smoother water into patches. Choose an environment reflection, a planar reflection for a flat patch, or a more expensive technique only where the camera reveals the difference. Check a bright lamp and its reflection from two viewpoints. For glass, place something recognizable behind the pane so refraction has a visible source. Lens drops belong in camera space; render readable labels after the refraction pass.

Use a physically connected event timeline for animated objects. At first contact, align their actual surfaces; after contact, deformation, secondary motion and loose parts follow that same location and time. Test a side view and a scrub across contact. Caption the scene as illustrative where choreography, damage or motion is authored rather than measured.

## Camera and frame pacing

Store a target point, viewing distance and arrival pose for each explanatory shot. For a handoff, hold the sender long enough to locate it, widen to reveal the path, then settle on the receiver. Selecting a different destination must replace the active transition. Render a still at each settled camera pose for environments where live graphics are unavailable.

Before polishing a costly effect, compare a representative shot with and without it on the intended renderer. Warm up shader compilation, then measure actual wall-clock elapsed time, median frame interval and the slowest tail such as p95. Report the viewport, device-pixel ratio, renderer and motion setting. For films, also compare elapsed wall time with video time advanced and the browser’s decoded/dropped frame counts when available. Software-rendered headless measurements and a physical presentation laptop describe different conditions.

On constrained hardware, try reusing scene buffers and materials, capping render scale, rendering static inspection views on demand and removing redundant passes. Release event listeners, GPU allocations and temporary media work when the view unmounts. A fixed film can preserve the art direction on a machine that cannot render the same shot in real time. Verify seeks at the start, contact, and settled state after a chapter change, then force a decoder error and confirm the local still and phase text continue to follow the control.
