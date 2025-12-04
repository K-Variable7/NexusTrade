'use client';

import { useState } from 'react';
import OpenAI from 'openai';
import { FiZap } from 'react-icons/fi';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // For demo purposes
});

export default function AIInsights() {
  const [insights, setInsights] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const generateInsights = async () => {
    setLoading(true);
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert cryptocurrency trading analyst. Provide concise, actionable insights for ETH trading based on current market conditions.'
          },
          {
            role: 'user',
            content: 'Generate trading insights for Ethereum, including risk assessment, potential strategies, and market analysis.'
          }
        ],
        max_tokens: 300,
      });

      setInsights(completion.choices[0].message.content || 'No insights generated.');
    } catch (error) {
      console.error('Error generating insights:', error);
      setInsights('Error: Unable to generate insights. Please check your OpenAI API key.');
    }
    setLoading(false);
  };

  return (
    <div className="bg-white/5 backdrop-blur-md p-6 rounded-xl border border-white/10 shadow-lg hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:border-white/20 group">
      <div className="flex items-center mb-4">
        <FiZap className="text-cyan-400 text-3xl mr-3 group-hover:text-cyan-300 transition-colors duration-300" />
        <h2 className="text-xl font-medium text-white group-hover:text-cyan-100 transition-colors duration-300">AI Insights</h2>
      </div>
      <p className="text-gray-300 mb-4 text-sm leading-relaxed group-hover:text-gray-200 transition-colors duration-300">
        Get AI-powered analysis of market trends and strategies.
      </p>
      <button
        onClick={generateInsights}
        disabled={loading}
        className="bg-cyan-600/80 text-white px-4 py-2 rounded-lg hover:bg-cyan-500 transition-all duration-300 text-sm font-medium disabled:opacity-50 mb-4 shadow-lg hover:shadow-cyan-500/25"
      >
        {loading ? 'Generating...' : 'Generate Insights'}
      </button>
      {insights && (
        <div className="bg-slate-900/80 p-4 rounded-lg border border-cyan-400/30">
          <h3 className="text-sm font-medium mb-2 text-cyan-400">AI Analysis:</h3>
          <p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">{insights}</p>
        </div>
      )}
    </div>
  );
}