import { memo, useState, useCallback, useMemo } from 'react';
import { ChevronDown, ChevronUp, MessageCircle, Twitter, HelpCircle } from 'lucide-react';
import clsx from 'clsx';
// Button functionality provided through anchor styled as button
import './FAQ.css';

export interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
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

interface FAQItemComponentProps {
  item: FAQItem;
  index: number;
  isOpen: boolean;
  onToggle: (index: number) => void;
}

const FAQItemComponent = memo(function FAQItemComponent({
  item,
  index,
  isOpen,
  onToggle
}: FAQItemComponentProps) {
  const handleClick = useCallback(() => onToggle(index), [onToggle, index]);

  return (
    <div className={clsx('faq__item', isOpen && 'faq__item--open')}>
      <button
        className="faq__question"
        onClick={handleClick}
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${index}`}
      >
        <HelpCircle className="faq__question-icon" size={20} />
        <span className="faq__question-text">{item.question}</span>
        {isOpen ? (
          <ChevronUp className="faq__chevron" size={20} />
        ) : (
          <ChevronDown className="faq__chevron" size={20} />
        )}
      </button>
      <div 
        id={`faq-answer-${index}`}
        className="faq__answer"
        role="region"
        aria-hidden={!isOpen}
      >
        <p>{item.answer}</p>
      </div>
    </div>
  );
});

const FAQ = memo(function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleQuestion = useCallback((index: number) => {
    setOpenIndex(prev => prev === index ? null : index);
  }, []);

  const faqItems = useMemo(() =>
    FAQ_DATA.map((item, index) => (
      <FAQItemComponent
        key={index}
        item={item}
        index={index}
        isOpen={openIndex === index}
        onToggle={toggleQuestion}
      />
    )),
    [openIndex, toggleQuestion]
  );

  return (
    <div className="faq">
      <header className="faq__header">
        <h1 className="faq__title">Frequently Asked Questions</h1>
        <p className="faq__intro">
          Everything you need to know about StackSusu savings circles
        </p>
      </header>

      <div className="faq__list">
        {faqItems}
      </div>

      <div className="faq__contact">
        <h2 className="faq__contact-title">Still have questions?</h2>
        <p className="faq__contact-text">
          Can't find the answer you're looking for? Reach out to our community.
        </p>
        <div className="faq__contact-links">
          <a
            href="https://discord.gg/stacksusu"
            target="_blank"
            rel="noopener noreferrer"
            className="button button--secondary"
          >
            <MessageCircle size={18} />
            Join Discord
          </a>
          <a
            href="https://twitter.com/stacksusu"
            target="_blank"
            rel="noopener noreferrer"
            className="button button--secondary"
          >
            <Twitter size={18} />
            Follow on X
          </a>
        </div>
      </div>
    </div>
  );
});

export { FAQ as default };
