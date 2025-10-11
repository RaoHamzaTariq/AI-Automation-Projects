# Doctor Clinic WhatsApp AI Appointment System

This is a complete appointment management system for doctor clinics. It uses WhatsApp for patient communication and has a web dashboard for clinic staff to manage everything.

![](/public/n8n_workflow.PNG)

### What This System Does

**For Patients:**
- Patients can book appointments through WhatsApp
- They can check their upcoming appointments
- They can reschedule or cancel appointments
- They can choose to pay online or at clinic

**For Clinic Staff:**
- View all appointments in a calendar
- See patient information
- Check clinic performance with statistics
- Manage appointment status

## Complete Workflow Description

### 1. WhatsApp Conversation Flow

**Step 1: Patient Starts Chat**
```
Patient sends: "Hi" or "Hello"

System replies:
"Hello! Welcome to Doctor Clinic! 

Please choose:
1. New Booking
2. My Upcoming Bookings
3. Reschedule Booking
4. Cancel Booking

Reply with 1, 2, 3, or 4"
```

**Step 2: If Patient Chooses "1. New Booking"**

**A. Patient Selection**
- System checks if patient already exists in database
- If found: shows list of existing patients
- If not found: asks for Name, Age, Gender
- Saves new patient to database
- Asks which patient to use for appointment

**B. Date Selection**
- System shows next 7 available dates
- Patient chooses a date

**C. Time Selection**
- System shows available time slots for chosen date
- Patient chooses a time

**D. Payment Method**
```
System asks:
"Choose payment method:
1. Online (Stripe)
2. Cash at Clinic

Reply 1 or 2"
```

**E. Booking Confirmation**
- System saves appointment to database
- Only after successful save, sends confirmation:
```
"Appointment booked! 🎉
Patient: {name}
Date: {date}
Time: {time}
Payment Method: {method}
Status: Confirmed"
```

**Step 3: If Patient Chooses "2. My Upcoming Bookings"**
- System fetches patient's future appointments
- Shows list with date and time

**Step 4: If Patient Chooses "3. Reschedule Booking"**
- Shows patient's confirmed appointments
- Patient chooses which to reschedule
- Repeat date and time selection
- System updates appointment in database

**Step 5: If Patient Chooses "4. Cancel Booking"**
- Shows patient's future appointments
- Patient chooses which to cancel
- System updates status to "Cancelled"
- If paid online, processes refund

### 2. Payment Processing

**For Online Payments (Stripe):**
1. System creates payment link
2. Sends link to patient via WhatsApp
3. Patient completes payment
4. System automatically updates payment status to "Paid"
5. Sends confirmation message

**For Cash Payments:**
1. Status remains "Pending"
2. Marked as "Paid" when patient pays at clinic

### 3. Admin Dashboard Flow

**Dashboard Page:**
- Shows statistics: total appointments, today's appointments, total patients, revenue
- Shows recent appointments (newest first)
- Shows calendar view of all appointments

![](/public/dashboard.png)

**Appointments Page:**
- View all appointments in table
- Search and filter appointments
- Update appointment status
- Edit appointment details

![](/public/appointments.png)

**Patients Page:**
- View all registered patients
- Add new patients
- Edit patient information
- Search patients

![](/public/patients.png)

**Analytics Page:**
- View appointment statistics
- See charts for appointments by status
- See patient demographics
- Revenue trends

![](/public/analytics.png)

## Technical Details

### Backend System (n8n Workflow)
- **WhatsApp Trigger**: Listens for new messages
- **AI Agent (Google Gemini)**: Handles conversations
- **Database Tools**: Saves and reads data from Supabase
- **Payment Integration**: Connects with Stripe
- **Memory Management**: Remembers conversation context

### Frontend (Next.js Dashboard)
- **Dashboard**: Overview and statistics
- **Appointments**: Manage all bookings
- **Patients**: Patient database
- **Analytics**: Business insights

## Business Benefits

### For Clinic Owners:
1. **Save Time**: No need for staff to handle phone calls for appointments
2. **24/7 Booking**: Patients can book anytime, even after hours
3. **Fewer Mistakes**: Automated system reduces human errors
4. **Better Organization**: All data stored properly in database
5. **Payment Tracking**: Know which appointments are paid

### For Patients:
1. **Easy Booking**: Use WhatsApp they already know
2. **Instant Confirmation**: Get appointment details immediately
3. **Flexible Payments**: Choose online or cash payment
4. **Self-Service**: Check, reschedule, or cancel without calling

## Setup Requirements

### What You Need:
1. **WhatsApp Business Account**
2. **n8n Account** (free or paid)
3. **Supabase Account** (free tier available)
4. **Stripe Account** (for payments)
5. **Web Hosting** (for dashboard)
6. **AI Model** (OpenAI, Gemini, Claude)


## Technical Requirements

### For Clinic:
- WhatsApp Business API access
- Basic computer with internet
- Smartphone for testing

### For Developer:
- n8n workflow setup
- Supabase database configuration
- Stripe payment integration
- Next.js dashboard deployment

## 📞 Support and Services

We provide complete setup and support services. If you want to implement this system for your clinic or if you are a developer who wants to build similar systems, we can help.

### Our Services Include:
1. **Complete System Setup**
2. **WhatsApp API Configuration**
3. **Database Setup**
4. **Payment Integration**
5. **Staff Training**
6. **Ongoing Support**



## 💌 Contact Information

If you want to use this system for your clinic or if you need help implementing it:

**Email: bistructure9211@gmail.com**

**What to include in your email:**
- Your clinic name and type
- What features you need most
- Your timeline for implementation

We will respond within 24 hours to discuss your requirements and provide a detailed proposal.

---

*This system has been tested and proven to work for medical clinics. It can save hours of administrative work each week and provide better service to patients.*

**Contact us today to get started!**
**Email: bistructure9211@gmail.com**