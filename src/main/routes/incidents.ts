import * as express from 'express';

import { unslackify } from '../incidents/unslackify';
import { date } from '../modules/nunjucks/filters/date';

const { Logger } = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('routes/incidents');
const got = require('got');

const router = express.Router();

const responseUrl = process.env.RESPONSE_URL || 'http://localhost:8000';

const client = got.extend({
  prefixUrl: `${responseUrl}/core/incidents`,
  headers: {
    Accept: 'application/json',
  },
  responseType: 'json',
});

type SlackAuthor = {
  app_id: string; // always 'slack'
  external_id: string;
  display_name: string;
  full_name: string;
  email: string;
};

type TimelineMetadata = {
  author: SlackAuthor;
  message_ts: string;
  channel_id: string;
};

type TimelineEvent = {
  id: number;
  timestamp: string;
  text: string;
  event_type: string;
  metadata: TimelineMetadata;
  text_ui: string;
};

function compareTimelineEvents(a: TimelineEvent, b: TimelineEvent) {
  return a.timestamp > b.timestamp ? -1 : 1;
}

/* GET home page. */
router.get('/incident/:id', async (req, res, next) => {
  try {
    const response = await client.get(req.params.id);

    if (req.query.json === 'true') {
      return res.json(response.body);
    }

    const timeline = await client.get(`${req.params.id}/timeline/events`);

    const uiTimeline = await Promise.all(
      timeline.body.results
        // skipping incident_lead promotion for now
        .filter((entry: TimelineEvent) => entry.event_type !== 'incident_update')
        .sort(compareTimelineEvents)
        .map(async (entry: TimelineEvent) => {
          const description = await unslackify(entry.text_ui);

          return {
            title: { text: date(entry.timestamp) },
            by: entry.metadata.author.full_name,
            description: { html: `<div class="hmcts-timeline__description">${description}</div>` },
          };
        })
    );

    res.render('incident', { incident: response.body, timeline: uiTimeline });
  } catch (err) {
    logger.error(err);
    next(err);
  }
});

module.exports = router;
