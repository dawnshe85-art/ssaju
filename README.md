# 싸주 — 사주팔자 웹사이트

생년월일시를 입력하면 사주 원국, 오행 분포, 십성·12운성, 신살, 합충형파해, 대운·세운·월운, 오늘의 만세력을 보여주는 정적 웹사이트입니다.
모든 계산은 브라우저 안에서 이루어지고 입력값은 서버로 전송되지 않습니다.

## 실행

빌드 과정이 없는 정적 사이트입니다. 아무 정적 서버로 폴더를 열면 됩니다.

```bash
python3 -m http.server 8765
```

브라우저에서 http://localhost:8765 접속.

GitHub Pages로 배포하려면 저장소 Settings → Pages → Branch `main` / `/(root)` 를 선택하세요.

## 구성

| 경로 | 내용 |
|:--|:--|
| `index.html`, `app.js` | 웹사이트 화면·계산 연결 |
| `base.css` | 공통 레이아웃 |
| `theme.css` | 밤하늘 디자인 (색·글꼴·모양) |
| `lib/ssaju.mjs` | 계산 엔진 (ssaju 0.2.0 빌드본) |
| `vendor/ssaju/` | 원본 [golbin/ssaju](https://github.com/golbin/ssaju) 소스 사본 |

## 디자인

[awesome-design-md-jp](https://github.com/kzhrknt/awesome-design-md-jp)의 teamLab DESIGN.md를 바탕으로 한 **밤하늘** 디자인입니다. 거의 검은 바탕(`#0e0f0e`)에 무채색 UI를 쓰고, 색은 오행 글자에만 빛나는 효과로 넣었습니다.

## 기능

- 양력/음력(윤달) 입력, 시간 모름 처리, 진태양시(경도) 보정
- 결과 링크 공유 (URL 해시에 입력값 저장)
- AI용 요약(`toCompact`)·마크다운 전체(`toMarkdown`) 복사
- 모바일 대응

## 라이선스

계산 엔진 [ssaju](https://github.com/golbin/ssaju)는 MIT 라이선스입니다 (`lib/LICENSE`).
