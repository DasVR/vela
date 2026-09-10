export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["favicon.png"]),
	mimeTypes: {".png":"image/png"},
	_: {
		client: {start:"_app/immutable/entry/start.1rltjVr4.js",app:"_app/immutable/entry/app.45UweVeG.js",imports:["_app/immutable/entry/start.1rltjVr4.js","_app/immutable/chunks/D9kjXApO.js","_app/immutable/chunks/CJwyWDj-.js","_app/immutable/chunks/1kaZJbFx.js","_app/immutable/entry/app.45UweVeG.js","_app/immutable/chunks/Ct5FWWRu.js","_app/immutable/chunks/D9kjXApO.js","_app/immutable/chunks/DEX5dTO8.js","_app/immutable/chunks/Ht8u9NwZ.js","_app/immutable/chunks/1kaZJbFx.js","_app/immutable/chunks/CiMFYqln.js","_app/immutable/chunks/BjG7IeGY.js","_app/immutable/chunks/fACFFBQX.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
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
		prerendered_routes: new Set(["/palette","/start"]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
