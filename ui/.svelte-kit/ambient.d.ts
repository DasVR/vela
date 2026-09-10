
// this file is generated — do not edit it


/// <reference types="@sveltejs/kit" />

/**
 * This module provides access to environment variables that are injected _statically_ into your bundle at build time and are limited to _private_ access.
 * 
 * |         | Runtime                                                                    | Build time                                                               |
 * | ------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
 * | Private | [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private) | [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private) |
 * | Public  | [`$env/dynamic/public`](https://svelte.dev/docs/kit/$env-dynamic-public)   | [`$env/static/public`](https://svelte.dev/docs/kit/$env-static-public)   |
 * 
 * Static environment variables are [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env` at build time and then statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 * 
 * **_Private_ access:**
 * 
 * - This module cannot be imported into client-side code
 * - This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured)
 * 
 * For example, given the following build time environment:
 * 
 * ```env
 * ENVIRONMENT=production
 * PUBLIC_BASE_URL=http://site.com
 * ```
 * 
 * With the default `publicPrefix` and `privatePrefix`:
 * 
 * ```ts
 * import { ENVIRONMENT, PUBLIC_BASE_URL } from '$env/static/private';
 * 
 * console.log(ENVIRONMENT); // => "production"
 * console.log(PUBLIC_BASE_URL); // => throws error during build
 * ```
 * 
 * The above values will be the same _even if_ different values for `ENVIRONMENT` or `PUBLIC_BASE_URL` are set at runtime, as they are statically replaced in your code with their build time values.
 */
declare module '$env/static/private' {
	export const SVELTEKIT_FORK: string;
	export const NODE_ENV: string;
	export const HERMES_SESSION_SOURCE: string;
	export const HERMES_AGENT: string;
	export const MEMORY_PRESSURE_WRITE: string;
	export const BROWSER_INACTIVITY_TIMEOUT: string;
	export const npm_config_global_prefix: string;
	export const TERMINAL_HOME_MODE: string;
	export const npm_config_globalignorefile: string;
	export const HERMES_INTERACTIVE: string;
	export const npm_config_globalconfig: string;
	export const HERMES_BROWSER_CONTROL_TRANSPORT_FAMILY: string;
	export const TERMINAL_DOCKER_RUN_AS_HOST_USER: string;
	export const HERMES_SESSION_SCOPE_ID: string;
	export const TERMINAL_CONTAINER_DISK: string;
	export const PWD: string;
	export const HERMES_SESSION_PLATFORM: string;
	export const npm_config_init_module: string;
	export const QT_ACCESSIBILITY: string;
	export const npm_lifecycle_event: string;
	export const npm_package_version: string;
	export const SSH_AUTH_SOCK: string;
	export const HERMES_QUIET: string;
	export const LANG: string;
	export const TERMINAL_DEGRADED_MODE: string;
	export const XDG_RUNTIME_DIR: string;
	export const TERMINAL_DOCKER_SHM_SIZE: string;
	export const npm_package_name: string;
	export const NODE: string;
	export const TERMINAL_SINGULARITY_IMAGE: string;
	export const INVOCATION_ID: string;
	export const SHELL: string;
	export const npm_config_node_gyp: string;
	export const TERMINAL_CONTAINER_PERSISTENT: string;
	export const TERMINAL_CONTAINER_MEMORY: string;
	export const PAGER: string;
	export const HERMES_EXEC_ASK: string;
	export const TERMINAL_VERCEL_RUNTIME: string;
	export const TERMINAL_DOCKER_MOUNT_CWD_TO_WORKSPACE: string;
	export const HERMES_BROWSER_CONTROL_PRINCIPAL: string;
	export const TERMINAL_TEMP_DIR: string;
	export const npm_config_metrics_registry: string;
	export const _config_version: string;
	export const TERMINAL_CWD: string;
	export const TERMINAL_DOCKER_SHARED_CONTAINER_KEY: string;
	export const npm_config_local_prefix: string;
	export const MANAGERPID: string;
	export const TERMINAL_DOCKER_FORWARD_ENV: string;
	export const HOME: string;
	export const npm_lifecycle_script: string;
	export const HERMES_SESSION_CHAT_ID: string;
	export const HERMES_CRON_SESSION: string;
	export const _HERMES_GATEWAY: string;
	export const npm_config_user_agent: string;
	export const TERMINAL_DOCKER_EXTRA_ARGS: string;
	export const TERMINAL_CONTAINER_CPU: string;
	export const OLDPWD: string;
	export const npm_package_json: string;
	export const DBUS_SESSION_BUS_ADDRESS: string;
	export const INIT_CWD: string;
	export const DEBUGINFOD_URLS: string;
	export const HERMES_SESSION_KEY: string;
	export const XDG_DATA_DIRS: string;
	export const TERMINAL_MODAL_MODE: string;
	export const TERMINAL_DOCKER_IMAGE: string;
	export const HERMES_SESSION_USER_NAME: string;
	export const EDITOR: string;
	export const GIT_PAGER: string;
	export const HERMES_UI_SESSION_ID: string;
	export const USER: string;
	export const SHLVL: string;
	export const npm_config_noproxy: string;
	export const npm_execpath: string;
	export const TERMINAL_MODAL_IMAGE: string;
	export const TERMINAL_DOCKER_NETWORK: string;
	export const TERMINAL_ENV: string;
	export const HERMES_SESSION_THREAD_ID: string;
	export const HERMES_SESSION_PROFILE: string;
	export const HERMES_REAL_HOME: string;
	export const HERMES_SESSION_CHAT_TYPE: string;
	export const HERMES_SESSION_USER_ID: string;
	export const SYSTEMD_EXEC_PID: string;
	export const HERMES_TURN_LEASE_TIMEOUT: string;
	export const SSL_CERT_FILE: string;
	export const HERMES_SESSION_CHAT_NAME: string;
	export const COLOR: string;
	export const PATH: string;
	export const TERMINAL_DOCKER_VOLUMES: string;
	export const HERMES_SESSION_MESSAGE_ID: string;
	export const npm_command: string;
	export const GPG_AGENT_INFO: string;
	export const LOGNAME: string;
	export const TERMINAL_PERSISTENT_SHELL: string;
	export const MANAGERPIDFDID: string;
	export const HERMES_GATEWAY_SESSION: string;
	export const TERMINAL_DAYTONA_IMAGE: string;
	export const JOURNAL_STREAM: string;
	export const _: string;
	export const npm_config_prefix: string;
	export const TERMINAL_LIFETIME_SECONDS: string;
	export const npm_config_userconfig: string;
	export const MEMORY_PRESSURE_WATCH: string;
	export const AI_AGENT: string;
	export const npm_config_cache: string;
	export const HERMES_SESSION_USER_ID_ALT: string;
	export const TERMINAL_DOCKER_ENV: string;
	export const npm_node_execpath: string;
	export const DISCORD_ALLOWED_CHANNELS: string;
	export const HERMES_SESSION_ID: string;
	export const TERMINAL_TIMEOUT: string;
}

/**
 * This module provides access to environment variables that are injected _statically_ into your bundle at build time and are _publicly_ accessible.
 * 
 * |         | Runtime                                                                    | Build time                                                               |
 * | ------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
 * | Private | [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private) | [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private) |
 * | Public  | [`$env/dynamic/public`](https://svelte.dev/docs/kit/$env-dynamic-public)   | [`$env/static/public`](https://svelte.dev/docs/kit/$env-static-public)   |
 * 
 * Static environment variables are [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env` at build time and then statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 * 
 * **_Public_ access:**
 * 
 * - This module _can_ be imported into client-side code
 * - **Only** variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`) are included
 * 
 * For example, given the following build time environment:
 * 
 * ```env
 * ENVIRONMENT=production
 * PUBLIC_BASE_URL=http://site.com
 * ```
 * 
 * With the default `publicPrefix` and `privatePrefix`:
 * 
 * ```ts
 * import { ENVIRONMENT, PUBLIC_BASE_URL } from '$env/static/public';
 * 
 * console.log(ENVIRONMENT); // => throws error during build
 * console.log(PUBLIC_BASE_URL); // => "http://site.com"
 * ```
 * 
 * The above values will be the same _even if_ different values for `ENVIRONMENT` or `PUBLIC_BASE_URL` are set at runtime, as they are statically replaced in your code with their build time values.
 */
declare module '$env/static/public' {
	
}

/**
 * This module provides access to environment variables set _dynamically_ at runtime and that are limited to _private_ access.
 * 
 * |         | Runtime                                                                    | Build time                                                               |
 * | ------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
 * | Private | [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private) | [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private) |
 * | Public  | [`$env/dynamic/public`](https://svelte.dev/docs/kit/$env-dynamic-public)   | [`$env/static/public`](https://svelte.dev/docs/kit/$env-static-public)   |
 * 
 * Dynamic environment variables are defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/main/packages/adapter-node) (or running [`vite preview`](https://svelte.dev/docs/kit/cli)), this is equivalent to `process.env`.
 * 
 * **_Private_ access:**
 * 
 * - This module cannot be imported into client-side code
 * - This module includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured)
 * 
 * > [!NOTE] In `dev`, `$env/dynamic` includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 * 
 * > [!NOTE] To get correct types, environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * >
 * > ```env
 * > MY_FEATURE_FLAG=
 * > ```
 * >
 * > You can override `.env` values from the command line like so:
 * >
 * > ```sh
 * > MY_FEATURE_FLAG="enabled" npm run dev
 * > ```
 * 
 * For example, given the following runtime environment:
 * 
 * ```env
 * ENVIRONMENT=production
 * PUBLIC_BASE_URL=http://site.com
 * ```
 * 
 * With the default `publicPrefix` and `privatePrefix`:
 * 
 * ```ts
 * import { env } from '$env/dynamic/private';
 * 
 * console.log(env.ENVIRONMENT); // => "production"
 * console.log(env.PUBLIC_BASE_URL); // => undefined
 * ```
 */
declare module '$env/dynamic/private' {
	export const env: {
		SVELTEKIT_FORK: string;
		NODE_ENV: string;
		HERMES_SESSION_SOURCE: string;
		HERMES_AGENT: string;
		MEMORY_PRESSURE_WRITE: string;
		BROWSER_INACTIVITY_TIMEOUT: string;
		npm_config_global_prefix: string;
		TERMINAL_HOME_MODE: string;
		npm_config_globalignorefile: string;
		HERMES_INTERACTIVE: string;
		npm_config_globalconfig: string;
		HERMES_BROWSER_CONTROL_TRANSPORT_FAMILY: string;
		TERMINAL_DOCKER_RUN_AS_HOST_USER: string;
		HERMES_SESSION_SCOPE_ID: string;
		TERMINAL_CONTAINER_DISK: string;
		PWD: string;
		HERMES_SESSION_PLATFORM: string;
		npm_config_init_module: string;
		QT_ACCESSIBILITY: string;
		npm_lifecycle_event: string;
		npm_package_version: string;
		SSH_AUTH_SOCK: string;
		HERMES_QUIET: string;
		LANG: string;
		TERMINAL_DEGRADED_MODE: string;
		XDG_RUNTIME_DIR: string;
		TERMINAL_DOCKER_SHM_SIZE: string;
		npm_package_name: string;
		NODE: string;
		TERMINAL_SINGULARITY_IMAGE: string;
		INVOCATION_ID: string;
		SHELL: string;
		npm_config_node_gyp: string;
		TERMINAL_CONTAINER_PERSISTENT: string;
		TERMINAL_CONTAINER_MEMORY: string;
		PAGER: string;
		HERMES_EXEC_ASK: string;
		TERMINAL_VERCEL_RUNTIME: string;
		TERMINAL_DOCKER_MOUNT_CWD_TO_WORKSPACE: string;
		HERMES_BROWSER_CONTROL_PRINCIPAL: string;
		TERMINAL_TEMP_DIR: string;
		npm_config_metrics_registry: string;
		_config_version: string;
		TERMINAL_CWD: string;
		TERMINAL_DOCKER_SHARED_CONTAINER_KEY: string;
		npm_config_local_prefix: string;
		MANAGERPID: string;
		TERMINAL_DOCKER_FORWARD_ENV: string;
		HOME: string;
		npm_lifecycle_script: string;
		HERMES_SESSION_CHAT_ID: string;
		HERMES_CRON_SESSION: string;
		_HERMES_GATEWAY: string;
		npm_config_user_agent: string;
		TERMINAL_DOCKER_EXTRA_ARGS: string;
		TERMINAL_CONTAINER_CPU: string;
		OLDPWD: string;
		npm_package_json: string;
		DBUS_SESSION_BUS_ADDRESS: string;
		INIT_CWD: string;
		DEBUGINFOD_URLS: string;
		HERMES_SESSION_KEY: string;
		XDG_DATA_DIRS: string;
		TERMINAL_MODAL_MODE: string;
		TERMINAL_DOCKER_IMAGE: string;
		HERMES_SESSION_USER_NAME: string;
		EDITOR: string;
		GIT_PAGER: string;
		HERMES_UI_SESSION_ID: string;
		USER: string;
		SHLVL: string;
		npm_config_noproxy: string;
		npm_execpath: string;
		TERMINAL_MODAL_IMAGE: string;
		TERMINAL_DOCKER_NETWORK: string;
		TERMINAL_ENV: string;
		HERMES_SESSION_THREAD_ID: string;
		HERMES_SESSION_PROFILE: string;
		HERMES_REAL_HOME: string;
		HERMES_SESSION_CHAT_TYPE: string;
		HERMES_SESSION_USER_ID: string;
		SYSTEMD_EXEC_PID: string;
		HERMES_TURN_LEASE_TIMEOUT: string;
		SSL_CERT_FILE: string;
		HERMES_SESSION_CHAT_NAME: string;
		COLOR: string;
		PATH: string;
		TERMINAL_DOCKER_VOLUMES: string;
		HERMES_SESSION_MESSAGE_ID: string;
		npm_command: string;
		GPG_AGENT_INFO: string;
		LOGNAME: string;
		TERMINAL_PERSISTENT_SHELL: string;
		MANAGERPIDFDID: string;
		HERMES_GATEWAY_SESSION: string;
		TERMINAL_DAYTONA_IMAGE: string;
		JOURNAL_STREAM: string;
		_: string;
		npm_config_prefix: string;
		TERMINAL_LIFETIME_SECONDS: string;
		npm_config_userconfig: string;
		MEMORY_PRESSURE_WATCH: string;
		AI_AGENT: string;
		npm_config_cache: string;
		HERMES_SESSION_USER_ID_ALT: string;
		TERMINAL_DOCKER_ENV: string;
		npm_node_execpath: string;
		DISCORD_ALLOWED_CHANNELS: string;
		HERMES_SESSION_ID: string;
		TERMINAL_TIMEOUT: string;
		[key: `PUBLIC_${string}`]: undefined;
		[key: `${string}`]: string | undefined;
	}
}

/**
 * This module provides access to environment variables set _dynamically_ at runtime and that are _publicly_ accessible.
 * 
 * |         | Runtime                                                                    | Build time                                                               |
 * | ------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
 * | Private | [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private) | [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private) |
 * | Public  | [`$env/dynamic/public`](https://svelte.dev/docs/kit/$env-dynamic-public)   | [`$env/static/public`](https://svelte.dev/docs/kit/$env-static-public)   |
 * 
 * Dynamic environment variables are defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/main/packages/adapter-node) (or running [`vite preview`](https://svelte.dev/docs/kit/cli)), this is equivalent to `process.env`.
 * 
 * **_Public_ access:**
 * 
 * - This module _can_ be imported into client-side code
 * - **Only** variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`) are included
 * 
 * > [!NOTE] In `dev`, `$env/dynamic` includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 * 
 * > [!NOTE] To get correct types, environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * >
 * > ```env
 * > MY_FEATURE_FLAG=
 * > ```
 * >
 * > You can override `.env` values from the command line like so:
 * >
 * > ```sh
 * > MY_FEATURE_FLAG="enabled" npm run dev
 * > ```
 * 
 * For example, given the following runtime environment:
 * 
 * ```env
 * ENVIRONMENT=production
 * PUBLIC_BASE_URL=http://example.com
 * ```
 * 
 * With the default `publicPrefix` and `privatePrefix`:
 * 
 * ```ts
 * import { env } from '$env/dynamic/public';
 * console.log(env.ENVIRONMENT); // => undefined, not public
 * console.log(env.PUBLIC_BASE_URL); // => "http://example.com"
 * ```
 * 
 * ```
 * 
 * ```
 */
declare module '$env/dynamic/public' {
	export const env: {
		[key: `PUBLIC_${string}`]: string | undefined;
	}
}
