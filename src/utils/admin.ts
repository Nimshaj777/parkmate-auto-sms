import { SubscriptionManager, type ActivationCode } from './subscription';

// Admin utilities for manual code generation and management
export class AdminUtils {
  
  // Generate multiple codes for different durations
  static async generateCodeBatch(count: number = 10, duration: number = 30): Promise<string[]> {
    const codes: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const code = await SubscriptionManager.generateAndStoreCode(duration);
      codes.push(code);
    }
    
    return codes;
  }

  // Generate codes for different packages
  static async generateSubscriptionPackages(): Promise<{
    monthly: string[];
    twoMonth: string[];
    threeMonth: string[];
  }> {
    const packages = {
      monthly: await this.generateCodeBatch(5, 30),      // 30 days
      twoMonth: await this.generateCodeBatch(3, 60),     // 60 days  
      threeMonth: await this.generateCodeBatch(3, 90)    // 90 days
    };

    // Log for manual distribution
    console.log('Generated Activation Codes:');
    console.log('=========================');
    console.log('Monthly (30 days):', packages.monthly);
    console.log('2-Month (60 days):', packages.twoMonth);
    console.log('3-Month (90 days):', packages.threeMonth);
    
    return packages;
  }

  // Get all codes with their status
  static async getCodeSummary(): Promise<{
    total: number;
    unused: number;
    used: number;
    codes: ActivationCode[];
  }> {
    const codes = await SubscriptionManager.getAllCodes();
    
    return {
      total: codes.length,
      unused: codes.filter(c => !c.isUsed).length,
      used: codes.filter(c => c.isUsed).length,
      codes
    };
  }

  // Export codes to CSV format (for your records)
  static async exportCodesToCSV(): Promise<string> {
    const codes = await SubscriptionManager.getAllCodes();
    
    const headers = ['Code', 'Duration (Days)', 'Status', 'Used By', 'Used At', 'Created At'];
    const rows = codes.map(code => [
      code.code,
      code.duration.toString(),
      code.isUsed ? 'Used' : 'Available',
      code.usedBy || '',
      code.usedAt ? code.usedAt.toISOString() : '',
      code.createdAt.toISOString()
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    return csvContent;
  }

  // Download CSV file
  static downloadCodesCSV(): void {
    this.exportCodesToCSV().then(csvContent => {
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `activation-codes-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    });
  }

  // Quick code generation for immediate sale
  static async generateSingleCode(duration: number = 30): Promise<{
    code: string;
    duration: number;
    expiryDate: string;
  }> {
    const code = await SubscriptionManager.generateAndStoreCode(duration);
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + duration);
    
    return {
      code,
      duration,
      expiryDate: expiryDate.toLocaleDateString()
    };
  }
}

// Developer console helpers (you can use these in browser console)
declare global {
  interface Window {
    adminUtils: typeof AdminUtils;
    generateCodes: (count?: number, duration?: number) => Promise<string[]>;
    getCodeSummary: () => Promise<any>;
    downloadCodes: () => void;
    generateQuickCode: (duration?: number) => Promise<any>;
  }
}

// Make admin utilities available in browser console for development
if (typeof window !== 'undefined') {
  window.adminUtils = AdminUtils;
  window.generateCodes = AdminUtils.generateCodeBatch;
  window.getCodeSummary = AdminUtils.getCodeSummary;
  window.downloadCodes = AdminUtils.downloadCodesCSV;
  window.generateQuickCode = AdminUtils.generateSingleCode;
}