"""Serve the exhibit on loopback with seekable road films."""

from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import re


class ExhibitHandler(SimpleHTTPRequestHandler):
    def send_head(self):
        self.remaining = None
        path = Path(self.translate_path(self.path))
        requested = self.headers.get("Range")
        if path.suffix.lower() != ".mp4" or requested is None or not path.is_file():
            return super().send_head()

        length = path.stat().st_size
        match = re.fullmatch(r"bytes=(\d*)-(\d*)", requested.strip())
        if not match or not any(match.groups()):
            # A server may ignore unsupported ranges, including multipart requests.
            return super().send_head()
        first, last = match.groups()
        start = int(first) if first else max(0, length - int(last))
        end = min(int(last), length - 1) if first and last else length - 1
        if start > end or start >= length:
            self.send_response(416)
            self.send_header("Content-Range", f"bytes */{length}")
            self.send_header("Content-Length", "0")
            self.end_headers()
            return None

        stream = path.open("rb")
        stream.seek(start)
        self.remaining = end - start + 1
        self.send_response(206)
        self.send_header("Content-Type", "video/mp4")
        self.send_header("Content-Range", f"bytes {start}-{end}/{length}")
        self.send_header("Content-Length", str(self.remaining))
        self.end_headers()
        return stream

    def end_headers(self):
        if self.path.split("?", 1)[0].lower().endswith(".mp4"):
            self.send_header("Accept-Ranges", "bytes")
        super().end_headers()

    def copyfile(self, source, output):
        if self.remaining is None:
            return super().copyfile(source, output)
        try:
            while self.remaining:
                chunk = source.read(min(self.remaining, 64 * 1024))
                if not chunk:
                    break
                output.write(chunk)
                self.remaining -= len(chunk)
        except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError):
            # A new seek or chapter cancels the previous media request.
            pass


if __name__ == "__main__":
    handler = partial(ExhibitHandler, directory=str(Path(__file__).resolve().parent))
    with ThreadingHTTPServer(("127.0.0.1", 8765), handler) as server:
        server.serve_forever()
