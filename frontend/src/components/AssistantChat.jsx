import { useState } from 'react';
import { askAssistant } from '../api';

const SUGGESTIONS = [
  'Which orders are at risk right now?',
  'Which riders are overloaded?',
  'Why is this order late?',
];

export default function AssistantChat({ selectedRef }) {
  const [messages, setMessages] = useState([
    { who: 'bot', text: 'Ask about delayed orders, overloaded riders or policies.' },
  ]);
  const [input, setInput] = useState('');
  const [pending, setPending] = useState(false);

  async function ask(question) {
    const text = question.trim();
    if (!text || pending) return;

    setMessages((m) => [...m, { who: 'me', text }]);
    setInput('');
    setPending(true);
    try {
      const { answer } = await askAssistant(text, selectedRef);
      setMessages((m) => [...m, { who: 'bot', text: answer }]);
    } catch (e) {
      setMessages((m) => [...m, { who: 'bot', text: `Error: ${e.message}` }]);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="chat">
      <div className="msgs">
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.who}`}>{m.text}</div>
        ))}
      </div>

      <div className="suggest">
        {SUGGESTIONS.map((s) => (
          <button key={s} onClick={() => ask(s)} disabled={pending}>
            {s}
          </button>
        ))}
      </div>

      <form
        className="ask"
        onSubmit={(e) => {
          e.preventDefault();
          ask(input);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about an order, rider or policy"
          aria-label="Ask the ops assistant"
        />
        <button className="btn" type="submit" disabled={pending}>Ask</button>
      </form>
    </div>
  );
}