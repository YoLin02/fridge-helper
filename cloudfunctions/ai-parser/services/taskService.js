const cloud = require("wx-server-sdk");

const db = cloud.database();

async function createTaskResult({
  openid,
  inputType,
  inputText = "",
  rawAiResult,
  normalizedResult,
  warnings = [],
  status = "success",
  errorMessage = ""
}) {
  const now = Date.now();
  const taskRecord = {
    user_id: openid,
    task_type: "inventory_parse",
    input_type: inputType,
    input_text: inputText,
    image_file_id: "",
    ocr_text: "",
    raw_ai_result: rawAiResult,
    normalized_result: normalizedResult,
    status,
    error_message: errorMessage,
    created_at: now,
    updated_at: now
  };

  const result = await db.collection("ai_parse_tasks").add({
    data: taskRecord
  });

  return {
    success: status === "success",
    task_id: result._id,
    data: normalizedResult,
    warnings
  };
}

module.exports = {
  createTaskResult
};
