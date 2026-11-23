"""Package the prebuilt InnovateX exhibit for browsers running from disk."""

from pathlib import Path
from tempfile import NamedTemporaryFile
from zipfile import ZIP_DEFLATED, ZipFile


def main():
    root = Path(__file__).resolve().parent
    destination = root.parent / "RAMS Presentation - Offline.zip"
    files = [root / name for name in ("Finals.html", "index.html", "style.css", "chapters.css", "README.md")]
    for directory in ("assets", "public", "verification"):
        files.extend(sorted(path for path in (root / directory).rglob("*") if path.is_file()))

    # A normally playable clip can mask missing fallback frames; require both.
    required = [root / "public/presenters" / f"RAMS Presenter Script.{ext}" for ext in ("docx", "pdf")]
    required.append(root / "public/presenters/RAMS InnovateX 2026 National Finals Slides.pdf")
    required.append(root / "public/presenters/RAMS AI Use Disclosure.pdf")
    for story in ("pairing", "motorcycle", "car", "pedestrian", "fall"):
        required.append(root / "public/scenarios" / f"{story}.mp4")
        for phase in range(3):
            required.append(root / "public/scenarios" / f"{story}-{phase}.webp")
    for name in ("phone", "wearable", "receiver", "station"):
        required.append(root / "public/relay" / f"{name}.webp")
    for path in required:
        if not path.is_file() or not path.stat().st_size:
            raise FileNotFoundError(path)

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
