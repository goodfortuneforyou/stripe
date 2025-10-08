const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
app.use(express.static('.'));
app.use(express.json());

app.post('/create-subscription', async (req, res) => {
    const { paymentMethodId, customerId } = req.body;

    try {
        // Attach payment method to customer
        await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });

        // Set default payment method on customer
        await stripe.customers.update(customerId, {
            invoice_settings: { default_payment_method: paymentMethodId },
        });

        // Create subscription
        const subscription = await stripe.subscriptions.create({
            customer: customerId,
            items: [{ price: process.env.STRIPE_PRICE_ID }], // Replace with your test price ID
        });

        res.send(subscription);
    } catch (error) {
        res.status(400).send({ error: { message: error.message } });
    }
});

app.listen(3000, () => console.log('Server is running on port 3000'));