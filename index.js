#!/usr/bin/env node

import { PrismaClient } from "@prisma/client";
import BigNumber from "big-number";
import minimist from "minimist";
import ora from "ora";

// https://www.stefanjudis.com/snippets/how-to-import-json-files-in-es-modules-node-js/
// import conn from "./env.json" assert { type: "json" };
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const conn = require("./env.json");

const argv = minimist(process.argv.slice(2));
const defaultNumberOfRows = 100;

const clusters = conn.clusters.map((cluster) => ({
  name: cluster.name,
  client: new PrismaClient({ datasources: { db: { url: cluster.connString }}}),
}))


const generate = async (rows) => new Promise(
  resolve =>
    resolve(
      Array(rows)
      .fill(0)
      .map(
        () => ({
          foo: BigNumber(2).pow(6400).toString(),
          bar: BigNumber(2).pow(6400).toString(),
          baz: BigNumber(2).pow(6400).toString(),
          bim: BigNumber(2).pow(6400).toString(),
        })
      )
    )
);

const insertJunk = async (cluster, junk) => {
  const o = ora();

  o.text = "Inserting junk",
  o.spinner = {
    frames: ["🌯","🍕", "🍿", "🎱", "🎷", "🛵", "💽", "📻", "💎", "🔩", "🪓", "💣", "🔮", "🔑", "🥽", "💀", "🤖"],
    interval: 200,
  };
  o.start();

  try {
    console.info(`inserting rows into ${cluster.name}`);
    const inserted = await cluster.client.junk.createMany({
      data: junk,
    });
    o.stopAndPersist({
      text: `Inserted ${inserted.count} rows of junk into ${cluster.name}`,
      symbol: "✅",
    });
    console.info(`done [${cluster.name}]`);
  } catch (e) {
    console.error(e);
    o.stopAndPersist({
      symbol: "❌",
    });
  }

};

async function main() {
  const rows = argv.rows || defaultNumberOfRows;

  console.info(`Generating ${rows} rows of junk`);
  const o = ora({
    text: `Generating ${rows} rows of junk`,
    spinner: {
      frames: ["🏭"],
    },
  }).start();

  const junk = await generate(rows);

  console.info(`${rows} rows generated`);
  o.stopAndPersist({
    text: `${rows} rows generated`,
    symbol: "✅"
  });

  await Promise.all(clusters.map(async (cluster) => {
    await insertJunk(cluster, junk);
  }));
}

main()
  .then(async () => {
    console.info("disconnecting clients");
    await Promise.all(clusters.map(async (cluster) => {
      await cluster.client.$disconnect();
    }));
  })
  .catch(async (e) => {
    console.error(e);
    await Promise.all(clusters.map(async (cluster) => {
      await cluster.client.$disconnect();
    }));
    process.exit(1);
  });
