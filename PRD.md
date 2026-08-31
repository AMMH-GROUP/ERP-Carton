# ERP System for Corrugated Carton Factory
## Product Requirements Document (PRD) — Version 1.0

**Product Type:** Web-based ERP / PWA  
**Business:** Corrugated Carton Manufacturing Factory  
**Database:** Supabase Online / PostgreSQL  
**Authentication:** Supabase Auth  
**Storage:** Supabase Storage  
**Languages:** Arabic + English  
**Currency:** EGP  
**VAT:** 14% default, configurable  
**Architecture:** Modular ERP with role-based access control  
**Deployment:** Production-ready PWA

---

# 1. Product Vision

Build a complete ERP system for a corrugated carton factory that manages the complete business lifecycle:

**Customer → Quotation → Pricing → Sales Order → Stock Reservation → Production → Material Consumption → WIP → QC → Finished Goods → Delivery → Invoice → Payment → Accounting**

The system must also manage:

- Purchasing
- Suppliers
- Warehouses
- Inventory
- Manufacturing
- Quality Control
- Maintenance
- Expenses
- Treasury
- Banking
- Accounts Receivable
- Accounts Payable
- General Ledger
- Reporting
- Users
- Roles
- Permissions
- Approvals
- Audit Logs

The system must be designed as a real ERP, not as a collection of disconnected CRUD screens.

---

# 2. Core Principles

The application must follow these principles:

1. Every important business transaction must have a document.
2. Important transactions must have status transitions.
3. Inventory movements must be traceable.
4. Financial transactions must create accounting entries.
5. Posted accounting documents cannot simply be deleted.
6. All sensitive actions must be auditable.
7. Permissions must be enforced server-side.
8. Users must only see data/modules/actions allowed by their permissions.
9. Arabic and English must be supported from the beginning.
10. All major configuration values should be configurable instead of hard-coded.
11. The system must support one factory now while keeping the architecture extensible.
12. The system must be responsive and installable as a PWA.

---

# 3. Technology Requirements

## Frontend

Recommended:

- Next.js
- TypeScript
- Responsive UI
- PWA support
- Arabic RTL
- English LTR

## Backend / Platform

Use Supabase Online:

- PostgreSQL
- Supabase Auth
- Supabase Storage
- Row Level Security
- Database Functions / RPC where appropriate
- Server-side business logic for sensitive transactions

Do not expose privileged Supabase credentials to the browser.

---

# 4. Localization

The system must support:

- Arabic
- English

Every user can select their preferred language.

UI must support:

- RTL for Arabic
- LTR for English

Master data that users see should support Arabic and English names where applicable.

Documents such as:

- Quotations
- Sales Orders
- Invoices
- Purchase Orders
- Delivery Notes
- Payment Receipts

must support Arabic and English templates.

---

# 5. Currency and Tax

Default currency:

**EGP**

Default VAT:

**14%**

Tax configuration must be editable from Settings.

The architecture should support future currencies/taxes, but MVP focuses on EGP.

---

# 6. Authentication

Use Supabase Auth.

Required:

- Email/password login
- Password reset
- Email verification
- Session management
- User activation/deactivation

2FA is not required for MVP.

---

# 7. User Management

Admin can manage:

- Users
- Employees
- Roles
- Permissions
- User activation/deactivation
- Role assignment
- Password reset

Relationship:

**User → Employee → Role(s) → Permissions**

The system should support assigning more than one role if required.

---

# 8. Role-Based Access Control

Initial roles:

- Super Admin
- Factory Manager
- Sales
- Purchasing
- Warehouse
- Production Manager
- Production Operator
- QC
- Maintenance
- Accountant

Admin must be able to create custom roles.

Permissions should be granular.

Minimum permission types:

- View
- Create
- Edit
- Delete
- Approve
- Post
- Cancel
- Export
- Print

Permissions must be enforced server-side, not only hidden in the UI.

---

# 9. Approval Engine

The system must have a reusable approval mechanism.

Approval requests should contain:

- Document
- Requester
- Approver
- Status
- Requested Date
- Approval Date
- Comments
- Rejection Reason

Statuses:

- Pending
- Approved
- Rejected
- Cancelled

The approval system should be reusable for:

- Purchase Requests
- Expenses
- Discount Overrides
- Credit Limit Exceptions
- Production exceptions
- Payment approvals
- Inventory adjustments
- Other configured workflows

---

# 10. Approval Delegation

Managers can delegate approvals to another authorized user.

Delegation contains:

- Original Approver
- Delegate
- Start Date
- End Date
- Approval Types
- Status

All delegated approvals must be recorded in Audit Logs.

---

# 11. Customers

Customer Master Data:

- Customer Code
- Arabic Name
- English Name
- Phone
- Email
- Address
- Tax Number
- Payment Terms
- Credit Limit
- Status
- Notes
- Attachments

Customer screen must show:

- Orders
- Quotations
- Deliveries
- Invoices
- Payments
- Outstanding Balance
- Account Statement
- Aging
- Credit utilization

---

# 12. Products

Product Master Data:

- Product Code
- Arabic Name
- English Name
- Category
- Product Type
- Unit of Measure
- Active/Inactive
- QC Required
- Costing configuration
- Pricing configuration

Not every field should be required.

---

# 13. Product Specifications

Support configurable specifications such as:

- Length
- Width
- Height
- Weight
- GSM
- Board Type
- Flute
- Printing
- Colors
- Die Cut
- Folding
- Glue

Specifications can be optional depending on product type.

The system must support both:

### Standard Product Specification

Saved as part of product master data.

### Custom Order Specification

Sales can specify different dimensions/specifications for an individual order.

Example:

Product A:

Order 1 = 30 × 20 × 15

Order 2 = 40 × 30 × 20

Both can reference the same product while having different order specifications.

---

# 14. Units of Measure

The system must support quantity handling by:

- PCS
- KG
- Meter
- Square Meter
- Other configurable units

Products can have a default UOM.

The manufacturing system must support both:

- Weight-based calculation
- Dimension/area-based calculation

---

# 15. Pricing Engine

Pricing must be automatically calculated.

The pricing engine can consider:

- Raw Material Cost
- Labor Cost
- Machine Cost
- Waste
- Scrap
- Overhead
- Profit Margin
- Quantity
- Dimensions
- Weight
- Area
- Product Specification

Basic calculation:

**Estimated Cost = Material + Labor + Machine + Waste + Overhead**

Then:

**Selling Price = Estimated Cost + Profit Margin**

VAT is calculated afterward.

---

# 16. Manual Price Override

Sales users with permission can modify the system-generated price.

The system must preserve:

- Original calculated price
- New price
- Difference
- User
- Date/time
- Reason

If the override violates configured rules, Manager Approval is required.

---

# 17. Quotation

Sales can create:

**Quotation**

Fields:

- Quotation Number
- Customer
- Date
- Valid Until
- Items
- Specifications
- Quantity
- Unit Price
- Discount
- VAT
- Total
- Payment Terms
- Delivery Terms
- Notes
- Attachments

Statuses:

- Draft
- Pending Approval
- Sent
- Accepted
- Rejected
- Expired
- Cancelled
- Converted

Quotation can be converted into Sales Order.

---

# 18. Sales Order

Sales Order contains:

- SO Number
- Customer
- Quotation reference
- Products
- Specifications
- Quantity
- Price
- Discount
- VAT
- Total
- Delivery terms
- Payment terms
- Requested delivery date
- Notes

Statuses:

- Draft
- Pending Approval
- Confirmed
- Reserved
- Partially Produced
- Ready
- Partially Delivered
- Delivered
- Cancelled
- Closed

---

# 19. Customer Credit Check

Before confirming a Sales Order:

Calculate:

**Existing Outstanding + New Order Exposure**

Compare against:

**Customer Credit Limit**

If exceeded:

- Warning
- Manager Approval required

Manager can:

- Approve
- Reject

Approval must be audited.

---

# 20. Stock Reservation

After Sales Order confirmation:

System checks Finished Goods availability.

Example:

Order = 10,000

Available = 4,000

System creates:

Reserved = 4,000

Production Required = 6,000

Reserved stock cannot be allocated to another order unless reservation is released/cancelled according to permission.

---

# 21. Warehouses

Initial warehouse types:

1. Raw Materials
2. WIP
3. Finished Goods
4. Spare Parts
5. Packaging Materials

Architecture should support additional warehouses.

Warehouse operations must include:

- Receipt
- Issue
- Transfer
- Reservation
- Adjustment
- Stock Count

---

# 22. Inventory Ledger

Every stock movement must create an immutable inventory transaction.

Transaction types:

- Purchase Receipt
- Material Issue
- Production Receipt
- Delivery
- Sales Return
- Purchase Return
- Warehouse Transfer
- Adjustment
- Scrap
- Rework Consumption

Each transaction must contain:

- Item
- Quantity
- UOM
- Source Warehouse
- Destination Warehouse where applicable
- Reference Document
- User
- Date/time

---

# 23. Stock Transfers

Support warehouse-to-warehouse transfers.

Example:

Raw Materials → Production/WIP

Finished Goods Warehouse → another warehouse

Transfer must have:

- Source
- Destination
- Items
- Quantities
- Requester
- Executor
- Status

---

# 24. Production Orders

Production Order is created from Sales Order when required.

Fields:

- MO Number
- Sales Order
- Customer
- Product
- Specification
- Planned Quantity
- Priority
- Machine
- Planned Start
- Planned End
- Estimated Cost
- Actual Cost

Statuses:

- Draft
- Planned
- Released
- In Progress
- Paused
- Completed
- QC Pending
- Approved
- Closed
- Cancelled

---

# 25. Production Capacity

MVP supports simple capacity calculation.

Example:

Machine Capacity:

1,000 cartons/hour

Order:

5,000 cartons

Estimated Production Time:

5 hours

Production Manager can define:

- Machine
- Priority
- Planned Start
- Planned End

No advanced optimization scheduling in MVP.

---

# 26. BOM / Manufacturing Formula

BOM/Formula supports:

### A — Fixed Quantity

### B — Per Unit

### C — Dimension Based

### D — Weight / Area Based

The system calculates material requirements based on product specification and quantity.

---

# 27. Material Requirement

For each Production Order:

System calculates:

- Required Material
- Required Quantity
- Available Quantity
- Reserved Quantity
- Shortage

Example:

Required = 5,000 KG

Available = 2,000 KG

Shortage = 3,000 KG

---

# 28. Material Request

Production creates Material Request.

Workflow:

**Production → Material Request → Warehouse → Material Issue → WIP**

Warehouse executes the issue.

Production users cannot directly manipulate warehouse stock.

---

# 29. Material Shortage

Production supports Partial Production.

If required material is unavailable:

- Show shortage warning
- Allow available quantity to be issued
- Allow partial production
- Keep Production Order open
- Track remaining material requirement

---

# 30. WIP

WIP is a real inventory stage.

Flow:

**Raw Material → WIP → Finished Goods**

WIP must have stock quantities and valuation.

---

# 31. Production Execution

Production Operator records:

- Produced Quantity
- Scrap
- Waste
- Rework Quantity
- Machine Hours
- Downtime
- Start Time
- End Time
- Operator

Partial production is supported.

---

# 32. Actual Material Consumption

System compares:

**Planned Consumption**

vs

**Actual Consumption**

Calculate:

**Variance = Actual - Planned**

If variance exceeds configurable threshold:

**Manager Approval required**

---

# 33. Quality Control

QC can be:

- Full Inspection
- Sampling

Inspection fields may include:

- Dimensions
- GSM
- Board Type
- Flute
- Printing
- Colors
- Folding
- Glue
- Other configurable checks

Results:

- Passed
- Partial
- Failed
- Rework
- Scrap

---

# 34. Rework

Rework must create a separate document:

**Rework Order**

It must reference:

**Original Production Order**

Example:

Original MO = MO-001

Rework = RW-001

Quantity = 200

Reason = Printing Defect

Rework must have its own:

- Material Consumption
- Production Time
- Cost
- QC
- Final Result

---

# 35. Finished Goods

Only QC-approved production can enter:

**Finished Goods Warehouse**

Rejected goods must not be automatically treated as Finished Goods.

---

# 36. Scrap

Scrap must be tracked separately.

Track:

- Quantity
- Reason
- Production Order
- Material
- Cost
- User
- Date

Scrap must affect costing according to configured accounting policy.

---

# 37. Manufacturing Cost

Estimated Cost includes:

- Material
- Labor
- Machine
- Waste
- Overhead

Actual Cost includes:

- Actual Material Consumption
- Actual Labor
- Actual Machine Time
- Waste
- Scrap
- Rework
- Allocated Overhead

---

# 38. Overhead Allocation

Support overhead categories:

- Electricity
- Factory Rent
- Utilities
- Depreciation
- Indirect Labor
- Other Factory Overheads

Allocation methods:

- Machine Hours
- Production Quantity
- Material Cost
- Direct Labor
- Manual Allocation

Allocation rules must be configurable.

---

# 39. Sales Order Profitability

Each Sales Order must show:

### Estimated

- Revenue
- Cost
- Profit
- Margin

### Actual

- Revenue
- Cost
- Profit
- Margin

### Variance

- Amount
- Percentage
- Reasons

Possible variance reasons:

- Material Over Consumption
- Waste
- Scrap
- Rework
- Machine Downtime
- Labor
- Overhead

---

# 40. Purchasing

Workflow:

**Purchase Request → Manager Approval → RFQ → Supplier Quotations → Comparison → Purchase Order → Goods Receipt → QC if required → Supplier Invoice → 3-Way Match → Payment**

---

# 41. Purchase Request

Any authorized user may create Purchase Request based on permissions.

Fields:

- PR Number
- Requester
- Department
- Item
- Quantity
- Required Date
- Reason
- Reference
- Attachments

Manager approval is required.

---

# 42. Approved Suppliers

Purchasing must use approved suppliers.

Supplier status:

- Pending
- Approved
- Suspended
- Inactive

---

# 43. RFQ

Purchasing can create RFQ for multiple approved suppliers.

Supplier quotation should capture:

- Supplier
- Item
- Quantity
- Unit Price
- VAT
- Delivery Time
- Payment Terms
- Validity
- Notes

---

# 44. Supplier Comparison

System compares supplier offers by:

- Price
- Payment Terms
- Delivery
- Other configured factors

Purchasing selects supplier.

---

# 45. Purchase Order

PO includes:

- PO Number
- Supplier
- Items
- Quantity
- Unit Price
- Discount
- VAT
- Total
- Payment Terms
- Delivery Terms
- Expected Date

---

# 46. Partial Receiving

One PO can have multiple Goods Receipts.

Example:

PO = 3,000 KG

Receipt 1 = 1,000

Receipt 2 = 1,000

Receipt 3 = 1,000

PO remains Partially Received until complete.

---

# 47. Raw Material QC

Each item has:

**QC Required = Yes/No**

If Yes:

**Goods Receipt → QC → Warehouse**

If No:

**Goods Receipt → Warehouse**

---

# 48. Supplier Invoice

Supplier Invoice must support:

- Invoice Number
- Supplier
- PO
- Goods Receipt
- Date
- Due Date
- Items
- Quantity
- Price
- VAT
- Total
- Payment Status

---

# 49. Three-Way Matching

Compare:

**Purchase Order**

vs

**Goods Receipt**

vs

**Supplier Invoice**

Check:

- Supplier
- Quantity
- Price
- VAT
- Total

Variance behavior:

**Warning + Approval**

Do not silently post mismatched invoices.

---

# 50. Accounts Payable

Supplier account must show:

- Invoices
- Payments
- Credit Notes
- Outstanding Balance
- Aging
- Statement

---

# 51. Delivery

Delivery can be created/executed by:

- Sales
- Warehouse

based on permissions.

System must validate:

- Ordered Quantity
- Reserved Quantity
- Available Quantity
- Already Delivered Quantity

Partial Delivery is supported.

---

# 52. Delivery Workflow

Example:

Order = 10,000

Delivery 1 = 4,000

Delivery 2 = 3,000

Delivery 3 = 3,000

System tracks:

Ordered = 10,000

Delivered = 10,000

Remaining = 0

---

# 53. Sales Invoice

Support configurable invoicing:

### Option 1

Invoice after Delivery

### Option 2

Advance Invoice

Invoice includes:

- Invoice Number
- Customer
- Sales Order
- Delivery
- Items
- Quantity
- Price
- Discount
- VAT
- Total
- Paid
- Remaining
- Due Date

---

# 54. Invoice Status

Statuses:

- Draft
- Posted
- Partially Paid
- Paid
- Overdue
- Cancelled

Posted invoices cannot be deleted.

Corrections must use:

- Credit Note
- Reversal

---

# 55. Customer Payments

Support configurable payment methods:

- Cash
- Bank Transfer
- Cheque
- Credit
- Other

Payment can be allocated to:

- One invoice
- Multiple invoices

---

# 56. Accounts Receivable

Customer account must show:

- Invoices
- Payments
- Credit Notes
- Outstanding
- Aging
- Statement
- Credit Limit
- Credit Utilization

---

# 57. Treasury

System supports multiple cash accounts.

Examples:

- Main Cash
- Petty Cash
- Factory Cash

Also support multiple bank accounts.

---

# 58. Cash Transactions

Every cash transaction must update the corresponding account balance.

Formula:

**Opening Balance + Receipts - Payments + Transfers = Current Balance**

Balances must not be manually edited.

---

# 59. Cash Transfers

Support:

**Cash → Cash**

Example:

Main Cash:

-10,000

Petty Cash:

+10,000

Transfers are not expenses or revenue.

---

# 60. Daily Cash Closing

At end of day:

System Balance

vs

Physical Count

Example:

System = 120,000

Physical = 119,500

Variance = -500

User must provide variance reason.

Approval is required according to configurable threshold.

---

# 61. Bank Reconciliation

Accountant can reconcile:

**ERP Bank Balance**

against:

**Actual Bank Statement**

Transactions can be:

- Matched
- Unmatched
- Adjusted

---

# 62. Expenses

Workflow:

**Employee → Expense Request → Manager Approval → Accountant → Payment → Cash/Bank → Journal Entry**

Expense Request:

- Employee
- Category
- Amount
- VAT
- Date
- Department
- Description
- Attachment
- Payment Method
- Account
- Approval
- Payment

---

# 63. Expense Approval Threshold

Approval thresholds must be configurable.

Example:

0–5,000

5,001–50,000

50,000+

Actual values must be configurable by Admin/authorized Finance user.

---

# 64. General Accounting

Use double-entry accounting.

Core entities:

- Chart of Accounts
- Journal Entry
- Journal Lines
- Accounting Period
- Account Balances

---

# 65. Accounting Entries

### Sales Invoice

Debit:

Accounts Receivable

Credit:

Sales Revenue

Credit:

VAT Payable

### Customer Payment

Debit:

Cash/Bank

Credit:

Accounts Receivable

### Supplier Invoice

Debit:

Inventory / Expense

Debit:

Input VAT

Credit:

Accounts Payable

### Supplier Payment

Debit:

Accounts Payable

Credit:

Cash/Bank

### Production

Raw Material:

Inventory → WIP

Production Completion:

WIP → Finished Goods

Sale:

Inventory → COGS

---

# 66. COGS

When finished goods are sold:

Inventory decreases.

COGS increases.

Actual product cost must be used according to the configured inventory valuation/costing policy.

---

# 67. Returns

## Sales Return

Workflow:

**Customer → Return → QC → Good/Rework/Scrap → Inventory → Credit Note**

Return must reference original:

- Invoice
- Delivery
- Product

## Purchase Return

Workflow:

**Warehouse → Purchase Return → Supplier → Supplier Credit → AP**

---

# 68. Fiscal Periods

Accounting periods are monthly.

Example:

August 2026.

Status:

Open / Closed

After closing:

Users cannot post transactions into the closed period unless they have explicit Reopen Period permission.

Reopening must be audited.

---

# 69. Maintenance

Maintenance module must support:

### Machines

- Machine Code
- Name
- Type
- Location
- Status
- Installation Date
- Maintenance Schedule

### Corrective Maintenance

Machine failure:

**Issue → Maintenance Order → Work → Complete**

### Preventive Maintenance

Based on:

- Date
- Machine Hours
- Configurable frequency

### Spare Parts

Connected to Spare Parts Warehouse.

### Downtime

Production downtime must be linked to machine and production order when applicable.

---

# 70. Reports

## Management

- Sales Summary
- Production Summary
- Inventory Value
- Cash Position
- Receivables
- Payables
- Profitability
- Production Cost
- Waste
- Scrap
- Rework

## Sales

- Quotations
- Sales Orders
- Sales by Customer
- Sales by Product
- Delivery Status
- Customer Aging
- Sales Profitability

## Inventory

- Stock On Hand
- Available Stock
- Reserved Stock
- Stock Movements
- Warehouse Transfers
- Stock Valuation
- Low Stock
- Stock Count
- Adjustment Report

## Production

- Production Orders
- Production Output
- Material Consumption
- Planned vs Actual
- Waste
- Scrap
- Rework
- Machine Utilization
- Downtime
- Production Cost

## Purchasing

- Purchase Requests
- Purchase Orders
- Supplier Purchases
- Supplier Comparison
- Receiving
- Purchase Price Variance

## Finance

- General Ledger
- Trial Balance
- Profit & Loss
- Balance Sheet
- Cash Flow
- Cash Position
- Cash Ledger
- Cash Closing
- Bank Reconciliation
- AR Aging
- AP Aging
- VAT Report
- Expenses
- Customer Statements
- Supplier Statements

---

# 71. Global Search

Provide one global search field.

User can search by:

- Customer
- Supplier
- Product
- Quotation Number
- Sales Order Number
- Purchase Order Number
- Production Order
- Invoice
- Delivery
- Payment
- QC Order

Example:

Search:

`SO-2026-00001`

Results should show connected records:

- Customer
- Quotation
- Sales Order
- Production Order
- Delivery
- Invoice
- Payment

---

# 72. Notifications

MVP requires in-app notifications.

Examples:

- Approval Required
- Purchase Request Approval
- Expense Approval
- Discount Approval
- Credit Limit Approval
- Material Request
- QC Required
- Production Exception
- Payment Approval
- Maintenance Due
- Invoice Due

Email notifications are not required for MVP.

---

# 73. Attachments

Use Supabase Storage.

Attachments can be added to:

- Customers
- Suppliers
- Quotations
- Sales Orders
- Purchase Requests
- RFQs
- Purchase Orders
- Invoices
- Expenses
- QC
- Maintenance
- Other configurable documents

---

# 74. Document Numbering

Automatic numbering.

Examples:

- QT-2026-00001
- SO-2026-00001
- PO-2026-00001
- MO-2026-00001
- INV-2026-00001
- DN-2026-00001
- PR-2026-00001
- MR-2026-00001
- QC-2026-00001
- RW-2026-00001
- PINV-2026-00001
- PAY-2026-00001

Admin can configure:

- Prefix
- Format
- Starting number

---

# 75. Audit Log

Audit log is mandatory for sensitive operations.

Record:

- User
- Action
- Module
- Record Type
- Record ID
- Old Value
- New Value
- Timestamp
- IP if available

Important audited actions:

- Create
- Update
- Approve
- Reject
- Post
- Cancel
- Payment
- Stock Adjustment
- Stock Issue
- Stock Receipt
- Price Override
- Credit Approval
- Period Close
- Period Reopen
- Permission changes

---

# 76. Data Integrity

The system must prevent:

- Negative stock unless explicitly configured
- Duplicate document numbers
- Posting into closed fiscal periods
- Deleting posted accounting documents
- Delivery above allowed quantity
- Payment above allowed amount unless configured
- Material issue above available quantity
- Finished Goods receipt before QC approval
- Unauthorized approval
- Unauthorized financial posting

---

# 77. Status Transition Rules

Statuses must not be changed arbitrarily.

Every document should define allowed transitions.

Example Sales Order:

**Draft → Confirmed → Reserved → Production → Ready → Delivered → Closed**

Invalid transitions must be rejected server-side.

---

# 78. Database Requirements

Supabase PostgreSQL must use relational design.

Expected major entities include:

### Identity

- users/profile
- employees
- roles
- permissions
- role_permissions
- user_roles

### Sales

- customers
- quotations
- quotation_items
- sales_orders
- sales_order_items
- deliveries
- delivery_items
- sales_invoices
- sales_invoice_items
- customer_payments
- payment_allocations

### Products

- products
- product_categories
- product_specifications
- units_of_measure
- pricing_rules

### Inventory

- warehouses
- warehouse_types
- inventory_items
- inventory_transactions
- stock_reservations
- stock_counts
- stock_adjustments
- warehouse_transfers

### Manufacturing

- boms
- bom_items
- production_orders
- production_materials
- material_requests
- material_issues
- production_logs
- production_outputs
- scrap_records
- rework_orders
- qc_inspections
- qc_results

### Purchasing

- suppliers
- supplier_products
- purchase_requests
- rfqs
- rfq_items
- supplier_quotations
- purchase_orders
- purchase_order_items
- goods_receipts
- goods_receipt_items
- purchase_invoices
- purchase_invoice_items
- supplier_payments

### Finance

- chart_of_accounts
- journal_entries
- journal_lines
- accounting_periods
- cash_accounts
- bank_accounts
- cash_transactions
- bank_transactions
- bank_reconciliations
- expenses
- expense_categories
- tax_rates

### Maintenance

- machines
- maintenance_orders
- preventive_maintenance
- spare_parts

### System

- approvals
- approval_delegations
- notifications
- attachments
- audit_logs
- document_sequences
- system_settings

The final schema should normalize data appropriately and avoid unnecessary duplication.

---

# 79. Row Level Security

Supabase RLS is mandatory.

Users must only access records allowed by their permissions.

Examples:

Sales should not automatically have access to:

- General Ledger
- Supplier Payments
- Payroll
- Sensitive accounting data

Warehouse should not be able to:

- Post Sales Invoices
- Edit accounting entries
- Change product prices

Production Operator should not be able to:

- Modify Sales Orders
- Modify accounting
- Approve production exceptions

Accountant should not be able to:

- Modify production quantities
- Approve their own expense requests

Admin has full system administration permissions.

---

# 80. Self-Approval Prevention

Users should not approve their own requests unless explicitly configured.

Examples:

Employee creates Expense Request.

Employee cannot approve own request.

Sales creates Discount Approval.

Same Sales user cannot approve own discount.

---

# 81. Transaction Atomicity

Financial and inventory operations must be atomic.

Example:

When posting a Delivery:

1. Validate quantity.
2. Validate reservation/stock.
3. Create inventory movement.
4. Update reservation.
5. Update delivery status.
6. Create required accounting transaction if applicable.
7. Commit all operations.

If any step fails, the complete transaction must roll back.

Use server-side database functions/transactions for critical operations.

---

# 82. Security

Required:

- Supabase Auth
- RLS
- Server-side authorization
- Secure Storage policies
- No privileged credentials in frontend
- Audit logging
- Input validation
- Server-side business-rule validation

---

# 83. PWA Requirements

The application must be installable as a PWA.

Required:

- Manifest
- App icons
- Responsive design
- Mobile/tablet/desktop layouts
- Standalone mode

Offline-first transaction processing is NOT required for MVP.

---

# 84. UI Requirements

The UI should be:

- Clean
- Modern
- Professional
- ERP-oriented
- Responsive
- Fast
- Easy for non-technical factory employees

Dashboard should show information relevant to the logged-in role.

Do not show irrelevant modules.

---

# 85. Arabic UX

Arabic is a first-class language.

Requirements:

- RTL
- Arabic labels
- Arabic document templates
- Arabic numbers where appropriate
- Proper Arabic typography
- Correct table alignment
- RTL forms

English mode must switch the interface to LTR.

---

# 86. Role Dashboards

### Admin

- Users
- Permissions
- System Settings
- Audit
- Overall KPIs

### Manager

- Sales
- Production
- Inventory
- Finance
- Approvals
- Profitability

### Sales

- Customers
- Quotations
- Sales Orders
- Deliveries
- Customer balances where permitted

### Warehouse

- Stock
- Reservations
- Material Requests
- Receiving
- Transfers
- Delivery

### Production Manager

- Production Orders
- Capacity
- Materials
- Production
- Waste
- QC
- Rework

### Production Operator

- Assigned Production Orders
- Production Entry
- Machine Hours
- Waste
- Downtime

### QC

- Pending Inspections
- QC History
- Rework
- Scrap

### Purchasing

- Purchase Requests
- RFQs
- Supplier Quotations
- POs
- Receiving

### Accountant

- Invoices
- Payments
- Cash
- Banks
- AR
- AP
- GL
- VAT
- Expenses
- Period Closing

### Maintenance

- Machines
- Maintenance Orders
- Preventive Maintenance
- Spare Parts
- Downtime

---

# 87. End-to-End Business Scenario

The complete main scenario is:

## Customer Order

1. Sales selects customer.
2. Sales creates quotation.
3. Sales enters product/specification.
4. Pricing Engine calculates suggested price.
5. Sales may override price if permitted.
6. Approval is requested if rules require it.
7. Quotation is sent/accepted.
8. Quotation is converted to Sales Order.
9. Credit Limit is checked.
10. Manager approval required if credit limit is exceeded.
11. Inventory availability is checked.
12. Available Finished Goods are reserved.
13. Missing quantity becomes Production Requirement.
14. Production Order is created.
15. BOM/Formula calculates material requirement.
16. Material Request is created.
17. Warehouse issues available materials.
18. Materials move into WIP.
19. Production Operator starts production.
20. Operator records output/waste/scrap/rework/downtime.
21. Production output goes to QC.
22. QC approves/rejects/reworks.
23. Passed quantity enters Finished Goods.
24. Sales or Warehouse creates Delivery.
25. Customer receives goods.
26. Invoice is generated according to configured policy.
27. Customer payment is recorded.
28. Payment updates Cash/Bank and AR.
29. Accounting entries are created.
30. Actual production cost is calculated.
31. Sales Order profitability is updated.
32. Order is closed when all required quantities and financial processes are complete.

---

# 88. Purchase-to-Pay Scenario

1. Authorized user creates Purchase Request.
2. Manager approves.
3. Purchasing creates RFQ.
4. Approved suppliers submit quotations.
5. Purchasing compares offers.
6. Supplier is selected.
7. Purchase Order is created.
8. Supplier delivers.
9. Warehouse receives goods.
10. QC occurs if required.
11. Goods enter inventory.
12. Supplier Invoice is entered.
13. 3-Way Matching occurs.
14. Variance triggers warning + approval.
15. Invoice is posted.
16. AP is created.
17. Accountant creates payment request/payment.
18. Large payments require configured approval.
19. Payment updates Cash/Bank.
20. Supplier balance is updated.
21. Journal Entry is created.

---

# 89. Expense-to-Pay Scenario

1. Employee creates Expense Request.
2. Manager approves.
3. Accountant reviews.
4. Payment is prepared.
5. Large payment follows configured approval.
6. Payment is made from Cash/Bank.
7. Expense is posted.
8. Journal Entry is created.
9. Expense appears in financial reports.

---

# 90. Returns Scenario

## Customer Return

Customer return references original Delivery/Invoice.

Warehouse receives returned goods.

QC decides:

- Good
- Rework
- Scrap

Inventory and accounting are updated.

Credit Note is generated when financially applicable.

## Supplier Return

Warehouse creates return against received goods.

Supplier receives returned quantity.

Supplier Credit is recorded.

AP is updated.

---

# 91. MVP Scope

MVP must include:

### Authentication
### Users
### Roles
### Permissions
### Audit
### Arabic/English
### Customers
### Products
### Product Specifications
### Pricing
### Quotations
### Sales Orders
### Credit Limits
### Deliveries
### Warehouses
### Inventory
### Reservations
### Purchasing
### Suppliers
### RFQ
### Supplier Comparison
### Purchase Orders
### Receiving
### Supplier Invoices
### Production
### BOM
### Material Requests
### WIP
### QC
### Rework
### Scrap
### Manufacturing Cost
### Overhead
### Maintenance
### Sales Invoices
### Customer Payments
### AR
### AP
### Cash
### Banks
### Transfers
### Expenses
### General Ledger
### VAT
### Returns
### Fiscal Periods
### Reports
### Notifications
### Attachments
### Global Search
### PWA

---

# 92. Explicitly Out of MVP

Do not implement initially:

- 2FA
- Email Notifications
- Multiple Factories
- Multiple Currencies
- Batch/Lot Tracking
- Automatic Reorder
- Advanced Production Scheduling
- Full HR/Payroll
- Advanced BI/Data Warehouse

Architecture should allow these to be added later.

---

# 93. Acceptance Criteria

The application is considered successful when:

### Sales

- Sales can create quotation.
- Pricing calculates automatically.
- Authorized Sales users can override price.
- Required approvals work.
- Quotation converts to Sales Order.
- Credit Limit is checked.
- Stock is reserved.

### Inventory

- Stock movements are traceable.
- Reservations work.
- Partial receiving works.
- Partial delivery works.
- Warehouse transfers work.
- Negative stock rules are enforced.

### Production

- Production Order can be created.
- BOM calculates requirements.
- Material Request works.
- Partial production works.
- WIP is tracked.
- Operator can record production.
- QC controls Finished Goods.
- Rework creates separate order.
- Actual cost is calculated.

### Purchasing

- Purchase Request approval works.
- Only approved suppliers can be used.
- RFQ comparison works.
- Partial receiving works.
- 3-Way Match works.
- Variance requires approval.

### Finance

- Sales Invoice creates accounting entries.
- Purchase Invoice creates AP.
- Customer payments update AR.
- Supplier payments update AP.
- Cash balances are correct.
- Cash transfers work.
- Daily closing works.
- Bank reconciliation works.
- Posted documents cannot be deleted.
- Fiscal periods can be closed/reopened with permission.
- P&L, Balance Sheet and Trial Balance are generated.

### Security

- RLS works.
- Users see only authorized data.
- Permissions are enforced server-side.
- Users cannot approve their own requests.
- Audit Logs capture sensitive actions.

### Localization

- Arabic RTL works.
- English LTR works.
- Documents can be generated in both languages.

### PWA

- Application can be installed.
- Responsive layouts work on desktop/tablet/mobile.

---

# 94. Implementation Rules for the AI Developer

The implementation agent MUST:

1. Read and follow this PRD before writing code.
2. Do not simplify the system into basic CRUD.
3. Do not remove modules without explicit approval.
4. Do not invent business rules that contradict this PRD.
5. Keep business logic server-side for sensitive operations.
6. Use PostgreSQL constraints where appropriate.
7. Use database transactions for inventory and accounting operations.
8. Implement RLS properly.
9. Use reusable components.
10. Use reusable approval/status engines.
11. Use configurable settings instead of hard-coded business thresholds.
12. Keep Arabic and English translations centralized.
13. Keep financial documents immutable after posting.
14. Maintain audit logs.
15. Never expose service-role credentials in frontend code.
16. Never directly modify inventory balances without creating an inventory transaction.
17. Never directly modify accounting balances without creating accounting entries.
18. Use document sequences for document numbers.
19. Use soft-delete/archive where appropriate instead of deleting important historical records.
20. Before implementing each module, validate its dependencies and relationships with existing modules.

---

# 95. Recommended Development Order

Build in this order:

## Phase 1 — Foundation

- Supabase connection
- Auth
- Profiles
- Employees
- Roles
- Permissions
- RLS
- Settings
- Audit Logs
- Document Numbering
- Localization

## Phase 2 — Master Data

- Customers
- Suppliers
- Products
- Categories
- UOM
- Product Specifications
- Warehouses
- Machines
- Tax Settings

## Phase 3 — Inventory

- Stock
- Inventory Transactions
- Reservations
- Transfers
- Adjustments
- Stock Counts

## Phase 4 — Sales

- Quotations
- Pricing
- Sales Orders
- Credit Limit
- Delivery

## Phase 5 — Purchasing

- Purchase Requests
- Approval
- RFQ
- Supplier Quotations
- PO
- Receiving
- Supplier Invoice
- 3-Way Match

## Phase 6 — Manufacturing

- BOM
- Production Orders
- Material Requests
- Material Issue
- WIP
- Production Logs
- QC
- Rework
- Scrap
- Costing
- Capacity

## Phase 7 — Finance

- Chart of Accounts
- GL
- AR
- AP
- Sales Invoices
- Purchase Invoices
- Customer Payments
- Supplier Payments
- Cash
- Bank
- Transfers
- Expenses
- VAT
- Fiscal Periods
- Reconciliation

## Phase 8 — Maintenance

- Machines
- Preventive Maintenance
- Corrective Maintenance
- Spare Parts
- Downtime

## Phase 9 — Reports

- Management
- Sales
- Inventory
- Production
- Purchasing
- Finance
- Profitability

## Phase 10 — Finalization

- PWA
- Performance
- Security Review
- RLS Review
- Audit Review
- Arabic/English QA
- End-to-End Testing
- Production Deployment

---

# 96. Final Product Definition

The final product is a bilingual PWA ERP for a single corrugated carton factory.

The system must connect:

**Sales + Inventory + Purchasing + Manufacturing + QC + Maintenance + Finance + Treasury**

into one integrated transaction lifecycle.

The most important architectural principle is:

**One business transaction must remain traceable across all affected modules.**

Example:

**SO-2026-00001**

must be traceable to:

Quotation → Reservation → Production Order → Material Issue → WIP → QC → Finished Goods → Delivery → Invoice → Payment → Accounting → Profitability.

This traceability is a core requirement of the system.