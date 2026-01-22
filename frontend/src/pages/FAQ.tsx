import { useState } from 'react';
import './FAQ.css';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: 'What is a savings circle?',
    answer: 'A savings circle (also known as susu, tanda, or ROSCA) is a group of people who contribute a fixed amount regularly. Each period, one member receives the entire pool. This continues until everyone has received a payout.',
  },
  {
    question: 'How do I join a circle?',
    answer: 'First, connect your Stacks wallet. Then browse available circles and click "Join" on one that fits your savings goals. You\'ll need to make your first contribution to officially join.',
  },
  {
    question: 'What happens if someone doesn\'t pay?',
    answer: 'Our smart contracts include mechanisms to handle missed payments. Members who miss contributions may be penalized or removed from the circle. The escrow system helps protect active members.',
  },
  {
    question: 'How are payouts determined?',
    answer: 'Payout order can be determined in different ways depending on the circle\'s rules: first-come-first-served, random selection, or bidding. The smart contract enforces the chosen method automatically.',
  },
  {
    question: 'What are the NFT badges?',
    answer: 'NFT badges are proof-of-participation tokens you earn when you successfully complete a savings circle. They serve as a reputation system, showing other users that you\'re a reliable participant.',
  },
  {
    question: 'Is my money safe?',
    answer: 'Funds are held in audited smart contracts on the Stacks blockchain. The code is open-source and verifiable. However, as with any DeFi application, you should only deposit what you can afford to risk.',
  },
  {
    question: 'What are the fees?',
    answer: 'StackSusu charges a small platform fee (1-2%) on completed circles. You\'ll also need to pay standard Stacks network transaction fees for deposits and withdrawals.',
  },
  {
    question: 'Can I create my own circle?',
    answer: 'Yes! Anyone can create a circle by setting the contribution amount, frequency, number of members, and other parameters. You\'ll be the circle administrator.',
  },
  {
    question: 'What wallets are supported?',
    answer: 'We currently support Hiro Wallet (formerly Stacks Wallet) and Xverse. More wallet integrations are planned for the future.',
  },
  {
    question: 'How do I withdraw my payout?',
    answer: 'When it\'s your turn to receive the payout, the funds are automatically sent to your connected wallet address. No manual withdrawal is needed.',
  },
];

function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="faq-page">
      <h1>Frequently Asked Questions</h1>
      <p className="faq-intro">
        Everything you need to know about StackSusu savings circles
      </p>

      <div className="faq-list">
        {faqData.map((item, index) => (
          <div
            key={index}
            className={`faq-item ${openIndex === index ? 'open' : ''}`}
          >
            <button
              className="faq-question"
              onClick={() => toggleQuestion(index)}
            >
              <span>{item.question}</span>
              <span className="faq-icon">{openIndex === index ? '−' : '+'}</span>
            </button>
            <div className="faq-answer">
              <p>{item.answer}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="faq-contact">
        <h2>Still have questions?</h2>
        <p>
          Can't find the answer you're looking for? Reach out to our community.
        </p>
        <div className="contact-links">
          <a href="https://discord.gg/stacksusu" className="contact-btn discord">
            Join Discord
          </a>
          <a href="https://twitter.com/stacksusu" className="contact-btn twitter">
            Follow on X
          </a>
        </div>
      </div>
    </div>
  );
}

export default FAQ;
