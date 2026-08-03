const initSqlJs = require('sql.js');
const fs = require('fs');
async function main() {
  const SQL = await initSqlJs();
  const buf = fs.readFileSync('C:\\Users\\User\\Desktop\\web_agreement_docx\\data\\portal.db');
  const db = new SQL.Database(buf);
  const users = db.exec('SELECT id, username, role, password_changed FROM users');
  console.log('Users:', JSON.stringify(users, null, 2));
  const clients = db.exec('SELECT id, client_id, user_id FROM clients');
  console.log('Clients:', JSON.stringify(clients, null, 2));
}
main();
