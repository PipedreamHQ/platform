"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
function observability(resp) {
    return {
        request: resp.config,
        response: {
            status: resp.status,
            headers: resp.headers,
            data: resp.data,
        },
    };
}
async function default_1(step, config) {
    try {
        const resp = await axios_1.default(config);
        step.axios = observability(resp);
        return resp.data;
    }
    catch (err) {
        if (err.isAxiosError) {
            step.axios = observability(err.response);
        }
        else {
            step.error = err;
        }
        throw err;
    }
}
exports.default = default_1;
