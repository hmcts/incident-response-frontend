import * as os from 'os';

import { infoRequestHandler } from '@hmcts/info-provider';
import * as express from 'express';

const router = express.Router();

router.get(
  '/info',
  infoRequestHandler({
    extraBuildInfo: {
      host: os.hostname(),
      name: 'expressjs-template',
      uptime: process.uptime(),
    },
    info: {
      // TODO: add downstream info endpoints if your app has any
    },
  })
);

module.exports = router;
