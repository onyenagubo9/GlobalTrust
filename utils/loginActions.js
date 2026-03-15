"use client";

import { auth, db } from "@/lib/firebaseClient";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

/**
 * 🚨 SENDS LOGIN ALERT EMAIL (Updated Template)
 */
async function sendLoginEmail(email) {
  try {
    const loginTime = new Date().toLocaleString();

    await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: email,
        subject: "🔐 Login Alert GlobalTrust Bank",
        html: `
          <div style="background-color:#f6f8fb;padding:40px 0;font-family:Arial,Helvetica,sans-serif;">
            <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:10px;overflow:hidden;
              box-shadow:0 4px 8px rgba(0,0,0,0.05);">

              <div style="background:#0b8f60;color:#fff;text-align:center;padding:25px 0;">
                <h1 style="margin:0;font-size:22px;">Login Alert - FirstCBU Bank</h1>
              </div>

              <div style="padding:30px;">
                <p style="font-size:16px;color:#333;">Hello,</p>

                <p style="font-size:15px;color:#555;line-height:1.6;">
                  A login was detected on your <b>GlobalTrust Bank</b> account using:
                  <br><b>${email}</b>
                </p>

                <table style="width:100%;margin-top:15px;border-collapse:collapse;">
                  <tr>
                    <td style="padding:8px 0;color:#555;"><b>Login Time:</b></td>
                    <td style="padding:8px 0;">${loginTime}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;color:#555;"><b>IP Address:</b></td>
                    <td style="padding:8px 0;">Auto-detected</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;color:#555;"><b>Device:</b></td>
                    <td style="padding:8px 0;">Web Browser</td>
                  </tr>
                </table>

                <p style="margin-top:25px;font-size:15px;color:#555;line-height:1.6;">
                  If this login was <b>NOT YOU</b>, please reset your password immediately.
                </p>

                <a href="https://firstcbu.app/reset-password"
                  style="display:inline-block;margin-top:20px;background:#e53e3e;color:#fff;padding:12px 30px;
                  border-radius:6px;text-decoration:none;font-weight:bold;">
                  Secure My Account
                </a>

                <p style="margin-top:30px;color:#999;font-size:13px;">
                  This email was sent automatically for your security.
                </p>
              </div>

              <div style="background:#f1f1f1;text-align:center;padding:15px;color:#666;font-size:13px;">
                © ${new Date().getFullYear()} GlobalTrust Bank. All rights reserved.
              </div>
            </div>
          </div>
        `,
      }),
    });
  } catch (err) {
    console.error("❌ Email send error:", err);
  }
}

/**
 * 🚀 SECURE LOGIN FUNCTION WITH ACCOUNT STATUS CHECK
 */
export async function loginUser({ email, password }) {
  try {
    // 1️⃣ Login with Firebase Auth
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    const user = userCred.user;

    // 2️⃣ Fetch user info from Firestore
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      await signOut(auth);
      return { success: false, message: "Account data not found." };
    }

    const userData = snap.data();

    // 3️⃣ BLOCK SUSPENDED USERS
    if (userData.accountStatus === "Suspended") {
      await signOut(auth);
      return {
        success: false,
        message: "Your account has been suspended. Contact support.",
      };
    }

    // 4️⃣ BLOCK CLOSED ACCOUNTS
    if (userData.accountStatus === "Closed") {
      await signOut(auth);
      return {
        success: false,
        message: "Your account has been closed.",
      };
    }

    // 5️⃣ Send login alert email (ACTIVE ACCOUNTS ONLY)
    await sendLoginEmail(email);

    return {
      success: true,
      message: "Login successful.",
      user,
    };
  } catch (error) {
    console.error("Login Error:", error.code, error.message);

    let errorMessage = "Something went wrong.";

    switch (error.code) {
      case "auth/user-not-found":
        errorMessage = "User not found.";
        break;
      case "auth/wrong-password":
        errorMessage = "Incorrect password.";
        break;
      case "auth/invalid-email":
        errorMessage = "Invalid email format.";
        break;
      case "auth/too-many-requests":
        errorMessage = "Too many login attempts. Try again later.";
        break;
      case "auth/network-request-failed":
        errorMessage = "Check your internet connection.";
        break;
      default:
        errorMessage = error.message;
    }

    return { success: false, message: errorMessage };
  }
}
