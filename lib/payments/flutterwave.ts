import axios from "axios";

const BASE = "https://api.flutterwave.com/v3";

// Unlike Paystack, Flutterwave expects amounts in the major currency unit
// (naira), not kobo - convert at the call site, not in the schema.
export async function initializeFlutterwavePayment(opts: {
  email: string;
  name: string;
  amountKobo: number;
  reference: string;
  callbackUrl: string;
}): Promise<{ authorizationUrl: string }> {
  const res = await axios.post(
    `${BASE}/payments`,
    {
      tx_ref: opts.reference,
      amount: opts.amountKobo / 100,
      currency: "NGN",
      redirect_url: opts.callbackUrl,
      customer: { email: opts.email, name: opts.name },
    },
    { headers: { Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}` } }
  );
  return { authorizationUrl: res.data.data.link };
}

export async function verifyFlutterwaveTransaction(
  transactionId: string
): Promise<{ success: boolean }> {
  const res = await axios.get(
    `${BASE}/transactions/${encodeURIComponent(transactionId)}/verify`,
    { headers: { Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}` } }
  );
  return { success: res.data?.data?.status === "successful" };
}
