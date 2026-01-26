/**
 * Analytics Service
 * 
 * Track user events and interactions for product insights.
 */

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, unknown>;
  timestamp: Date;
}

export interface UserProperties {
  walletAddress?: string;
  isConnected?: boolean;
  circlesJoined?: number;
  totalContributions?: number;
  reputationScore?: number;
}

type AnalyticsProvider = 'console' | 'custom';

interface AnalyticsConfig {
  provider: AnalyticsProvider;
  enabled: boolean;
  debug: boolean;
  customHandler?: (event: AnalyticsEvent) => void;
}

class AnalyticsService {
  private config: AnalyticsConfig = {
    provider: 'console',
    enabled: true,
    debug: import.meta.env.DEV,
  };

  private userProperties: UserProperties = {};
  private eventQueue: AnalyticsEvent[] = [];
  private isInitialized = false;

  /**
   * Initialize the analytics service
   */
  initialize(config: Partial<AnalyticsConfig> = {}): void {
    this.config = { ...this.config, ...config };
    this.isInitialized = true;

    // Flush any queued events
    this.flushQueue();

    if (this.config.debug) {
      console.log('[Analytics] Initialized with config:', this.config);
    }
  }

  /**
   * Set user properties for analytics
   */
  setUser(properties: UserProperties): void {
    this.userProperties = { ...this.userProperties, ...properties };

    if (this.config.debug) {
      console.log('[Analytics] User properties set:', this.userProperties);
    }
  }

  /**
   * Clear user properties (on disconnect/logout)
   */
  clearUser(): void {
    this.userProperties = {};

    if (this.config.debug) {
      console.log('[Analytics] User properties cleared');
    }
  }

  /**
   * Track an event
   */
  track(name: string, properties?: Record<string, unknown>): void {
    if (!this.config.enabled) return;

    const event: AnalyticsEvent = {
      name,
      properties: {
        ...properties,
        ...this.userProperties,
      },
      timestamp: new Date(),
    };

    if (!this.isInitialized) {
      this.eventQueue.push(event);
      return;
    }

    this.sendEvent(event);
  }

  /**
   * Send event to configured provider
   */
  private sendEvent(event: AnalyticsEvent): void {
    if (this.config.debug) {
      console.log('[Analytics] Event:', event.name, event.properties);
    }

    switch (this.config.provider) {
      case 'console':
        // Just log to console (already done above in debug mode)
        break;
      case 'custom':
        this.config.customHandler?.(event);
        break;
    }
  }

  /**
   * Flush queued events
   */
  private flushQueue(): void {
    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift();
      if (event) {
        this.sendEvent(event);
      }
    }
  }

  // ===== Circle Events =====

  trackCircleCreated(circleId: string, name: string, contribution: number): void {
    this.track('circle_created', {
      circleId,
      circleName: name,
      contributionAmount: contribution,
    });
  }

  trackCircleJoined(circleId: string, position: number): void {
    this.track('circle_joined', {
      circleId,
      position,
    });
  }

  trackContributionMade(circleId: string, amount: number, round: number): void {
    this.track('contribution_made', {
      circleId,
      amount,
      round,
    });
  }

  trackPayoutReceived(circleId: string, amount: number, round: number): void {
    this.track('payout_received', {
      circleId,
      amount,
      round,
    });
  }

  trackPayoutClaimed(circleId: string, amount: number): void {
    this.track('payout_claimed', {
      circleId,
      amount,
    });
  }

  // ===== NFT Events =====

  trackNFTMinted(tokenId: number, circleId: string): void {
    this.track('nft_minted', {
      tokenId,
      circleId,
    });
  }

  trackNFTListed(tokenId: number, price: number): void {
    this.track('nft_listed', {
      tokenId,
      price,
    });
  }

  trackNFTSold(tokenId: number, price: number): void {
    this.track('nft_sold', {
      tokenId,
      price,
    });
  }

  // ===== Wallet Events =====

  trackWalletConnected(address: string): void {
    this.track('wallet_connected', {
      address,
    });
  }

  trackWalletDisconnected(): void {
    this.track('wallet_disconnected');
  }

  // ===== Page Events =====

  trackPageView(path: string, title?: string): void {
    this.track('page_view', {
      path,
      title,
    });
  }

  trackError(error: Error, context?: string): void {
    this.track('error', {
      message: error.message,
      stack: error.stack,
      context,
    });
  }
}

// Singleton instance
export const analytics = new AnalyticsService();

export default analytics;
