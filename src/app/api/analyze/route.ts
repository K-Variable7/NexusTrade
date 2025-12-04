import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { address, transactions } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    // Construct a prompt for OpenAI to analyze the blockchain data
    const prompt = `
      Analyze the following blockchain activity for address ${address} and recent network transactions.
      Act as an expert blockchain analyst (like Nansen or Arkham Intelligence).
      
      Provide a JSON response with the following structure:
      {
        "whaleMovements": [
          { "hash": "0x...", "fromAddress": "0x...", "toAddress": "0x...", "amount": "150.5", "token": "ETH", "type": "accumulation" | "dump" | "transfer", "usdValue": 450000, "analysis": "Brief explanation" }
        ],
        "advancedPatterns": [
          { "patternType": "arbitrage" | "wash_trading" | "front_running" | "sandwich_attack" | "flash_loan" | "yield_farming", "confidenceScore": 0.95, "severity": "high", "description": "Detailed description", "estimatedLoss": 0 }
        ],
        "riskAssessment": {
          "overallRiskScore": 85, // 0-100, higher is riskier
          "riskFactors": [
            { "factor": "Smart Contract Audit", "riskLevel": "low" | "medium" | "high" | "critical", "details": "Contract is verified but not audited" }
          ],
          "safetyRecommendations": [
            "Revoke infinite approvals",
            "Use hardware wallet"
          ]
        }
      }

      Context:
      - The user is on the Tenderly Virtual Testnet.
      - If real transaction data is sparse, generate REALISTIC SIMULATED data that demonstrates advanced pattern recognition capabilities (e.g., simulate a flash loan or a whale accumulation pattern).
      - Make the analysis sound professional and actionable.
    `;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "system", content: "You are an advanced blockchain analytics AI." }, { role: "user", content: prompt }],
      model: "gpt-4o",
      response_format: { type: "json_object" },
    });

    const analysis = JSON.parse(completion.choices[0].message.content || '{}');

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('OpenAI analysis error:', error);
    return NextResponse.json({ error: 'Failed to analyze data' }, { status: 500 });
  }
}
