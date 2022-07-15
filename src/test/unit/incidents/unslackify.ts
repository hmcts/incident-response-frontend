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
});
