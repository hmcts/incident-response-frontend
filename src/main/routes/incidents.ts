import * as express from 'express';
import { date } from '../modules/nunjucks/filters/date';
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

/* GET home page. */
router.get('/incident/:id', async (req, res, next) => {
  try {
    const response = await client.get(req.params.id);

    if (req.query.json === 'true') {
      return res.json(response.body);
    }

    const timeline = await client.get(`${req.params.id}/timeline/events`);

    const uiTimeline = timeline.body.results
    // skipping incident_lead promotion for now
      .filter((entry: any) => entry.event_type !== 'incident_update')
      .map((entry: any) => {
        return {
          title: { text: date(entry.timestamp) },
          by: entry.metadata.author.full_name,
          description: { text: entry.text_ui },
        };
      });

    res.render('incident', { incident: response.body, timeline: uiTimeline });
  } catch (err) {
    console.log(err);
    next(err);
  }
});

module.exports = router;
