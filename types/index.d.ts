declare global {
	// Event object that persists throughout worfklow with observability after each step.
	const $event: any;

	// End workflow with optional message.
	function $end(msg?: string): void;

	// TODO other $things we support

	type SendPayload = any; // XXX ?

	// mimics axios config
	type SendConfigHTTPKv = [key: string]: string;
	interface SendConfigHTTPAuth {
		username: string;
		password: string;
	}
	interface SendConfigHTTP {
		method: string; // XXX proper enum for methods here?
		url: string;
		headers?: SendConfigHTTPKv;
		params?: SendConfigHTTPKv;
		auth?: SendConfigHTTPAuth;
		data?: SendPayload; // XXX ?
	}

	interface SendConfigS3 {
		bucket: string;
		prefix: string;
		payload: SendPayload;
	}

	interface SendConfigSQL {
		table: string;
		payload: SendPayload;
	}

	interface SendSnowflakeConfig {
		user: string;
		private_key: string;
		database: string;
		schema: string;
		stage_name: string;
		pipe_name: string;
		account: string;
		host: string;
		payload: SendPayload;
	}

	interface SendConfigSSE {
	}

	interface SendFunctionsWrapper {
		function http(config: SendConfigHTTP): void;
		function s3(config: SendConfigS3): void;
		function sql(config: SendConfigSQL): void;
		function snowflake(config: SendConfigSnowflake): void;
		function sse(config: SendConfigSSE): void:
	}
	const $send: SendFunctionsWrapper;
}
