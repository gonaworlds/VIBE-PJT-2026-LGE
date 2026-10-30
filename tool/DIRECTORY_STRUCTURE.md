# 디렉토리 구조

## 대상 폴더

정리 대상은 저장된 듀오링고 페이지의 리소스 폴더입니다.

```text
벤치마킹 사이트 분석/
└── 듀오링고/
    └── 듀오링고 - 세계에서 가장 인기 있는 학습 방법_files/
        ├── *.svg                    # 19 files
        ├── *.css                    # 9 files
        ├── *.js.다운로드            # 15 files
        ├── *.html                   # 3 files
        ├── client                   # extensionless file
        └── style                    # extensionless file
```

현재 확인된 48개 항목은 모두 파일이며, 대상 폴더 바로 아래에 있습니다. `client`와 `style`도 디렉토리가 아닌 확장자가 없는 파일입니다.

## 확장자별 정리 후 예상 구조

[`separate_files_by_extension.py`](./separate_files_by_extension.py)는 파일의 마지막 확장자를 기준으로 폴더명을 정합니다. 예를 들어 `.svg` 파일은 `svg/`, `.css` 파일은 `css/`로 이동합니다. 이름이 `.js.다운로드`로 끝나는 파일은 마지막 확장자인 `.다운로드` 기준으로 `다운로드/`에 분류됩니다. 확장자가 없는 파일은 `no_extension/`에 분류됩니다.

```text
듀오링고 - 세계에서 가장 인기 있는 학습 방법_files/
├── css/
│   └── *.css
├── 다운로드/
│   └── *.js.다운로드
├── html/
│   └── *.html
├── no_extension/
│   ├── client
│   └── style
├── svg/
│   └── *.svg
```

위 구조는 스크립트 실행 시 생성될 수 있는 예시이며, 현재 파일은 이동하지 않았습니다. 스크립트는 기본적으로 미리보기만 합니다. 실제 이동은 명시적으로 `--apply` 옵션을 전달해야 실행됩니다.

## 사용법

PowerShell에서 대상 경로를 따옴표로 감싸 실행합니다.

```powershell
python .\separate_files_by_extension.py "C:\Github_LGE\VIBECODING-2026-DUOLINGO\벤치마킹 사이트 분석\듀오링고\듀오링고 - 세계에서 가장 인기 있는 학습 방법_files"
```

미리보기 결과를 확인한 뒤 실제로 이동하려면 다음처럼 실행합니다.

```powershell
python .\separate_files_by_extension.py "C:\Github_LGE\VIBECODING-2026-DUOLINGO\벤치마킹 사이트 분석\듀오링고\듀오링고 - 세계에서 가장 인기 있는 학습 방법_files" --apply
```

목적지에 같은 이름의 파일이 이미 있으면 이동을 시작하지 않고 오류를 표시합니다.
