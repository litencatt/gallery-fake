import { Client, LogLevel } from "@notionhq/client";
import * as fs from "fs";
import * as path from "path";
import { markdownToBlocks } from "@tryfabric/martian";
import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
type BlockObjectRequest = ReturnType<typeof markdownToBlocks>[number];

const databaseId = process.env.NOTION_DB_ID;
const mdPath = process.env.GITHUB_MD_PATH;
const githubRepo = process.env.GITHUB_REPOSITORY;

const notion = new Client({
  auth: process.env.NOTION_API_TOKEN,
  logLevel: LogLevel.DEBUG,
});

async function sync() {
  if (databaseId == undefined) {
    console.log("env NOTION_DB_ID is undefined");
    return;
  }

  if (mdPath == undefined) {
    console.log("env GITHUB_MD_PATH is undefined");
    return;
  }

  let sd = ""
  if (process.env.GITHUB_ACTIONS) {
    const ws = process.env.GITHUB_WORKSPACE
    if (ws == undefined) {
      console.log("env GITHUB_WORKSPACE is undefined");
      return;
    }
    sd = path.join(ws, "/", mdPath);
  } else {
    sd = path.join("./", mdPath);
  }
  console.log(sd);

  const mdFileNames = fs.readdirSync(sd, { encoding: "utf-8" });
  console.log(mdFileNames);

  const repoUrl = `https://github.com/${githubRepo}`

  for (const fileName of mdFileNames) {
    const fp = path.join(sd, "/", fileName);
    console.log(fp);

    const page = await retrievePage(databaseId, fileName)
    console.log(page)

    const fileUrl = `${repoUrl}/blob/main/${mdPath}/${fileName}`

    // Create page when the page is not exists
    if (page.results.length === 0) {
      console.log(`${fp} is not exists`)
      const mdContent = fs.readFileSync(fp, { encoding: "utf-8" });
      const blocks = markdownToBlocks(mdContent);
      const res = await createPage(databaseId, fileName, fileUrl, blocks);
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
        const res = await createPage(databaseId, fileName, fileUrl, blocks);
        console.log(res)
      }
    }
  }
}

async function createPage(
  databaseId: string,
  title: string,
  url: string,
  blocks: BlockObjectRequest[]
) {
  const props = {
    Name: {
      title: [{ text: { content: title } }],
    },
    URL: {
      url: url
    }
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
