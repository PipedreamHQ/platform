"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const t = require("io-ts");
const SendPayload = t.union([t.string, t.object]);
exports.SendConfigEmail = t.partial({
    html: t.string,
    subject: t.string,
    text: t.string,
});
// interface SendConfigHTTPKv {
// 	[key: string]: string;
// }
const SendConfigHTTPKv = t.object; // XXX should be type above
const SendConfigHTTPAuth = t.strict({
    password: t.string,
    username: t.string,
});
const SendConfigHTTP_required = t.strict({
    method: t.string,
    url: t.string,
});
const SendConfigHTTP_optional = t.partial({
    auth: SendConfigHTTPAuth,
    data: SendPayload,
    headers: SendConfigHTTPKv,
    params: SendConfigHTTPKv,
});
exports.SendConfigHTTP = t.intersection([SendConfigHTTP_required, SendConfigHTTP_optional]);
exports.SendConfigS3 = t.strict({
    bucket: t.string,
    payload: SendPayload,
    prefix: t.string,
});
exports.SendConfigSQL = t.strict({
    payload: SendPayload,
    table: t.string,
});
exports.SendConfigSnowflake = t.strict({
    account: t.string,
    database: t.string,
    host: t.string,
    payload: SendPayload,
    pipe_name: t.string,
    private_key: t.string,
    schema: t.string,
    stage_name: t.string,
    user: t.string,
});
exports.SendConfigSSE = t.strict({
    channel: t.string,
    payload: SendPayload,
});
// XXX would be cool to have this and SendFunctionsWrapper be more shared
exports.sendTypeMap = {
    email: exports.SendConfigEmail,
    http: exports.SendConfigHTTP,
    s3: exports.SendConfigS3,
    sql: exports.SendConfigSQL,
    snowflake: exports.SendConfigSnowflake,
    sse: exports.SendConfigSSE,
};
exports.END_NEEDLE = "__pd_end";
// End workflow with optional message.
function $end(message) {
    const err = new Error();
    err[exports.END_NEEDLE] = {
        message,
        ts: new Date().toISOString(),
    };
    throw err;
}
exports.$end = $end;
exports.$sendConfigRuntimeTypeChecker = (function () {
    const ret = {};
    for (const [sendName, sendConfigType] of Object.entries(exports.sendTypeMap)) {
        ret[sendName] = function (config) {
            const result = sendConfigType.decode(config);
            if (!result)
                throw new Error("io-ts: unexpected decode output");
            if (result._tag === "Left") {
                for (const err of result.left) {
                    if (err.message) {
                        throw new Error(err.message);
                    }
                    else {
                        const keyChunks = [];
                        for (const ctx of err.context) {
                            if (!ctx.key)
                                continue;
                            if (!isNaN(+ctx.key))
                                continue;
                            keyChunks.push(ctx.key);
                        }
                        throw new Error(`$send.${sendName}: invalid value ${err.value} for ${keyChunks.join(".")}`);
                    }
                }
                throw new Error("io-ts: error but could not produce message"); // shouldn't happen...
            }
            // XXX if result !== config they passed extra fields... but expensive
        };
    }
    return ret;
})();
