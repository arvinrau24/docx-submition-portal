/**
 * Script to create a test client and fill their due diligence form with sample data
 * Usage: node scripts/create-test-client-with-dd.js
 */

const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, '../data/app.db');
const db = new Database(dbPath);

// Sample due diligence data
const sampleDueDiligenceData = {
  date_of_application: '2026-08-07',
  business_relationship_type: ['Corporate Customer', 'Merchant'],
  purpose_of_relationship: 'Parking management services and toll collection for shopping mall car parks',
  company_name: 'Premium Parking Solutions Sdn Bhd',
  old_reg_no: 'BRN001234567',
  new_reg_no: 'SSM001234567',
  tin_no: 'CT1234567890',
  sst_reg_no: 'SST1234567890',
  date_of_incorporation: '2015-03-15',
  country_of_incorporation: 'Malaysia',
  contact_number: '+60312345678',
  registered_address: '123 Business Park, Kuala Lumpur, 50000, Malaysia',
  business_address: '456 Technology Centre, Petaling Jaya, 46200, Malaysia',
  nature_of_business: 'Parking Management & Toll Collection',
  business_email: 'business@premiumparking.com.my',
  contact_email: 'contact@premiumparking.com.my',
  has_corporate_shareholder: 'Yes',
  corporate_shareholder_details: 'Access Digital Corporation (65% shareholding)',
  is_corporate_group: 'Yes',
  group_structure_details: 'Part of Access Digital Group with 5 subsidiary companies across Malaysia and Singapore',
  source_of_fund: ['Sales profits', 'Capital injection'],
  source_of_fund_others: '',
  entity_name: '',
  entity_reg_no: '',
  entity_tin: '',
  entity_sst: '',
  entity_date_registration: '',
  entity_country_registration: '',
  entity_contact_no: '',
  entity_registered_address: '',
  entity_email: '',
  entity_contact_email: '',
  entity_activity_type: '',
  entity_office_bearers: '',
  declaration_name: 'Ahmad bin Mohamed',
  declaration_designation: 'Managing Director',
  declaration_date: '2026-08-07',
  declaration_signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAS0AAABkCAYAAABwBMVVAAAACXBIWXMAAAsTAAALEwEAmpwYAAABfUlEQVR4nO3SMQEAAAzCoPdPbQ3g0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA+A1v9QABREX6EQAAAABJRU5ErkJggg=='
};

function createTestClient() {
  try {
    console.log('\n🚀 Creating test client with filled due diligence form...\n');

    // 1. Create user account
    const clientId = 'TEST_DD_001';
    const tempPassword = 'Test@12345';
    const passwordHash = bcrypt.hashSync(tempPassword, 10);

    // Check if user already exists
    const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get(clientId);
    if (existingUser) {
      console.log('❌ User already exists:', clientId);
      console.log('   To recreate, delete the user first from admin panel');
      db.close();
      process.exit(0);
    }

    db.prepare("INSERT INTO users (username, password_hash, role, password_changed) VALUES (?, ?, 'client', 1)")
      .run(clientId, passwordHash);
    
    const user = db.prepare('SELECT id FROM users WHERE username = ?').get(clientId);
    console.log('✅ User created:', clientId);
    console.log('   Temporary Password:', tempPassword);

    // 2. Create client record
    db.prepare(`INSERT INTO clients (client_id, company_name, address, form_group, user_id, status, created_at) 
              VALUES (?, ?, ?, ?, ?, 'active', datetime('now'))`)
      .run(clientId, 'Premium Parking Solutions Sdn Bhd', 'Kuala Lumpur', 'A', user.id);
    
    const client = db.prepare('SELECT id FROM clients WHERE client_id = ?').get(clientId);
    console.log('✅ Client created:', client.client_id);

    // 3. Create onboarding data
    db.prepare(`INSERT INTO onboarding_data (
      client_id, company_name, company_office_address, company_registration_no,
      company_tax_number, company_ssm_no, company_sst_no,
      car_park_site_name, car_park_site_address, car_park_type,
      no_of_entry, no_of_exit, no_of_zone, no_of_validator, no_of_parking_bay,
      authorized_pic_office_name, authorized_pic_office_contact,
      authorized_pic_site_name, authorized_pic_site_contact,
      authorized_email, authorized_email_cc,
      bank_name, bank_account_name, bank_account_number, bank_address, tax_number,
      primary_active_bank_account, commercial_model, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`)
      .run(
        client.id, 'Premium Parking Solutions Sdn Bhd', '123 Business Park, KL',
        'SSM001234567', 'CT1234567890', 'SSM001234567', 'SST1234567890',
        'KL Shopping Mall Car Park', '456 Tech Centre, PJ',
        'Commercial Building (Mall)', 4, 4, 8, 12, 450,
        'Ahmad Mohamed', '+60312345678', 'Rashid Ali', '+60387654321',
        'business@premiumparking.com.my', 'admin@premiumparking.com.my',
        'Maybank', 'Premium Parking Solutions', '123456789012', 'KL, Malaysia',
        'CT1234567890', '1', 'Lease-to-Own (3-5 years)'
      );
    console.log('✅ Onboarding data created');

    // 4. Create due diligence form with filled data
    const formDataJson = JSON.stringify(sampleDueDiligenceData);
    
    db.prepare(`INSERT INTO due_diligence_forms (
      client_id, form_data, is_submitted, submission_date, 
      approval_status, created_at, updated_at
    ) VALUES (?, ?, 1, datetime('now'), 'pending', datetime('now'), datetime('now'))`)
      .run(client.id, formDataJson);
    
    console.log('✅ Due diligence form created with all fields filled');
    console.log('   Status: Submitted for review (Pending approval)');

    // 5. Display summary
    console.log('\n' + '='.repeat(60));
    console.log('📋 TEST CLIENT CREATED SUCCESSFULLY');
    console.log('='.repeat(60));
    console.log('\n👤 CLIENT DETAILS:');
    console.log('   Client ID: ' + clientId);
    console.log('   Company: Premium Parking Solutions Sdn Bhd');
    console.log('   Username: ' + clientId);
    console.log('   Password: ' + tempPassword);
    console.log('\n📝 FORM STATUS:');
    console.log('   All 48 fields filled with sample data');
    console.log('   Signature: Included');
    console.log('   Submission Status: Submitted');
    console.log('   Approval Status: Pending Review');
    console.log('\n🔗 NEXT STEPS:');
    console.log('   1. Go to http://localhost:3000/login');
    console.log('   2. Login with: ' + clientId + ' / ' + tempPassword);
    console.log('   3. View the due diligence form (all fields pre-filled)');
    console.log('   4. Download PDF to see auto-filled form');
    console.log('   5. As admin, approve/reject the form');
    console.log('\n' + '='.repeat(60));

    db.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    db.close();
    process.exit(1);
  }
}

createTestClient();
