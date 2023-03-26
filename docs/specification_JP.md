# Specification

- GitHubのあるレポジトリで管理しているMarkdownファイルを任意のNotionのDBのページとして同期させたい
- Notion上ではページをロックしたい
  - 内容を変更したい場合はGitHubのリンクを表示させておいてそっちに飛んでもらってPRを出してもらう

## TODO

- [x]  指定ディレクトリ内の全.mdファイルから指定Notion DBにページ作成
- [ ]  ~~作成したページはロックしてNotion側での変更を不可にする~~
  - APIでのpage lockは現在不可
- [ ]  Notion DB内の既存ページは変更がある場合は更新する
- [ ]  編集用にGitHubのLinkをpropertyに設定

## Issues

- [ ]  Notionのpageを更新する場合は再作成しているのでpageのURLが更新ごとに変わってしまう

## Next Action

- [ ]  md内の画像をNotion側にどう同期させるか
