import { defineCliConfig } from 'sanity/cli';

export default defineCliConfig({
	api: { projectId: 'arbdqygj', dataset: 'production' },
	studioHost: 'dhodge',
	deployment: { appId: 'nb92fb0s38c0j3k8esmy14g7' },
	// The CORS list allows only 3333 for the Studio: never let Vite move to another port.
	vite: (config) => ({ ...config, server: { ...config.server, port: 3333, strictPort: true } }),
});
