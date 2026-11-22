"""Package the prebuilt InnovateX exhibit for browsers running from disk."""

from pathlib import Path
from tempfile import NamedTemporaryFile
from zipfile import ZIP_DEFLATED, ZipFile


def main():
    root = Path(__file__).resolve().parent
    destination = root.parent / "RAMS Presentation - Offline.zip"
    files = [root / name for name in ("index.html", "style.css", "chapters.css", "README.md")]
    for directory in ("assets", "public", "verification"):
        files.extend(sorted(path for path in (root / directory).rglob("*") if path.is_file()))

    # These posters load only when WebGL is unavailable, so a normal preview
    # can succeed even if an artwork export was interrupted.
    for story in ("pairing", "motorcycle", "car", "pedestrian", "fall"):
        for phase in range(3):
            poster = root / "public" / "scenarios" / f"{story}-{phase}.webp"
            if not poster.is_file() or not poster.stat().st_size:
                raise FileNotFoundError(poster)

    with NamedTemporaryFile(dir=destination.parent, suffix=".zip", delete=False) as temp:
        temporary = Path(temp.name)
    try:
        with ZipFile(temporary, "w", ZIP_DEFLATED, compresslevel=9) as archive:
            for path in files:
                archive.write(path, path.relative_to(root).as_posix())
        with ZipFile(temporary) as archive:
            damaged = archive.testzip()
            if damaged:
                raise ValueError(f"Damaged archive entry {damaged}")
        temporary.replace(destination)
        print(f"Packaged {len(files)} files in {destination.name}")
    finally:
        temporary.unlink(missing_ok=True)


if __name__ == "__main__":
    main()
