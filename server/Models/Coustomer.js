const mongoose = require('mongoose');
mongoose.CoustomerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    contact: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    subscription: {
        type: String,
        required: true,
        default: null
    },
    subscription_start_date: {
        type: Date,
        default: Date.now
    },
     subscription_end_date: {
          type: Date,
          required: true
     },
     meals:{ 
            type: Number,
            required: true
     } , 
     meals_timeing:{ 
            type: Array,
            required: true
     },
    payment:{ 
        type: String,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});
module.exports = mongoose.model('Customer', mongoose.CoustomerSchema);