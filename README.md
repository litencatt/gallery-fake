# Gallery Fake

Sync GitHub markdown docs to Notion DB

### Usage

1. Create Notion Integration.
    - https://developers.notion.com/docs/create-a-notion-integration
1. Set env `NOTION_API_TOKEN`, `NOTION_DB_ID`, `GITHUB_MD_PATH` in your GitHub repository.
   - https://github.com/\<your\>/\<repository\>/settings
1. Create workflow yaml.

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
          NOTION_API_TOKEN: ${{ secrets.NOTION_API_TOKEN }}
          NOTION_DB_ID: ${{ secrets.NOTION_DB_ID }}
          GITHUB_MD_PATH: "path/to/sync_dir"
```

### Settings example
Set like this, if you sync [./example](https://github.com/litencatt/gallery-fake/tree/main/example) dir in your repository.
```yml
          GITHUB_MD_PATH: "example"
```
Sync like this, after actions executed.
<img width="1252" alt="image" src="https://user-images.githubusercontent.com/17349045/226583181-64664397-e4c9-4d85-9c6e-4950ca7cce20.png">

Open `example1.md` page
<img width="787" alt="image" src="https://user-images.githubusercontent.com/17349045/226583486-56d58273-995f-457b-9c6d-f60687214107.png">
