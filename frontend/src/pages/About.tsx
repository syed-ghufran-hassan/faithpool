import { memo, useMemo } from 'react';
import { 
  Shield, 
  Eye, 
  Bot, 
  Globe, 
  Users, 
  Coins, 
  Gift, 
  Award,
  type LucideIcon
} from 'lucide-react';
import { Badge } from '../components/Badge';
import './About.css';

interface Step {
  number: number;
  title: string;
  description: string;
  icon: LucideIcon;
}

interface Benefit {
  icon: LucideIcon;
  title: string;
  description: string;
}

const STEPS: Step[] = [
  { number: 1, title: 'Create or Join', description: 'Start a new savings circle or join an existing one that fits your goals', icon: Users },
  { number: 2, title: 'Contribute', description: 'Make regular STX deposits according to the circle\'s schedule', icon: Coins },
  { number: 3, title: 'Receive Payout', description: 'When it\'s your turn, receive the pooled funds automatically', icon: Gift },
  { number: 4, title: 'Earn NFT', description: 'Complete the cycle and earn an NFT badge proving your reliability', icon: Award },
];

const BENEFITS: Benefit[] = [
  { icon: Shield, title: 'Security', description: 'Smart contracts ensure funds are handled according to rules' },
  { icon: Eye, title: 'Transparency', description: 'All transactions are public and verifiable on-chain' },
  { icon: Bot, title: 'Automation', description: 'Distributions happen automatically without intermediaries' },
  { icon: Globe, title: 'Accessibility', description: 'Anyone with a Stacks wallet can participate globally' },
];

const TECH_STACK = ['Stacks', 'Clarity', 'Bitcoin', 'React'] as const;

const About = memo(function About() {
  const stepElements = useMemo(() => 
    STEPS.map((step) => {
      const Icon = step.icon;
      return (
        <div key={step.number} className="about__step">
          <div className="about__step-number">{step.number}</div>
          <Icon className="about__step-icon" size={24} />
          <h3 className="about__step-title">{step.title}</h3>
          <p className="about__step-text">{step.description}</p>
        </div>
      );
    }),
    []
  );

  const benefitElements = useMemo(() =>
    BENEFITS.map((benefit) => {
      const Icon = benefit.icon;
      return (
        <div key={benefit.title} className="about__benefit">
          <Icon className="about__benefit-icon" size={28} />
          <h4 className="about__benefit-title">{benefit.title}</h4>
          <p className="about__benefit-text">{benefit.description}</p>
        </div>
      );
    }),
    []
  );

  return (
    <div className="about">
      <section className="about__hero">
        <h1 className="about__hero-title">About StackSusu</h1>
        <p className="about__hero-subtitle">
          Decentralized savings circles powered by the Stacks blockchain
        </p>
      </section>

      <section className="about__content">
        <div className="about__section">
          <h2 className="about__section-title">What is StackSusu?</h2>
          <p className="about__section-text">
            StackSusu brings the traditional concept of rotating savings circles 
            (known as "susu", "tanda", "chit fund", or "ROSCA") to the blockchain. 
            Our platform enables communities to save together in a transparent, 
            secure, and trustless environment.
          </p>
        </div>

        <div className="about__section">
          <h2 className="about__section-title">How It Works</h2>
          <div className="about__steps">
            {stepElements}
          </div>
        </div>

        <div className="about__section">
          <h2 className="about__section-title">Why Blockchain?</h2>
          <div className="about__benefits">
            {benefitElements}
          </div>
        </div>

        <div className="about__section">
          <h2 className="about__section-title">Our Mission</h2>
          <p className="about__section-text">
            We believe in the power of community-based savings. By combining 
            traditional financial practices with blockchain technology, we're 
            creating a more inclusive and transparent financial system for everyone.
          </p>
        </div>

        <div className="about__section">
          <h2 className="about__section-title">Built on Stacks</h2>
          <p className="about__section-text">
            StackSusu is built on the Stacks blockchain, which brings smart contracts 
            and DeFi to Bitcoin. This means your savings circles benefit from Bitcoin's 
            security while enjoying the programmability of Clarity smart contracts.
          </p>
          <div className="about__tech-stack">
            {TECH_STACK.map((tech) => (
              <Badge key={tech} variant="info" size="lg">
                {tech}
              </Badge>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
});

export { About as default };
