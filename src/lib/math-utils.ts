export function getAvgValue(val1: number, val2: number | undefined): number {
  return (val1 + (val2 ?? val1)) / 2;
}

export function roundToOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}
