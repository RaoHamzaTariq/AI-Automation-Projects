# WhatsApp AI Shopping Agent

I developed an end-to-end e-commerce automation system that allows customers to place and track their orders directly through WhatsApp, powered by **n8n workflows, Google Sheets, MCP, and AI agents**.  
This project showcases how conversational AI can be integrated with backend tools to create a seamless shopping experience.

---

![N8N Complete Workflow](/whatsapp_ai_shopping_agent/images/MCP%20AI%20Agent.PNG)

## Project Overview
The goal of the project was to design a **WhatsApp-based shopping assistant** that could handle product inquiries, FAQs, and orders without the need for a traditional website or app.  

- Customers interact naturally via WhatsApp.  
- System automatically manages **Products, Orders, and FAQs** stored in Google Sheets.  
- AI agent leverages **n8n automation** to interpret messages, call the right tools, and respond in a **conversational style**.  

![WhatsApp Chatbot](/whatsapp_ai_shopping_agent/images/Whatsapp%20image.PNG)

---

![]()

## Key Features

### Product Management
- Customers can ask about available products, prices, descriptions, and stock levels.  
- AI agent fetches details directly from the **Products sheet**.  

### Smart FAQs
- Instantly answers common questions (delivery time, return policy, payment methods, etc.).  
- Data sourced from the **FAQs sheet**.  

### Order Placement
- Customers place orders via WhatsApp.  
- Flow: **Collect details → Check stock → Generate unique Order ID → Save in Orders sheet**.  
- Ensures smooth and professional order management.  

### Order Tracking
- Customers can check their order status anytime by providing their Order ID.  
- Replies instantly with status (Pending, Shipped, Delivered).  

### Automated Order ID
- Sequential IDs (101, 102, …) generated via **Google Apps Script**.  
- Prevents duplicate IDs and keeps order management clean.  

---

## Technical Flow

1. **WhatsApp → n8n Trigger**: Customer sends a message.  
2. **Intent Detection**: AI agent identifies query type (Products, FAQs, New Order, Order Status).  
3. **MCP Client → MCP Server**: Routes requests to the right tools.  
4. **Tool Calls**:
   - `get_products` → Fetch product details.  
   - `get_faqs` → Answer FAQs.  
   - `create_order` → Place new order with auto-generated Order ID.  
   - `get_order_status` → Retrieve order status.  
5. **Google Sheets Integration**: Backend for Products, Orders, and FAQs.  
6. **WhatsApp Response**: AI agent replies in natural language with required details.  

---

## Tech Stack & Tools
- **n8n** – Workflow automation & AI orchestration  
- **MCP Server** – Centralized tool management for Google Sheets  
- **Google Sheets** – Lightweight backend for Products, Orders, FAQs  
- **Google Apps Script** – Auto sequential Order ID generation  
- **WhatsApp API** – Customer communication channel  
- **AI Agent** – Conversational logic & tool orchestration  

---

## Impact & Learning
This project demonstrates how **AI and automation** can replace traditional e-commerce front-ends with a **WhatsApp-first shopping experience**.  

### Key learnings:  
- Workflow automation with **n8n**  
- Designing AI-powered conversational commerce tools  
- Leveraging **Google Sheets** as a scalable lightweight backend  
- Automating unique ID generation with **Apps Script**  
- Exploring **MCP Server** to streamline the workflow  

---

## Conclusion
This project highlights my ability to combine **AI, automation, and lightweight backend systems** to build scalable, user-friendly solutions that make online shopping as simple as sending a WhatsApp message.  
