import 'dotenv/config';

const required = (key, fallback) => {
  const v = process.env[key] ?? fallback;
  if (v === undefined || v === '') {
    throw new Error(`Missing required env var: ${key}`);
  }
  return v;
};

export const env = {
  PORT: parseInt(process.env.PORT || '4000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  CORS_ORIGIN: (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  MONGODB_URI: required('MONGODB_URI', 'mongodb://localhost:27017/foodmood'),
  JWT_SECRET: required('JWT_SECRET', 'dev-only-secret-change-me'),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  OCR_SERVICE_URL: process.env.OCR_SERVICE_URL || 'http://localhost:4100',

  // ML microservice (team-mate's recipe recommender). Optional.
  ML_SERVICE_URL: process.env.ML_SERVICE_URL || '',
  ML_TIMEOUT_MS: parseInt(process.env.ML_TIMEOUT_MS || '5000', 10),

  // Spoonacular external recipe API (free tier, optional).
  SPOONACULAR_API_KEY: process.env.SPOONACULAR_API_KEY || '',
  SPOONACULAR_TIMEOUT_MS: parseInt(process.env.SPOONACULAR_TIMEOUT_MS || '8000', 10),

  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '300', 10),
};
