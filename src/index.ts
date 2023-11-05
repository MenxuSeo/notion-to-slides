#!/usr/bin/env node

import yargs from 'yargs'
import fs from 'fs'
import { tmpdir } from 'os'

import notion2md from './notion2md';
import md2slides from './md2slides';
import { getPageId } from './utils';

const args = yargs
  .scriptName('notion2slides')
  .usage('Usage: $0 <command> [options]')
  .option('url', {
    alias: 'u',
    describe: 'The url of the Notion page to convert',
    type: 'string',
    demandOption: true
  })
  .option('theme', {
    alias: 't',
    describe: 'The theme to use for the slides',
    type: 'string',
    default: 'default',
    demandOption: false
  })
  .help()
  .parseSync()

// check the env variable
const NOTION_TOKEN: string | undefined = process.env.NOTION_TOKEN;
if (!NOTION_TOKEN) {
  console.error('Please set the NOTION_TOKEN env variable')
  process.exit(1)
}

// get the url and extract page id from it
const url = args.url as string;
const pageId = getPageId(url);

// get the theme from the --theme flag
const theme = args.theme as string;

// prepare to open the file in the browser
const opener = require('opener');

// download the page and convert it to markdown slides
(async () => {
  const mdString = await notion2md(pageId, NOTION_TOKEN);
  const htmlString = md2slides(mdString, theme);
  const tmpFilePath = tmpdir() + `/${pageId}.html`
  fs.writeFileSync(tmpFilePath, htmlString)
  opener(tmpFilePath);
})();