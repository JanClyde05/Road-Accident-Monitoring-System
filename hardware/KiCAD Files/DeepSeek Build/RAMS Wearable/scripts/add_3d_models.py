"""Attach 3D bodies to RAMS_JLC_S3.kicad_pcb footprints that have none.

KiCad stock footprints already carry ${KICAD10_3DMODEL_DIR} paths, so after a
DRC-clean board the only parts with no body are the custom RAMS_JLC footprints
and the bare-pad test points. Bodies are only attached where the stock model is
the same package as the fitted part:

  Y1  Abracon ABM8 3.2 x 2.5 mm 4-pin
      -> Crystal_SMD_Abracon_ABM8G-4Pin_3.2x2.5mm.step
      Same package family and land pattern; the ABM8G body is 3.2 x 2.5 x 0.8,
      the ABM8 in the BOM is the same size.

  U2  Ai-Thinker Ra-02 on an Ra-01 land pattern
      -> ${KIPRJMOD}/3dmodels/LoRa_Module_RA-02_AiThinker.step
      Supplier STEP for the actual fitted module, which has the IPEX connector
      the stock Ra-01 body lacks. Copied into the project so the board does not
      depend on a path outside it.

Deliberately left without a body: ANT1 (Johanson 2450AT18B100E chip antenna),
BZ1 (9650 buzzer), SW1 (Shouhan MSK12C02), LED1 (WS2812B-2020) and TP1-TP8
(bare 1 mm pads). No stock model matches those packages, and SW1/LED1 previously
carried paths to files that do not exist, so they rendered as nothing while
looking configured. A body of the wrong size is worse than none when the file is
used for a mechanical fit check. Add real supplier STEPs if they are sourced.

Rotation is left at zero. A rotated or offset body is only visible in the 3D
viewer, so check it there by eye before trusting a mechanical clearance figure.

Usage:  python add_3d_models.py [--dry-run]
"""

import argparse

import pcbnew

BOARD = "RAMS_JLC_S3.kicad_pcb"
STOCK = "${KICAD10_3DMODEL_DIR}"
ADD = {
    "Y1": STOCK + "/Crystal.3dshapes/Crystal_SMD_Abracon_ABM8G-4Pin_3.2x2.5mm.step",
}
REPLACE = {
    "U2": "${KIPRJMOD}/3dmodels/LoRa_Module_RA-02_AiThinker.step",
}
# Bodies whose stored path names a file that does not exist in the installed
# library. They were silently ignored by the 3D viewer and reported by
# `kicad-cli pcb export step` as "Could not add 3D model". Dropping them makes
# the gap visible instead of pretending the part has a body.
REMOVE = {
    "SW1": "SW_SPDT_Shouhan_MSK12C02.step is not in Button_Switch_SMD.3dshapes",
    "LED1": "LED_WS2812B-2020_PLCC4_2.0x2.0mm.step is not in LED_SMD.3dshapes",
}


def _drop_all(models):
    while len(models):
        if hasattr(models, "pop_back"):
            models.pop_back()
        else:
            models.__delitem__(len(models) - 1)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("board", nargs="?", default=BOARD)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    board = pcbnew.LoadBoard(args.board)
    added = replaced = removed = 0

    for fp in board.GetFootprints():
        ref = fp.GetReference()
        if ref in REPLACE:
            models = fp.Models()
            if len(models) != 1:
                print("SKIP %s: expected one existing model, found %d" % (ref, len(models)))
                continue
            print("%s: %s -> %s" % (ref, models[0].m_Filename, REPLACE[ref]))
            models[0].m_Filename = REPLACE[ref]
            replaced += 1
        elif ref in REMOVE:
            models = fp.Models()
            if not len(models):
                print("SKIP %s: already has no body" % ref)
                continue
            for m in [models[i].m_Filename for i in range(len(models))]:
                print("%s: dropping broken body %s (%s)" % (ref, m, REMOVE[ref]))
            _drop_all(models)
            removed += 1
        elif ref in ADD:
            if len(fp.Models()):
                print("SKIP %s: already has a model" % ref)
                continue
            # A new FP_3DMODEL already carries scale 1, offset 0, rotation 0.
            model = pcbnew.FP_3DMODEL()
            model.m_Filename = ADD[ref]
            models = fp.Models()
            try:
                models.push_back(model)
            except AttributeError:
                models.append(model)
            print("%s: %s" % (ref, ADD[ref]))
            added += 1

    missing = [fp.GetReference() for fp in board.GetFootprints() if not len(fp.Models())]
    print("added=%d replaced=%d removed=%d still-without-body=%s"
          % (added, replaced, removed, ",".join(sorted(missing)) or "none"))

    if args.dry_run:
        print("dry run, board not written")
        return
    pcbnew.SaveBoard(args.board, board)
    print("saved %s" % args.board)


if __name__ == "__main__":
    main()
