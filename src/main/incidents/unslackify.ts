import { UsersProfileGetResponse } from '@slack/web-api/dist/response';
import { Profile } from '@slack/web-api/dist/response/UsersProfileGetResponse';

import { app } from './slack';

const { Logger } = require('@hmcts/nodejs-logging');
const NodeCache = require('node-cache');

const logger = Logger.getLogger('incidents/unslackify');

const myCache = new NodeCache({
  stdTTL: 3600,
});

export async function userIdToDisplayName(text: string): Promise<string> {
  const cachedValue = myCache.get(text);
  if (cachedValue) {
    return cachedValue;
  }

  try {
    const user: UsersProfileGetResponse = (
      await app.client.users.info({
        user: text,
      })
    ).user;

    if (!user.profile) {
      return text;
    }

    const name = convertProfileToName(user.profile);
    if (name) {
      myCache.set(text, `@${name}`);
      return `@${name}`;
    }
  } catch (err) {
    logger.error(err);
  }
  return text;
}

/**
 * Users may have a display name set or may not.
 * Display name is normally better than real name, so we prefer that but fallback to real name.
 */
function convertProfileToName(profile: Profile): string | undefined {
  let name = profile.display_name_normalized;
  if (!name) {
    name = profile.real_name_normalized;
  }
  return name;
}

const userIdRegex = /(&lt;@U[A-Z\d]+&gt;)/;

export function userReferenceToId(text: string): string {
  const result = /&lt;@(U[A-Z\d]+)&gt;/.exec(text);
  return result ? result[1] : text;
}

export async function unslackify(text: string): Promise<string> {
  const match = userIdRegex.exec(text);

  let unslackifiedText = text;
  if (match) {
    const userId = userReferenceToId(match[1]);
    const displayName = await userIdToDisplayName(userId);

    unslackifiedText = text.replace(userIdRegex, displayName);
  }

  // TODO urls

  return unslackifiedText;
}
