import * as path from 'path';
import * as express from 'express';
import * as nunjucks from 'nunjucks';

import { date } from './filters/date';

export class Nunjucks {
  constructor(public developmentMode: boolean) {
    this.developmentMode = developmentMode;
  }

  enableFor(app: express.Express): void {
    app.set('view engine', 'njk');
    const govUkFrontendPath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      '..',
      'node_modules',
      'govuk-frontend',
    );
    const nunjucksEnv = nunjucks.configure(
      [path.join(__dirname, '..', '..', 'views'), govUkFrontendPath],
      {
        autoescape: true,
        watch: this.developmentMode,
        express: app,
      },
    );

    nunjucksEnv.addFilter('date', date);

    app.use((req, res, next) => {
      res.locals.pagePath = req.path;
      next();
    });
  }
}
