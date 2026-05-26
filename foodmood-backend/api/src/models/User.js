import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    // Hash is optional because Google-OAuth users never set a local password.
    passwordHash: { type: String },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },

    // Email verification — set when the user clicks the link sent on registration.
    emailVerified: { type: Boolean, default: false },
    emailVerifyToken: { type: String, index: true, sparse: true },
    emailVerifyExpiresAt: { type: Date },

    // Google OAuth — set when the user signs in with their Google account.
    // Unique+sparse so two users can't share the same Google identity but
    // legacy email/password users without googleId still slot into the index.
    googleId: { type: String, unique: true, sparse: true, index: true },
    avatarUrl: { type: String },
    // Aligned with frontend UserStats interface
    stats: {
      foodSavedKg: { type: Number, default: 0 },
      co2Offset: { type: Number, default: 0 },
      moneySaved: { type: Number, default: 0 },
      wasteWarriorLevel: { type: Number, default: 1 },
    },
  },
  { timestamps: true }
);

UserSchema.methods.toPublicJSON = function () {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    role: this.role,
    stats: this.stats,
    emailVerified: this.emailVerified,
    avatarUrl: this.avatarUrl,
    createdAt: this.createdAt,
  };
};

export default mongoose.model('User', UserSchema);
