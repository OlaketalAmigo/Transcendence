export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set([".ic-assets.json5","favicon.ico","logo2.svg"]),
	mimeTypes: {".json5":"application/json5",".svg":"image/svg+xml"},
	_: {
		client: {start:"_app/immutable/entry/start.B-oA_1Yq.js",app:"_app/immutable/entry/app.C_9dZLJH.js",imports:["_app/immutable/entry/start.B-oA_1Yq.js","_app/immutable/chunks/B4a7gUsC.js","_app/immutable/chunks/BjoQfrDv.js","_app/immutable/chunks/BW4a5eJ_.js","_app/immutable/entry/app.C_9dZLJH.js","_app/immutable/chunks/BjoQfrDv.js","_app/immutable/chunks/Dz-Vw7My.js","_app/immutable/chunks/DXSP3qqg.js","_app/immutable/chunks/BW4a5eJ_.js","_app/immutable/chunks/B_qiAcv3.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
