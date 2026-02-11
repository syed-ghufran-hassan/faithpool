// Add to frontend/src/services/decayScheduler.ts  
export class DecayScheduler {  
  private static instance: DecayScheduler;  
  private checkInterval: NodeJS.Timeout | null = null;  
    
  static getInstance(): DecayScheduler {  
    if (!DecayScheduler.instance) {  
      DecayScheduler.instance = new DecayScheduler();  
    }  
    return DecayScheduler.instance;  
  }  
    
  start() {  
    // Check every 10 minutes  
    this.checkInterval = setInterval(() => {  
      this.checkAndProcessDecay();  
    }, 10 * 60 * 1000);  
  }  
    
  stop() {  
    if (this.checkInterval) {  
      clearInterval(this.checkInterval);  
      this.checkInterval = null;  
    }  
  }  
    
  private async checkAndProcessDecay() {  
    try {  
      // Get all active circles  
      const circles = await getActiveCircles();  
        
      for (const circle of circles) {  
        const isDue = await isDecayDue(circle.id);  
          
        if (isDue) {  
          await processReputationDecay(circle.id);  
            
          // Notify affected members  
          const members = await getCircleMembers(circle.id);  
          for (const member of members) {  
            const oldRep = await getUserReputation(member.address);  
            const newRep = await getUserReputation(member.address);  
              
            if (newRep < oldRep) {  
              notifyReputationDecay({  
                type: 'reputation_decay',  
                circleId: circle.id,  
                oldScore: oldRep,  
                newScore: newRep,  
                decayAmount: oldRep - newRep,  
              });  
            }  
          }  
        }  
      }  
    } catch (error) {  
      console.error('Error processing decay:', error);  
    }  
  }  
}
