// backend/src/config/env.validation.ts
import * as Joi from 'joi';

/**
 * Validates process.env at boot. Fails fast with one clear error instead
 * of the app starting and failing mysteriously later — e.g. JwtStrategy's
 * constructor throwing on an undefined JWT_SECRET, or Brevo silently
 * no-op'ing every email because BREVO_API_KEY was never set.
 */
export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  PORT: Joi.number().default(4000),

  DATABASE_URL: Joi.string().uri().required(),

  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default('1d'),

  // Email (Brevo). API key is optional at the schema level — BrevoService
  // already degrades gracefully (logs + returns false) if it's unset — but
  // every other email-related value has a safe default.
  BREVO_API_KEY: Joi.string().allow('').optional(),
  BREVO_SENDER_EMAIL: Joi.string().email().default('hello@elorgeschools.com'),
  BREVO_SENDER_NAME: Joi.string().default('Elorge Schools'),
  FRONTEND_RESET_PASSWORD_URL: Joi.string().uri().default('https://app.elorgeschools.com/reset-password'),

  // Wallet
  DEFAULT_PRICE_PER_STUDENT_KOBO: Joi.number().integer().min(0).default(20_000),
  WELCOME_BONUS_KOBO: Joi.number().integer().min(0).default(10_000_000),
  LOW_BALANCE_WARNING_THRESHOLD_KOBO: Joi.number().integer().min(0).default(500_000),

  // PIN lookup rate limiting
  MAX_PIN_LOOKUP_ATTEMPTS: Joi.number().integer().min(1).default(5),

// Payment gateways — optional for now. No webhook controller consumes
  // these yet (see note below); required once that module ships.
  PAYSTACK_SECRET_KEY: Joi.string().allow('').optional(),
  PAYSTACK_WEBHOOK_SECRET: Joi.string().allow('').optional(),
  FLUTTERWAVE_SECRET_KEY: Joi.string().allow('').optional(),
  FLUTTERWAVE_WEBHOOK_SECRET: Joi.string().allow('').optional(),

  // Ready to go live delete the above use the below
  // Payment gateways — required now that PaymentsModule consumes them.
  // PAYSTACK_SECRET_KEY: Joi.string().required(),
  // PAYSTACK_WEBHOOK_SECRET: Joi.string().required(),
  // FLUTTERWAVE_SECRET_KEY: Joi.string().required(),
  // FLUTTERWAVE_WEBHOOK_SECRET: Joi.string().required(),
  
  BANK_TRANSFER_SLA_HOURS: Joi.number().integer().min(1).default(24),

  PERFORMANCE_STRENGTH_THRESHOLD: Joi.number().integer().min(0).max(100).default(70),
  PERFORMANCE_AT_RISK_THRESHOLD: Joi.number().integer().min(0).max(100).default(50),

  ATTENDANCE_MAX_BACKDATE_HOURS: Joi.number().integer().min(1).default(72),
  ATTENDANCE_MAX_FUTURE_MINUTES: Joi.number().integer().min(0).default(5),

  CLOUDINARY_CLOUD_NAME: Joi.string().required(),
  CLOUDINARY_API_KEY: Joi.string().required(),
  CLOUDINARY_API_SECRET: Joi.string().required(),
});