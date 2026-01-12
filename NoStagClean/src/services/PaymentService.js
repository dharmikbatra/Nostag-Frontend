import RazorpayCheckout from 'react-native-razorpay';
import axios from 'axios';
import { API_BASE_URL, RAZORPAY_KEY_ID } from '../constants/config';

/**
 * Orchestrates the payment flow
 * @param {number} amountInRupees - Amount to add
 * @param {string} token - Auth Token
 * @param {object} userInfo - { email, phone, name } for prefilling Razorpay
 */
export const handlePayment = async (amountInRupees, token, userInfo = {}) => {
  try {
    console.log(`[PaymentService] 1. Creating Order for ₹${amountInRupees}...`);
    
    // 1. Create Order
    const orderResponse = await axios.post(
      `${API_BASE_URL}/payments/create-order`,
      { amount: amountInRupees }, 
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // Backend returns order_id and amount (in paise)
    const { id: order_id, amount: order_amount } = orderResponse.data;
    
    console.log("[PaymentService] Order Created:", order_id);

    // 2. Open Razorpay (Use userInfo passed from Frontend)
    const options = {
      description: 'Wallet Top-up',
      image: 'https://drive.google.com/file/d/1qZhj2FUdhIbg0k-B4WgCCDKah6rQce8x/view?usp=sharing', // Ensure this is a direct link (png/jpg), drive links often fail in SDKs
      currency: 'INR',
      key: RAZORPAY_KEY_ID,
      amount: order_amount, // Amount in paise from backend
      name: 'NoStag',
      order_id: order_id,
      prefill: {
        email: userInfo.email || 'user@nostag.com',
        contact: userInfo.phone || '', 
        name: userInfo.name || 'NoStag User'
      },
      theme: { color: '#53a20e' }
    };

    const checkoutData = await RazorpayCheckout.open(options);
    
    // 3. Verify Payment
    console.log("[PaymentService] 3. Verifying with Backend...");
    
    const verifyResponse = await axios.post(
      `${API_BASE_URL}/payments/verify`,
      {
        razorpay_order_id: checkoutData.razorpay_order_id,
        razorpay_payment_id: checkoutData.razorpay_payment_id,
        razorpay_signature: checkoutData.razorpay_signature,
        amount: amountInRupees
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log("[PaymentService] Verified:", verifyResponse.data);
    return verifyResponse.data; 

  } catch (error) {
    if (error.code && error.description) {
        throw { isCancel: true, message: "Payment cancelled by user" };
    }
    
    console.error("Payment Service Error:", error);
    const errorMessage = error.response?.data?.message || "Payment failed";
    throw { isCancel: false, message: errorMessage };
  }
};