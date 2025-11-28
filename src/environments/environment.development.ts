declare global {
  interface Window {
    __env?: {
      __API_URL__?: string;
      __CLOUD_API_URL__?: string;
      __PHASE_ONE_URL__?: string;
      __PHASE_TWO_URL__?: string;
    };
  }
}

const win = window as Window;

export const environment = {
  production: false,
  __API_URL__: win.__env?.__API_URL__ || '//crss-dev.exist.com.ph',
  __CLOUD_API_URL__: win.__env?.__CLOUD_API_URL__ || 'https://crss-cloud-dev.exist.com.ph',
  __PHASE_ONE_URL__: win.__env?.__PHASE_ONE_URL__ || '',
  __PHASE_TWO_URL__: win.__env?.__PHASE_TWO_URL__ || '/bsmd',
};
