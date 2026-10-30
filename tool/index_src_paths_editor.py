"""Update local HTML src attributes to point to matching asset subfolders."""

import argparse
import posixpath
import re
import sys
from pathlib import Path
from urllib.parse import unquote, urlsplit, urlunsplit


TAG_PATTERN = re.compile(r"<[A-Za-z][^>]*>", re.DOTALL)
SRC_ATTRIBUTE_PATTERN = re.compile(
    r"""(?<![\w:-])(src\s*=\s*)(["'])(.*?)\2""",
    re.IGNORECASE | re.DOTALL,
)


def build_asset_lookup(index_directory: Path) -> dict[str, list[str]]:
    assets: dict[str, list[str]] = {}
    for folder in index_directory.iterdir():
        if not folder.is_dir():
            continue
        for item in folder.iterdir():
            if item.is_file():
                assets.setdefault(item.name, []).append(folder.name)
    return assets


def update_src_value(value: str, assets: dict[str, list[str]]) -> tuple[str, str | None]:
    parts = urlsplit(value)
    if parts.scheme or parts.netloc or not parts.path:
        return value, None

    filename = unquote(posixpath.basename(parts.path))
    matching_folders = assets.get(filename, [])
    if len(matching_folders) != 1:
        return value, None

    new_path = f"./{matching_folders[0]}/{filename}"
    updated = urlunsplit(("", "", new_path, parts.query, parts.fragment))
    if updated == value:
        return value, None
    return updated, new_path


def main() -> int:
    parser = argparse.ArgumentParser(
        description=(
            "Update local src attributes in index.html to use the subfolder "
            "that contains each referenced filename."
        )
    )
    parser.add_argument(
        "--index",
        type=Path,
        default=Path("index.html"),
        help="HTML file to update, relative to the current directory by default",
    )
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Write changes to the HTML file (default: preview only)",
    )
    args = parser.parse_args()

    index_path = args.index
    if not index_path.is_absolute():
        index_path = Path.cwd() / index_path
    if not index_path.is_file():
        print(f"Error: index file does not exist: {index_path}", file=sys.stderr)
        return 1

    try:
        raw = index_path.read_bytes()
        has_utf8_bom = raw.startswith(b"\xef\xbb\xbf")
        content = raw.decode("utf-8-sig")
    except (OSError, UnicodeDecodeError) as error:
        print(f"Error: could not read UTF-8 HTML file: {error}", file=sys.stderr)
        return 1

    assets = build_asset_lookup(index_path.parent)
    changes: list[tuple[str, str]] = []
    ambiguous: set[str] = set()

    def update_tag(tag_match: re.Match[str]) -> str:
        tag = tag_match.group(0)

        def update_attribute(attribute_match: re.Match[str]) -> str:
            prefix, quote, value = attribute_match.groups()
            updated, new_path = update_src_value(value, assets)
            if new_path:
                changes.append((value, new_path))
            elif value and len(assets.get(unquote(posixpath.basename(urlsplit(value).path)), [])) > 1:
                ambiguous.add(value)
            return f"{prefix}{quote}{updated}{quote}"

        return SRC_ATTRIBUTE_PATTERN.sub(update_attribute, tag)

    updated_content = TAG_PATTERN.sub(update_tag, content)

    if changes:
        print("Planned src path changes:")
        for old_path, new_path in changes:
            print(f"  {old_path} -> {new_path}")
    else:
        print("No matching src paths need updating.")

    if ambiguous:
        print("\nSkipped ambiguous filenames found in multiple subfolders:")
        for value in sorted(ambiguous):
            print(f"  {value}")

    if not args.apply:
        print("\nPreview only. Add --apply to write the changes.")
        return 0

    if not changes:
        return 0

    try:
        output = updated_content.encode("utf-8")
        if has_utf8_bom:
            output = b"\xef\xbb\xbf" + output
        index_path.write_bytes(output)
    except OSError as error:
        print(f"Error: could not write HTML file: {error}", file=sys.stderr)
        return 1

    print(f"\nUpdated {len(changes)} src attribute(s) in {index_path}.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
