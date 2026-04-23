import { rankingMap } from './rankingService.js';

class ExtensionStrategy {
  constructor(rfq) {
    this.rfq = rfq;
  }
  evaluate(beforeRankings, afterRankings, now) {
    throw new Error('Method evaluate() must be implemented.');
  }

  isWithinTriggerWindow(now) {
    const windowStart = new Date(this.rfq.bidCloseTime.getTime() - this.rfq.triggerWindowMinutes * 60000);
    return now >= windowStart && now <= this.rfq.bidCloseTime;
  }

  calculateNewCloseTime() {
    const requestedClose = new Date(this.rfq.bidCloseTime.getTime() + this.rfq.extensionMinutes * 60000);
    return requestedClose > this.rfq.forcedCloseTime ? this.rfq.forcedCloseTime : requestedClose;
  }
}

class AnyBidStrategy extends ExtensionStrategy {
  evaluate(beforeRankings, afterRankings, now) {
    if (!this.isWithinTriggerWindow(now)) {
      return { shouldExtend: false, reason: 'Bid was outside trigger window' };
    }
    return { shouldExtend: true, reason: 'any bid was placed in the trigger window' };
  }
}

class RankChangeStrategy extends ExtensionStrategy {
  evaluate(beforeRankings, afterRankings, now) {
    if (!this.isWithinTriggerWindow(now)) {
      return { shouldExtend: false, reason: 'Bid was outside trigger window' };
    }
    const before = rankingMap(beforeRankings);
    const after = rankingMap(afterRankings);
    let triggered = false;
    for (const [supplierId, rank] of after.entries()) {
      if (before.get(supplierId) !== rank) {
        triggered = true;
        break;
      }
    }
    if (!triggered) {
      return { shouldExtend: false, reason: 'no supplier ranking changed' };
    }
    return { shouldExtend: true, reason: 'supplier ranking changed' };
  }
}

class L1ChangeStrategy extends ExtensionStrategy {
  evaluate(beforeRankings, afterRankings, now) {
    if (!this.isWithinTriggerWindow(now)) {
      return { shouldExtend: false, reason: 'Bid was outside trigger window' };
    }
    if (!beforeRankings[0] || !afterRankings[0]) {
      return { shouldExtend: false, reason: 'L1 bidder did not change' };
    }
    const beforeL1 = beforeRankings[0].supplierId;
    const afterL1 = afterRankings[0].supplierId;
    const triggered = beforeL1 !== afterL1;
    if (!triggered) {
      return { shouldExtend: false, reason: 'L1 bidder did not change' };
    }
    return { shouldExtend: true, reason: 'L1 bidder changed' };
  }
}

export class AuctionEngine {
  constructor(rfq) {
    this.rfq = rfq;
    this.strategy = this._getStrategy();
  }

  _getStrategy() {
    switch (this.rfq.triggerType) {
      case 'ANY_BID': return new AnyBidStrategy(this.rfq);
      case 'ANY_RANK_CHANGE': return new RankChangeStrategy(this.rfq);
      case 'L1_CHANGE': return new L1ChangeStrategy(this.rfq);
      default: throw new Error(`Unknown trigger type: ${this.rfq.triggerType}`);
    }
  }

  processBidExtension(beforeRankings, afterRankings, now = new Date()) {
    const evaluation = this.strategy.evaluate(beforeRankings, afterRankings, now);
    
    if (!evaluation.shouldExtend) {
      return { ...evaluation, previousCloseTime: this.rfq.bidCloseTime, newCloseTime: this.rfq.bidCloseTime };
    }

    const newCloseTime = this.strategy.calculateNewCloseTime();
    
    if (newCloseTime.getTime() === this.rfq.bidCloseTime.getTime()) {
      return { shouldExtend: false, reason: 'forced close limit reached' };
    }

    return {
      shouldExtend: true,
      reason: evaluation.reason,
      previousCloseTime: this.rfq.bidCloseTime,
      newCloseTime
    };
  }

  static getStatus(rfq, now = new Date()) {
    if (now >= rfq.forcedCloseTime) return 'FORCE_CLOSED';
    if (now > rfq.bidCloseTime) return 'CLOSED';
    if (now < rfq.bidStartTime) return 'SCHEDULED';
    return 'ACTIVE';
  }
}
