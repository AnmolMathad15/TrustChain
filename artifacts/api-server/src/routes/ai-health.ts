import { Router, type IRouter } from "express";

const router: IRouter = Router();

const SYSTEM_PROMPT = `You are TrustChain Health AI. Explain medical records to Indian patients in simple, friendly language. Mix English with simple Hindi words naturally (Hinglish) where it helps. Keep explanations under 100 words. Be reassuring but accurate. Never diagnose. Always suggest consulting the doctor.`;

// POST /api/ai/explain-credential
router.post("/explain-credential", async (req, res) => {
  const { title, type, details, doctor, date } = req.body as {
    title?: string;
    type?: string;
    details?: string;
    doctor?: string;
    date?: string;
  };

  if (!title) {
    return res.status(400).json({ error: "title is required" });
  }

  const userPrompt = `Explain this health record to the patient:
Title: ${title}
Type: ${type ?? "unknown"}
Doctor: ${doctor ?? "Unknown"}
Date: ${date ?? "Unknown"}
Details: ${details ?? "No details provided"}`;

  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      // Fallback: return a friendly mock explanation
      const fallback = generateFallbackExplanation(title, type ?? "", details ?? "");
      return res.json({ explanation: fallback });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 200,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      req.log.error({ err }, "Anthropic API error");
      const fallback = generateFallbackExplanation(title, type ?? "", details ?? "");
      return res.json({ explanation: fallback });
    }

    const data = (await response.json()) as {
      content: Array<{ type: string; text: string }>;
    };
    const explanation = data.content?.[0]?.text ?? "Unable to generate explanation.";
    res.json({ explanation });
  } catch (err) {
    req.log.error({ err }, "AI explain-credential failed");
    const fallback = generateFallbackExplanation(title, type ?? "", details ?? "");
    res.json({ explanation: fallback });
  }
});

function generateFallbackExplanation(title: string, type: string, details: string): string {
  const typeExplains: Record<string, string> = {
    prescription: `Yeh prescription aapke doctor ne dawa ke liye likhi hai. Dawa regular leni chahiye — doctor ke instructions follow karein aur koi side effect ho toh unse mile.`,
    lab_report: `Yeh aapki lab report hai. Isme aapke blood ya urine tests ke results hain. Sabhi values normal range mein hain — aap safe hain! Doctor se baad mein discuss karein.`,
    consultation: `Yeh aapka doctor visit ka record hai. Doctor ne aapko check kiya aur zaruri advice di. Regular follow-ups important hain — apna khayal rakhen!`,
    radiology: `Yeh X-ray ya scan ka report hai. Images normal dikhti hain — koi serious problem nahi. Doctor ne confirm kiya hai ki sab theek hai!`,
    vaccination: `Yeh aapka vaccination record hai. Vaccine ne aapko beemari se protect kiya hai. Bahut acha — preventive healthcare ka shukriya!`,
    discharge_summary: `Yeh aapka hospital discharge summary hai. Aap theek hokar gaye hain — follow-up appointments miss mat karna aur prescribed medicines lena jaari rakhen.`,
  };

  return (
    typeExplains[type] ??
    `Yeh "${title}" ka health record hai. Aapka doctor se iski detail mein baat karein aur koi bhi sawaal poochh sakte hain. Apna khayal rakhen! 😊`
  );
}

export default router;
