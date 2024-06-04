# stripe
Testing Stripe payments
Here's a README file that guides users through setting up and testing Stripe payments using the provided HTML and Node.js server setup:

---

# Stripe Payment Testing Setup

This repository contains a simple setup for testing Stripe recurrent payments (subscriptions) using an HTML form and a Node.js backend.

## Prerequisites

- Node.js and npm installed
- A Stripe account with developer access
- Basic knowledge of HTML and JavaScript

## Getting Started

### 1. Set Up Stripe Account

1. Create a Stripe account at [Stripe](https://stripe.com) if you don't have one.
2. Navigate to the Stripe dashboard.
3. Switch to "Test Mode" to avoid real transactions.

### 2. Obtain API Keys

1. Go to **Developers > API keys** in your Stripe dashboard.
2. Copy the "Publishable key" and the "Secret key" for Test Mode.

### 3. Create Products and Prices

1. Go to **Products** in your Stripe dashboard.
2. Add a new product with a recurring price.

### 4. Set Up the Project

#### Clone the Repository

```bash
git clone https://github.com/your-repo/stripe-payment-testing.git
cd stripe-payment-testing
```

#### Install Dependencies

```bash
npm install
```

### 5. Configure Environment Variables

Create a `.env` file in the root directory and add your Stripe API keys:

```env
STRIPE_PUBLISHABLE_KEY=your_test_publishable_key
STRIPE_SECRET_KEY=your_test_secret_key
STRIPE_PRICE_ID=your_test_price_id
```

### 6. Set Up the HTML Form

Create an `index.html` file:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Subscription Payment</title>
    <script src="https://js.stripe.com/v3/"></script>
    <style>
        /* Add some styling */
        .StripeElement {
            box-sizing: border-box;
            height: 40px;
            padding: 10px 12px;
            border: 1px solid transparent;
            border-radius: 4px;
            background-color: white;
            box-shadow: 0 1px 3px 0 #e6ebf1;
            transition: box-shadow 150ms ease;
        }
        .StripeElement--focus {
            box-shadow: 0 1px 3px 0 #cfd7df;
        }
        .StripeElement--invalid {
            border-color: #fa755a;
        }
        .StripeElement--webkit-autofill {
            background-color: #fefde5 !important;
        }
    </style>
</head>
<body>
    <h1>Subscribe to our service</h1>
    <form id="subscription-form">
        <div id="card-element" class="StripeElement"></div>
        <button type="submit">Subscribe</button>
    </form>

    <script>
        document.addEventListener('DOMContentLoaded', async () => {
            const stripe = Stripe('YOUR_PUBLISHABLE_KEY'); // Replace with your Stripe publishable key
            const elements = stripe.elements();
            const card = elements.create('card');
            card.mount('#card-element');

            const form = document.getElementById('subscription-form');
            form.addEventListener('submit', async (event) => {
                event.preventDefault();
                const { setupIntent, error } = await stripe.confirmCardSetup(
                    'CLIENT_SECRET_FROM_BACKEND', // Replace with the client secret returned by your server
                    {
                        payment_method: {
                            card: card,
                        },
                    }
                );

                if (error) {
                    console.error(error);
                } else {
                    console.log('Setup Intent succeeded:', setupIntent);
                    // Send setupIntent.payment_method to your server to create a subscription
                }
            });
        });
    </script>
</body>
</html>
```

### 7. Set Up the Backend Server

Create a `server.js` file:

```javascript
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
```

### 8. Run the Server

```bash
node server.js
```

### 9. Test the Setup

1. Open `index.html` in a web browser.
2. Enter test card details provided by Stripe (e.g., 4242 4242 4242 4242) and submit the form.
3. Verify the subscription is created in your Stripe dashboard under "Customers" and "Subscriptions".

## Notes

- Ensure all sensitive keys are stored securely and not exposed in the frontend.
- Use Stripe's test card numbers for testing transactions.
- This setup is for testing purposes. For production, follow Stripe's security guidelines and best practices.

---

Replace placeholders (e.g., `YOUR_PUBLISHABLE_KEY`, `your_test_publishable_key`) with actual values from your Stripe account and ensure the backend server is properly secured for production use.