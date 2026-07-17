import test from "node:test";
import assert from "node:assert";
import { z } from "zod";

// 1. Re-create the clinical Zod schema inside the test to verify bounds validation
const predictorSchema = z.object({
  age: z.number().min(0).max(120),
  gender: z.number().min(0).max(1),
  bmi: z.number().min(10.0).max(80.0),
  systolic_bp: z.number().min(50).max(250),
  diastolic_bp: z.number().min(30).max(150),
  glucose: z.number().min(20).max(1000),
  heart_rate: z.number().min(30).max(220),
  cholesterol: z.number().min(50).max(500),
});

test("Predictor schema validation with valid data", () => {
  const validData = {
    age: 62,
    gender: 1,
    bmi: 28.4,
    systolic_bp: 130,
    diastolic_bp: 82,
    glucose: 95,
    heart_rate: 72,
    cholesterol: 180,
  };
  
  const result = predictorSchema.safeParse(validData);
  assert.strictEqual(result.success, true);
});

test("Predictor schema catches invalid outlier age", () => {
  const invalidData = {
    age: 150, // Out of clinical bounds
    gender: 1,
    bmi: 28.4,
    systolic_bp: 130,
    diastolic_bp: 82,
    glucose: 95,
    heart_rate: 72,
    cholesterol: 180,
  };
  
  const result = predictorSchema.safeParse(invalidData);
  assert.strictEqual(result.success, false);
  if (!result.success) {
    const ageError = result.error.format().age?._errors[0];
    assert.ok(ageError);
  }
});

test("Predictor schema catches invalid outlier blood pressure", () => {
  const invalidData = {
    age: 55,
    gender: 0,
    bmi: 22.1,
    systolic_bp: 400, // Out of bounds (max 250)
    diastolic_bp: 80,
    glucose: 90,
    heart_rate: 70,
    cholesterol: 170,
  };
  
  const result = predictorSchema.safeParse(invalidData);
  assert.strictEqual(result.success, false);
});
