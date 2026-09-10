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
		client: {start:"_app/immutable/entry/start.rb-KXW28.js",app:"_app/immutable/entry/app.DsqrKkL8.js",imports:["_app/immutable/entry/start.rb-KXW28.js","_app/immutable/chunks/DNrvzIKv.js","_app/immutable/chunks/oN6M1kas.js","_app/immutable/chunks/DN6gVfc7.js","_app/immutable/entry/app.DsqrKkL8.js","_app/immutable/chunks/Ct5FWWRu.js","_app/immutable/chunks/DNrvzIKv.js","_app/immutable/chunks/DiX9sSd4.js","_app/immutable/chunks/DmKOdZV4.js","_app/immutable/chunks/DN6gVfc7.js","_app/immutable/chunks/Cv4smXI8.js","_app/immutable/chunks/TKYa37SO.js","_app/immutable/chunks/Rlg5E8Ew.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
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
