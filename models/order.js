import mongoose from 'mongoose'

const orderSchema = mongoose.Schema({
    // references the Customer collection
   customer:{
    type:mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true,"order must be assigned to a customer"]

   },
   // references the MenuItem collection
   menuItem:
    [{ 
       item:{ type:mongoose.Schema.Types.ObjectId,
        ref: 'MenuItem',
        required:[true] },
        quantity:Number,
    }],
    
    totalAmount:{
        type:Number,
        required: true,
        min:0
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