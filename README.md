Dillon Bordeleau | #101038853

# How to run:

Install the required dependencies by navigating to the "app" directory from the root and running "npm install". After installing dependencies, from within the same "app" directory, run the "npm run dev" command. 

Follow the link in your terminal to open the web app (usually localhost:3000 by default).

# Supported Operations
Below is a list of supported functionality from the project specs and the components & endpoints involved with each:

## Member Functions

### User Registration
New members can register at the [/register](/app/app/register/page.tsx) route. After entering their credentials in the [MemberRegistrationForm](/app/app/components/MemberRegistrationForm.tsx) component, a POST request is made to [/api/member/registration](/app/app/api/member/registration/route.ts) on form submission to ensure the email does not already exist in the database. If it doesn't a new record is made in the members table with a hashed password and the member can immediately login.

### Profile Management
Members can update their profile details by pressing the "Edit profile" button in the [DashboardHeader](/app/app/components/DashboardHeader.tsx) component. Members can also create new fitness goals and log health metrics from the dashboard by pressing the respective buttons in the [FitnessGoalsSection](/app/app/components/FitnessGoalsSection.tsx) and [HealthMetricSection](/app/app/components/HealthMetricSection.tsx). The [CreateGoalModal](/app/app/components/CreateGoalModal.tsx) and [LogHealthMetricModal](/app/app/components/LogHealthMetricModal.tsx) components use the [/api/member/fitness-goals/](/app/app/api/member/fitness-goals/) and [/api/member/health-metrics/](/app/app/api/member/health-metrics/) endpoints for their respective CRUD operations.

### Health History
The [HealthMetricSection](/app/app/components/HealthMetricSection.tsx) component on the member dashboard maintains a list of health metrics for the logged in user, in descending order of when they were logged.

### Dashboard
The member dashboard displays stats at the top of the page for current active goals, classes and booked sessions. It also shows a list of upcoming sessions, classes, created fitness goals and logged health metrics.

### PT Session Scheduling
Members can schedule training sessions from the member dashboard using the [BookTrainingSessionModal](/app/app/components/BookTrainingSessionModal.tsx) component. This component uses the [/api/member/training-sessions](/app/app/api/member/training-sessions/) endpoints to create new training sessions and modify existing ones. It uses the [/api/admin/trainers/available](/app/app/api/admin/trainers/available/route.ts) endpoint to populate a list of trainers who have matching availability for the desired training date and time, and the [/api/member/rooms/available](/app/app/api/member/rooms/available/route.ts) endpoint to prevent double booking of rooms.

### Group Class Registration
Members can register for scheduled classes using the [ClassRegistrationModal](/app/app/components/ClassRegistrationModal.tsx) on the member dashboard. This component makes requests to [/api/member/group-classes/enroll](/app/app/api/member/group-classes/enroll/route.ts) endpoints to create new entries in the class_enrollments table. It uses the trigger_check_class_capacity trigger to prevent enrollment in full classes. It makes requests to [/api/member/group-classes/enroll/{classId}](/app/app/api/member/group-classes/enroll/[classId]/route.ts) to un-enroll members from classes they wish to withdraw from.

## Trainer Functions

### Set Availability
Trainers can set their availability from their profile page using the [AvailabilityManager](/app/app/components/AvailabilityManager.tsx) component. This component makes requests to the [/api/trainer/availability](/app/app/api/trainer/availability/route.ts) endpoint to manage entries in the trainer_day_schedules table. These entries are used to verify trainer availability when members are booking training sessions and admins are assigning group classes.

### Schedule View
Trainers can view their upcoming sessions and classes on the trainer dashboard via the [TrainerUpcomingSessions](/app/app/components/TrainerUpcomingSessions.tsx) component. This component makes requests to [/api/trainer/sessions](/app/app/api/trainer/sessions/route.ts) to fetch all training sessions and group classes associated with the logged in trainer. It displays separate lists for training sessions and group classes on the dashboard. Trainers can click upcoming classes to check class enrollment, and can click their client names on upcoming training sessions to view member lookup information.

### Member Lookup
Trainers can lookup member data on the trainer dashboard via the [MemberLookup](/app/app/components/MemberLookup.tsx) component. The component makes requests to the [/api/trainer/member-lookup](/app/app/api/trainer/member-lookup/route.ts) endpoint and returns the latest fitness goal and health metric data for the given member.

## Admin Functions

### Class Management & Room Booking
Admins can create new classes from the admin dashboard via the [CreateClassModal](/app/app/components/CreateClassModal.tsx) component. When entering schedule information requests are made to [/api/admin/trainers/available](/app/app/api/admin/trainers/available/route.ts) to populate a list of trainers that are available at the scheduled time. Classes can only be assigned to trainers who have availability for the scheduled time, and no conflicting sessions/classes. Requests are also made to [/api/admin/rooms/check-availability](/app/app/api/admin/rooms/check-availability/route.ts) to prevent double booking of rooms.

# ORM Usage
I opted to use TypeORM to try and secure bonus marks. The ORM is configured in [/app/data-source.ts](/app/data-source.ts) and the entities and their relations are defined in [/app/models](/app/models/), I will describe the configuration here.

The getDataSource() function initializes the database if it hasn't already been initialized. This creates all tables for the entities exported in [/models/index.ts](/app/models/index.ts). This is done for us automatically because we have the synchronize property set to true.

The promise it returns is the DataSource, AKA TypeORM's connection to our database. Whenever we want to make queries to the database we must import this function and then await the promise to gain access to the database. It looks like this:

```
const dataSource = await getDataSource();
```

Then we can use the query() method on the returned Promise to query the database and get responses. Here's an example where we fetch every fitness goal for a given member and order them by status:
```
const goals = await dataSource.query(
    `SELECT 
        goal_id,
        name,
        target_value,
        target_date,
        status
    FROM fitness_goals
    WHERE member_id = $1
    ORDER BY 
        CASE 
            WHEN status = 'In Progress' THEN 1
            WHEN status = 'Achieved' THEN 2
            ELSE 3
        END,
        target_date DESC`,
    [user.memberId]
);

return NextResponse.json({ goals }, { status: 200 });
```

You will see this pattern in every endpoint that makes a database query.

The other methods we use frequently are:
- getRepostiory(entity) returns a reference to the table associated with the passed entity. For example, to store a reference to the members table as a variable:
    ```
    const members = dataSource.getRepository(Member); // Now we can do members.find() to match records in the members table
    ```
- someRepository.find(conditions) and findOne(conditions) to return all records matching our conditions or the first record matching our conditions.
- someRepository.save(entity) similar to commit() in other ORMs. TypeORM will intellgently determine whether to insert a new record or update an existing one based on the presence and value of the passed in entity. Can also be used for partial updates, it will automatically skip undefined properties when doing an update.
- someRepository.create() Creates a new entity of the type associated with the repository. In the above example where we got the members repository, if we did members.Create() it would create a new empty Member entity. You can also supply initial data.
- someRepository.delete() Deletes an entity based on the passed in criteria. Example: members.delete(1) would delete the member with id = 1.

The getDataSource function also runs the imported migrations on initialization. You can view the migrations in detail in [/app/migrations](/app/migrations/), but I will briefly describe what each does:

- [CREATE_INDEX.ts](/app/migrations/CREATE_INDEX.ts): This creates **3 indexes.** 
    - One ON health_metrics(member_id, recorded_date DESC) for efficient retrievals of a member's health_metrics in the member dashboard.
    - Another ON training_sessions(member_id, session_date); for efficient retrieval of a member's booked training sessions.
    - And one ON class_enrollments(member_id); for efficient retrieval of a member's class_enrollments.

- [CREATE_VIEW.ts](/app/migrations/CREATE_VIEW.ts): This creates a member_dashboard_summary **view** which aggregates all of the member data we display on the member dashboard.

- [CREATE_TRIGGER.ts](/app/migrations/CREATE_TRIGGER.ts): This creates a check_class_capacity **trigger**. It triggers whenever we try to insert into the class_enrollments table and checks to see if the class we are enrolling in is full. If it is, it doesn't allow us to enroll.

- [CreateDefaultAdmin.ts](/app/migrations/CreateDefaultAdmin.ts): This creates an admin account with the following credentials and inserts the corresponding record in the admin_staff table:
    - Email: Admin@admin.com
    - First Name: Super
    - Last Name: Admin
    - Password: admin

Every exported migration class has a timestamp in its name because I was getting TypeORM errors explicitly prompting me to include a timestamp in the class name when I tried to run them without it.

# Project structure

Note: The models directory is found within the app directory. My reasoning for this is that's where the TypeORM package is installed. If I wanted to include the TypeORM entities in a top level directory I would've had to install the package in the COMP3005-FinalProject-DillonBordeleau directory as well.

- [/app](/app/app/) - This is the NextJS project. Important directories/files are highlighted below

- [/components](/app/app/components/) - All the React components used in the project live here, a brief description of each component and the endpoints they use can be found in [/docs/components.md](/docs/components.md)

- [/api](/app/app/api/) - This is where every api endpoint is defined. Every endpoint is listed along with a brief description of what it does in [/docs/endpoints.md](/docs/endpoints.md)

- [/docs](/docs/) - This directory contains the [ER diagram](/docs/ERD.png) and the components and endpoints markdown files.

- [data-source.ts](/app/data-source.ts) - This file contains the configuration for our TypeORM data source. The exported getDataSource() function is what we will use to establish a connection with our postgres database through TypeORM.

- [/models](/app/models/) - Contains all entity classes and their relations. All of the classes used in our TypeORM data source are exported in [index.ts](/app/models/index.ts).

- [/migrations](/app/migrations/) - Contains TypeORM migration classes that create our indexes, views, triggers and our initial admin account.

README.md - You are here.