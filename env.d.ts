// env.d.ts
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      USERNAME: string;
      PASSWORD: string;
      API_KEY: string;
      USER_AGENT: string;
      SESSION: string;
      CF_CLEARANCE: string;
      LLM_main: string;
      LLM_second: string;
      LLM_third: string;
      LLM_fourth: string;
    }
  }
}

export {};
