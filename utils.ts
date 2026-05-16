import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRupees(amount: number): string {
  if (isNaN(amount)) return '';
  
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  });
  
  return formatter.format(amount);
}

export function numberToWords(num: number): string {
  if (num === 0) return 'Zero';
  if (!num) return '';

  const singleDigits = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teenDigits = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const doubleDigits = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const placeValues = ['', 'Thousand', 'Lakh', 'Crore'];

  let words = '';
  let n = Math.floor(num);
  let i = 0;

  function convertTwoDigits(n: number) {
    if (n === 0) return '';
    if (n < 10) return singleDigits[n];
    if (n < 20) return teenDigits[n - 10];
    return doubleDigits[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + singleDigits[n % 10] : '');
  }

  // Handle first 3 digits (hundreds)
  if (n % 1000 !== 0) {
    let hundred = Math.floor((n % 1000) / 100);
    let rest = n % 100;
    if (hundred > 0) words = singleDigits[hundred] + ' Hundred ' + words;
    if (rest > 0) words += (hundred > 0 ? 'and ' : '') + convertTwoDigits(rest);
  }
  
  n = Math.floor(n / 1000);
  i = 1;

  while (n > 0) {
    let chunk = n % 100;
    if (chunk > 0) {
      words = convertTwoDigits(chunk) + ' ' + placeValues[i] + ' ' + words;
    }
    n = Math.floor(n / 100);
    i++;
  }

  return words.trim() + ' Rupees Only';
}
