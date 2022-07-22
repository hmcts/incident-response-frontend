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

export function userReferenceToId(text: string): string {
  const result = /&lt;@(U[A-Z\d]+)&gt;/.exec(text);
  return result ? result[1] : text;
}

function italics(text: string) {
  const regex = /(?:^_| _|\r\n_|\r_|\n_)(.+)_/g;
  return modifyText(regex, text, matches => {
    return `<span class="hmcts-!-font-style-italic">${matches[0]}</span>`;
  });
}

function bold(text: string) {
  const regex = /(?:^\*| \*|\r\n\*|\r\*|\n\*)(.+)\*/g;
  return modifyText(regex, text, matches => {
    return `<span class="govuk-!-font-weight-bold">${matches[0]}</span>`;
  });
}

function linkWithText(text: string) {
  const regex = /&lt;(https?:\/\/.+)\|(.+)&gt;/g;
  return modifyText(regex, text, matches => {
    return `<a class="govuk-link" href="${matches[0]}">${matches[1]}</a>`;
  });
}

function plainLink(text: string) {
  const regex = /&lt;(https?:\/\/.+)&gt;/g;
  return modifyText(regex, text, matches => {
    return `<a class="govuk-link" href="${matches[0]}">${matches[0]}</a>`;
  });
}

function multiLine(unslackifiedText: string) {
  return unslackifiedText.replace(/\r\n|\r|\n/g, '<br>');
}

async function userIdToDisplayNameConversion(text: string) {
  const regex = /(&lt;@U[A-Z\d]+&gt;)/g;

  return modifyTextAsync(regex, text, text, async matches => {
    const userId = userReferenceToId(matches[0]);
    return userIdToDisplayName(userId);
  });
}

function strikethrough(text: string) {
  const regex = /(?:^~| ~|\r\n~|\r~|\n~)(.+)~/g;
  return modifyText(regex, text, matches => {
    return `<span class="hmcts-!-text-decoration-line-through">${matches[0]}</span>`;
  });
}

function inlineCode(text: string) {
  const regex = /`([^`]+)`/g;
  return modifyText(regex, text, matches => {
    return `<code>${matches[0]}</code>`;
  });
}

function codeBlock(text: string) {
  const regex = /```([^`]+)```/g;

  return modifyText(regex, text, matches => {
    return `<pre><code>${matches[0]}</code></pre>`;
  });
}

function modifyText(regex: RegExp, text: string, replacementText: (matches: string[]) => string) {
  const matches = matchRegex(regex, text);

  let modifiedText = text;
  matches.forEach(theMatch => {
    modifiedText = modifiedText.replace(theMatch.original, replacementText(theMatch.matches));
  });
  return modifiedText;
}

function matchRegex(regex: RegExp, text: string) {
  const matches = [];
  let match = regex.exec(text);
  while (match !== null) {
    matches.push({
      original: match[0],
      matches: [match[1], match[2]],
    });
    match = regex.exec(text);
  }
  return matches;
}

async function modifyTextAsync(
  regex: RegExp,
  text: string,
  unslackifiedText: string,
  replacementTextFn: (matches: string[]) => Promise<string>
) {
  const matches = matchRegex(regex, text);

  let modifiedText = unslackifiedText;
  for (const theMatch of matches) {
    const replacementText = await replacementTextFn(theMatch.matches);

    modifiedText = modifiedText.replace(theMatch.original, replacementText);
  }
  return modifiedText;
}

function blockquote(text: string) {
  // blockquote must be at the start of a line, given we don't do line by line searching, we try to find the start
  const regex = /(?:\r\n|\r|\n)&gt; (.+)/g;
  return modifyText(regex, text, matches => {
    return `<blockquote>${matches[0]}</blockquote>`;
  });
}

/**
 * Adapts slacks markdown format to HTML
 *
 * Looks up users IDs and converts them to a display name
 * @see https://slack.com/intl/en-gb/help/articles/202288908-Format-your-messages
 * @param text the text from response API
 */
export async function unslackify(text: string): Promise<string> {
  let unslackifiedText = await userIdToDisplayNameConversion(text);
  unslackifiedText = bold(unslackifiedText);
  unslackifiedText = italics(unslackifiedText);
  unslackifiedText = strikethrough(unslackifiedText);
  unslackifiedText = linkWithText(unslackifiedText);
  unslackifiedText = plainLink(unslackifiedText);
  unslackifiedText = codeBlock(unslackifiedText);
  unslackifiedText = inlineCode(unslackifiedText);
  unslackifiedText = blockquote(unslackifiedText);

  return multiLine(unslackifiedText);
}
