# AI-Powered Leads Cold Email Outreaching Workflow

This project is an **end-to-end AI-powered outreach automation system** built with **n8n, Google Sheets, Gmail, and Google Gemini**.  
It helps businesses automatically send personalized cold emails to potential leads, reducing manual work and ensuring efficient lead engagement.

---

![Leads Outreaching Workflow](/ai-powered-leads-cold-email-outreach/images/Leads%20Outreaching%20Workflow.PNG)

## Project Overview
The workflow automates the **lead outreach process** by:  
1. Pulling lead data (Company Name, Email, Services, Description, etc.) from Google Sheets.  
2. Filtering valid leads (with email & no prior outreach).  
3. Generating a **business-specific one-line description** using **Google Gemini AI**.  
4. Sending a **personalized cold email** via Gmail.  
5. Updating Google Sheets to mark leads as "email sent".  

This system saves time for sales teams, improves personalization, and scales cold email campaigns efficiently.

---

## Key Features

### Lead Management
- Google Sheets acts as the **CRM backend**.  
- Stores Company Name, Website, Email, Services, and Outreach status.  

### Filtering & Batching
- Filters out leads that:  
  - Already received an email.  
  - Do not have a valid email.  
- Processes **up to 10 leads per batch**.  

### AI-Powered Description
- Uses **Google Gemini** to generate a concise, one-line continuation describing the business.  
- This line is dynamically inserted into the cold email for personalization.  

### Personalized Email Outreach
- Sends tailored emails via **Gmail API**.  
- Template includes:  
  - Company name  
  - AI-generated business description  
  - Value-driven pitch for AI chatbots and automation  

### Status Update
- Once the email is sent, the workflow updates Google Sheets with:  
  - `"email sent" = yes`  
- Ensures no duplicate outreach.  

### Automated Scheduling
- Workflow is triggered **daily at 6:30 AM**.  
- Runs automatically without manual intervention.  

---

## Technical Flow

1. **Schedule Trigger** → Runs workflow daily at 6:30 AM.  
2. **Get Data from Google Sheets** → Fetch all leads.  
3. **Filter** → Keep only new & valid leads.  
4. **Limit & Batch** → Process 10 leads per run.  
5. **Loop** → Go through each lead.  
6. **Google Gemini (AI Description)** → Generate business-specific one-liner.  
7. **Gmail Node** → Send personalized cold email.  
8. **Update Google Sheets** → Mark lead as "email sent".  
9. **Wait Node** → Ensures smooth pacing before next batch.  

---

## Tech Stack & Tools
- **n8n** – Workflow automation  
- **Google Sheets** – Lead database  
- **Google Gemini** – AI-powered personalization  
- **Gmail API** – Cold email sending  
- **Schedule Trigger** – Automated daily runs  

---

## Impact & Learning
This project demonstrates how **AI + automation** can streamline **lead generation and outreach**.  

Key Learnings:  
- Workflow orchestration with **n8n**  
- AI-based content personalization using **Gemini**  
- Automated lead tracking with Google Sheets  
- Professional cold email delivery with Gmail API  

---

## Conclusion
With this workflow, cold emailing becomes:  
- **Personalized** → AI tailors messages for each lead.  
- **Efficient** → Eliminates manual copy-paste work.  
- **Scalable** → Handles multiple leads daily.  

It showcases how **AI and automation can modernize B2B lead generation**, giving businesses a competitive edge.
