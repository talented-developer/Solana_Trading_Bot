import { calculateDifferentials, getDifferentialBreakdown } from './differential.util';
import * as fs from 'fs';
import * as path from 'path';

describe('calculateDifferentials', () => {
  let prevDetails: any;
  let currentDetails: any;

  beforeAll(() => {
    const prevDetailsPath = path.resolve(__dirname, 'mock-token-details-before.json');
    const currentDetailsPath = path.resolve(__dirname, 'mock-token-details-now.json');

    prevDetails = JSON.parse(fs.readFileSync(prevDetailsPath, 'utf-8'));
    currentDetails = JSON.parse(fs.readFileSync(currentDetailsPath, 'utf-8'));
  });

  it('should calculate differentials correctly', () => {

    const result = calculateDifferentials(prevDetails, currentDetails);

    expect(result).toHaveProperty('durationString');
    expect(result).toHaveProperty('numberHoldersString');
    expect(result).toHaveProperty('volumeStrings');
    expect(result).toHaveProperty('txnsDiffStrings');
    expect(result).toHaveProperty('liquidityDiffStrings');
    expect(result).toHaveProperty('priceUsdString');
    expect(result).toHaveProperty('fdvString');
    expect(result).toHaveProperty('marketCapString');

    console.log(result);
  });

  it('should get differential breakdown', ()=>{
    const result = getDifferentialBreakdown(prevDetails, currentDetails);
    expect(result).toHaveProperty('duration');
    expect(result).toHaveProperty('numberHolders');
    expect(result).toHaveProperty('volume2');
    expect(result).toHaveProperty('volume3');
    expect(result).toHaveProperty('txnsDiff1');
    expect(result).toHaveProperty('txnsDiff2');
    expect(result).toHaveProperty('txnsDiff3');
    expect(result).toHaveProperty('liquidityDiff1');
    expect(result).toHaveProperty('liquidityDiff2');
    expect(result).toHaveProperty('liquidityDiff3');
    expect(result).toHaveProperty('priceUsd');
    expect(result).toHaveProperty('fdv');
    expect(result).toHaveProperty('marketCap');
    expect(result).toHaveProperty('volumeSignal');
    expect(result).toHaveProperty('volumeSignal5m');

    console.log("Differential Breakdown:", result);
  })
});