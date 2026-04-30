import mongoose from "mongoose";

const MenuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      minlength: [2, "Name must be at least 2 characters"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
      // custom validator: no more than 2 decimal places
      validate: {
        validator: function (v) {
          return /^\d+(\.\d{1,2})?$/.test(v.toString());
        },
        message: "Price must have at most 2 decimal places",
      },
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: ["Appetizer", "Main Course", "Dessert", "Beverage", "Side Dish"],
        message: "{VALUE} is not a valid category",
      },
    },
    available: {
      type: Boolean,
      default: true,
    },
    ingredients: [{ type: String, trim: true }],
    calories: {
      type: Number,
      min: [0, "Calories cannot be negative"],
    },
    // estimated prep time in minutes
    preparationTime: {
      type: Number,
      min: [1, "Preparation time must be at least 1 minute"],
    },
  },
  { timestamps: true }
);

// virtual: formatted price with dollar sign
MenuItemSchema.virtual("formattedPrice").get(function () {
  return `$${this.price.toFixed(2)}`;
});

export default mongoose.model("MenuItem", MenuItemSchema);
