### Auth components
- [LoginForm.tsx](/app/app/components/LoginForm.tsx):
This component mounts on the /login, /login/trainer and /login/admin pages. It makes a POST request to /api/${userType}/login to authenticate user logins where userType is one of member, trainer or admin. This userType is set based on the page the user is logging in from. The login API returns a JWT token which we use to access protected routes for the rest of the session, as well as supply member, trainer and admin IDs when required.

- [MemberRegistrationForm.tsx](/app/app/components/MemberRegistrationForm.tsx):
This component mounts on the /register page. On submission it makes a POST request to [/api/member/register](/app/app/api/member/register/route.ts) to ensure the email doesn't already exist in the database. If every thing checks out, the endpoint inserts a new record in the members table. This is how new member accounts are created and it is the only user type that can be self-registered. Trainer accounts are created by admins and a single admin account is created by default the first time the app is launched w/ the credentials "admin@admin.com" and a password of "admin"

- [DashboardHeader.tsx](/app/app/components/DashboardHeader.tsx):
This component mounts whenever the member, trainer or admin dashboards load. It fetches the first name of the logged in user to display a welcome message. Trainers and members can press the "Edit profile" button in the welcome message dropdown to load their respective profile pages. Members, trainers and admins can press the logout button in the welcome message dropdown to clear the current session data and logout.

### Member components
- [UpcomingSessionsList.tsx](/app/app/components/UpcomingSessionsList.tsx.tsx):
This component mounts when the member dashboard page loads. It makes a GET request to [/api/member/upcoming-sessions](/app/app/api/member/upcoming-sessions/route.ts) to fetch all personal training sessions and group classes associated with the logged in member ID. It creates a list item for every returned item. Pressing the "Reschedule" button on a training session opens the BookTrainingSessionModal with the given training session data. Pressing the "cancel" button on a training session sends a DELETE request to [/api/member/training-sessions/route.ts}](/app/app/api/member/training-sessions/route.ts). Pressing the "Book Training Session" and "Register for Group Class" buttons open the BookTrainingSessionModal and ClassRegistrationModal components respectively.

- [BookTrainingSessionModal.tsx](/app/app/components/BookTrainingSessionModal.tsx):
This component is mounted when a logged in member presses the "Book Training Session" button in their UpcomingSessionsList on the member dashboard. Members set a desired date for a personal training session in the modal as well as a start and end time for the session. The modal makes a request to [/api/admin/trainers/available](/app/app/api/admin/trainers/available/route.ts) which returns a list of trainers who have availability for the selected date and time. A member must also select a room for the training session. When a room is selected the modal makes a request to [/api/member/rooms/available](/app/app/api/member/rooms/available/route.ts) to ensure the room will not be double booked for the given date and time. When the member submits the form a POST request is made to [/api/member/training-sessions](/app/app/api/member/training-sessions/route.ts) to insert a record into the training_sessions table or, a PUT request is made to [/api/member/training-sessions](/app/app/api/member/training-sessions/route.ts) to update an already existing record in the training_sessions table if they are rescheduling a session.

- [ClassRegistrationModal.tsx](/app/app/components/ClassRegistrationModal.tsx):
This component mounts when a member presses the Register for Group Class button on the member dashboard. It makes a GET reques to [/api/member/group-classes](/app/app/api/member/group-classes/route.ts) to fetch all existing classes in the group_classes table and renders a list item for each one. Each list item has a register button which submits a POST request to [/api/member/group-classes/enroll](/app/app/api/member/group-classes/enroll/route.ts) to create a new record in the class_enrollments table. If a user is already enrolled in a class this register button is replaced with a withdraw button that submits a DELETE request to [/api/member/group-classes/enroll/](/app/app/api/member/group-classes/enroll/route.ts) and deletes the record in that class_enrollments table that matches the member and class id.

- [FitnessGoalsSection.tsx](/app/app/components/FitnessGoalsSection.tsx):
This component mounts when the member dashboard page loads. It makes a GET request to [/api/member/fitness-goals](/app/app/api/member/fitness-goals/route.ts) and lists every goal the logged in member has created. Each list item has buttons to mark a goal as achieved, failed, or to delete the goal. Each button makes a PUT or DELETE request to [/api/member/fitness-goals/](/app/app/api/member/fitness-goals/route.ts). Pressing the "Create New Goal" button in this section opens the CreateGoalModal component.

- [CreateGoalModal.tsx](/app/app/components/CreateGoalModal.tsx):
This component mounts when an admin presses the "Create New Goal" button in the FitnessGoalsSection component. On submission it makes a POST request to [/api/member/fitness-goals](/app/app/api/member/fitness-goals/route.ts)  to insert a new record into the fitness_goals table for the member.

- [HealthMetricSection.tsx](/app/app/components/HealthMetricSection.tsx):
This component mounts when the member dashboard page loads. It makes a GET request to [/api/member/health-metrics](/app/app/api/member/health-metrics/route.ts) and lists every metric the logged in member has logged. Each list item has a button to delete the metric which makes a DELETE request to [/api/member/health-metrics/](/app/app/api/member/health-metrics/route.ts). Pressing the "Log New Metric" button in this section opens the LogHealthMetricModal component.

- [LogHealthMetricModal.tsx](/app/app/components/LogHealthMetricModal.tsx):
This component mounts when a member presses the "Log new Health Metric" button in the HealthMetricSection component. On submission it makes a POST request to /api/member/health-metrics to insert a new record into the health_metrics table. 

### Trainer Components
- [AvailabilityManager.tsx](/app/app/components/AvailabilityManager.tsx):
This component mounts when a trainer's profile page loads. It allows trainers to add "TrainerDaySchedule" entities at the click of a button. Adding an entity creates a list item in the front end where they can enter the start and end time for their availability on a given day. When they press the save button a PUT request is sent to the [/api/trainer/availability](/app/app/api/trainer/availability/route.ts) endpoint

- [TrainerUpcomingSessions.tsx](/app/app/components/TrainerUpcomingSessions.tsx):
This component mounts whenever the trainer dashboard loads. It makes a GET request to [/api/trainer/sessions](/app/app/api/trainer/sessions/route.ts) to fetch all training sessions and group classes associated with the logged in trainer ID. Trainers can click the member names associated with training sessions to populate member info in the MemberLookup component. Trainers can also click class names to be taken to a dedicated page for that class where they can review a list of all members currently enrolled.

- [MemberLookup.tsx](/app/app/components/MemberLookup.tsx):
This component mounts whenever the trainer dashboard loads. When the search button is pressed it makes a GET request to [/api/trainer/member-lookup](/app/app/api/trainer/member-lookup/route.ts). If it finds a matching member in the members table it returns information for that member's most recent fitness goal and health metric. Otherwise it displays a "Member not found" message.

### Admin Components
- [CreateTrainerModal.tsx](/app/app/components/CreateTrainerModal.tsx):
This component mounts when an admin presses the "Create Trainer Account" button on the admin dashboard. On submission it makes a POST request to [/api/admin/trainers](/app/app/api/admin/trainers/route.ts) to insert a new record into the trainers table. This is how new trainer accounts are created.

- [CreateRoomModal.tsx](/app/app/components/CreateRoomModal.tsx):
This component mounts when an admin presses the "Create Room" button on the admin dashboard. On submission it makes a POST request to [/api/admin/rooms](/app/app/api/admin/rooms/route.ts) to insert a new record into the rooms table. This is how new rooms are created. This component is reused when editing rooms, on submission of a room edit it makes a PUT request to [/api/admin/rooms/](/app/app/api/admin/rooms/route.ts) to update the given room data.

- [CreateClassModal.tsx](/app/app/components/CreateClassModal.tsx):
This component mounts when an admin presses the Create Group Class button on the admin dashboard. After entering the day and time for the class it makes requests to [/api/admin/trainers/available](/app/app/api/admin/trainers/available/route.ts) and [/api/admin/rooms](/app/app/api/admin/rooms/route.ts) to populate a list of trainers available for the set time and a list of all rooms. On submission it makes a request to [/api/admin/rooms/check-availability](/app/app/api/admin/rooms/check-availability/route.ts) to ensure the room is not being double booked. If every thing checks out it makes a POST request to [/api/admin/classes](/app/app/api/admin/classes/route.ts) to insert a record into the group_classes table. This modal is reused when editing classes in the ClassList component. On submission it makes a PUT request to [/api/admin/classes/](/app/app/api/admin/classes/route.ts) to update the given class data.

- [ClassList.tsx](/app/app/components/ClassList.tsx):
This component mounts when the admin dashboard loads. It renders a list of all existing classes from the "group_classes" table in the admin dashboard. There are buttons for an admin to edit and delete existing classes. The delete button makes a DELETE request to the [/api/admin/classes/](/app/app/api/admin/classes/route.ts) endpoint. The edit button opens up a CreateClassModal with the associated class data.

- [RoomsList.tsx](/app/app/components/RoomsList.tsx):
This component mounts when the admin dashboard loads. It renders a list of existing rooms. Each list item has an edit and delete button. The edit button opens the CreateRoomModal component. The delete button sends a DELETE request to [/api/admin/rooms/](/app/app/api/admin/rooms/route.ts).