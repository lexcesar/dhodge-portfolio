import { defineField, defineType } from 'sanity';

/* YouTube or Vimeo address; the site plays it in a click-to-load player. */
export const VIDEO_URL = /^https:\/\/(www\.)?(youtube\.com\/watch\?v=[\w-]{11}|youtu\.be\/[\w-]{11}|vimeo\.com\/\d+)/;

export const videoUrl = defineField({
	name: 'video',
	title: 'Vídeo',
	type: 'url',
	description: 'Endereço do YouTube (youtube.com/watch?v=… ou youtu.be/…) ou do Vimeo (vimeo.com/123456).',
	validation: (r) => r.required().custom((v) => (!v || VIDEO_URL.test(String(v)) ? true : 'Use um endereço do YouTube ou do Vimeo.')),
});
