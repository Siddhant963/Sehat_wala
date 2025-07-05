const Usermodel = require('../Models/Usermodel');
const Subscriptionmodel = require('../Models/Subscription');
const Coustomermodel = require('../Models/Coustomer')
const Deliverymodel = require('../Models/delivery');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParsar = require('cookie-parser');
require('dotenv').config();

module.exports.login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }
    try {
        const user = await Usermodel.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'Strict' });
        return res.status(200).json({ message: "Login successful", token });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

module.exports.getAllDeliveries =  async (req, res) => {
        try {
            const delivery = await Deliverymodel.find();
            res.status(200).json(delivery);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    };

    module.exports.getDeliveriesById = async(req,res) => {
        const { delivery_person_id, customer_id, delivery_date, status } = req.body;
        if(!delivery_person_id && !customer_id && !delivery_date &&!status){
             return res.status(400).json({message: "At least one filter is required"});
        }
        const filter = {};
        if(delivery_person_id){
             filter.delivery_person_id = delivery_person_id;
        }
        if(customer_id){
             filter.customer_id = customer_id;
        }
        if(delivery_date){
             filter.delivery_date = delivery_date;
        }
        if(status){
             filter.status = status;
        }
    
        
        try {
             const deliveries = await Deliverymodel.find(filter);
             if(deliveries.length === 0){
                  return res.status(404).json({message: "No deliveries found"});
             }
             return res.status(200).json({message: "Deliveries fetched successfully", data: deliveries});
        } catch (error) {
             return res.status(500).json({message: "Internal server error"});
        }
   };

module.exports.markDeliveryAsComplete = async (req, res) => {
    const { deliveryId } = req.params;
    if (!deliveryId) {
        return res.status(400).json({ message: "Delivery ID is required" });
    }
    try {
        const delivery = await Deliverymodel.findByIdAndUpdate(deliveryId, { status: 'completed' }, { new: true });
        if (!delivery) {
            return res.status(404).json({ message: "Delivery not found" });
        }
        return res.status(200).json({ message: "Delivery marked as completed", delivery });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

module.exports.getUserOrder = async (req, res) => {
    const { email } = req.query;
    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    try {
        const user = await Usermodel.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // Get today's date in YYYY-MM-DD format (assuming delivery_date is stored as string)
        const today = new Date().toISOString().split('T')[0]; 


        let orders = await Deliverymodel.find({ delivery_person_id: user._id , delivery_date: today  , status:  'assigned'  });

        if (orders.length === 0) {
            return res.status(404).json({ message: "No orders found for this user" });
        }

        const customerIds = orders.map(order => order.customer_id);
        const customers = await Coustomermodel.find({ _id: { $in: customerIds } });

        if (customers.length === 0) {
            return res.status(404).json({ message: "Customers not found" });
        }

        // Create a map of customer_id to customer name
        const customerMap = {};
        customers.forEach(customer => {
            customerMap[customer._id.toString()] = 
            {
            name :customer.name ,
            address: customer.address ,
            contact : customer.contact
        };
        });


        // Attach customer_name to each order
        const enrichedOrders = orders.map(order => ({
            ...order.toObject(),
            customer_name: customerMap[order.customer_id.toString()] || "Unknown Customer",
          

        }));

        return res.status(200).json({ message: "Orders fetched successfully", data: enrichedOrders });
    } catch (error) {
        console.error("Error fetching user orders:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

module.exports.updateDelivery = async (req, res) => {
    const { delivery_id, customer_id, status } = req.query;

    if (!delivery_id || !customer_id || !status) {
        return res.status(400).json({ message: "delivery_id, customer_id, and status are required" });
    }

    try {
        const delivery = await Deliverymodel.findById(delivery_id);
        if (!delivery) {
            return res.status(404).json({ message: "Delivery not found" });
        }

        const previousStatus = delivery.status;
        delivery.status = status;
        await delivery.save();

        // If status changed to "delivered" and wasn't already "delivered", decrement meal count
        if (status.toLowerCase() === "delivered" && previousStatus.toLowerCase() !== "delivered") {
            const customer = await Coustomermodel.findById(customer_id);

            if (!customer) {
                return res.status(404).json({ message: "Customer not found" });
            }

            console.log("Customer found:", customer);

            if (customer.meals > 0) {
                console.log("Meals left in customer:", customer.meals);

                customer.meals = customer.meals - 1;
                console.log("Meals left in subscription after decrement:", customer.meals);

                // Ensure payment field exists (optional safety)
                if (typeof customer.payment === 'undefined') {
                    customer.payment = 0;
                }

                await customer.save(); // Or use: await customer.save({ validateBeforeSave: false });

            } else {
                return res.status(400).json({ message: "No meals left in subscription" });
            }

        }

        return res.status(200).json({ message: "Delivery status updated successfully" });

    } catch (error) {
        console.error("Error updating delivery status:", error);
        return res.status(500).json({ message: "Server error" });
    }
};


