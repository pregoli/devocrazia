#!/usr/bin/env node
/**
 * Convert article SVG diagrams to PNG for Medium.
 *
 * Renders each SVG in Playwright's Chromium (already a dev dependency), so text,
 * fonts, and symbols look exactly as they do on devocrazia.com.
 *
 * Each PNG is written to a `medium/` folder next to its source SVG:
 *   public/images/articles/event-sourcing/architecture.svg
 *   -> public/images/articles/event-sourcing/medium/architecture.png
 *
 * Usage (from the repo root):
 *   node .claude/skills/devocrazia-medium-publish/scripts/svg-to-png.mjs [--width 1400] <file.svg>...
 *
 * Width defaults to 1400px: Medium's content column is ~700px, so 2x keeps
 * diagrams sharp on retina screens.
 *
 * Requires `npm install` and `npx playwright install chromium`.
 */

import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { chromium } from '@playwright/test';

const DEFAULT_WIDTH = 1400;

function parseArgs(argv) {
  const files = [];
  let width = DEFAULT_WIDTH;

  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--width') {
      width = Number(argv[++i]);
      if (!Number.isInteger(width) || width <= 0) {
        throw new Error(`--width must be a positive integer, got "${argv[i]}"`);
      }
    } else {
      files.push(argv[i]);
    }
  }

  return { files, width };
}

/** Intrinsic size of the SVG, from its viewBox or width/height attributes. */
function readSvgSize(svgText) {
  const root = svgText.match(/<svg\b[^>]*>/i)?.[0] ?? '';
  const viewBox = root.match(/viewBox="([^"]+)"/i)?.[1].trim().split(/[\s,]+/).map(Number);
  if (viewBox?.length === 4 && viewBox[2] > 0 && viewBox[3] > 0) {
    return { width: viewBox[2], height: viewBox[3] };
  }

  const width = parseFloat(root.match(/\bwidth="([\d.]+)/i)?.[1]);
  const height = parseFloat(root.match(/\bheight="([\d.]+)/i)?.[1]);
  if (width > 0 && height > 0) {
    return { width, height };
  }

  throw new Error('SVG has no viewBox or width/height, so its size is unknown');
}

async function convert(browser, svgPath, targetWidth) {
  if (!fs.existsSync(svgPath)) {
    throw new Error(`File not found: ${svgPath}`);
  }
  if (path.extname(svgPath).toLowerCase() !== '.svg') {
    throw new Error(`Not an SVG file: ${svgPath}`);
  }

  const size = readSvgSize(fs.readFileSync(svgPath, 'utf8'));
  const viewport = { width: Math.round(size.width), height: Math.round(size.height) };

  const page = await browser.newPage({
    viewport,
    deviceScaleFactor: targetWidth / viewport.width,
  });

  try {
    await page.goto(pathToFileURL(path.resolve(svgPath)).href);

    const outDir = path.join(path.dirname(svgPath), 'medium');
    const outPath = path.join(outDir, `${path.basename(svgPath, '.svg')}.png`);
    fs.mkdirSync(outDir, { recursive: true });
    // Transparent page background, so scaling rounding never adds a white edge.
    await page.screenshot({ path: outPath, omitBackground: true });

    const height = Math.round(viewport.height * (targetWidth / viewport.width));
    return { outPath, width: targetWidth, height };
  } finally {
    await page.close();
  }
}

async function main() {
  let args;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(`❌ ${error.message}`);
    process.exit(1);
  }

  if (args.files.length === 0) {
    console.error('Usage: node svg-to-png.mjs [--width 1400] <file.svg>...');
    process.exit(1);
  }

  let browser;
  try {
    browser = await chromium.launch();
  } catch (error) {
    console.error(`❌ Could not launch Chromium. Run "npx playwright install chromium" first.\n${error.message}`);
    process.exit(1);
  }

  let failed = 0;
  try {
    for (const file of args.files) {
      try {
        const { outPath, width, height } = await convert(browser, file, args.width);
        console.log(`✅ ${outPath} (${width}x${height})`);
      } catch (error) {
        console.error(`❌ ${file}: ${error.message}`);
        failed++;
      }
    }
  } finally {
    await browser.close();
  }

  process.exit(failed > 0 ? 1 : 0);
}

main();
