export const globalTypes = {
  theme: {
    name: 'Theme',
    description: 'Global theme for components',
    toolbar: {
      icon: 'circlehollow',
      title: 'Theme',
      items: [
        { value: 'light', icon: 'circlehollow', title: 'light' },
        { value: 'dark', icon: 'circle', title: 'dark' },
        { value: 'side-by-side', icon: 'sidebar', title: 'side by side' },
        { value: 'stacked', icon: 'bottombar', title: 'stacked' },
      ],
    },
  },
  locale: {
    name: 'Locale',
    description: 'Internationalization locale',
    toolbar: {
      icon: 'globe',
      shortcuts: {
        next: {
          label: 'Go to next language',
          keys: ['L'],
        },
        previous: {
          label: 'Go to previous language',
          keys: ['K'],
        },
        reset: {
          label: 'Reset language',
          keys: ['meta', 'shift', 'L'],
        },
      },
      items: [
        { title: 'Reset locale', type: 'reset' },
        { value: 'en', right: '🇺🇸', title: 'English' },
        { value: 'es', right: '🇪🇸', title: 'Español' },
        { value: 'zh', right: '🇨🇳', title: '中文' },
        { value: 'kr', right: '🇰🇷', title: '한국어' },
      ],
    },
  },
};
