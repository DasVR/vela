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
		client: {start:"_app/immutable/entry/start.GiNGBnKv.js",app:"_app/immutable/entry/app.DIVqxU7_.js",imports:["_app/immutable/entry/start.GiNGBnKv.js","_app/immutable/chunks/BD-I1W1N.js","_app/immutable/chunks/CRUGelMG.js","_app/immutable/chunks/CkU-M3Q7.js","_app/immutable/entry/app.DIVqxU7_.js","_app/immutable/chunks/Ct5FWWRu.js","_app/immutable/chunks/BD-I1W1N.js","_app/immutable/chunks/CLlH1EvT.js","_app/immutable/chunks/Dh7_K4zK.js","_app/immutable/chunks/CkU-M3Q7.js","_app/immutable/chunks/BaXsBOun.js","_app/immutable/chunks/7spujkkc.js","_app/immutable/chunks/Bk8FoJL0.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
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
