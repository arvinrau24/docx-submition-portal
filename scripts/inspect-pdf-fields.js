/**
 * PDF Field Inspector
 * Run this to see all fillable fields in your PDF templates
 */

const { listPdfFields } = require('../backend/pdf-filler');
const path = require('path');

async function inspectPdf(pdfPath, templateName) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📄 ${templateName}`);
  console.log(`${'='.repeat(60)}`);
  
  try {
    const fields = await listPdfFields(pdfPath);
    
    if (fields.length === 0) {
      console.log('⚠️  No form fields found. This PDF may not be a fillable form.');
      return;
    }
    
    console.log(`\nFound ${fields.length} form fields:\n`);
    
    fields.forEach((field, index) => {
      console.log(`${index + 1}. [${field.type.toUpperCase()}] ${field.name}`);
    });
    
    console.log('\n' + '='.repeat(60));
    
  } catch (err) {
    console.error(`❌ Error inspecting ${templateName}:`, err.message);
  }
}

async function main() {
  const PROJECT_ROOT = path.join(__dirname, '..');
  
  console.log('\n🔍 PDF Template Field Inspector\n');
  console.log('This tool shows all fillable fields in your PDF templates.');
  console.log('Use these field names to map your form data.\n');
  
  // Inspect both PDFs
  await inspectPdf(
    path.join(PROJECT_ROOT, 'public', 'TNGSB Due Diligence Form.pdf'),
    'TNGSB Due Diligence Form'
  );
  
  await inspectPdf(
    path.join(PROJECT_ROOT, 'public', 'Customer Onboarding Form 01.pdf'),
    'Customer Onboarding Form'
  );
  
  console.log('\n✅ Inspection complete!\n');
  console.log('Next steps:');
  console.log('1. Review the field names above');
  console.log('2. Update backend/template-defs.js with the correct mappings');
  console.log('3. Test filling a form with real data\n');
}

main().catch(console.error);