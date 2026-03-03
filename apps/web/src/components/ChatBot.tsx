'use client';

import { useState, useRef, useEffect, useCallback, FormEvent } from 'react';

// ---------- Types ----------
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// ---------- Knowledge Base ----------
const KNOWLEDGE_BASE: { patterns: RegExp[]; response: string }[] = [
  {
    patterns: [/hello/i, /^hi\b/i, /^hey/i, /good morning/i, /good afternoon/i, /good evening/i],
    response:
      'Hello! I\'m the Constitutional Tender assistant. I can help with questions about our metals, pricing, orders, and platform features. What would you like to know?',
  },
  {
    patterns: [/help/i, /what can you/i, /what do you/i, /support/i],
    response:
      'I can help with:\n\n• Product & metal information\n• Pricing, premiums & spreads\n• Quote locking & checkout\n• Order tracking & delivery\n• Account & KYC verification\n• Payment methods\n• Vault storage options\n\nJust ask me anything!',
  },
  {
    patterns: [/what metals/i, /which metals/i, /what products/i, /sell/i, /offer/i, /catalog/i],
    response:
      'We offer Gold (XAU) and Silver (XAG) in various forms:\n\n• Coins — American Eagles, sovereign mint coins\n• Bars — PAMP Suisse, 1oz to 100oz\n• Rounds — private mint rounds\n\nAll products are IRA-eligible where marked. Browse our full catalog on the Market page.',
  },
  {
    patterns: [/gold/i, /xau/i],
    response:
      'Our gold products include:\n\n• 1 oz American Gold Eagle (coin, .9167 fine)\n• 1 oz Gold Bar - PAMP Suisse (.9999 fine)\n• 10 oz Gold Bar (.9999 fine)\n\nAll are IRA-eligible and available for direct ship or vault allocation. Check the Market page for live pricing.',
  },
  {
    patterns: [/silver/i, /xag/i],
    response:
      'Our silver products include:\n\n• 1 oz American Silver Eagle (coin, .999 fine)\n• 1 oz Silver Round (.999 fine)\n• 100 oz Silver Bar (.999 fine)\n\nAll are available for direct ship or vault allocation. Visit the Market page for current prices.',
  },
  {
    patterns: [/pric/i, /how much/i, /cost/i, /premium/i, /spread/i, /fee/i, /transparent/i],
    response:
      'Your execution price is fully transparent:\n\n• Spot Price — live market rate\n• Supplier Premium — dealer markup\n• Platform Spread — $2.00/oz\n• Shipping — $15.00 flat (if applicable)\n\nEvery component is disclosed before you lock your quote. No hidden fees.',
  },
  {
    patterns: [/quote/i, /lock/i, /freeze/i, /30 second/i, /timer/i],
    response:
      'When you lock a quote, your total price is frozen for 30 seconds. This prevents slippage during checkout. The countdown timer shows your remaining time. If it expires, you can lock a new quote instantly.',
  },
  {
    patterns: [/deliver/i, /ship/i, /mail/i, /send/i],
    response:
      'Two delivery options:\n\n• Direct Ship — insured delivery to your address (flat $15 shipping)\n• Vault Allocate — stored in an audited vault facility\n\nShipment tracking is provided for all direct deliveries. Vault allocations include regular audit reports.',
  },
  {
    patterns: [/vault/i, /stor/i, /allocat/i, /custod/i],
    response:
      'Vault allocation stores your metal in an audited, insured facility. Benefits include:\n\n• No shipping risk\n• Professional secure storage\n• Regular third-party audits\n• Easy liquidation when ready\n• IRA-eligible storage\n\nSelect "Vault Allocate" during checkout.',
  },
  {
    patterns: [/kyc/i, /verify/i, /identity/i, /verification/i, /aml/i],
    response:
      'KYC/AML verification is required before placing orders. You can browse products and view pricing without verification.\n\nTo verify: visit your Profile page and click "Start Verification." The process is quick and your data is encrypted.',
  },
  {
    patterns: [/order/i, /track/i, /status/i, /timeline/i],
    response:
      'Every order has a real-time timeline:\n\n1. Price Locked ✓\n2. Funds Confirmed\n3. Supplier Confirmed\n4. Shipment Created\n5. In Transit\n6. Delivered / Vault Allocated\n\nVisit the Orders page to track all your orders. Each completed order generates a printable receipt.',
  },
  {
    patterns: [/receipt/i, /print/i, /record/i, /proof/i],
    response:
      'Every completed order generates a detailed receipt with:\n\n• Full price breakdown (spot + premium + spread + shipping)\n• Timestamps for each stage\n• Product details & supplier info\n• Delivery/vault confirmation\n\nReceipts are printable and serve as your proof of purchase.',
  },
  {
    patterns: [/payment/i, /pay/i, /wire/i, /ach/i, /crypto/i, /bitcoin/i],
    response:
      'We accept three payment methods:\n\n• Wire Transfer — bank wire\n• ACH — automated clearing house\n• Crypto — cryptocurrency payment\n\nSelect your preferred method during checkout after locking your quote.',
  },
  {
    patterns: [/leverage/i, /margin/i, /derivative/i, /paper/i, /etf/i, /futures/i],
    response:
      'Constitutional Tender is physical metal only. We do not offer:\n\n• Leverage or margin trading\n• Derivatives or futures\n• Paper gold/silver or ETFs\n\nEvery purchase results in allocated physical metal — either shipped to you or stored in an audited vault.',
  },
  {
    patterns: [/ira/i, /retirement/i, /401k/i, /tax/i],
    response:
      'Many of our products are IRA-eligible, marked with the IRA badge in the catalog. IRA-eligible products can be held in self-directed precious metals IRAs.\n\nConsult your tax advisor for specific guidance on retirement account investments.',
  },
  {
    patterns: [/safe/i, /secur/i, /insur/i, /trust/i, /risk/i],
    response:
      'Security measures:\n\n• Bank-grade encryption for all data\n• Auth0 authentication with MFA support\n• Insured shipments and vaults\n• Third-party vault audits\n• Transparent pricing — no hidden fees\n\nRead our full security details on the Security page.',
  },
  {
    patterns: [/spot.*price/i, /live.*price/i, /current.*price/i, /real.?time/i, /ticker/i],
    response:
      'Live spot prices are displayed in the blue prices bar at the top of every page. Prices update in real-time via our server-sent events feed.\n\nThe Market page shows detailed spot data for Gold and Silver with 24h change percentages.',
  },
  {
    patterns: [/account/i, /profile/i, /setting/i],
    response:
      'Your account is managed on the Profile page where you can:\n\n• View your KYC verification status\n• See your account details\n• Start identity verification\n\nNavigation: click "Profile" in the header or sidebar.',
  },
  {
    patterns: [/contact/i, /email/i, /phone/i, /reach/i],
    response:
      'For support beyond what I can help with, please contact our team. You can find our contact information on the website footer, or reach out through the support channels listed on the FAQ page.',
  },
  {
    patterns: [/constitutional/i, /lawful money/i, /what is/i, /about/i, /who are/i],
    response:
      'Constitutional Tender is a precious metals trading platform focused on physical gold and silver ownership.\n\nOur mission: Lawful Money. Modern Execution.\n\nWe provide live pricing, transparent spreads, 30-second quote locks, and auditable receipts for every transaction. No leverage, no derivatives — just physical metal.',
  },
];

const DEFAULT_RESPONSE =
  'I\'m not sure about that specific question. I can help with:\n\n• Metals & products\n• Pricing & fees\n• Orders & delivery\n• Account & verification\n\nTry asking about one of these topics, or visit our FAQ page for more details.';

function findResponse(input: string): string {
  for (const entry of KNOWLEDGE_BASE) {
    if (entry.patterns.some((p) => p.test(input))) {
      return entry.response;
    }
  }
  return DEFAULT_RESPONSE;
}

// ---------- Component ----------
export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Welcome to Constitutional Tender. I can help you with products, pricing, orders, and more. What would you like to know?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSend = useCallback(
    (e?: FormEvent) => {
      e?.preventDefault();
      const trimmed = input.trim();
      if (!trimmed || isTyping) return;

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: trimmed,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput('');
      setIsTyping(true);

      setTimeout(() => {
        const response = findResponse(trimmed);
        const assistantMsg: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: response,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
        setIsTyping(false);
      }, 400 + Math.random() * 600);
    },
    [input, isTyping]
  );

  return (
    <>
      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 w-[calc(100%-2rem)] sm:w-96 max-h-[80vh] sm:max-h-[32rem] bg-navy-800 border border-navy-600 rounded-xl shadow-2xl flex flex-col z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-navy-700 bg-navy-900 rounded-t-xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gold-500 flex items-center justify-center">
                <span className="text-navy-900 font-bold text-sm">CT</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">CT Assistant</h3>
                <p className="text-[10px] text-gold-400 tracking-wide">Precious Metals Advisor</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-navy-400 hover:text-white transition-colors p-1 rounded hover:bg-navy-800"
              aria-label="Close chat"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[14rem] max-h-[20rem] sm:max-h-[22rem]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-gold-500 text-navy-900 rounded-br-sm'
                      : 'bg-navy-700 text-navy-100 rounded-bl-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-navy-700 rounded-lg rounded-bl-sm px-3.5 py-2.5 text-sm text-navy-400">
                  <span className="inline-flex gap-1">
                    <span className="w-1.5 h-1.5 bg-navy-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-navy-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-navy-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSend}
            className="flex items-center gap-2 px-3 py-3 border-t border-navy-700"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about metals, pricing, orders..."
              className="flex-1 bg-navy-900 border border-navy-600 rounded-lg px-3 py-2 text-sm text-white placeholder-navy-500 focus:outline-none focus:border-gold-500 transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="bg-gold-500 hover:bg-gold-600 disabled:opacity-40 disabled:cursor-not-allowed text-navy-900 font-semibold p-2 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </form>
        </div>
      )}

      {/* Floating Bubble */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all z-50 ${
          isOpen
            ? 'bg-navy-700 hover:bg-navy-600 text-navy-300'
            : 'bg-gold-500 hover:bg-gold-600 text-navy-900 hover:scale-105'
        }`}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>
    </>
  );
}
