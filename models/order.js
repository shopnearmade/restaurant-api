import mongoose from 'mongoose'

const orderSchema = mongoose.Schema({
    // references the Customer collection
   customer:{
    type:mongoose.Schema.Types.ObjectId,
    required: [true,"order must be assigned to a customer"]

   },
   // references the MenuItem collection
   menuItem:
    [{ 
        type:mongoose.Schema.Types.ObjectId,
        quantity:Number
    }],
    
    totalAmount:{
        type:Number,
        required: true
    },

    status:
    {
        type: String,
        required: true,  
        enum:{ values:['Pending', 'Preparing', 'Ready', 'Completed', 'Cancelled'] },
        default:'Pending'


    },
    createdAt:
    {
        type:Date,
        default: Date.now
    },
    updatedAt:
    {
        type:Date,
        default: Date.now
    },
    specialInstructions:
    {
        type: String,
        required: false

    }


});
const Order = mongoose.model("Order",orderSchema)
export default Order;