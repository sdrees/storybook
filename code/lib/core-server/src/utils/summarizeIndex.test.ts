import { isPageStory } from './summarizeIndex';

describe('isPageStory', () => {
  describe('true positives', () => {
    it.each(['pages/login', 'screens/login', 'components/LoginPage', 'components/LoginScreen'])(
      '%s',
      (title) => {
        expect(isPageStory(title)).toBe(true);
      }
    );
  });

  describe('false positives', () => {
    it.each([
      'components/PagerStatus',
      'components/DefectScreener',
      'addons/docs/docspage/autoplay',
    ])('%s', (title) => {
      expect(isPageStory(title)).toBe(true);
    });
  });

  describe('true negatives', () => {
    it.each(['atoms/Button', 'components/Slider'])('%s', (title) => {
      expect(isPageStory(title)).toBe(false);
    });
  });

  describe('false negatives', () => {
    it.each(['flows/login', 'login-flow/forgot password'])('%s', (title) => {
      expect(isPageStory(title)).toBe(false);
    });
  });
});
