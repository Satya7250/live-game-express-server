import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      minlength: 2,
      maxlength: 50,
      required: [true, "Name is required"],
    },

    email: {
      type: String,
      trim: true,
      maxlength: 300,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      index: true,
    },

    password: {
      type: String,
      trim: true,
      minlength: 8,
      required: [true, "Password is required"],
      select: false,
    },

    role: {
      type: String,
      enum: ["customer", "seller", "admin"],
      default: "customer",
      required: true,
      index: true,
    },

    phone: {
      type: String,
      trim: true,
      default: null,
    },

    avatar: {
      type: String,
      trim: true,
      default: null,
    },

    address: {
      type: String,
      trim: true,
      maxlength: [100, "Address cannot exceed 100 characters"],
      default: null,
    },

    bio: {
      type: String,
      trim: true,
      maxlength: [100, "Bio cannot exceed 100 characters"],
      default: null,
    },

    isVerified: {
      type: Boolean,
      default: false,
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    verificationToken: {
      type: String,
      default: null,
      select: false,
    },

    refreshToken: {
      type: String,
      default: null,
      select: false,
    },

    resetPasswordToken: {
      type: String,
      default: null,
      select: false,
    },

    resetPasswordTokenExpiry: {
      type: Date,
      default: null,
      select: false,
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (clearTextPassword) {
  return bcrypt.compare(clearTextPassword, this.password);
};

export default mongoose.model("User", userSchema);
