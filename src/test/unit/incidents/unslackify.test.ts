import '../../mocks/slack';
import { unslackify, userIdToDisplayName, userReferenceToId } from '../../../main/incidents/unslackify';

describe('unslackify', () => {
  test('converts slack-isms to browser suitable', async () => {
    await expect(unslackify('&lt;@UMMJ5Q47M&gt; hello')).resolves.toBe('@I like rice hello');
  });

  describe('userIdToDisplayName', () => {
    test('converts slack user id to display name', async () => {
      await expect(userIdToDisplayName('UMMJ5Q47M')).resolves.toBe('@I like rice');
    });
  });

  describe('userReferenceToId', () => {
    test('converts slack user id reference to ID', async () => {
      expect(userReferenceToId('&lt;@UMMJ5Q47M&gt;')).toBe('UMMJ5Q47M');
    });

    test('returns existing text if not an id reference', async () => {
      expect(userReferenceToId('not an id')).toBe('not an id');
    });
  });

  test('to match snapshot', async () => {
    const unslackifiedResult = await unslackify(`
    *bold1* non bold

*bold2* not bold2

_Test italic_ and non italic

_Test2 italic2_ and non italic

~strike through~ and non

~strike through2~ and non

\`code\` inline code

\`code23\` inline code

\`\`\`multi-line code

hello\`\`\`
\`\`\`multi-line2 code

hello3\`\`\`

&gt; block quote
&gt; on multi lines
&gt; block quote2
&gt; on multi lines2

1. ordered list
2. second item
1. ordered list2
2. second item2

• bulleted list
• second item bulleted list
• bulleted list2
• second item bulleted list2
Link1:
&lt;https://github.com/hmcts/azure-platform-terraform/commit/82f70a946b14db4616b0b53bb61c8fc5a8f4dab4&gt;

link2:
&lt;https://dev.azure.com/hmcts/CNP/_build/results?buildId=247004&amp;view=ms.vss-test-web.build-test-results-tab&gt;

&lt;https://github.com/hmcts/azure-platform-terraform/commit/82f70a946b14db4616b0b53bb61c8fc5a8f4dab4|link with text1&gt;

&lt;https://dev.azure.com/hmcts/CNP/_build/results?buildId=247004&amp;view=ms.vss-test-web.build-test-results-tab|link with text2&gt;

&lt;@U2YKSMJU9&gt; Hi

&lt;@U2YKSMJU9&gt; Bye

&lt;@U03KG7Y9TRA&gt; let’s make sure this works for people other than me`);

    expect(unslackifiedResult).toMatchSnapshot();
  });
});
