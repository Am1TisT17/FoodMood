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
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
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
    createdAt: this.createdAt,
  };
};

export default mongoose.model('User', UserSchema);
