"""
Coffee Biochar Academy — Generador de audio con OpenAI TTS
Convierte los scripts de video en archivos MP3 listos para producción.

Uso:
    export OPENAI_API_KEY="sk-..."
    python3 generate_audio.py --session S1.1
    python3 generate_audio.py --session S1.1 --voice onyx
    python3 generate_audio.py --session S1.1 --video A   # solo un video

Voces disponibles (OpenAI TTS):
    onyx   — masculina, grave, autoritaria (recomendada para este programa)
    echo   — masculina, cálida, conversacional
    nova   — femenina, cálida, clara
    alloy  — neutra, profesional
    fable  — masculina, expresiva
    shimmer — femenina, suave
"""

import os
import re
import argparse
import sys
from pathlib import Path

# ── Configuración ──────────────────────────────────────────────────────────────

BASE_DIR = Path(__file__).parent
SCRIPTS_DIR = BASE_DIR
AUDIO_DIR = BASE_DIR / "audio"

DEFAULT_VOICE = "nova"       # femenina, cálida — mejor fonética en español
DEFAULT_MODEL = "tts-1-hd"   # máxima calidad

# ── Marcadores a eliminar del script (solo narración al API) ───────────────────

REMOVE_PATTERNS = [
    r"\[SLIDE\s*\d+[^\]]*\]",          # [SLIDE 5]
    r"\[B-ROLL:[^\]]*\]",              # [B-ROLL: foto campo]
    r"\[PANTALLA:[^\]]*\]",            # [PANTALLA: tabla]
    r"\[tono:[^\]]*\]",                # [tono: cálido]
    r"\[pausa\s*[\d.]+s?\]",           # [pausa 2s]
    r"\[PRE-ROLL[^\]]*\]",             # [PRE-ROLL — 3 segundos]
    r"\[FADE OUT[^\]]*\]",             # [FADE OUT]
    r"<!--[^>]*-->",                   # comentarios HTML
    r"^\s*---+\s*$",                   # separadores ---
    r"^\*\*\[FIN VIDEO[^\]]*\]\*\*.*$",# [FIN VIDEO ...]
    r"^\*\*\[FIN[^\]]*\]\*\*.*$",
]

# ── Funciones ──────────────────────────────────────────────────────────────────

def load_scripts(session: str) -> dict:
    """Lee el archivo de scripts y extrae el texto de cada video (A, B, C)."""
    script_file = SCRIPTS_DIR / f"{session}_Scripts_Video.md"
    if not script_file.exists():
        print(f"ERROR: No se encontró {script_file}")
        sys.exit(1)

    content = script_file.read_text(encoding="utf-8")

    # Separar por video usando los encabezados ## VIDEO S1.1-A / B / C
    video_sections = {}
    pattern = r"## VIDEO \S+?-([ABC])\n(.*?)(?=\n## VIDEO |\Z)"
    matches = re.findall(pattern, content, re.DOTALL)

    if not matches:
        print("ERROR: No se encontraron secciones de video (## VIDEO S1.1-A/B/C)")
        sys.exit(1)

    for letter, text in matches:
        video_sections[letter] = text.strip()

    return video_sections


def clean_narration(text: str) -> str:
    """Elimina todos los marcadores de producción — deja solo el texto a narrar."""
    # 1. Primero eliminar líneas de metadatos del script (antes de quitar **)
    text = re.sub(r"^\*\*Duración estimada:.*$", "", text, flags=re.MULTILINE)
    text = re.sub(r"^\*\*Cubre:.*$", "", text, flags=re.MULTILINE)
    text = re.sub(r"^Duración estimada:.*$", "", text, flags=re.MULTILINE)
    text = re.sub(r"^Cubre:.*$", "", text, flags=re.MULTILINE)

    # 2. Eliminar marcadores de producción con corchetes
    for pattern in REMOVE_PATTERNS:
        text = re.sub(pattern, "", text, flags=re.MULTILINE | re.IGNORECASE)

    # 3. Eliminar encabezados Markdown (### Título, ## Título)
    text = re.sub(r"^#{1,3}.*$", "", text, flags=re.MULTILINE)

    # 4. Eliminar líneas de solo asteriscos (separadores * o ***)
    text = re.sub(r"^\s*\*+\s*$", "", text, flags=re.MULTILINE)

    # 5. Eliminar negrita/cursiva Markdown — queda solo el texto
    text = re.sub(r"\*{1,3}([^*\n]+)\*{1,3}", r"\1", text)

    # 6. Limpiar líneas en blanco excesivas
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = text.strip()

    return text


def generate_audio(text: str, output_path: Path, voice: str, model: str):
    """Llama a OpenAI TTS y guarda el MP3."""
    try:
        from openai import OpenAI
    except ImportError:
        print("ERROR: pip3 install openai")
        sys.exit(1)

    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        print("ERROR: Variable OPENAI_API_KEY no encontrada.")
        print("       Ejecuta: export OPENAI_API_KEY='sk-...'")
        sys.exit(1)

    client = OpenAI(api_key=api_key)

    # OpenAI TTS tiene límite de 4096 caracteres por llamada
    # Para textos largos, dividimos en párrafos y concatenamos
    chunks = split_into_chunks(text, max_chars=4000)
    total_chunks = len(chunks)

    if total_chunks == 1:
        print(f"  Generando audio ({len(text):,} caracteres)...")
        response = client.audio.speech.create(
            model=model,
            voice=voice,
            input=text,
            response_format="mp3",
        )
        response.stream_to_file(str(output_path))
    else:
        # Generar chunks y combinar
        print(f"  Texto largo — generando en {total_chunks} partes...")
        chunk_paths = []

        for i, chunk in enumerate(chunks, 1):
            chunk_path = output_path.parent / f"_chunk_{i:02d}_{output_path.name}"
            print(f"  Parte {i}/{total_chunks} ({len(chunk):,} chars)...")
            response = client.audio.speech.create(
                model=model,
                voice=voice,
                input=chunk,
                response_format="mp3",
            )
            response.stream_to_file(str(chunk_path))
            chunk_paths.append(chunk_path)

        # Combinar con ffmpeg si está disponible, sino avisar
        combine_audio_chunks(chunk_paths, output_path)

        # Limpiar chunks temporales
        for cp in chunk_paths:
            cp.unlink(missing_ok=True)


def split_into_chunks(text: str, max_chars: int = 4000) -> list:
    """Divide el texto en chunks respetando párrafos."""
    if len(text) <= max_chars:
        return [text]

    paragraphs = text.split("\n\n")
    chunks = []
    current = ""

    for para in paragraphs:
        if len(current) + len(para) + 2 <= max_chars:
            current += ("\n\n" if current else "") + para
        else:
            if current:
                chunks.append(current.strip())
            # Si un solo párrafo es mayor al límite, dividir por oraciones
            if len(para) > max_chars:
                sentences = re.split(r"(?<=[.!?])\s+", para)
                current = ""
                for s in sentences:
                    if len(current) + len(s) + 1 <= max_chars:
                        current += (" " if current else "") + s
                    else:
                        if current:
                            chunks.append(current.strip())
                        current = s
            else:
                current = para

    if current:
        chunks.append(current.strip())

    return chunks


def combine_audio_chunks(chunk_paths: list, output_path: Path):
    """Combina múltiples MP3 en uno solo usando ffmpeg."""
    import shutil
    import subprocess

    if shutil.which("ffmpeg"):
        # Crear lista de archivos para ffmpeg
        list_file = output_path.parent / "_concat_list.txt"
        list_file.write_text(
            "\n".join(f"file '{p.resolve()}'" for p in chunk_paths)
        )
        subprocess.run(
            ["ffmpeg", "-y", "-f", "concat", "-safe", "0",
             "-i", str(list_file), "-c", "copy", str(output_path)],
            check=True, capture_output=True
        )
        list_file.unlink(missing_ok=True)
        print(f"  Chunks combinados con ffmpeg.")
    else:
        # Sin ffmpeg: concatenar bytes directamente (funciona para MP3)
        with open(output_path, "wb") as out:
            for cp in chunk_paths:
                out.write(cp.read_bytes())
        print(f"  Chunks combinados (sin ffmpeg — calidad OK para MP3).")


def preview_text(text: str, video: str, chars: int = 300):
    """Muestra los primeros caracteres del texto a narrar."""
    print(f"\n  --- PREVIEW Video {video} (primeros {chars} chars) ---")
    print(text[:chars].replace("\n", " "))
    print(f"  ... [{len(text):,} caracteres en total]")
    print(f"  --- FIN PREVIEW ---\n")


# ── Main ───────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Genera audio MP3 para los videos de Coffee Biochar Academy"
    )
    parser.add_argument(
        "--session", required=True,
        help="Código de sesión, ej: S1.1, S2.3"
    )
    parser.add_argument(
        "--video", choices=["A", "B", "C", "all"], default="all",
        help="Video específico a generar (default: all)"
    )
    parser.add_argument(
        "--voice", default=DEFAULT_VOICE,
        choices=["onyx", "echo", "nova", "alloy", "fable", "shimmer"],
        help=f"Voz OpenAI TTS (default: {DEFAULT_VOICE})"
    )
    parser.add_argument(
        "--model", default=DEFAULT_MODEL,
        choices=["tts-1", "tts-1-hd"],
        help=f"Modelo TTS (default: {DEFAULT_MODEL})"
    )
    parser.add_argument(
        "--preview", action="store_true",
        help="Solo muestra el texto que se enviaría al API, sin generar audio"
    )
    args = parser.parse_args()

    # Cargar scripts
    print(f"\nCoffee Biochar Academy — Generador de Audio")
    print(f"Sesión: {args.session} | Voz: {args.voice} | Modelo: {args.model}")
    print("─" * 50)

    video_scripts = load_scripts(args.session)
    videos_to_generate = list(video_scripts.keys()) if args.video == "all" else [args.video]

    # Crear directorio de salida
    AUDIO_DIR.mkdir(exist_ok=True)

    for video_letter in videos_to_generate:
        if video_letter not in video_scripts:
            print(f"  WARN: Video {video_letter} no encontrado en el script.")
            continue

        raw_text = video_scripts[video_letter]
        clean_text = clean_narration(raw_text)
        output_file = AUDIO_DIR / f"{args.session}-{video_letter}.mp3"

        print(f"\nVideo {video_letter}:")
        print(f"  Texto limpio: {len(clean_text):,} caracteres")

        if args.preview:
            preview_text(clean_text, video_letter)
            continue

        if output_file.exists():
            print(f"  Ya existe: {output_file.name} — omitiendo.")
            print(f"  (Borra el archivo para regenerar)")
            continue

        generate_audio(clean_text, output_file, args.voice, args.model)
        size_kb = output_file.stat().st_size // 1024
        print(f"  Guardado: {output_file.name} ({size_kb} KB)")

    if not args.preview:
        print(f"\nAudios en: {AUDIO_DIR}/")
        print("Listo.")


if __name__ == "__main__":
    main()
