import { Client, LogLevel } from "@notionhq/client";
import * as fs from "fs";
import * as path from "path";
import { markdownToBlocks } from "@tryfabric/martian";
import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
type BlockObjectRequest = ReturnType<typeof markdownToBlocks>[number];

const databaseId = process.env.DATABASE_ID;
const mdPath = process.env.MD_PATH;

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
  logLevel: LogLevel.DEBUG,
});

async function sync() {
  if (databaseId == undefined) {
    console.log("env DATABASE_ID is undefined");
    return;
  }

  if (mdPath == undefined) {
    console.log("env MD_PATH is undefined");
    return;
  }

  const sd = path.join("./", mdPath);
  console.log(sd);

  const mdFileNames = fs.readdirSync(sd, { encoding: "utf-8" });
  console.log(mdFileNames);

  for (const fileName of mdFileNames) {
    const fp = path.join("./", sd, "/", fileName);
    console.log(fp);

    const page = await retrievePage(databaseId, fileName)
    console.log(page)

    // Create page when the page is not exists
    if (page.results.length === 0) {
      console.log(`${fp} is not exists`)
      const mdContent = fs.readFileSync(fp, { encoding: "utf-8" });
      const blocks = markdownToBlocks(mdContent);
      const res = await createPage(databaseId, fileName, blocks);
      console.log(res)

    // Archive and re-create a page when the page is exists
    } else {
      const notionPage = page.results[0] as PageObjectResponse
      const fileStat = fs.statSync(fp)
      console.log(notionPage.created_time)
      console.log(fileStat.ctime)
      if (fileStat.ctime.getTime() > Date.parse(notionPage.created_time)) {
        await archivePage(notionPage.id)

        const mdContent = fs.readFileSync(fp, { encoding: "utf-8" });
        const blocks = markdownToBlocks(mdContent);
        const res = await createPage(databaseId, fileName, blocks);
        console.log(res)
      }
    }
  }
}

async function createPage(
  databaseId: string,
  title: string,
  blocks: BlockObjectRequest[]
) {
  const props = {
    Name: {
      title: [{ text: { content: title } }],
    },
  };
  const res = notion.pages.create({
    parent: { database_id: databaseId },
    properties: props,
    children: blocks,
  });

  return res;
}

async function retrievePage(databaseId: string, fileName: string) {
  return notion.databases.query({
    database_id: databaseId,
    filter: {
      and: [
        {
          property: "Name",
          title: {
            equals: fileName,
          },
        },
      ],
    },
  });
}

async function archivePage(pageId: string) {
  return notion.pages.update({
    page_id: pageId,
    archived: true
  });
}

sync();
