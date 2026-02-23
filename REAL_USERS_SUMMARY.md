# Real Users Seeding Summary

## ✅ Successfully Created 15 Real Users

All users have been seeded into the database with realistic profiles, posts, and comments.

### Login Credentials
- **Password for all users:** `password123`

---

## 📚 Users by College

### 1. John Smith - New York University
- **Email:** john.smith@nyu.edu
- **Username:** johnsmith
- **Bio:** Computer Science major at NYU. Passionate about AI and machine learning. Love debating tech ethics.
- **Posts:**
  - "The Ethics of AI in Healthcare" (College Panel)
  - "Remote Learning: A Permanent Shift?" (General Panel)

### 2. Emily Johnson - Duke University
- **Email:** emily.johnson@duke.edu
- **Username:** emilyjohnson
- **Bio:** Pre-med student at Duke. Interested in public health policy and healthcare accessibility.
- **Posts:**
  - "Healthcare as a Human Right" (General Panel)
  - "Mental Health Resources on Campus" (College Panel)

### 3. Michael Chen - Cornell University
- **Email:** michael.chen@cornell.edu
- **Username:** michaelchen
- **Bio:** Engineering student at Cornell. Building sustainable solutions for tomorrow's challenges.
- **Posts:**
  - "Renewable Energy: The Path Forward" (General Panel)
  - "Cornell's Sustainability Initiatives" (College Panel)

### 4. Sarah Williams - Northwestern University
- **Email:** sarah.williams@northwestern.edu
- **Username:** sarahwilliams
- **Bio:** Journalism major at Northwestern. Committed to truth, transparency, and holding power accountable.
- **Posts:**
  - "The Crisis of Trust in Media" (General Panel)
  - "Student Journalism Matters" (College Panel)

### 5. David Martinez - University of Pennsylvania
- **Email:** david.martinez@upenn.edu
- **Username:** davidmartinez
- **Bio:** Economics student at UPenn. Analyzing markets, policy, and their impact on society.
- **Posts:**
  - "Student Debt: A National Crisis" (General Panel)
  - "Wharton's Role in Ethical Business" (College Panel)

### 6. Jessica Brown - Brown University
- **Email:** jessica.brown@brown.edu
- **Username:** jessicabrown
- **Bio:** Political Science major at Brown. Passionate about social justice and democratic reform.
- **Posts:**
  - "Voting Rights Under Attack" (General Panel)
  - "Brown's Open Curriculum Philosophy" (College Panel)

### 7. Robert Taylor - Dartmouth College
- **Email:** robert.taylor@dartmouth.edu
- **Username:** roberttaylor
- **Bio:** Environmental Studies major at Dartmouth. Fighting for climate action and environmental justice.
- **Posts:**
  - "Climate Change: We're Running Out of Time" (General Panel)
  - "Dartmouth's Carbon Neutrality Goal" (College Panel)

### 8. Amanda Garcia - Vanderbilt University
- **Email:** amanda.garcia@vanderbilt.edu
- **Username:** amandagarcia
- **Bio:** Psychology major at Vanderbilt. Studying cognitive biases and decision-making.
- **Posts:**
  - "Social Media and Mental Health" (General Panel)
  - "Vanderbilt's Mental Health Support" (College Panel)

### 9. Christopher Lee - Rice University
- **Email:** christopher.lee@rice.edu
- **Username:** christopherlee
- **Bio:** Bioengineering student at Rice. Working on medical devices and healthcare innovation.
- **Posts:**
  - "Gene Editing: Promise and Peril" (General Panel)
  - "Rice's Research Excellence" (College Panel)

### 10. Michelle Anderson - Emory University
- **Email:** michelle.anderson@emory.edu
- **Username:** michelleanderson
- **Bio:** Public Health major at Emory. Focused on health equity and disease prevention.
- **Posts:**
  - "Vaccine Hesitancy: A Public Health Crisis" (General Panel)
  - "Emory's Public Health Leadership" (College Panel)

### 11. Daniel Wilson - Georgetown University
- **Email:** daniel.wilson@georgetown.edu
- **Username:** danielwilson
- **Bio:** International Relations major at Georgetown. Interested in diplomacy and global cooperation.
- **Posts:**
  - "The Future of International Cooperation" (General Panel)
  - "Georgetown's DC Advantage" (College Panel)

### 12. Rachel Thomas - Carnegie Mellon University
- **Email:** rachel.thomas@carnegie.edu
- **Username:** rachelthomas
- **Bio:** Computer Science major at Carnegie Mellon. Specializing in cybersecurity and privacy.
- **Posts:**
  - "Privacy in the Digital Age" (General Panel)
  - "CMU's Cybersecurity Excellence" (College Panel)

### 13. Kevin Moore - Washington University in St. Louis
- **Email:** kevin.moore@washu.edu
- **Username:** kevinmoore
- **Bio:** Philosophy major at WashU. Exploring ethics, logic, and the nature of knowledge.
- **Posts:**
  - "The Value of Philosophy in Modern Society" (General Panel)
  - "WashU's Philosophy Department" (College Panel)

### 14. Lauren Jackson - University of Notre Dame
- **Email:** lauren.jackson@notre.edu
- **Username:** laurenjackson
- **Bio:** Business major at Notre Dame. Interested in ethical leadership and corporate responsibility.
- **Posts:**
  - "Corporate Social Responsibility Matters" (General Panel)
  - "Notre Dame's Ethics Focus" (College Panel)

### 15. Brian Harris - University of Southern California
- **Email:** brian.harris@usc.edu
- **Username:** brianharris
- **Bio:** Film major at USC. Exploring how media shapes culture and society.
- **Posts:**
  - "Representation in Media Matters" (General Panel)
  - "USC Film School Experience" (College Panel)

---

## 📊 Database Statistics

- **Total Users:** 18 (15 new + 3 existing)
- **Total Colleges:** 15 (all new, diverse institutions)
- **Total Posts:** 69 (30 from new users + 39 existing)
- **Total Comments:** 310 (203 from new users + 107 existing)

---

## 🎯 Features Implemented

✅ **15 unique users** from different colleges
✅ **2 posts per user** (1 college panel, 1 general panel)
✅ **Realistic content** - thoughtful discussions on various topics
✅ **Diverse colleges** - NYU, Duke, Cornell, Northwestern, UPenn, Brown, Dartmouth, Vanderbilt, Rice, Emory, Georgetown, CMU, WashU, Notre Dame, USC
✅ **Realistic engagement** - likes, comments, and interactions
✅ **Varied topics** - AI ethics, healthcare, climate change, media, politics, philosophy, business ethics, and more

---

## 🚀 How to Use

1. **Login to the application** at http://localhost:3000
2. **Use any username** from the list above
3. **Password:** password123
4. **Explore the feeds** to see all the posts and comments
5. **Switch between panels** to see college-specific and general discussions

---

## 🔄 Re-running the Seed

To re-run the seeding (it will skip existing users):

```bash
cd backend
npm run seed:real-users
```

To check current database status:

```bash
cd backend
npx ts-node scripts/check-users.ts
```

---

## 📝 Notes

- All users have realistic bios and diverse academic backgrounds
- Posts cover important contemporary topics
- Comments are thoughtful and encourage discussion
- Each user represents a different college to showcase the platform's multi-institution support
- The seeding script is idempotent - it won't create duplicates if run multiple times
