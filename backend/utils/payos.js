import { PayOS } from "@payos/node";
import dotenv from "dotenv";
dotenv.config();

export const payos = new PayOS({
  clientId: process.env.PAYOS_CLIENT_ID,
  apiKey: process.env.PAYOS_API_KEY,
  checksumKey: process.env.PAYOS_CHECKSUM_KEY,
  
});

(async () => {
  try {
    const webhookUrl = "https://unproportional-angelica-photometrically.ngrok-free.dev/payment/payos/webhook";
    const response = await payos.webhooks.confirm(webhookUrl);
    console.log("PayOS webhook confirmed:", response);
    console.log("INIT PAYOS KEY:", process.env.PAYOS_CHECKSUM_KEY);
  } catch (err) {
    console.error("Error confirming PayOS webhook:", err.message);
  }
})();
