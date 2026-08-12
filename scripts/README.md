Scripts README
===============

Overview
--------
This README describes the utility scripts in the scripts/ folder and the lightweight test scripts in tests/. These are handwritten Node.js command-line utilities used for PDF inspection, PDF generation, coordinate measurement, and automated integration-style tests that exercise the application server.

Prerequisites
-------------
- Node.js (v14+ recommended)
- Install project dependencies before running scripts:
  - From the project root: npm install
- Many test scripts expect the web server to be running (npm start) on the default port (http://localhost:3000).

How to run
----------
From the project root run:

  node scripts/<script-name>.js

Some scripts include a shebang (#!/usr/bin/env node) and can be made executable on Unix-like systems, but on Windows use the node command above.

Scripts (scripts/)
------------------
- analyze-due-diligence-pdf.js
  - Purpose: Analyze the TNG Due Diligence PDF structure and print page/text info. Useful to get a text preview and page counts.
  - Usage: node scripts/analyze-due-diligence-pdf.js

- analyze-tng-pdf.js
  - Purpose: Similar to analyze-due-diligence-pdf.js (TNG-specific PDF analysis).
  - Usage: node scripts/analyze-tng-pdf.js

- create-filled-test-pdf.js
  - Purpose: Create a small filled PDF for quick visual checks (uses sample data).
  - Usage: node scripts/create-filled-test-pdf.js

- create-test-client-with-dd.js
  - Purpose: Inserts a test client and a fully filled due diligence form into the local SQLite database (data/app.db). Helpful for manual testing and PDF generation.
  - Usage: node scripts/create-test-client-with-dd.js
  - Notes: This script writes to data/app.db. Avoid running on production databases.

- extract-pdf-coordinates.js
  - Purpose: Helpers to extract coordinates or measurements from PDFs for template alignment.
  - Usage: node scripts/extract-pdf-coordinates.js

- extract-tng-coordinates.js
  - Purpose: TNG-specific coordinate extraction helper.
  - Usage: node scripts/extract-tng-coordinates.js

- generate-full-test-tng-pdf.js
  - Purpose: Generate a fully filled TNG PDF using current field coordinate mappings (used to verify alignment across all fields).
  - Usage: node scripts/generate-full-test-tng-pdf.js

- generate-test-tng-pdf.js
  - Purpose: Create a sample filled TNG Due Diligence PDF (smaller sample set) and save to public/ for inspection.
  - Usage: node scripts/generate-test-tng-pdf.js

- inspect-header-positions.js
  - Purpose: Inspect and print header positions for fine-grained alignment adjustments.
  - Usage: node scripts/inspect-header-positions.js

- inspect-pdf-fields.js
  - Purpose: Lists all form fields found inside the configured PDF templates. Use this to validate field names and counts.
  - Usage: node scripts/inspect-pdf-fields.js

- inspect-tng-coordinates.js
  - Purpose: Inspect coordinates for TNG-specific PDF templates.
  - Usage: node scripts/inspect-tng-coordinates.js

- measure-spacebar.js
  - Purpose: Uses pdf-lib to measure the width of a space character at various font sizes. Useful when tuning small X offsets for alignment.
  - Usage: node scripts/measure-spacebar.js

- test-due-diligence-pdf.js
  - Purpose: End-to-end test that loads the due diligence template, prepares sample test data (including a signature), generates a PDF buffer, and writes it to public/TEST_DUE_DILIGENCE_FORM.pdf.
  - Usage: node scripts/test-due-diligence-pdf.js

- test-pdf-fill.js
  - Purpose: Misc test helper for PDF filling code paths.
  - Usage: node scripts/test-pdf-fill.js

- test-tng-generation.js
  - Purpose: Test script for TNG PDF generation flows.
  - Usage: node scripts/test-tng-generation.js

Tests (tests/)
--------------
The tests/ folder contains simple integration-style scripts that interact with a running server to create test clients and submit forms.

- add-new-client-filled.js
  - Purpose: Automates creating a new client (via the admin UI endpoints) with all fields filled and checks that the server returns the created client and temporary password.
  - Usage: node tests/add-new-client-filled.js
  - Notes: Requires the server to be running (npm start).

- coordinate-verification-test.js
  - Purpose: Creates a client with all fields filled and all checkboxes checked; used to verify PDF coordinates/positioning when the onboarding PDF is downloaded.
  - Usage: node tests/coordinate-verification-test.js

- fill-test-form.js
  - Purpose: End-to-end script that creates a test client, logs in as that client, fills the due diligence form, saves draft and then submits.
  - Usage: node tests/fill-test-form.js
n
Important notes
---------------
- None of the scripts are compiled artifacts — they are handwritten Node.js utilities. The large number of .js files in the repository is caused by node_modules (installed dependencies), which is normal for Node projects.
- node_modules/ is listed in .gitignore; do NOT commit node_modules to the repository.
- Many scripts write to data/app.db or public/ (PDF outputs). Avoid running on production databases and back up data if necessary.

Contributing
------------
If adding or changing scripts, follow these guidelines:
- Document the script in this README with expected inputs, outputs, and any side effects.
- Prefer environment variables or CLI args for destructive scripts (e.g., database writes).

Questions or next steps
----------------------
If desired, a top-level README.md can be drafted that summarizes the entire repository and developer workflow. If preferred, the scripts' README can be expanded with example outputs and sample command lines.

Files referenced in this README:
- scripts/ (folder): C:/Users/User/Desktop/web_agreement_docx/scripts
- tests/ (folder): C:/Users/User/Desktop/web_agreement_docx/tests


Archived duplicates (moved to scripts/archived):
- analyze-tng-pdf.js
- extract-tng-coordinates.js
- inspect-tng-coordinates.js
- generate-full-test-tng-pdf.js
- test-tng-generation.js
\nThese files were moved to reduce duplication; they are recoverable in scripts/archived/ if needed.
