// ToolUsageManager.js
// Manages free tool usage, subscription status, upgrade prompts, and access permissions

class ToolUsageManager {
  constructor({ toolKey, freeLimit = 3, period = 'day', upgradeSelector, usesSelector, upgradeCallback }) {
    this.toolKey = toolKey; // e.g., 'skincareQuizUses'
    this.freeLimit = freeLimit;
    this.period = period; // 'day' or 'month'
    this.upgradeSelector = upgradeSelector;
    this.usesSelector = usesSelector;
    this.upgradeCallback = upgradeCallback;
    this.subKey = `${toolKey}_subscribed`;
  }

  _getPeriodKey() {
    const now = new Date();
    if (this.period === 'month') {
      return `${now.getFullYear()}-${now.getMonth() + 1}`;
    }
    // default: day
    return now.toISOString().slice(0, 10);
  }

  getUsage() {
    const data = localStorage.getItem(this.toolKey);
    const periodKey = this._getPeriodKey();
    if (!data) return { period: periodKey, uses: 0 };
    try {
      const obj = JSON.parse(data);
      if (obj.period !== periodKey) return { period: periodKey, uses: 0 };
      return obj;
    } catch {
      return { period: periodKey, uses: 0 };
    }
  }

  setUsage(uses) {
    const periodKey = this._getPeriodKey();
    localStorage.setItem(this.toolKey, JSON.stringify({ period: periodKey, uses }));
  }

  incrementUsage() {
    const usage = this.getUsage();
    this.setUsage(usage.uses + 1);
  }

  resetUsage() {
    this.setUsage(0);
  }

  isSubscribed() {
    return localStorage.getItem(this.subKey) === 'true';
  }

  setSubscribed(val) {
    localStorage.setItem(this.subKey, val ? 'true' : 'false');
  }

  canAccess() {
    if (this.isSubscribed()) return true;
    const { uses } = this.getUsage();
    return uses < this.freeLimit;
  }

  showUpgradePrompt() {
    if (this.upgradeSelector) {
      const el = document.querySelector(this.upgradeSelector);
      if (el) el.classList.remove('hidden');
    }
    if (typeof this.upgradeCallback === 'function') {
      this.upgradeCallback();
    }
  }

  hideUpgradePrompt() {
    if (this.upgradeSelector) {
      const el = document.querySelector(this.upgradeSelector);
      if (el) el.classList.add('hidden');
    }
  }

  updateUsesDisplay() {
    if (this.usesSelector) {
      const el = document.querySelector(this.usesSelector);
      if (el) {
        if (this.isSubscribed()) {
          el.textContent = '(Unlimited)';
        } else {
          const { uses } = this.getUsage();
          el.textContent = `(${Math.max(0, this.freeLimit - uses)} free uses left ${this.period === 'month' ? 'this month' : 'today'})`;
        }
      }
    }
  }

  handleAccess() {
    if (this.canAccess()) {
      this.hideUpgradePrompt();
      return true;
    } else {
      this.showUpgradePrompt();
      return false;
    }
  }

  // For demo: simulate upgrade
  simulateUpgrade() {
    this.setSubscribed(true);
    this.updateUsesDisplay();
    this.hideUpgradePrompt();
  }
}

// Example usage (uncomment and adapt as needed):
// const manager = new ToolUsageManager({
//   toolKey: 'skincareQuizUses',
//   freeLimit: 3,
//   period: 'day',
//   upgradeSelector: '#quiz-upgrade',
//   usesSelector: '#quiz-uses-remaining',
//   upgradeCallback: () => alert('Please upgrade for unlimited access!'),
// });
// manager.updateUsesDisplay();
// if (!manager.canAccess()) manager.showUpgradePrompt();

export default ToolUsageManager;
