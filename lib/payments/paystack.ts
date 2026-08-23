import axios from "axios";

const BASE = "https://api.paystack.co";

// Paystack expects amounts in kobo for NGN - matches our schema directly.
export async function initializePaystackTransaction(opts: {
  email: string;
  amountKobo: number;
  reference: string;
  callbackUrl: string;
}): Promise<{ authorizationUrl: string }> {
  const res = await axios.post(
    `${BASE}/transaction/initialize`,
    {
      email: opts.email,
      amount: opts.amountKobo,
      reference: opts.reference,
      callback_url: opts.callbackUrl,
    },
    { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } }
  );
  return { authorizationUrl: res.data.data.authorization_url };
}

export async function verifyPaystackTransaction(
  reference: string
): Promise<{ success: boolean }> {
  const res = await axios.get(`${BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
  });
  return { success: res.data?.data?.status === "success" };
}
