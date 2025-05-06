// apiUrls.test.js
import * as apiUrls from './apiUrls';

describe('API URLs', () => {
  it('should export all API URLs as strings', () => {
    Object.values(apiUrls).forEach((url) => {
      expect(typeof url).toBe('string');
    });
  });

  it('should not contain duplicate URLs', () => {
    const urls = Object.values(apiUrls);
    const uniqueUrls = new Set(urls);
    expect(uniqueUrls.size).toBe(urls.length);
  });
});
