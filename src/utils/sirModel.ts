/**
 * Simple SIR (Susceptible-Infected-Recovered) model for disease spread prediction.
 * Uses Euler method for numerical integration.
 */

export interface SIRResult {
  day: number;
  susceptible: number;
  infected: number;
  recovered: number;
}

export function runSIRModel(
  population: number,
  currentInfected: number,
  currentRecovered: number,
  days: number = 30,
  beta: number = 0.3,   // transmission rate
  gamma: number = 0.1   // recovery rate
): SIRResult[] {
  const results: SIRResult[] = [];
  
  let S = population - currentInfected - currentRecovered;
  let I = currentInfected;
  let R = currentRecovered;
  const N = population;
  const dt = 1; // 1 day step
  
  for (let day = 0; day <= days; day++) {
    results.push({
      day,
      susceptible: Math.max(0, Math.round(S)),
      infected: Math.max(0, Math.round(I)),
      recovered: Math.max(0, Math.round(R)),
    });
    
    const dS = -beta * S * I / N * dt;
    const dI = (beta * S * I / N - gamma * I) * dt;
    const dR = gamma * I * dt;
    
    S += dS;
    I += dI;
    R += dR;
  }
  
  return results;
}

export function getRiskForecast(predictions: SIRResult[]): {
  trend: 'increasing' | 'decreasing' | 'stable';
  peakDay: number;
  peakInfected: number;
  riskLevel: string;
} {
  const first = predictions[0];
  const last = predictions[predictions.length - 1];
  const peak = predictions.reduce((max, r) => r.infected > max.infected ? r : max, predictions[0]);
  
  const change = (last.infected - first.infected) / Math.max(first.infected, 1);
  const trend = change > 0.1 ? 'increasing' : change < -0.1 ? 'decreasing' : 'stable';
  
  let riskLevel = 'Low';
  if (peak.infected > 5000000) riskLevel = 'Extreme';
  else if (peak.infected > 1000000) riskLevel = 'Critical';
  else if (peak.infected > 500000) riskLevel = 'High';
  else if (peak.infected > 100000) riskLevel = 'Moderate';
  
  return { trend, peakDay: peak.day, peakInfected: peak.infected, riskLevel };
}
