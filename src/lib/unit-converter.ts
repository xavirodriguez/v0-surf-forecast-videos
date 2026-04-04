export class UnitConverter {
  metersToFeet(meters: number): number {
    return meters * 3.28084;
  }

  celsiusToFahrenheit(celsius: number): number {
    return (celsius * 9) / 5 + 32;
  }

  convertHeight(height: number, unit: 'ft' | 'm'): number {
    return unit === 'ft' ? this.metersToFeet(height) : height;
  }

  convertTemp(temp: number, unit: 'C' | 'F'): number {
    return unit === 'F' ? this.celsiusToFahrenheit(temp) : temp;
  }
}
