import * as express from 'express';
import helmet from 'helmet';

export interface HelmetConfig {
  referrerPolicy: string;
}

const googleAnalyticsDomain = '*.google-analytics.com';
const self = "'self'";

/**
 * Module that enables helmet in the application
 */
export class Helmet {
  constructor(public config: HelmetConfig) {}

  public enableFor(app: express.Express): void {
    // include default helmet functions
    app.use(helmet());

    this.setContentSecurityPolicy(app);
    this.setReferrerPolicy(app, this.config.referrerPolicy);
  }

  private setContentSecurityPolicy(app: express.Express): void {
    const scriptSrc = [self, googleAnalyticsDomain, "'sha256-+6WnXIl4mbFTCARd8N3COQmT3bJJmo32N8q8ZSQAIcU='"];

    if (process.env.DEV_MODE === 'true') {
      scriptSrc.push("'unsafe-eval'");
    }

    app.use(
      // eslint-disable-next-line import/no-named-as-default-member
      helmet.contentSecurityPolicy({
        directives: {
          connectSrc: [self],
          defaultSrc: ["'none'"],
          fontSrc: [self, 'data:'],
          imgSrc: [self, googleAnalyticsDomain],
          objectSrc: [self],
          scriptSrc,
          styleSrc: [self],
        },
      })
    );
  }

  private setReferrerPolicy(app: express.Express, policy: string): void {
    if (!policy) {
      throw new Error('Referrer policy configuration is required');
    }

    // eslint-disable-next-line import/no-named-as-default-member
    app.use(helmet.referrerPolicy({ policy }));
  }
}
