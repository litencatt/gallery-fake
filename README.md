# Gallery Fake

Clone docs to other service

### Usage
```yml
name: Sync markdown To Notion DB

on:
  workflow_dispatch:
  schedule:
    - cron: '00 * * * *'

jobs:
  sync:
    name: Sync
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Gallery Fake
        uses: litencatt/gallery-fake@v0.1.1
        env:
          NOTION_TOKEN: ${{ secrets.NOTION_TOKEN }}
          DATABASE_ID: ${{ secrets.NOTION_DATABASE_ID }}
          MD_PATH: "${{ github.workspace }}/path/to/sync_dir"
```
