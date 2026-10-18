"""Genera una vista previa de un solo archivo (CSS, JS, fuentes e imágenes embebidas).

Uso:  python3 build_preview.py            -> dist/hemisferio-vista-previa.html
      python3 build_preview.py --artifact -> dist/hemisferio-artifact.html (sin <html>/<head>/<body>)
"""
import base64, mimetypes, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent
DIST = ROOT / "dist"


def data_uri(path: pathlib.Path) -> str:
    mime = mimetypes.guess_type(path.name)[0] or ("font/woff2" if path.suffix == ".woff2" else "application/octet-stream")
    return f"data:{mime};base64," + base64.b64encode(path.read_bytes()).decode()


def inline_urls(text: str, base: pathlib.Path) -> str:
    def repl(m):
        ref = m.group(2)
        p = (base / ref).resolve()
        return f"{m.group(1)}{data_uri(p)}{m.group(3)}" if p.is_file() else m.group(0)
    text = re.sub(r'(url\(")([^"]+\.(?:woff2|png|jpg|jpeg|svg))("\))', repl, text)
    text = re.sub(r'((?:src|href)=")((?:\.\./)?assets/[^"]+)(")', repl, text)
    return text


def build(artifact: bool) -> pathlib.Path:
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    css = inline_urls((ROOT / "css/styles.css").read_text(encoding="utf-8"), ROOT / "css")
    cfg = (ROOT / "js/config.js").read_text(encoding="utf-8")
    cfg = re.sub(r'(")(assets/[^"]+\.(?:jpg|jpeg|png))(")', lambda m: m.group(1) + data_uri(ROOT / m.group(2)) + m.group(3), cfg)
    js = (ROOT / "js/main.js").read_text(encoding="utf-8")
    mica = (ROOT / "js/mica.js").read_text(encoding="utf-8")
    micakb = (ROOT / "js/mica-conocimiento.js").read_text(encoding="utf-8")
    libro = (ROOT / "js/libro.js").read_text(encoding="utf-8")

    html = html.replace('<link rel="stylesheet" href="css/styles.css">', f"<style>\n{css}\n</style>")
    html = re.sub(r'<link rel="preload"[^>]+>\n', "", html)
    html = html.replace('<script src="js/config.js"></script>', f"<script>\n{cfg}\n</script>")
    html = html.replace('<script src="js/main.js"></script>', f"<script>\n{js}\n</script>")
    html = html.replace('<script src="js/mica-conocimiento.js"></script>', f"<script>\n{micakb}\n</script>")
    html = html.replace('<script src="js/mica.js"></script>', f"<script>\n{mica}\n</script>")
    html = html.replace('<script src="js/libro.js"></script>', f"<script>\n{libro}\n</script>")
    html = inline_urls(html, ROOT)

    if artifact:
        title = re.search(r"<title>.*?</title>", html, re.S).group(0)
        style = re.search(r"<style>.*?</style>", html, re.S).group(0)
        body = html.split("<!--BODY-START-->", 1)[1].split("<!--BODY-END-->", 1)[0]
        html = (title + '\n<meta name="claude:viewport-fit-sides" content="cover">\n'
                + '<meta name="description" content="Terapia física y rehabilitación especializada, con énfasis en neurorehabilitación.">\n'
                + style + "\n" + body)
        out = DIST / "hemisferio-artifact.html"
    else:
        out = DIST / "hemisferio-vista-previa.html"

    DIST.mkdir(exist_ok=True)
    out.write_text(html, encoding="utf-8")
    return out


if __name__ == "__main__":
    p = build("--artifact" in sys.argv)
    print(p, round(p.stat().st_size / 1024), "KB")
