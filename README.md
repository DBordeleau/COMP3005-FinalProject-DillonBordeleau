Dillon Bordeleau | #101038853

# How to run:

Install the required dependencies by navigating to the "app" directory from the root and running "npm install". After installing dependencies, from within the same "app" directory, run the "npm run dev" command. 

Follow the link in your terminal to open the web app (usually localhost:3000 by default).

# Supported Operations:
Below is a list of supported functionality from the project specs and the components & endpoints involved with each:

## Member Functions

### User Registration
New members can register at the /register route. After entering their credentials in the MemberRegistrationForm component, a POST request is made to /api/member/registration to ensure the email does not already exist in the database. If it doesn't a new record is made in the members table with a hashed password and the member can immediately login.

### Profile Management
Members can update their profile details by pressing the "Edit profile" button on the member dashboard. Members can also create new fitness goals and log health metrics from the dashboard. The CreateGoalModal and LogHealthMetricModal components use the /api/member/fitness-goals and /api/member/health-metrics endpoints for their respective CRUD operations.

### Health History
The HealthMetricSection component on the member dashboard maintains a list of health metrics for the logged in user, in descending order of when they were logged.

### Dashboard
The member dashboard displays stats at the top of the page for current active goals, classes and booked sessions. It also shows a list of upcoming sessions, classes, created fitness goals and logged health metrics.

### PT Session Scheduling
Members can schedule training sessions from the dashboard using the BookTrainingSessionModal component. This component uses the /api/member/training-sessions endpoint to create new training sessions and modify existing ones. It uses the /api/admin/trainers/available endpoint to populate a list of trainers who have matching availability for the desired training date and time, and the /api/member/rooms/available endpoint to prevent double booking of rooms.

### Group Class Registration
Members can register for scheduled classes using the ClassRegistrationModal on the member dashboard. This component makes requests to /api/member/group-classes/enroll to create new entries in the class_enrollments table. It uses the trigger_check_class_capacity trigger to prevent enrollment in full classes. It makes requests to /api/member/group-classes/enroll/{classId} to un-enroll members from classes they wish to withdraw from.

## Trainer Functions

### Set Availability
Trainers can set their availability from their profile page using the AvailabilityManager component. This component makes requests to the /api/trainer/availability endpoint to manage entries in the trainer_day_schedules table. These entries are used to verify trainer availability when members are booking training sessions and admins are assigning group classes.

### Schedule View
Trainers can view their upcoming sessions and classes on the trainer dashboard via the TrainerUpcomingSessions component. This component makes requests to /api/trainer/sessions to fetch all training sessions and group classes associated with the logged in trainer. It displays separate lists for training sessions and group classes on the dashboard. Trainers can click upcoming classes to check class enrollment, and can click their client names on upcoming training sessions to view member lookup information.

### Member Lookup
Trainers can lookup member data on the trainer dashboard via the MemberLookup component. The component makes requests to the /api/trainer/member-lookup endpoint and returns the latest fitness goal and health metric data for the given member.

## Admin Functions

### Class Management & Room Booking
Admins can create new classes from the admin dashboard via the CreateClassModal component. When entering schedule information requests are made to /api/admin/trainers/available to populate a list of trainers that are available at the scheduled time. Classes can only be assigned to trainers who have availability for the scheduled time, and no conflicting sessions/classes. Requests are also made to /api/admin/rooms/check-availability to prevent double booking of rooms.

# ORM Usage
I opted to use TypeORM to try and secure bonus marks. The ORM is configured in /app/data-source.ts and the entities are in /app/models, I will describe the configuration here.



# Project structure:

Note: The models directory is found within the app directory. My reasoning for this is that's where the TypeORM package is installed. If I wanted to include the TypeORM entities in a top level directory I would've had to install the package in the COMP3005-FinalProject-DillonBordeleau directory as well.

# /app - This is the NextJS project. Important directories/files are highlighted below

## /components - All the React components used in the project live here, a brief description of each component and the endpoints they use can be found in /docs/components.md

## /api - This is where every api endpoint is defined. Every endpoint is listed along with a brief description of what it does in /docs/endpoints.md

/docs - This directory contains the ER diagram and the components and endpoints markdown files.

README.md - You are here.