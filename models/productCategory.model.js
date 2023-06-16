const mongoose = require("mongoose"); // Erase if already required
// const mongoosePaginate = require("mongoose-paginate-v2");
// Declare the Schema of the Mongo model
var productCategorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// productCategorySchema.plugin(mongoosePaginate);

//Export the model
module.exports = mongoose.model("ProductCategory", productCategorySchema);
