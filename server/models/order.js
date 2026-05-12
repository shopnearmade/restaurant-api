import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    // references the Customer collection
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Order must be assigned to a customer'],
    },
    // references the MenuItem collection (array — one order can have many items)
    menuItem: [
      {
        item: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'MenuItem',
          required: [true, 'Each order line must reference a menu item'],
        },
        quantity: {
          type: Number,
          min: [1, 'Quantity must be at least 1'],
          default: 1,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative'],
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ['Pending', 'Preparing', 'Ready', 'Completed', 'Cancelled'],
        message: '{VALUE} is not a valid status',
      },
      default: 'Pending',
    },
    specialInstructions: {
      type: String,
    },
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);
export default Order;
