import { Link } from 'react-router-dom';
import { Github, Twitter, MessageCircle, ExternalLink, Heart } from 'lucide-react';
import clsx from 'clsx';
import './Footer.css';

interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

const footerColumns: FooterColumn[] = [
  {
    title: 'Product',
    links: [
      { label: 'Browse Circles', href: '/circles' },
      { label: 'Create Circle', href: '/create' },
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'How it Works', href: '/about' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: 'https://docs.stacks.co', external: true },
      { label: 'FAQ', href: '/faq' },
      { label: 'Support', href: '/support' },
      { label: 'API', href: '/api-docs' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Cookie Policy', href: '/cookies' },
    ],
  },
];

const socialLinks = [
  { icon: Github, href: 'https://github.com/AdekumleBamz/Stacksusu', label: 'GitHub' },
  { icon: Twitter, href: 'https://twitter.com/stacksusu', label: 'Twitter' },
  { icon: MessageCircle, href: 'https://discord.gg/stacksusu', label: 'Discord' },
];

interface FooterProps {
  className?: string;
  variant?: 'default' | 'minimal';
}

function Footer({ className, variant = 'default' }: FooterProps) {
  const currentYear = new Date().getFullYear();

  if (variant === 'minimal') {
    return (
      <footer className={clsx('footer footer--minimal', className)}>
        <div className="footer__container">
          <div className="footer__minimal-content">
            <p className="footer__copyright">
              © {currentYear} StackSusu. Built on Stacks.
            </p>
            <div className="footer__social">
              {socialLinks.map(social => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer__social-link"
                  aria-label={social.label}
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className={clsx('footer', className)}>
      <div className="footer__container">
        {/* Main Content */}
        <div className="footer__main">
          {/* Brand Section */}
          <div className="footer__brand">
            <Link to="/" className="footer__logo">
              <span className="footer__logo-icon">🔄</span>
              <span className="footer__logo-text">StackSusu</span>
            </Link>
            <p className="footer__tagline">
              Decentralized savings circles powered by Stacks blockchain 
              and secured by Bitcoin.
            </p>
            
            {/* Social Links */}
            <div className="footer__social">
              {socialLinks.map(social => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer__social-link"
                  aria-label={social.label}
                >
                  <social.icon size={20} />
                </a>
              ))}
            </div>
          </div>

          {/* Links Grid */}
          <div className="footer__links-grid">
            {footerColumns.map(column => (
              <div key={column.title} className="footer__column">
                <h4 className="footer__column-title">{column.title}</h4>
                <ul className="footer__column-list">
                  {column.links.map(link => (
                    <li key={link.label}>
                      {link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="footer__link"
                        >
                          {link.label}
                          <ExternalLink size={12} />
                        </a>
                      ) : (
                        <Link to={link.href} className="footer__link">
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Newsletter (optional future feature) */}
        <div className="footer__newsletter">
          <div className="footer__newsletter-content">
            <h4 className="footer__newsletter-title">Stay updated</h4>
            <p className="footer__newsletter-text">
              Get the latest updates on new features and community news.
            </p>
          </div>
          <form className="footer__newsletter-form" onSubmit={e => e.preventDefault()}>
            <input
              type="email"
              placeholder="Enter your email"
              className="footer__newsletter-input"
            />
            <button type="submit" className="footer__newsletter-btn">
              Subscribe
            </button>
          </form>
        </div>

        {/* Bottom */}
        <div className="footer__bottom">
          <p className="footer__copyright">
            © {currentYear} StackSusu. All rights reserved.
          </p>
          <p className="footer__made-with">
            Made with <Heart size={14} className="footer__heart" /> on Stacks
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
