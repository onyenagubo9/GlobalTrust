// Generate a random 10-digit account number with a prefix
export function generateAccountNumber() {
  const prefix = "40"; // You can change this to your bank code
  const randomDigits = Math.floor(100000000 + Math.random() * 900000000);
  return `${prefix}${randomDigits}`;
}

// (Optional) Example for sending welcome emails later
export async function sendWelcomeEmail(email, name) {
  const res = await fetch("/api/send-welcome-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, name }),
  });
  return res.ok;
}
