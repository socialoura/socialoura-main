/**
 * Example: Test the Stripe Payment Intent API
 * 
 * This file demonstrates how to call the create-payment-intent endpoint
 * from a client-side application.
 * 
 * Usage:
 * 1. Ensure your .env.local file has STRIPE_SECRET_KEY set
 * 2. Run this script in a browser console or create a test page
 */

/**
 * Create a payment intent for a specific amount
 */
async function createPaymentIntent(amount: number, currency: string = 'usd') {
  try {
    const response = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Error:', data.error);
      if (data.details) {
        console.error('Details:', data.details);
      }
      throw new Error(data.error);
    }

    console.log('✅ Payment Intent created successfully!');
    console.log('Client Secret:', data.clientSecret);
    console.log('Payment Intent ID:', data.paymentIntentId);
    
    return data;
  } catch (error) {
    console.error('Failed to create payment intent:', error);
    throw error;
  }
}

/**
 * Test various scenarios
 */
async function runTests() {
  console.log('🧪 Running Stripe API Tests...\n');

  // Test 1: Valid payment intent
  console.log('Test 1: Create valid payment intent ($20.00)');
  try {
    await createPaymentIntent(2000, 'usd');
  } catch (error) {
    console.error('Test 1 failed:', error);
  }
  console.log('\n---\n');

  // Test 2: Different currency
  console.log('Test 2: Create payment intent in EUR (€50.00)');
  try {
    await createPaymentIntent(5000, 'eur');
  } catch (error) {
    console.error('Test 2 failed:', error);
  }
  console.log('\n---\n');

  // Test 3: Missing amount
  console.log('Test 3: Missing amount (should fail)');
  try {
    const response = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currency: 'usd' }),
    });
    const data = await response.json();
    console.log('Response:', data);
  } catch (error) {
    console.error('Test 3 error:', error);
  }
  console.log('\n---\n');

  // Test 4: Invalid amount (negative)
  console.log('Test 4: Negative amount (should fail)');
  try {
    await createPaymentIntent(-100, 'usd');
  } catch {
    console.log('Expected error caught');
  }
  console.log('\n---\n');

  // Test 5: Invalid currency
  console.log('Test 5: Invalid currency format (should fail)');
  try {
    await createPaymentIntent(1000, 'invalid');
  } catch {
    console.log('Expected error caught');
  }
  console.log('\n---\n');

  // Test 6: Wrong HTTP method
  console.log('Test 6: GET request (should fail with 405)');
  try {
    const response = await fetch('/api/create-payment-intent', {
      method: 'GET',
    });
    const data = await response.json();
    console.log('Response:', data);
  } catch (error) {
    console.error('Test 6 error:', error);
  }
  console.log('\n---\n');

  console.log('✅ All tests completed!');
}

/**
 * Example: Common payment amounts
 */
const PAYMENT_EXAMPLES = {
  // Subscription tiers from the pricing pages
  instagram: {
    starter: 2900,      // $29.00
    professional: 7900, // $79.00
    enterprise: 19900,  // $199.00
  },
  tiktok: {
    creator: 3900,      // $39.00
    influencer: 9900,   // $99.00
    brand: 24900,       // $249.00
  },
};

/**
 * Create payment intent for a specific plan
 */
async function createPlanPayment(platform: 'instagram' | 'tiktok', tier: string) {
  const plans = PAYMENT_EXAMPLES[platform];
  const amount = plans[tier as keyof typeof plans];
  
  if (!amount) {
    throw new Error(`Invalid tier: ${tier} for platform: ${platform}`);
  }

  console.log(`Creating payment for ${platform} - ${tier} plan`);
  return createPaymentIntent(amount, 'usd');
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    createPaymentIntent,
    createPlanPayment,
    runTests,
    PAYMENT_EXAMPLES,
  };
}

// Browser console usage examples:
/*

// Create a payment intent for $20.00
createPaymentIntent(2000, 'usd');

// Create a payment intent for Instagram Professional plan
createPlanPayment('instagram', 'professional');

// Run all tests
runTests();

*/
