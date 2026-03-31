"use client"; // ✅ must run on the client

import { db, auth } from "@/lib/firebaseClient";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";

/**
 * ✅ Sends a beautiful welcome email after signup
 */
async function sendWelcomeEmail(userData, accountNumber) {
  try {
    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: userData.email,
        subject: "🎉 Welcome to FirstCBU Bank",
        html: `
          <div style="background-color:#f6f8fb;padding:40px 0;font-family:Arial,Helvetica,sans-serif;">
            <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:10px;
              overflow:hidden;box-shadow:0 4px 8px rgba(0,0,0,0.05);">
              
              <div style="background:#0b8f60;color:#fff;text-align:center;padding:25px 0;">
                <h1 style="margin:0;font-size:24px;">Welcome to FirstCBU Bank 🎉</h1>
              </div>
              
              <div style="padding:30px;">
                <p style="font-size:16px;color:#333;">
                  Hi <b>${userData.name}</b>,
                </p>

                <p style="font-size:15px;color:#555;line-height:1.6;">
                  We're excited to have you join <b>FirstCBU Bank</b>! Your new account has been successfully created.
                </p>

                <table style="width:100%;margin-top:20px;border-collapse:collapse;">
                  <tr><td style="padding:8px 0;color:#555;"><b>Account Number:</b></td><td>${accountNumber}</td></tr>
                  <tr><td style="padding:8px 0;color:#555;"><b>Account Type:</b></td><td>${userData.accountType}</td></tr>
                  <tr><td style="padding:8px 0;color:#555;"><b>Country:</b></td><td>${userData.country}</td></tr>
                  <tr><td style="padding:8px 0;color:#555;"><b>Currency:</b></td><td>USD</td></tr>
                  <tr><td style="padding:8px 0;color:#555;"><b>Status:</b></td><td style="color:green;">Active</td></tr>
                </table>

                <p style="margin-top:25px;font-size:15px;color:#555;">
                  You can now log in anytime to view your balance, transfer funds, and manage your account securely.
                </p>

                <a href="https://honstinger.app/login"
                  style="display:inline-block;margin-top:20px;background:#0b8f60;color:#fff;
                  padding:12px 30px;border-radius:6px;text-decoration:none;font-weight:bold;">
                  Log in to Your Account
                </a>

                <p style="margin-top:30px;color:#999;font-size:13px;">
                  If you did not create this account, please contact our support team immediately.
                </p>
              </div>

              <div style="background:#f1f1f1;text-align:center;padding:15px;color:#666;font-size:13px;">
                © ${new Date().getFullYear()} FirstCBU Bank. All rights reserved.
              </div>
            </div>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("❌ Email API failed:", error);
    } else {
      console.log("✅ Welcome email sent successfully!");
    }
  } catch (err) {
    console.error("❌ Email send failed:", err);
  }
}

/**
 * ✅ Main signup handler (now saves by UID)
 */
export async function registerUser(formData) {
  const {
    name,
    email,
    password,
    phone,
    dob,
    address,
    country,
    accountType,
  } = formData;

  try {
    // 1️⃣ Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 2️⃣ Generate random account number
    const accountNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();

    // 3️⃣ Create user object
    const userDetails = {
      name,
      email,
      phone,
      dob,
      address,
      country,
      accountType,
      accountNumber,

      // 🌍 Default currency
      currency: "USD",

      // 💱 NEW: Multi-currency balances
      balances: {
        USD: 0,
        EUR: 0,
        MYR: 0,
        PHP: 0,
        JPY: 0,
        THB: 0,
      },

      status: "Active",
      avatar: "",
      createdAt: serverTimestamp(),
    };

    // 4️⃣ Save user to Firestore
    await setDoc(doc(db, "users", user.uid), userDetails);

    // 5️⃣ Send welcome email
    await sendWelcomeEmail(userDetails, accountNumber);

    console.log("✅ User registered successfully!");
    return { success: true, message: "Account created successfully!", user };

  } catch (error) {
    console.error("❌ Registration error:", error);
    return { success: false, message: error.message };
  }
}
