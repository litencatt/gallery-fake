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
  if (databaseId === undefined) {
    console.log("env NOTION_DB_ID is undefined");
    return;
  }

  if (mdPath === undefined) {
    console.log("env GITHUB_MD_PATH is undefined");
    return;
  }

  let docRootPath = ""
  if (process.env.GITHUB_ACTIONS) {
    const ws = process.env.GITHUB_WORKSPACE
    if (ws === undefined) {
      console.log("env GITHUB_WORKSPACE is undefined");
      return;
    }
    docRootPath = path.join(ws, "/", mdPath);
  } else {
    docRootPath = path.join("./", mdPath);
  }
  console.log(docRootPath);

  const mdFilePath = readdirRecursively(docRootPath)
  console.log(mdFilePath);

  const repoUrl = `https://github.com/${githubRepo}`

  for (const filePath of mdFilePath) {
    const dirName = path.dirname(filePath)
    const fileName = path.basename(filePath)
    const extName = path.extname(filePath)

    // Sync support ext only .md
    if (extName !== ".md") {
      continue
    }

    const page = await retrievePage(databaseId, fileName, dirName)
    console.log(page)

    const fileUrl = `${repoUrl}/blob/main/${filePath}`

    // Create page when the page is not exists
    if (page.results.length === 0) {
      console.log(`${filePath} is not exists`)
      const mdContent = fs.readFileSync(filePath, { encoding: "utf-8" });
      const blocks = markdownToBlocks(mdContent);
      const res = await createPage(databaseId, fileName, dirName, fileUrl, blocks);
      console.log(res)

    // Archive and re-create a page when the page is exists
    } else {
      const notionPage = page.results[0] as PageObjectResponse
      const fileStat = fs.statSync(filePath)
      console.log(notionPage.created_time)
      console.log(fileStat.ctime)
      if (fileStat.ctime.getTime() > Date.parse(notionPage.created_time)) {
        await archivePage(notionPage.id)

        const mdContent = fs.readFileSync(filePath, { encoding: "utf-8" });
        const blocks = markdownToBlocks(mdContent);
        const res = await createPage(databaseId, fileName, dirName, fileUrl, blocks);
        console.log(res)
      }
    }
  }
}

async function createPage(
  databaseId: string,
  fileName: string,
  dirName: string,
  url: string,
  blocks: BlockObjectRequest[]
) {
  const props = {
    Name: {
      title: [{ text: { content: fileName } }],
    },
    Dir: {
      select: { name: dirName }
    },
    URL: { url: url }
  };
  const res = notion.pages.create({
    parent: { database_id: databaseId },
    properties: props,
    children: blocks,
  });

  return res;
}

async function retrievePage(databaseId: string, fileName: string, dirName: string) {
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
        {
          property: "Dir",
          select: {
            equals: dirName
          }
        }
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

const readdirRecursively = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap(dirent =>
    dirent.isFile() ? [`${dir}/${dirent.name}`] : readdirRecursively(`${dir}/${dirent.name}`)
  );

sync();
