function pickCategory(name) {
  if (/蛋|奶/.test(name)) {
    return "蛋奶类";
  }

  if (/鸡|牛|猪|肉/.test(name)) {
    return "肉类";
  }

  if (/番茄|青菜|菜|西红柿/.test(name)) {
    return "蔬菜类";
  }

  return "其他";
}

function pickStorage(name) {
  if (/青菜|番茄|牛奶|鸡蛋|鸡胸/.test(name)) {
    return "cold";
  }

  return "room";
}

function defaultExpireDate(name) {
  if (/牛奶/.test(name)) {
    return "2026-05-26";
  }

  if (/鸡胸|肉/.test(name)) {
    return "2026-05-22";
  }

  if (/番茄|西红柿/.test(name)) {
    return "2026-05-23";
  }

  return "2026-06-19";
}

function parseQuantityUnit(raw) {
  const unitMatch = raw.match(/(\d+)\s*(个|盒|克|g|斤|板)/i);

  if (!unitMatch) {
    return {
      quantity: 1,
      unit: "份"
    };
  }

  return {
    quantity: Number(unitMatch[1]),
    unit: unitMatch[2]
  };
}

function splitText(text) {
  return text
    .split(/[，,。；;]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeName(raw) {
  if (/鸡蛋/.test(raw)) {
    return "鸡蛋";
  }

  if (/牛奶/.test(raw)) {
    return "纯牛奶";
  }

  if (/鸡胸/.test(raw)) {
    return "鸡胸肉";
  }

  if (/番茄|西红柿/.test(raw)) {
    return "番茄";
  }

  return raw.replace(/今天买了|买了/g, "").trim();
}

function buildInventoryDraft(text, inputType) {
  const items = splitText(text).map((raw, index) => {
    const foodName = normalizeName(raw);
    const quantityUnit = parseQuantityUnit(raw);

    return {
      id: `draft-${index + 1}`,
      foodName,
      originalName: raw,
      category: pickCategory(foodName),
      quantity: quantityUnit.quantity,
      unit: quantityUnit.unit,
      storageLocation: pickStorage(foodName),
      purchaseDate: "2026-05-20",
      expireDate: defaultExpireDate(foodName),
      expireSource: inputType === "receipt" ? "ai_inferred" : "default_rule",
      confidence: inputType === "receipt" ? 0.86 : 0.92,
      note: "云函数已返回结构化草稿，仍需人工确认"
    };
  });

  return {
    items: items.length > 0 ? items : [],
    warnings: ["AI 只生成草稿，确认后才允许写入库存。"]
  };
}

module.exports = {
  buildInventoryDraft
};
