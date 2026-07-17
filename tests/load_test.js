import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 100 },  // Ramp up to 100 VUs
    { duration: '1m', target: 500 },   // Ramp up to 500 VUs
    { duration: '1m', target: 1000 },  // Ramp up to 1000 VUs
    { duration: '30s', target: 0 },    // Cooldown to 0 VUs
  ],
  thresholds: {
    http_req_duration: ['p(95)<200'], // 95% of requests must complete below 200ms
    http_req_failed: ['rate<0.01'],    // Error rate must be less than 1%
  },
};

const BASE_URL = __ENV.TARGET_URL || 'http://localhost';

export default function () {
  // 1. Ping Health endpoint
  const healthRes = http.get(`${BASE_URL}/health`);
  check(healthRes, {
    'health status is 200': (r) => r.status === 200,
  });

  sleep(0.5);

  // 2. Perform Mock Login submit (simulated payload credentials)
  const loginPayload = {
    username: 'doctor@hospital.org',
    password: 'secure_password_123',
  };
  
  const loginRes = http.post(
    `${BASE_URL}/api/v1/auth/login`,
    loginPayload,
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  
  check(loginRes, {
    'login status is 200 or 401': (r) => r.status === 200 || r.status === 401,
  });

  sleep(1);

  // 3. Perform prediction request (simulated mock inference inputs)
  const predictorPayload = JSON.stringify({
    age: 65,
    gender: 1,
    bmi: 27.5,
    systolic_bp: 135,
    diastolic_bp: 85,
    glucose: 98,
    heart_rate: 74,
    cholesterol: 190,
    admission_frequency: 1,
    medication_count: 2,
    hypertension: 1,
    diabetes: 0,
    smoking: 1,
    previous_cardiac: 0,
    statin_history: 0,
    beta_blocker_history: 1,
    ace_arb_history: 0,
    aspirin_history: 1,
  });

  const predictRes = http.post(
    `${BASE_URL}/api/v1/predict`,
    predictorPayload,
    { headers: { 'Content-Type': 'application/json' } }
  );

  check(predictRes, {
    'predict status is 200, 401 or 422': (r) => r.status === 200 || r.status === 401 || r.status === 422,
  });

  sleep(1);
}
