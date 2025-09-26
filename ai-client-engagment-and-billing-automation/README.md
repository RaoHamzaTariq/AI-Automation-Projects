# AI Client Engagement & Billing Automation

This project is an **AI-powered automation system** that helps businesses manage **client engagement, follow-ups, invoice creation, and payment reminders** — all in one place.  

It saves time, reduces errors, and increases revenue by automating **emails, invoices, and payment tracking** using **Next.js Dashboard + Supabase + n8n + Gmail + AI agents**.

---

### Dashboard
A clean dashboard where staff can:
- Add and manage leads
- Create invoices linked to clients
- Track payments and outstanding dues

![Dashboard Screenshot](/public/Images/Dashboard%20Page.png)

### Automation Workflows
n8n workflows handle client emails, invoices, and payment reminders automatically.

![Workflow Screenshot](/public/AI%20Invoive%20and%20Payment%20Automation.PNG)

---

## Why This Project Matters

Running a business means constantly:
- Talking to new leads
- Sending follow-up reminders
- Creating invoices
- Chasing overdue payments

Doing all this manually is:
- ❌ Time-consuming  
- ❌ Error-prone  
- ❌ Stressful for staff  

This system **automates the entire cycle**:
- ✅ Engages clients automatically  
- ✅ Generates invoices instantly  
- ✅ Sends reminders before and after due dates  
- ✅ Adds late fee invoices automatically if needed  

> No client is ignored, and no payment is missed.  

---

## How It Works (Workflow Overview)

### 1. Send Welcome Emails to New Leads
- When a new lead is added in the dashboard,  
- The system automatically sends a **welcome email**.  
- This builds trust and keeps engagement fast.  

![Send Welcome Emails to New Leads Pic](/public/Send%20Email%20to%20Lead.PNG)

![](/public//Leads%20Management%20Page.png)
---

### 2. Follow-Up Emails
- If a lead doesn’t convert within a set time,  
- The system automatically sends a **follow-up email**.  
- This increases the chance of converting leads without manual effort.  

![Follow-up Emails Pic](/public/Follows%20Up%20Email.PNG)

![](/public/Email%20Campaign%20Page.png)

---

### 3. Invoice Creation
- Staff can create invoices from the dashboard by just selecting the client and entering the amount and due date.  
- Once created, the AI system:  
  - Generates a professional **PDF invoice**  
  - Sends it to the client by email instantly  
- The invoice is tracked automatically.  

![Invoice Creation Pic](/public/Invoice%20Flow.PNG)

![](/public//Invoice%20Management%20Page.png)
---

### 4. Payment Reminders
  
- After the due date: The AI system sends a **late fee invoice** as a PDF attachment with email.  
- This ensures payments are not forgotten.  

![Payment Reminders](/public/Invoice%20Reminder%20After%20Due%20Date.PNG)

![](/public/Transaction%20History%20Page.png)
---

## Real Use Case Example

Imagine a **small service company**:  
- They add a new client → the system sends a welcome email.  
- If the client doesn’t respond, a follow-up email is sent.  
- When the client agrees to buy, staff creates an invoice in the dashboard.  
- The client instantly receives the invoice PDF by email.  
- If the client delays, reminders and late fee invoices are sent automatically.  

> The company saves hours of manual work and gets paid faster.  

---

## Benefits

- 70% less manual admin work  
- Faster client engagement with instant communication  
- Reduced errors in invoicing and payment tracking  
- More revenue with automated late fee handling  
- Professional image with timely emails and documents  

---

## Tech Behind the Scenes

- **Next.js Dashboard** → Manage leads, invoices, payments  
- **Supabase** → Stores client and invoice data  
- **n8n** → Workflow automation (emails, reminders, late fee handling)  
- **AI Agents (Gemini)** → Draft natural, professional messages  
- **Gmail API** → Sends all emails with attachments  
- **PDF Generator** → Creates invoices as polished PDF documents  

---

## Future Improvements

- Online payment links (Stripe, PayPal) inside invoices  
- WhatsApp notifications in addition to email  
- Advanced analytics dashboard for business KPIs  
- Multi-language invoice support  

---

## Final Notes

This project proves how **AI + automation** can replace manual client engagement and billing work.  

Businesses can now:  
- Engage leads automatically  
- Convert more clients  
- Send invoices instantly  
- Track payments without effort  

➡️ Saving time, reducing stress, and boosting revenue.  

---
