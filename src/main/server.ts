#!/usr/bin/env node
import * as fs from 'fs';
import * as https from 'https';
import * as path from 'path';

require('@hmcts/properties-volume').addTo(require('config'));

import { app } from './app';

const { Logger } = require('@hmcts/nodejs-logging');

const logger = Logger.getLogger('server');

const port: number = parseInt(process.env.PORT || '3000', 10);

if (app.locals.ENV === 'development') {
  const sslDirectory = path.join(__dirname, 'resources', 'localhost-ssl');
  const sslOptions = {
    cert: fs.readFileSync(path.join(sslDirectory, 'localhost.crt')),
    key: fs.readFileSync(path.join(sslDirectory, 'localhost.key')),
  };
  const server = https.createServer(sslOptions, app);
  server.listen(port, () => {
    logger.info(`Application started: https://localhost:${port}`);
  });
} else {
  app.listen(port, () => {
    logger.info(`Application started: http://localhost:${port}`);
  });
}
