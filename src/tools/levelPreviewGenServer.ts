
import express from 'express';
import { type Request, type Response } from 'express';
import morgan from 'morgan';
import { writeFile, mkdir } from "node:fs/promises";
import path from 'node:path';

// express server to generate level preview files
// run: `npm run level-preview-gen` to start server, then open up `localhost:3002/` in browser

const levelPreviewFilesPath = 'public/assets/graphics/level-preview';
const GREEN = '\x1b[32m';
const RESET = '\x1b[0m';
const title = GREEN + `
▄▖    ▌   ▖       ▜   ▄▖      ▘       ▄▖    
▚ ▛▌█▌▙▘  ▌ █▌▌▌█▌▐   ▙▌▛▘█▌▌▌▌█▌▌▌▌  ▌ █▌▛▌
▄▌▌▌▙▖▛▖  ▙▖▙▖▚▘▙▖▐▖  ▌ ▌ ▙▖▚▘▌▙▖▚▚▘  ▙▌▙▖▌▌
` + RESET;

(function main(){
    const app = express();
    const port = 3002;
  
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

    // accept body as image
    app.use(express.raw({ type: 'image/*', limit: '5mb' }));

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
        const { slug } = req.query;
        if (!slug) {
          return res.status(400).send('slug query param required.');
        }
        if (!req.body || req.body.length === 0) {
          return res.status(400).send('image required in body.');
        }
        const contentType = req.headers['content-type'] || 'image/jpeg';
        const ext = contentType.split('/')[1] || 'jpg';
        const filename = `${slug}.${ext}`;
        const pwd = process.cwd();
        const targetFolder = path.join(pwd, levelPreviewFilesPath);
        await mkdir(targetFolder, { recursive: true });
        const targetPath = path.join(pwd, levelPreviewFilesPath, filename);
        await writeFile(targetPath, req.body, "utf8");
        res.json({ ok: true });
      } catch (err) {
        res.status(500);
        res.json({ err: err.message });
      }
    });

    app.listen(port, () => {
      console.log(title);
      console.log(`Listening on port ${port}`)
    });
})()
