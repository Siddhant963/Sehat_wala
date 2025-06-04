const mongoose = require('mongoose');
mongoose.SubscriptionSchema = mongoose.Schema({
     name: {
          type: String,
          required: true
     },
     price: {
          type: Number,
          required: true
     },
     duration: {
          type: String,
          required: true
     },
     meals: {
          type: Number,
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
module.exports = mongoose.model('Subscription', mongoose.SubscriptionSchema);
