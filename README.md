# Connect & Thrive Careers

Build a complete, production-style full-stack Job Board website for my web development project.

TECH STACK

- Frontend: React.js

- Backend: Node.js + Express.js

- Database: MongoDB

- Authentication: JWT-based authentication

- Styling: Tailwind CSS

- Use a clean REST API architecture

- Make the application fully responsive for desktop, tablet, and mobile

- Structure the code cleanly so it is easy to understand and modify

PROJECT NAME

"JobConnect" – Job Search & Recruitment Platform

MAIN PURPOSE

Create a platform where:

1. Employers can create accounts, create company profiles, post jobs, edit/delete jobs, and manage applications.

2. Job seekers/candidates can create accounts, build their profiles, search/filter jobs, view job details, upload resumes, and apply for jobs.

3. The system sends email notifications for successful applications and important application updates.

USER ROLES

Create two main user roles:

- Candidate

- Employer

Also create a basic Admin role for managing the platform.

AUTHENTICATION

Create:

- Sign up

- Login

- Logout

- Forgot password

- Reset password

- JWT authentication

- Protected routes

- Role-based authorization

- Secure password hashing

- Form validation

- Proper error handling

- Session/token handling

HOME PAGE

Create a modern professional landing page.

Include:

- Navbar with logo "JobConnect"

- Home

- Find Jobs

- Companies

- About

- Login

- Register

- Dashboard button when logged in

Hero section:

- Heading: "Find Your Next Opportunity"

- Short description

- Large job search bar

- Search by job title, skill, or keyword

- Location search

- "Search Jobs" button

Add:

- Featured Jobs section

- Popular job categories

- Featured companies

- How It Works section

- Statistics section

- Call-to-action section

- Professional footer

JOB LISTINGS PAGE

Create a complete jobs listing page.

Each job card should display:

- Job title

- Company name

- Company logo

- Location

- Job type

- Salary range

- Experience level

- Posted date

- Short description

- Apply/View Details button

Add search and filtering:

- Search by keyword

- Location

- Job category

- Job type:

  - Full-time

  - Part-time

  - Internship

  - Contract

  - Remote

- Experience level

- Salary range

- Date posted

Add:

- Sort by newest

- Sort by salary

- Pagination

- Empty-state message

- Loading skeletons

JOB DETAIL PAGE

Create a detailed job page.

Display:

- Job title

- Company

- Company logo

- Location

- Salary

- Job type

- Experience level

- Posted date

- Number of applicants

Sections:

- Job Description

- Responsibilities

- Requirements

- Skills

- Benefits

- About Company

Add:

- "Apply Now" button

- Save Job button

- Share button

- Similar Jobs section

If the user is not logged in and clicks Apply Now:

- Ask them to login/register.

If an employer views their own job:

- Show Edit Job

- Delete Job

- View Applications

CANDIDATE DASHBOARD

Create a professional candidate dashboard.

Sidebar navigation:

- Overview

- My Profile

- My Applications

- Saved Jobs

- Resume

- Account Settings

- Logout

Dashboard overview:

- Total applications

- Applications in review

- Shortlisted applications

- Rejected applications

- Recently applied jobs

CANDIDATE PROFILE

Allow candidates to manage:

- Full name

- Profile photo

- Email

- Phone

- Location

- Professional headline

- Bio/About

- Skills

- Education

- Work experience

- Certifications

- Portfolio URL

- LinkedIn URL

- GitHub URL

Allow candidates to upload/update their resume.

JOB APPLICATION PROCESS

Create a complete application workflow.

When candidate clicks "Apply Now":

Open application form containing:

- Full name

- Email

- Phone

- Cover letter

- Resume upload

- Optional portfolio URL

- Optional LinkedIn URL

Resume:

- Allow PDF/DOC/DOCX

- Validate file type

- Validate file size

- Show uploaded file name

- Allow replacing the resume

Prevent duplicate applications to the same job.

After successful application:

- Show success confirmation

- Create application record in database

- Update application count

- Send confirmation email to candidate

- Notify employer about the new application

APPLICATION STATUS

Employer should be able to update application status:

- Applied

- Under Review

- Shortlisted

- Interview

- Rejected

- Hired

Candidate should be able to see the status of every application.

EMPLOYER DASHBOARD

Create an employer dashboard.

Sidebar:

- Overview

- Company Profile

- Post a Job

- Manage Jobs

- Applications

- Account Settings

- Logout

Dashboard overview:

- Total jobs posted

- Active jobs

- Total applications

- Pending applications

- Recent applications

COMPANY PROFILE

Employers can manage:

- Company name

- Company logo

- Company description

- Industry

- Company size

- Website

- Location

- Founded year

- Social links

POST JOB PAGE

Create a complete job posting form.

Fields:

- Job title

- Job category

- Job type

- Location

- Remote/hybrid/on-site

- Salary minimum

- Salary maximum

- Experience level

- Job description

- Responsibilities

- Requirements

- Required skills

- Benefits

- Application deadline

Buttons:

- Save Draft

- Publish Job

JOB MANAGEMENT

Employer can:

- View all posted jobs

- Edit jobs

- Delete jobs

- Publish/unpublish jobs

- View job applications

- See number of applicants

- Filter jobs by status

APPLICATION MANAGEMENT

Create an employer application management page.

Display:

- Candidate name

- Email

- Job applied for

- Application date

- Resume

- Cover letter

- Application status

Employer actions:

- View candidate profile

- Download/view resume

- Change application status

- Send/update interview information

ADMIN DASHBOARD

Create a basic admin dashboard.

Admin can:

- View total users

- View candidates

- View employers

- View jobs

- View applications

- Delete inappropriate jobs

- Suspend users

- Manage reported content

DATABASE DESIGN

Use MongoDB.

Create appropriate models:

User:

- name

- email

- password

- role

- profile

- createdAt

- updatedAt

CandidateProfile:

- userId

- phone

- location

- headline

- bio

- skills

- education

- experience

- certifications

- portfolio

- linkedin

- github

- resumeUrl

EmployerProfile:

- userId

- companyName

- logo

- description

- industry

- companySize

- website

- location

- foundedYear

- socialLinks

Job:

- employerId

- title

- category

- description

- responsibilities

- requirements

- skills

- benefits

- jobType

- workplaceType

- location

- salaryMin

- salaryMax

- experienceLevel

- applicationDeadline

- status

- applicantsCount

- createdAt

- updatedAt

Application:

- jobId

- candidateId

- employerId

- resumeUrl

- coverLetter

- portfolioUrl

- linkedinUrl

- status

- createdAt

- updatedAt

SavedJob:

- candidateId

- jobId

- createdAt

SEARCH API

Implement backend search functionality.

Support:

- keyword search

- location search

- category filter

- job type filter

- experience filter

- salary filter

- pagination

- sorting

Use MongoDB indexes where appropriate.

EMAIL NOTIFICATIONS

Implement email notifications using a service such as Nodemailer.

Send email when:

1. Candidate successfully applies.

2. Employer receives a new application.

3. Employer changes application status.

4. Candidate is shortlisted.

5. Candidate is rejected.

6. Candidate receives interview information.

7. Password reset is requested.

Create reusable email templates.

FILE UPLOAD

Implement secure resume/profile image uploads.

Use an appropriate cloud storage solution such as Cloudinary or another suitable service.

Do not store large files directly inside MongoDB.

SECURITY

Implement:

- Password hashing with bcrypt

- JWT authentication

- Protected API routes

- Role-based authorization

- Input validation

- File type validation

- File size validation

- CORS configuration

- Secure HTTP headers

- Rate limiting for authentication endpoints

- Prevent unauthorized access to dashboards

- Never expose passwords or sensitive data through APIs

- Proper environment variables for secrets

ENVIRONMENT VARIABLES

Create a .env.example file containing placeholders such as:

MONGODB_URI=

JWT_SECRET=

EMAIL_HOST=

EMAIL_PORT=

EMAIL_USER=

EMAIL_PASSWORD=

CLOUDINARY_CLOUD_NAME=

CLOUDINARY_API_KEY=

CLOUDINARY_API_SECRET=

Never hard-code secrets.

API STRUCTURE

Use REST API endpoints similar to:

/api/auth/register

/api/auth/login

/api/auth/logout

/api/auth/forgot-password

/api/auth/reset-password

/api/jobs

/api/jobs/:id

/api/jobs/search

/api/applications

/api/applications/:id

/api/applications/:id/status

/api/candidates/profile

/api/candidates/resume

/api/employers/profile

/api/employers/jobs

/api/employers/applications

/api/admin/users

/api/admin/jobs

/api/admin/applications

FRONTEND DESIGN

Create a modern professional UI.

Design style:

- Clean job/recruitment platform

- Professional

- Minimal

- Easy navigation

- Modern cards

- Rounded corners

- Good spacing

- Accessible typography

- Responsive layout

- Subtle animations

- Professional dashboard sidebar

Use reusable components:

- Navbar

- Footer

- JobCard

- SearchBar

- FilterSidebar

- CompanyCard

- ApplicationCard

- StatusBadge

- Modal

- Pagination

- LoadingSkeleton

- EmptyState

- Toast notifications

- Form components

RESPONSIVE DESIGN

The website must work properly on:

- Desktop

- Laptop

- Tablet

- Mobile

On mobile:

- Convert sidebar into a drawer/menu

- Make job cards responsive

- Make forms mobile-friendly

- Make tables horizontally scrollable or convert them to cards

- Keep buttons easily tappable

ERROR HANDLING

Create proper:

- Loading states

- Error states

- Empty states

- Success notifications

- Form validation messages

- 404 page

- Unauthorized page

IMPORTANT UX FEATURES

- Disable Apply button if already applied

- Show "Applied" status on jobs already applied to

- Allow candidates to save/unsave jobs

- Show application status with colored badges

- Confirm before deleting jobs

- Confirm before deleting accounts

- Show upload progress

- Show toast notifications after actions

SEED DATA

Create realistic sample data for development:

- At least 10 jobs

- Several companies

- Several categories

- Sample candidates

- Sample employers

Include different job types such as:

- Software Developer

- Frontend Developer

- Backend Developer

- Full Stack Developer

- UI/UX Designer

- Data Analyst

- DevOps Engineer

- Marketing Intern

- ECE/Embedded Systems Engineer

- Product Manager

IMPORTANT

Do not create only a static frontend.

Build the actual full-stack application with:

- React frontend

- Node.js/Express backend

- MongoDB database

- Authentication

- REST APIs

- CRUD operations

- File uploads

- Search/filter functionality

- Job applications

- Dashboards

- Email notifications

Make sure frontend API calls are connected to the backend.

Create a clear folder structure such as:

/client

  /src

    /components

    /pages

    /layouts

    /hooks

    /services

    /context

    /utils

/server

  /controllers

  /models

  /routes

  /middleware

  /services

  /utils

  /config

Also create:

- README.md

- .env.example

- API documentation

- Setup instructions

- Database setup instructions

- Development and production run commands

Before finishing, test the major user flows:

1. Candidate registration

2. Candidate login

3. Candidate profile update

4. Resume upload

5. Job search

6. Job filtering

7. Job details

8. Job application

9. Employer registration

10. Employer job posting

11. Employer editing/deleting a job

12. Employer viewing applications

13. Employer changing application status

14. Candidate viewing application status

15. Email notification flow

16. Logout

Fix any errors you encounter.

The final result should look like a real professional recruitment platform rather than a basic college demo.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/5f9211e3-855b-457b-9656-86bae0257e62).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
