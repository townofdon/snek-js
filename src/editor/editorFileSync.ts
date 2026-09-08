import express from 'express';
import { type Request, type Response } from 'express';
import morgan from 'morgan';
import { readFile, writeFile } from "node:fs/promises";
import path from 'node:path';

// express server to keep editor files in sync
// run: `npm run editor-sync`

(function main(){

  const app = express();
  const port = 3001;

  // disable CORS
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
  });

  app.use(express.json());

  // logger
  app.use(morgan('tiny', {
    skip: function (req, res) {
      return res.statusCode >= 400;
    },
  }));
  app.use(morgan('combined', {
    skip: function (req, res) {
      return res.statusCode < 400;
    },
  }));

  // health check
  app.get('/', (req: Request, res: Response) => {
    res.send('Hello World!')
  });

  app.post("/write-file", async (req: Request, res: Response) => {
    try {
      const { annotations, layoutV2 = '', url = '' } = req.body;
      if (!annotations || typeof annotations !== 'object' ) {
        throw new Error(`invalid annotations: ${annotations}`);
      }
      const pwd = process.cwd();
      const fullPath = path.join(pwd, req.body.path);
      let content = await readFile(fullPath, 'utf8');

      content = replaceProperty(content, 'layoutV2', `'${layoutV2}'`);


      const annotationsStr = Object.entries(annotations)
        .map(([key, value]) => `${key}: ${value}`)
        .join(", ");
      content = replaceProperty(content, 'annotations', `{ ${annotationsStr} }`);

      if (url) {
        content = replaceProperty(content, 'url', `<${url}>`);
      }

      await writeFile(fullPath, content, "utf8");
      res.json({ ok: true });
    } catch (err) {
      res.status(500);
      res.json({ err: err.message });
    }
  });

  app.listen(port, () => {
    console.log(`Listening on port ${port}`)
  });
})()

enum PropertyType {
  string,
  url,
  object,
}

function replaceProperty(
  source: string,
  property: string,
  replacement: string,
): string {
  const pattern = new RegExp(`(\\b${property}\\s*:\\s*)`, "m");
  const match = pattern.exec(source);

  if (!match || match.index === undefined) {
    throw new Error(`Could not find property "${property}" in source string.`);
  }

  let type: PropertyType;
  let suffix: string = '';
  if (property === "layoutV2") {
    type = PropertyType.string;
  } else if (property === 'url') {
    type = PropertyType.url;
  } else if (property === 'annotations') {
    type = PropertyType.object;
    suffix = ' satisfies Record<number, MapAnnotation>'
  } else {
    throw new Error(`invalid property: ${property}`)
  }
  const start = findValueStart(source, match.index + match[0].length, type);
  if (start <= 0) {
    throw new Error(`Could not find property "${property}" value start.`);
  }
  const end = findValueEnd(source, start + 1, type);
  if (end <= 0) {
    throw new Error(`Could not find property "${property}" value end.`);
  }

  return (
    source.slice(0, start) +
    replacement +
    source.slice(end + 1)
  );
}

function findValueStart(source: string, start: number, type: PropertyType): number {
  const remainder = source.slice(start);
  for (let i = 0; i < remainder.length; i++) {
    switch (type) {
      case PropertyType.string:
        if (remainder[i] === '"') return start + i;
        if (remainder[i] === '\'') return start + i;
        if (remainder[i] === '`') return start + i;
      case PropertyType.url:
        if (remainder[i] === '<') return start + i;
      case PropertyType.object:
        if (remainder[i] === '{') return start + i;
    }
  }
  return -1;
}

function findValueEnd(source: string, start: number, type: PropertyType): number {
  const remainder = source.slice(start);
  for (let i = 0; i < remainder.length; i++) {
    switch (type) {
      case PropertyType.string:
        if (remainder[i] === '"') return start + i;
        if (remainder[i] === '\'') return start + i;
        if (remainder[i] === '`') return start + i;
      case PropertyType.url:
        if (remainder[i] === '>') return start + i;
      case PropertyType.object:
        if (remainder[i] === '}') return start + i;
    }
  }
  return -1;
}
