import mixpanel from 'mixpanel-browser';

const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;

export const initMixpanel = () => {
  if (!MIXPANEL_TOKEN) return;

  mixpanel.init(MIXPANEL_TOKEN, { autocapture: true });
};
