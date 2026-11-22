"""Attach audited visualization models without changing electrical geometry.

Call apply_models(board) from a coordinated PCB edit, or supply DIFFERENT input
and output paths. The CLI never overwrites its input or an existing output.
Run with KiCad's Python. Model assets and provenance live in lib/3d/.
"""
from pathlib import Path
import argparse
import hashlib
import json
import pcbnew

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / 'lib/3d/model_manifest.json'


def apply_models(board, absolute_paths=False):
    manifest = json.loads(MANIFEST.read_text(encoding='utf-8'))
    for item in manifest['attachments']:
        fp = board.FindFootprintByReference(item['reference'])
        if fp is None or fp.GetValue() != item['expected_value']:
            raise ValueError('Component identity changed: ' + item['reference'])
        path = ROOT / 'lib/3d' / item['file']
        if hashlib.sha256(path.read_bytes()).hexdigest() != item['sha256']:
            raise ValueError('Model asset changed: ' + str(path))
    for item in manifest['attachments']:
        fp = board.FindFootprintByReference(item['reference'])
        model = pcbnew.FP_3DMODEL()
        model.m_Filename = (str(ROOT / 'lib/3d' / item['file']) if absolute_paths
                            else '${KIPRJMOD}/lib/3d/' + item['file'])
        model.m_Offset = pcbnew.VECTOR3D(*item['offset_mm'])
        model.m_Rotation = pcbnew.VECTOR3D(*item['rotation_deg'])
        model.m_Scale = pcbnew.VECTOR3D(1, 1, 1)
        fp.Models().clear()
        fp.Models().push_back(model)
    return [item['reference'] for item in manifest['attachments']]


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('input', type=Path)
    parser.add_argument('output', type=Path)
    parser.add_argument('--absolute-paths', action='store_true',
                        help='Private previews outside project root only')
    args = parser.parse_args()
    if args.input.resolve() == args.output.resolve() or args.output.exists():
        parser.error('Use a new output path; input and existing files are protected.')
    board = pcbnew.LoadBoard(str(args.input))
    changed = apply_models(board, args.absolute_paths)
    pcbnew.SaveBoard(str(args.output), board)
    print(json.dumps({'output': str(args.output), 'models_updated': changed}))
