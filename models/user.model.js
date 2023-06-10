const { genSaltSync, hashSync, compareSync } = require("bcrypt");
const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    mobile: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "user",
    },
    cart: {
      type: Array,
      default: [],
    },
    address: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Address",
      },
    ],
    wishlist: [{ type: mongoose.Types.ObjectId, ref: "Product" }],
    isBlock: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
    },
    passwordChangeAt: {
      type: String,
    },
    passwordResetToken: {
      type: String,
    },
    passwordResetExpires: {
      type: String,
    },
  },
  { timestamps: true }
);

// Hash password before into DB (only work with create, save method)
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const salt = genSaltSync(10);
    this.password = hashSync(this.password, salt);
  }
});

userSchema.methods = {
  isCorrectPassword: function (password) {
    return compareSync(password, this.password);
  },
};

//Export the model
module.exports = mongoose.model("User", userSchema);
