

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/2.C9E6bgso.js","_app/immutable/chunks/DXSP3qqg.js","_app/immutable/chunks/BjoQfrDv.js","_app/immutable/chunks/Dz-Vw7My.js"];
export const stylesheets = ["_app/immutable/assets/2.FklCH5OQ.css"];
export const fonts = [];
