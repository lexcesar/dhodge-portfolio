import { home } from './home';
import { localeBody, localeLine, localeString, localeText } from './locale';
import { profile } from './profile';
import { project } from './project';
import { section } from './section';
import { work } from './work';

/* project + home: the site since the 26/11/2026 restructure (Daniel's four categories).
   work + section: the "Três portas" site (tag tres-portas-2026-11-26); kept until the published site stops reading them. */
export const schemaTypes = [localeString, localeText, localeLine, localeBody, project, home, profile, work, section];
