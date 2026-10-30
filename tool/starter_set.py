from pathlib import Path

base_dir = Path(__file__).resolve().parent
folder_names = ["css", "js", "images", "data", "spec-kit"]  # 만들 폴더 이름으로 바꾸세요

file_paths = ["README.md","index.html", "css/style.css", "js/main.js"]  # 만들 파일 경로로 바꾸세요

for name in folder_names:
    (base_dir / name).mkdir(exist_ok=True)
    print(f"생성 완료: {name}")

for file_path in file_paths:
    path = base_dir / file_path
    path.parent.mkdir(parents=True, exist_ok=True)

    try:
        with path.open("x", encoding="utf-8"):
            pass
        print(f"파일 생성 완료: {file_path}")
    except FileExistsError:
        print(f"이미 존재하여 건너뜀: {file_path}")