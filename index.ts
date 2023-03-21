import { Client, LogLevel } from "@notionhq/client";
import * as fs from 'fs'
import * as path from 'path'
import { markdownToBlocks } from '@tryfabric/martian'
type BlockObjectRequest = ReturnType<typeof markdownToBlocks>[number]

const databaseId = process.env.DATABASE_ID

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
  logLevel: LogLevel.DEBUG,
});

async function sync() {
  if (databaseId == undefined) {
    console.log("env DATABASE_ID is undefined")
    return
  }

  const filePath = "example/example1.md"
  const fp = path.join('./', filePath)
  const fn = path.basename(filePath)
  console.log(fp)

  const mdFile = fs.readFileSync(fp, { encoding: 'utf-8' })
  console.log(mdFile)
  const blocks = markdownToBlocks(mdFile)

  const res = await createPage(databaseId, fn, blocks)
  console.log(res)
}

async function createPage(databaseId: string, title: string, blocks: BlockObjectRequest[]) {
  const props = {
    Name: {
      title: [{ text: { content: title } }],
    },
  }
  const res = notion.pages.create({
    parent: { database_id: databaseId },
    properties: props,
    children: blocks,
  })

  return res
}

sync()
