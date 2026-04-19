import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-calculator',
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.css'],
  imports: [CommonModule, FormsModule]
})
export class CalculatorComponent {
  // Input values
  monthlyRent: number = 500;
  propertyPrice: number = 200000;
  downPaymentPercent: number = 20;
  interestRate: number = 5;
  loanTermYears: number = 30;

  // Calculated values
  downPaymentAmount: number = 0;
  mortgageAmount: number = 0;
  monthlyMortgage: number = 0;
  totalRentCost: number = 0;
  totalBuyCost: number = 0;
  breakEvenMonths: number = 0;
  breakEvenYears: number = 0;

  constructor() {
    this.calculate();
  }

  calculate(): void {
    // Calculate down payment
    this.downPaymentAmount = (this.propertyPrice * this.downPaymentPercent) / 100;

    // Calculate mortgage amount
    this.mortgageAmount = this.propertyPrice - this.downPaymentAmount;

    // Calculate monthly mortgage using standard formula
    const monthlyRate = this.interestRate / 100 / 12;
    const numberOfPayments = this.loanTermYears * 12;

    if (monthlyRate > 0) {
      this.monthlyMortgage =
        (this.mortgageAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
        (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    } else {
      this.monthlyMortgage = this.mortgageAmount / numberOfPayments;
    }

    // Calculate total costs (30 years for fair comparison)
    const monthsForComparison = 30 * 12;
    this.totalRentCost = this.monthlyRent * monthsForComparison;
    this.totalBuyCost = this.downPaymentAmount + (this.monthlyMortgage * numberOfPayments);

    // Calculate break-even point
    if (this.monthlyMortgage < this.monthlyRent) {
      const monthlySavings = this.monthlyRent - this.monthlyMortgage;
      this.breakEvenMonths = Math.ceil(this.downPaymentAmount / monthlySavings);
      this.breakEvenYears = Math.floor(this.breakEvenMonths / 12);
    } else {
      this.breakEvenMonths = 0;
      this.breakEvenYears = 0;
    }
  }

  // Format currency
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  // Reset to default values
  reset(): void {
    this.monthlyRent = 500;
    this.propertyPrice = 200000;
    this.downPaymentPercent = 20;
    this.interestRate = 5;
    this.loanTermYears = 30;
    this.calculate();
  }

  // Determine which option is better
  isBuyingBetter(): boolean {
    return this.monthlyMortgage < this.monthlyRent;
  }

  getRentingAdvantage(): string {
    if (this.isBuyingBetter()) {
      return `Buying is better! You save ${this.formatCurrency(this.monthlyRent - this.monthlyMortgage)} per month.`;
    } else {
      return `Renting is better! You save ${this.formatCurrency(this.monthlyMortgage - this.monthlyRent)} per month.`;
    }
  }

  // Helper methods for template
  getAbsoluteValue(value: number): number {
    return Math.abs(value);
  }

  getMathFloor(value: number): number {
    return Math.floor(value);
  }

  getMathCeil(value: number): number {
    return Math.ceil(value);
  }
}
