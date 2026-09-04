import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Read env variables
const envLocalPath = path.join(process.cwd(), '.env.local');
const envText = fs.readFileSync(envLocalPath, 'utf8');
const env = {};
envText.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
  if (match) {
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[match[1]] = value;
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing Supabase URL or Service Key in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function seed() {
  console.log('--- Seeding Complete Chart of Accounts from Excel ---');
  
  // 1. Ensure Account Types exist
  const accountTypesData = [
    { code: 'asset', name_ar: 'الأصول', name_en: 'Assets', normal_balance: 'debit' },
    { code: 'liability', name_ar: 'الالتزامات', name_en: 'Liabilities', normal_balance: 'credit' },
    { code: 'equity', name_ar: 'حقوق الملكية', name_en: 'Equity', normal_balance: 'credit' },
    { code: 'revenue', name_ar: 'الإيرادات', name_en: 'Revenue', normal_balance: 'credit' },
    { code: 'expense', name_ar: 'المصاريف', name_en: 'Expenses', normal_balance: 'debit' },
    { code: 'contra', name_ar: 'حسابات مقابلة', name_en: 'Contra Accounts', normal_balance: 'debit' }
  ];

  for (const at of accountTypesData) {
    const { error } = await supabase
      .from('account_types')
      .upsert(at, { onConflict: 'code' });
    if (error) console.error(`Error upserting account type ${at.code}:`, error.message);
  }

  // Get Map of Account Types
  const { data: types } = await supabase.from('account_types').select('*');
  const typeMap = {};
  types.forEach(t => { typeMap[t.code] = t.id; });

  // 2. Load Parsed Excel Data
  const parsedPath = path.join(process.cwd(), 'scratch', 'excel_parsed.json');
  const parsedData = JSON.parse(fs.readFileSync(parsedPath, 'utf8'));
  const rawRows = parsedData[0].rows;

  // Skip header rows (index 0 and 1)
  const rows = rawRows.slice(2).filter(r => r && r[0]);

  // English translation dictionary for standard names
  const enTranslations = {
    "الأصول": "Assets",
    "أصول متداولة": "Current Assets",
    "النقد ومايعادله": "Cash & Cash Equivalents",
    "النقدية في الخزينة": "Cash in Safe",
    "العهد النقدية": "Petty Cash & Custodies",
    "النقدية في البنك": "Cash at Bank",
    "حساب البنك الجاري - اسم البنك": "Current Bank Account",
    "المدينون": "Accounts Receivable (Customers)",
    "مصروفات مقدمة": "Prepaid Expenses",
    "تأمين طبي مقدم": "Prepaid Medical Insurance",
    "إيجار مقدم": "Prepaid Rent",
    "مدفوعات مقدمة للموظفين": "Employee Advances",
    "المخزون": "Inventory",
    "أصول غير متداولة": "Non-Current Assets",
    "عقارات وآلات ومعدات": "Property, Plant & Equipment",
    "الأراضي": "Land",
    "المباني": "Buildings",
    "المعدات": "Machinery & Equipment",
    "أجهزة مكتبية وطابعات": "Office Equipment & Printers",
    "الأصول غير الملموسة": "Intangible Assets",
    "العقارات الاستثمارية": "Investment Properties",
    "الالتزامات": "Liabilities",
    "الالتزامات المتداولة": "Current Liabilities",
    "الدائنون": "Accounts Payable (Suppliers)",
    "مصروفات مستحقة": "Accrued Expenses",
    "الرواتب المستحقة": "Accrued Salaries",
    "قروض قصيرة الأجل": "Short-Term Loans",
    "ضريبة القيمة المضافة المستحقة": "VAT Payable",
    "الضرائب المستحقة": "Taxes Payable",
    "إيرادات غير مكتسبة": "Unearned Revenue",
    "مستحقات المؤسسة العامة للتأمينات الاجتماعية": "Social Insurance Payable",
    "مجمع الاستهلاك": "Accumulated Depreciation",
    "مجمع استهلاك المباني": "Accumulated Depreciation - Buildings",
    "مجمع استهلاك المعدات": "Accumulated Depreciation - Equipment",
    "مجمع استهلاك أجهزة مكتبية وطابعات": "Accumulated Depreciation - Office Equipment",
    "التزامات غير متداولة": "Non-Current Liabilities",
    "قروض طويلة أجل": "Long-Term Loans",
    "مخصص مكافأة نهاية الخدمة": "End of Service Provision",
    "حقوق الملكية": "Equity",
    "رأس المال": "Capital",
    "رأس المال المسجل": "Registered Capital",
    "رأس المال الإضافي المدفوع": "Additional Paid-In Capital",
    "حقوق ملكية أخرى": "Other Equity",
    "أرصدة افتتاحية": "Opening Balances",
    "احتياطيات": "Reserves",
    "احتياطي نظامي": "Statutory Reserve",
    "احتياطي ترجمة عملات أجنبية": "Foreign Currency Reserve",
    "الأرباح المبقاة (أو الخسائر)": "Retained Earnings",
    "الأرباح والخسائر العاملة": "Current Period Profit/Loss",
    "الإيرادات": "Revenues",
    "الإيرادات التشغيلية": "Operating Revenues",
    "إيرادات المبيعات/ الخدمات": "Sales & Service Revenues",
    "الإيرادات غير التشغيلية": "Non-Operating Revenues",
    "إيرادات أخرى": "Other Revenues",
    "المصاريف": "Expenses",
    "التكاليف المباشرة": "Direct Costs (COGS)",
    "تكلفة البضاعة المباعة": "Cost of Goods Sold",
    "رواتب وأجور": "Direct Salaries & Wages",
    "عمولات البيع": "Sales Commissions",
    "شحن وتخليص جمركي": "Freight & Customs",
    "التكاليف التشغيلية": "Operating Expenses (OPEX)",
    "الرواتب والرسوم الإدارية": "Administrative Salaries",
    "تأمين طبي": "Medical Insurance",
    "مصاريف تسويقية ودعائية": "Marketing & Advertising",
    "مصاريف الإيجار": "Rent Expense",
    "عمولات وحوافز": "Incentives & Bonuses",
    "تذاكر سفر": "Travel Tickets",
    "التأمينات الاجتماعية": "Social Security Expense",
    "الرسوم الحكومية": "Government Fees",
    "رسوم واشتراكات": "Subscriptions & Licenses",
    "مصاريف خدمات المكتب": "Utilities & Communication",
    "مصاريف مكتبية ومطبوعات": "Stationery & Printing",
    "مصاريف ضيافة": "Hospitality Expense",
    "عمولات بنكية": "Bank Charges",
    "مصاريف أخرى": "Other Expenses",
    "مصاريف الإهلاك": "Depreciation Expense",
    "مصروف إهلاك المباني": "Depreciation - Buildings",
    "مصروف إهلاك المعدات": "Depreciation - Equipment",
    "مصروف إهلاك أجهزة مكتبية وطابعات": "Depreciation - Office Equipment",
    "مصروف نقل ومواصلات": "Transportation Expense",
    "مصاريف غير التشغيلية": "Non-Operating Expenses",
    "الزكاة": "Zakat",
    "الضرائب": "Income Tax",
    "ترجمة عملات أجنبية": "Foreign Exchange Loss",
    "فوائد": "Interest Expense"
  };

  // Helper to map type
  function getTypeCode(code) {
    const mainDigit = code[0];
    switch (mainDigit) {
      case '1': return 'asset';
      case '2': return 'liability';
      case '3': return 'equity';
      case '4': return 'revenue';
      case '5': return 'expense';
      default: return 'asset';
    }
  }

  // Pre-pass: Build account objects and find child relationships
  const accountList = [];
  const parentCodeSet = new Set();

  for (const r of rows) {
    const code = String(r[0]).trim();
    const name_ar = String(r[1]).trim();
    const desc = r[3] ? String(r[3]).trim() : null;
    const parentField = r[4] ? String(r[4]).trim() : null;

    let parent_code = null;
    if (parentField && parentField.includes('-')) {
      parent_code = parentField.split('-')[0].trim();
    } else if (code.length === 2) {
      parent_code = code[0];
    } else if (code.length === 4) {
      parent_code = code.slice(0, 2);
    } else if (code.length === 6) {
      parent_code = code.slice(0, 4);
    }

    if (parent_code) parentCodeSet.add(parent_code);

    let level = 1;
    if (code.length === 2) level = 2;
    else if (code.length === 4) level = 3;
    else if (code.length >= 6) level = 4;

    const type_code = getTypeCode(code);
    const name_en = enTranslations[name_ar] || name_ar;

    accountList.push({
      code,
      name_ar,
      name_en,
      type_code,
      parent_code,
      level,
      description: desc
    });
  }

  // Sort by level so parents are created before children
  accountList.sort((a, b) => a.level - b.level);

  console.log(`Found ${accountList.length} accounts to seed/upsert.`);

  // Map to store inserted code -> DB UUID
  const codeToIdMap = {};

  for (const acc of accountList) {
    const is_header = parentCodeSet.has(acc.code);
    const parent_id = acc.parent_code ? (codeToIdMap[acc.parent_code] || null) : null;
    const account_type_id = typeMap[acc.type_code];

    const payload = {
      account_code: acc.code,
      name_ar: acc.name_ar,
      name_en: acc.name_en,
      account_type_id,
      parent_id,
      level: acc.level,
      is_header,
      is_active: true,
      description: acc.description
    };

    const { data, error } = await supabase
      .from('chart_of_accounts')
      .upsert(payload, { onConflict: 'account_code' })
      .select('id, account_code')
      .single();

    if (error) {
      console.error(`Error inserting account ${acc.code} (${acc.name_ar}):`, error.message);
    } else {
      codeToIdMap[data.account_code] = data.id;
    }
  }

  console.log('✅ Successfully seeded all 78 Chart of Accounts items!');
}

seed().catch(err => {
  console.error('Fatal error in seed:', err);
  process.exit(1);
});
