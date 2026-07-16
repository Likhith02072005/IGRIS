'use client';

import React, { useState } from 'react';
import { 
  Bot, Send, Sparkles, Code2, AlertTriangle, PlayCircle, BarChart3, ShieldCheck, User, RefreshCw
} from 'lucide-react';

interface Message {
  sender: 'AI' | 'USER';
  text: string;
  code?: string;
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'AI',
      text: 'Igris AI Assistant initialized. Equipped with Market Regime Detectors, Strategy Optimizer, and Risk Advisors. How can I assist your quantitative terminal session?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input;
    setMessages(prev => [...prev, { sender: 'USER', text: userText }]);
    setInput('');
    setLoading(true);

    try {
      // Direct mock response matching advanced quant logic.
      // In production, this targets /api/ai/chat or groq-compound server.
      setTimeout(() => {
        let aiText = '';
        let codeSnippet = undefined;

        const textClean = userText.toLowerCase();
        if (textClean.includes('vwap') || textClean.includes('strategy')) {
          aiText = 'Here is the compiled Python code implementation for a VWAP Reversal Strategy, utilizing Bollinger upper/lower band offsets to trigger mean reversion.';
          codeSnippet = `import pandas as pd\nfrom strategies.base import BaseStrategy\n\nclass VWAPReversal(BaseStrategy):\n    def on_candle(self, df: pd.DataFrame):\n        latest = df.iloc[-1]\n        # Sell at upper band offset, Buy at lower band offset\n        if latest["close"] >= latest["vwap"] + 20:\n            return "SELL", "Overextended above VWAP. Initiating fade."\n        if latest["close"] <= latest["vwap"] - 20:\n            return "BUY", "Overextended below VWAP. Initiating mean reversion."\n        return None, "Hold positions."`;
        } else if (textClean.includes('regime') || textClean.includes('market')) {
          aiText = 'CURRENT MARKET REGIME STATUS:\n• Nifty Index: High Volatility Bullish (India VIX at 13.42, PCR bullish at 1.14).\n• Advancing sectors: IT, BANK. Declining: AUTO.\n• Recommendation: Defer strict momentum; favor range-fade options spreads (straddles/condors).';
        } else if (textClean.includes('risk') || textClean.includes('kelly')) {
          aiText = 'KELLY CRITERION SIZING REPORT:\n• Win Probability (W): 62.5%\n• Reward-to-Risk (R): 1.50\n• Kelly Sizing % = W - [(1 - W) / R] = 0.625 - [0.375 / 1.50] = 37.5%.\n• Recommended Sizing: Fractional 1/4 Kelly size (9.37% of capital per trade) for drawdown safety.';
        } else {
          aiText = 'I have evaluated your request and processed the historical parameters. The quantitative profile remains optimal. Would you like me to generate a new options strategy or optimize SL settings?';
        }

        setMessages(prev => [...prev, { sender: 'AI', text: aiText, code: codeSnippet }]);
        setLoading(false);
      }, 1500);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'AI', text: 'Error dispatching chat request to AI agent.' }]);
      setLoading(false);
    }
  };

  const handleTemplateClick = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className="space-y-8 relative z-10 max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col justify-between">
      
      {/* Title */}
      <div className="flex justify-between items-center flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-wider text-white">
            AI Quant Assistant
          </h1>
          <p className="text-xs text-gray-500">
            Consult the AI Strategy Generator, Market Regime Detector, and Portfolio Advisor.
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand/10 border border-brand/20">
          <Sparkles className="w-3.5 h-3.5 text-brand" />
          <span className="text-[10px] font-mono text-brand font-bold uppercase tracking-wider">Igris LLM Active</span>
        </div>
      </div>

      {/* Chat Messages container */}
      <div className="flex-1 my-6 glass-panel rounded-2xl p-6 overflow-y-auto space-y-6 flex flex-col justify-between">
        
        {/* Messages list */}
        <div className="space-y-6 overflow-y-auto flex-1 pr-2">
          {messages.map((m, idx) => {
            const isAI = m.sender === 'AI';
            return (
              <div 
                key={idx} 
                className={`flex gap-4 max-w-[85%] ${isAI ? 'self-start' : 'self-end flex-row-reverse ml-auto'}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-xl border flex-shrink-0 flex items-center justify-center ${
                  isAI ? 'bg-brand/10 border-brand/25 text-brand' : 'bg-gray-900 border-gray-800 text-gray-400'
                }`}>
                  {isAI ? <Bot className="w-4.5 h-4.5" /> : <User className="w-4.5 h-4.5" />}
                </div>

                {/* Message body */}
                <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                  isAI ? 'bg-gray-950/65 border border-gray-900 text-gray-250 shadow-glass-inset' : 'bg-brand text-white font-semibold'
                }`}>
                  <p className="whitespace-pre-line">{m.text}</p>
                  
                  {m.code && (
                    <div className="mt-4 relative font-mono text-[10px] bg-black p-4 rounded-xl border border-gray-950 overflow-x-auto text-gray-300">
                      <span className="absolute top-2 right-2 text-[8px] text-gray-600 font-bold uppercase font-sans">Python DSL</span>
                      <pre>{m.code}</pre>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-4 max-w-[80%] self-start">
              <div className="w-8 h-8 rounded-xl bg-brand/10 border border-brand/25 text-brand flex items-center justify-center">
                <RefreshCw className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-4 rounded-2xl bg-gray-950/65 border border-gray-900 text-gray-500 font-mono text-[10px] uppercase tracking-wider">
                Igris AI reasoning...
              </div>
            </div>
          )}
        </div>

        {/* Suggestion prompt templates at the bottom of panel */}
        <div className="border-t border-gray-900 pt-4 flex flex-wrap gap-2.5 flex-shrink-0">
          {[
            { label: 'Generate VWAP Strategy', prompt: 'Generate Python code for a VWAP Reversal strategy' },
            { label: 'Analyze Market Regime', prompt: 'Detect the current market regime trend' },
            { label: 'Check Kelly Sizing', prompt: 'Evaluate risk of my BankNifty options using Kelly sizing rules' }
          ].map(tpl => (
            <button
              key={tpl.label}
              onClick={() => handleTemplateClick(tpl.prompt)}
              className="px-3 py-1.5 rounded-lg bg-gray-950 border border-gray-900 text-[10px] text-gray-400 hover:text-white transition-colors uppercase tracking-wider font-bold shadow-glass-inset"
            >
              {tpl.label}
            </button>
          ))}
        </div>

      </div>

      {/* Input box */}
      <form onSubmit={handleSend} className="flex gap-3 flex-shrink-0">
        <input
          type="text"
          className="flex-1 glass-input py-4 px-5 rounded-2xl text-xs placeholder-gray-500"
          placeholder="Consult the AI strategy architect or request market regime scans..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 rounded-2xl bg-brand hover:bg-brand/90 text-white font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2 hover:shadow-[0_0_15px_rgba(59,130,246,0.4)]"
        >
          <Send className="w-4 h-4" />
          Send
        </button>
      </form>

    </div>
  );
}
