import * as fs from "fs";
import * as path from "path";
import { markdownToBlocks } from "@tryfabric/martian";
import { retrievePage, createPage, archivePage } from "./notion";
import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";

const databaseId = process.env.NOTION_DB_ID;
const mdPath = process.env.GITHUB_MD_PATH;
const githubRepo = process.env.GITHUB_REPOSITORY;
const ws = process.env.GITHUB_WORKSPACE;

async function sync() {
  if (databaseId === undefined) {
    console.log("env NOTION_DB_ID is undefined");
    return;
  }

  if (mdPath === undefined) {
    console.log("env GITHUB_MD_PATH is undefined");
    return;
  }

  let docRootPath = "";
  if (process.env.GITHUB_ACTIONS) {
    const ws = process.env.GITHUB_WORKSPACE;
    if (ws === undefined) {
      console.log("env GITHUB_WORKSPACE is undefined");
      return;
    }
    docRootPath = path.join(ws, "/", mdPath);
  } else {
    docRootPath = path.join("./", mdPath);
  }
  console.log(docRootPath);

  const mdFileList = readdirRecursively(docRootPath);
  console.log(mdFileList);

  const repoUrl = `https://github.com/${githubRepo}`;

  for (const filePath of mdFileList) {
    let dirName = path.dirname(filePath);
    if (process.env.GITHUB_ACTIONS && ws !== undefined) {
      dirName = dirName.replace(new RegExp(ws + "/"), "");
    }
    const fileName = path.basename(filePath);
    const extName = path.extname(filePath);

    // Sync support ext only .md
    if (extName !== ".md") {
      continue;
    }

    const page = await retrievePage(databaseId, fileName, dirName);
    console.log(page);

    const fileUrl = `${repoUrl}/blob/main/${filePath}`;

    // Create page when the page is not exists
    if (page.results.length === 0) {
      console.log(`${filePath} is not exists`);
      const mdContent = fs.readFileSync(filePath, { encoding: "utf-8" });
      const blocks = markdownToBlocks(mdContent);
      const res = await createPage(
        databaseId,
        fileName,
        dirName,
        fileUrl,
        blocks
      );
      console.log(res);

      // Archive and re-create a page when the page is exists
    } else {
      const notionPage = page.results[0] as PageObjectResponse;
      const fileStat = fs.statSync(filePath);
      console.log(notionPage.created_time);
      console.log(fileStat.ctime);
      if (fileStat.ctime.getTime() > Date.parse(notionPage.created_time)) {
        await archivePage(notionPage.id);

        const mdContent = fs.readFileSync(filePath, { encoding: "utf-8" });
        const blocks = markdownToBlocks(mdContent);
        const res = await createPage(
          databaseId,
          fileName,
          dirName,
          fileUrl,
          blocks
        );
        console.log(res);
      }
    }
  }
}

const readdirRecursively = (dir: string): string[] =>
  fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((dirent) =>
      dirent.isFile()
        ? [`${dir}/${dirent.name}`]
        : readdirRecursively(`${dir}/${dirent.name}`)
    );

sync();
