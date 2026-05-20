const cloud = require("wx-server-sdk");
const { calculateTargets } = require("../services/calorieService");

const db = cloud.database();

async function setUserProfile(payload, options = {}) {
  const { OPENID } = cloud.getWXContext();
  const calculated = calculateTargets(payload);

  if (options.calculateOnly) {
    return {
      success: true,
      data: calculated
    };
  }

  const now = Date.now();
  const existing = await db
    .collection("user_profiles")
    .where({
      user_id: OPENID
    })
    .limit(1)
    .get()
    .catch(() => ({ data: [] }));

  const data = {
    user_id: OPENID,
    gender: calculated.gender,
    birthday: calculated.birthday,
    height_cm: calculated.heightCm,
    weight_kg: calculated.weightKg,
    target_weight_kg: calculated.targetWeightKg,
    goal: calculated.goal,
    activity_level: calculated.activityLevel,
    bmr: calculated.bmr,
    tdee: calculated.tdee,
    daily_calorie_target: calculated.dailyCalorieTarget,
    protein_target_g: calculated.proteinTargetG,
    fat_target_g: calculated.fatTargetG,
    carb_target_g: calculated.carbTargetG,
    updated_at: now
  };

  if (existing.data.length > 0) {
    await db.collection("user_profiles").doc(existing.data[0]._id).update({
      data
    });
  } else {
    await db.collection("user_profiles").add({
      data: {
        ...data,
        created_at: now
      }
    });
  }

  return {
    success: true,
    data: calculated
  };
}

module.exports = {
  setUserProfile
};
