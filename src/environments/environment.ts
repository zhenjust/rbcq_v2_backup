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
  production: true, // will be overridden by prod file replacement
  __API_URL__: win.__env?.__API_URL__ || '',
  __CLOUD_API_URL__: win.__env?.__CLOUD_API_URL__ || '',
  __PHASE_ONE_URL__: win.__env?.__PHASE_ONE_URL__ || '',
  __PHASE_TWO_URL__: win.__env?.__PHASE_TWO_URL__ || '/bsmd',
};
