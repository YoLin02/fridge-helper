"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.callCloudFunction = callCloudFunction;
async function callCloudFunction(options) {
    const result = await wx.cloud.callFunction({
        name: options.name,
        data: options.data
    });
    return result.result;
}
