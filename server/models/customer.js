import mongoose from "mongoose";
 
const CustomerSchema = new mongoose.Schema({
  name: { type: String, required: [true, "Name is required"], minlength: 2 },
  email: { type: String, required: [true, "Email is required"], unique: true },
  phone: { type: String },
  address: { type: String }
}, { timestamps: true });
 
// virtual property - full contact label
CustomerSchema.virtual("displayName").get(function () {
  return `${this.name} (${this.email})`;
});
 
export default mongoose.model("Customer", CustomerSchema);
 