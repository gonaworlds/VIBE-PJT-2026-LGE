"""Move direct child files into folders named after their file extension."""

import argparse
import sys
from pathlib import Path


def folder_name_for(path: Path) -> str:
    suffix = path.suffix
    return suffix[1:] if suffix else "no_extension"


def main() -> int:
    parser = argparse.ArgumentParser(
        description=(
            "Sort files directly inside a directory into folders named "
            "after their final extension. Without --apply, only show the plan."
        )
    )
    parser.add_argument("directory", type=Path, help="Directory whose files to sort")
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Create extension folders and move files (default: preview only)",
    )
    args = parser.parse_args()

    directory = args.directory.expanduser()
    if not directory.exists():
        print(f"Error: directory does not exist: {directory}", file=sys.stderr)
        return 1
    if not directory.is_dir():
        print(f"Error: not a directory: {directory}", file=sys.stderr)
        return 1

    files = sorted(
        (path for path in directory.iterdir() if path.is_file()),
        key=lambda path: path.name.casefold(),
    )
    if not files:
        print(f"No files found directly in: {directory}")
        return 0

    moves = [
        (path, directory / folder_name_for(path) / path.name)
        for path in files
    ]
    conflicts = [destination for _, destination in moves if destination.exists()]
    if conflicts:
        print("Error: destination files already exist; no files were moved:", file=sys.stderr)
        for destination in conflicts:
            print(f"  {destination}", file=sys.stderr)
        return 1

    print("Move plan:" if not args.apply else "Moving files:")
    for source, destination in moves:
        print(f"  {source.name} -> {destination.parent.name}\\{destination.name}")

    if not args.apply:
        print("\nPreview only. Add --apply to create folders and move files.")
        return 0

    try:
        for source, destination in moves:
            destination.parent.mkdir(exist_ok=True)
            source.rename(destination)
    except OSError as error:
        print(f"Error while moving files: {error}", file=sys.stderr)
        return 1

    print(f"\nMoved {len(moves)} file(s).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
