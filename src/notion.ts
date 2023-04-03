import { Client, LogLevel } from "@notionhq/client";
import { markdownToBlocks } from "@tryfabric/martian";

type BlockObjectRequest = ReturnType<typeof markdownToBlocks>[number];

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
  logLevel: LogLevel.DEBUG,
});

export const createPage = async (
  databaseId: string,
  fileName: string,
  dirName: string,
  url: string,
  blocks: BlockObjectRequest[]
) => {
  const props = {
    Name: {
      title: [{ text: { content: fileName } }],
    },
    Dir: {
      select: { name: dirName },
    },
    URL: { url: url },
  };
  const res = notion.pages.create({
    parent: { database_id: databaseId },
    properties: props,
    children: blocks,
  });

  return res;
};

export const retrievePage = async (
  databaseId: string,
  fileName: string,
  dirName: string
) => {
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
            equals: dirName,
          },
        },
      ],
    },
  });
};

export const archivePage = async (pageId: string) => {
  return notion.pages.update({
    page_id: pageId,
    archived: true,
  });
};

// Update page
// Delete all blocks in a page and add blocks
export const updatePage = async (
  pageId: string,
  blocks: BlockObjectRequest[]
) => {
  const blks = await notion.blocks.children.list({
    block_id: pageId,
  });
  for (const blk of blks.results) {
    await notion.blocks.delete({
      block_id: blk.id,
    });
  }

  await notion.blocks.children.append({
    block_id: pageId,
    children: blocks,
  });
};
