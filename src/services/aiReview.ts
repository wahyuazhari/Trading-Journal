import { Trade, AIReviewResult } from '../types';

/**
 * Offline Rule-Based AI Review Engine
 * Generates immediate, objective performance analysis without external APIs.
 */
export function generateOfflineAIReview(trade: Trade): AIReviewResult {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const suggestions: string[] = [];

  let score = 70; // baseline score

  // 1. Risk Reward Ratio Analysis
  if (trade.rr >= 2.0) {
    strengths.push(`Excellent Risk-to-Reward ratio (1:${trade.rr.toFixed(2)}), providing strong positive expectancy.`);
    score += 10;
  } else if (trade.rr >= 1.5) {
    strengths.push(`Acceptable Risk-to-Reward ratio (1:${trade.rr.toFixed(2)}).`);
    score += 5;
  } else if (trade.rr > 0) {
    weaknesses.push(`Sub-optimal Risk-to-Reward ratio (1:${trade.rr.toFixed(2)}). Target at least 1:1.5 or 1:2 to maintain profitability.`);
    score -= 10;
  }

  // 2. Risk Management
  if (trade.riskPercent <= 1.5) {
    strengths.push(`Disciplined position sizing (${trade.riskPercent}% risk per trade), protecting account equity.`);
    score += 10;
  } else if (trade.riskPercent <= 2.5) {
    strengths.push(`Moderate risk allocation (${trade.riskPercent}%).`);
  } else {
    weaknesses.push(`High risk per trade (${trade.riskPercent}%). Exceeding 2% increases vulnerability to severe drawdown strings.`);
    suggestions.push('Cap risk per trade to ≤ 1.5% to preserve capital during market consolidation phases.');
    score -= 15;
  }

  // 3. Psychology State Analysis
  const calmStates = ['Calm', 'Confident'];
  const emotionStates = ['FOMO', 'Revenge', 'Fear', 'Greed', 'Impatient', 'Tired'];

  if (calmStates.includes(trade.psychology)) {
    strengths.push(`Mental clarity maintained: Entered trade in a '${trade.psychology}' psychological state.`);
    score += 10;
  } else if (emotionStates.includes(trade.psychology)) {
    weaknesses.push(`Psychological pressure identified: Entered with '${trade.psychology}' emotion.`);
    if (trade.psychology === 'FOMO') {
      suggestions.push('Avoid chasing candles. Wait for liquidity sweeps or key level pullbacks before entry.');
    } else if (trade.psychology === 'Revenge') {
      suggestions.push('Enforce a mandatory 30-minute cooling-off break after any losing trade to reset emotional state.');
    } else if (trade.psychology === 'Greed') {
      suggestions.push('Stick strictly to pre-planned Take Profit levels rather than holding for irrational extensions.');
    } else if (trade.psychology === 'Fear' || trade.psychology === 'Impatient') {
      suggestions.push('Rely on your predefined trading checklist to eliminate entry hesitation or premature execution.');
    }
    score -= 15;
  }

  // 4. Checklist Compliance
  const checklist = trade.checklist || {};
  const checklistKeys = Object.keys(checklist) as (keyof typeof checklist)[];
  const completedChecks = checklistKeys.filter(key => checklist[key]).length;
  const totalChecks = checklistKeys.length || 1;
  const checklistPercent = Math.round((completedChecks / totalChecks) * 100);

  if (checklistPercent >= 80) {
    strengths.push(`High trading checklist compliance (${checklistPercent}% of rules fulfilled prior to entry).`);
    score += 10;
  } else if (checklistPercent < 50) {
    weaknesses.push(`Low checklist compliance (${checklistPercent}%). You skipped essential confluence verifications.`);
    suggestions.push('Require at least 70% checklist approval before opening any new position.');
    score -= 15;
  }

  // 5. Technical Confluence & Strategy
  if (trade.analysis?.confluence && trade.analysis.confluence.trim().length > 10) {
    strengths.push(`Solid confluence documented: "${trade.analysis.confluence}".`);
  } else {
    weaknesses.push('Limited confluence documentation for market entry drivers.');
    suggestions.push('Document at least 2 distinct technical factors (e.g. HTF Trend + Order Block / Liquidity Sweep).');
  }

  // 6. Screenshot Documentation
  if (trade.screenshotBefore && trade.screenshotAfter) {
    strengths.push('Comprehensive visual record: Both Before & After chart screenshots were captured.');
    score += 5;
  } else if (!trade.screenshotBefore && !trade.screenshotAfter) {
    weaknesses.push('No chart screenshots attached to this trade.');
    suggestions.push('Attach Before and After screenshots to visually review market structure and entry timing later.');
  } else if (!trade.screenshotAfter && trade.status === 'Closed') {
    suggestions.push('Add an After screenshot to evaluate how price unfolded post-exit.');
  }

  // 7. Result specific insights
  if (trade.result === 'Win') {
    if (trade.exitPrice && trade.takeProfit) {
      const exitDiff = Math.abs(trade.exitPrice - trade.takeProfit);
      const entryTpDist = Math.abs(trade.takeProfit - trade.entryPrice);
      if (entryTpDist > 0 && exitDiff / entryTpDist < 0.1) {
        strengths.push('Clean execution: Exited remarkably close to designated Take Profit level.');
      }
    }
  } else if (trade.result === 'Loss') {
    suggestions.push('Review whether the loss was a valid statistical outcome of your strategy or a rule deviation.');
  }

  // Default fallback if lists are sparse
  if (strengths.length === 0) {
    strengths.push('Trade logged in system for statistical tracking.');
  }
  if (suggestions.length === 0) {
    suggestions.push('Continue maintaining strict journal consistency across your next 20 trades.');
  }

  // Clamp final score 0 - 100
  const finalScore = Math.max(0, Math.min(100, score));

  return {
    strengths,
    weaknesses,
    suggestions,
    overallScore: finalScore,
  };
}
