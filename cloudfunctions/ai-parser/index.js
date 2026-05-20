const cloud = require("wx-server-sdk");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const { buildInventoryDraft } = require("./services/normalizeService");
const { createTaskResult } = require("./services/taskService");

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const { action, payload = {} } = event || {};

  if (action === "parseInventoryInput") {
    try {
      const draft = buildInventoryDraft(payload.text || "", payload.input_type || "text_input");

      return await createTaskResult({
        openid: OPENID,
        inputType: payload.input_type || "text_input",
        inputText: payload.text || "",
        rawAiResult: {
          source: "mock_normalizer",
          payload
        },
        normalizedResult: draft,
        warnings: draft.warnings
      });
    } catch (error) {
      return {
        success: false,
        message: error.message || "parse inventory failed"
      };
    }
  }

  return {
    success: false,
    message: `unsupported action: ${action || "unknown"}`
  };
};
