Below is a brief description of the purpose of every API endpoint in the NextJS app

### Admin Endpoints
[/admin](/app/app/api/admin/) - Contains all API routes related to the admin user type
- [/dashboard/route.ts](/app/app/api/admin/dashboard/route.ts) - This just returns the data associated with the admin user to display in the dashboard header. The actual admin dashboard contents are fetched from the admin dashboard page file and it is not based on the specific admin that's logged in. Any admin account can see all of the admin dashboard contents (all rooms and classes).
- [/classes/](/app/app/api/admin/classes/) - CRUD endpoints for [GroupClass](/app/models/GroupClass.ts) entities. Interacted with via the [ClassList](/app/app/components/ClassList.tsx) component on the admin dashboard.
    - [/classes/route.ts](/app/app/api/admin/classes/route.ts) - Read and Create endpoint for [GroupClass](/app/models/GroupClass.ts) entities. 
    - [/classes/[classId]/route.ts](/app/app/api/admin/classes/[classId]/route.ts) - Update and Delete endpoints for [GroupClass](/app/models/GroupClass.ts) entities.
- [/rooms/](/app/app/api/admin/rooms/) - CRUD endpoints for [Room](/app/models/Room.ts) entities. Also contains an endpoint to check room availability. Interacted with via the [RoomsList](/app/app/components/RoomsList.tsx) component on the admin dashboard.
    - [/rooms/route.ts](/app/app/api/admin/rooms/route.ts) - Read and Create endpoint for [Room](/app/models/Room.ts) entities.
    - [/rooms/[roomId]/route.ts](/app/app/api/admin/rooms/[roomId]/route.ts) - Update and Delete endpoints for [Room](/app/models/Room.ts) entities.
    - [/rooms/check-availability/route.ts](/app/app/api/admin/rooms/check-availability/route.ts) - Checks a given room, day and time with entries in the group_classes table to determine whether or not a room is already booked. No longer checks entries in the training_sessions table because I don't see why multiple personal training sessions couldn't take place in the same room.
- [/trainers/](/app/app/api/trainers/) - Creation endpoint for [Trainer](/app/models/Trainer.ts.ts) entities. Also contains an endpoint to check if a trainer is available at a given time.  
    - [/trainers/route.ts](/app/app/api/admin/trainers/route.ts) - Read and Create endpoint for [Trainer](/app/models/Trainer.ts.ts) entities. Currently, admins cannot edit or delete trainer accounts after creating them without querying the database directly.
    - [/trainers/available/route.ts](/app/app/api/admin/trainers/available/route.ts) - Returns a list of trainers that are available at a given time and day (they have availability, are not teaching a class, and have no training session booked). This endpoint is used to populate the trainer dropdown in the [CreateClassModal](/app/app/components/CreateClassModal.tsx) and [BookTrainingSessionModal](/app/app/components/BookTrainingSessionModal.tsx). Member user types can also make requests to this endpoint.

### Trainer Endpoints
[/trainer](/app/app/api/trainer/) - Contains all API routes related to the trainer user type
- [/dashboard/route.ts](/app/app/api/trainer/dashboard/route.ts) - This just returns the data associated with the logged in trainer user. Their actual schedule you see in the dashboard is returned from the /trainer/sessions route.
- [/availability/route.ts](/app/app/api/trainer/availability/route.ts) - CRUD endpoint for [TrainerDaySchedule](/app/models/TrainerDaySchedule.ts) entities. The [AvailabilityManager](/app/app/components/AvailabilityManager.tsx) component makes requests to this endpoint on submission.
- [/member-lookup/route.ts](/app/app/api/trainer/member-lookup/route.ts) - Returns the latest fitness goal and health metric for a member that matches the case insensitive name based search. The [MemberLookup](/app/app/components/MemberLookup.tsx) component submits requests to this endpoint on submission.
- [/sessions/route.ts](/app/app/api/trainer/sessions/route.ts) - Returns all upcoming training sessions and group classes associated with the logged in trainer. This is used to populate the [TrainerUpcomingSessions](/app/app/components/TrainerUpcomingSessions.tsx) component on their dashboard which acts as a schedule. Only upcoming sessions are returned, anything in the past is omitted.
- [/profile/route.ts](/app/app/api/trainer/profile/route.ts) - Read and Update endpoint for the trainer profile. Allows a trainer to change their name and password. The availability management is done on the profile page, but uses the [/availability/route.ts](/app/app/api/trainer/availability/route.ts) API route.
    
### Member Endpoints

[/member](/app/app/api/member/) - Contains all API routes related to the member user type
- [/dashboard/route.ts](/app/app/api/member/dashboard/route.ts) - Returns aggregated data for the logged in member to display in their dashboard. Uses the member_dashboard_summary view defined in [CREATE_VIEW.ts](/app/migrations/CREATE_VIEW.ts)
- [/register/route.ts](/app/app/api/member/register/route.ts) - Creation endpoint for member accounts. The [MemberRegistrationForm](/app/app/components/MemberRegistrationForm.tsx) makes POST requests to this endpoint on submission. Members are the only user type that can self-register
- [/fitness-goals/](/app/app/api/member/fitness-goals/) - CRUD endpoints for [FitnessGoal](/app/models/FitnessGoal.ts) entities. Fitness goals can't be edited but members can change their status by marking them as achieved/failed. Interacted with via the [FitnessGoalsSection](/app/app/components/FitnessGoalsSection.tsx) component on the member dashboard.
    - [/fitness-goals/route.ts](/app/app/api/member/fitness-goals/route.ts) - Read and Create endpoint for [FitnessGoal](/app/models/FitnessGoal.ts) entities.
    - [/fitness-goals/[goalId]/route.ts](/app/app/api/member/fitness-goals/[goalId]/route.ts) - Update and Delete endpoint for [FitnessGoal](/app/models/FitnessGoal.ts) entities.
- [/health-metrics/](/app/app/api/member/health-metrics/) - Creation, Read and Delete endpoint for [HealthMetric](/app/models/HealthMetric.ts) entities. [HealthMetricSection](/app/app/components/HealthMetricSection.tsx) component on the member dashboard.
    - [/health-metrics/route.ts](/app/app/api/member/health-metrics/route.ts) - Read and Create endpoint for [HealthMetric](/app/models/HealthMetric.ts) entities.
    - [/health-metrics/[metricId]/route.ts](/app/app/api/member/health-metrics/[metricId]/route.ts) - Delete endpoint for [HealthMetric](/app/models/HealthMetric.ts) entities.
- [/training-sessions/](/app/app/api/member/training-sessions/) - CRUD endpoints for [TrainingSession](/app/models/TrainingSession.ts) entities.
    - [/training-sessions/route.ts](/app/app/api/member/training-sessions/route.ts) - Read and Create endpoint for [TrainingSession](/app/models/TrainingSession.ts) entities. Schedules new training sessions for the logged in member on POST request.
    - [/training-sessions/[sessionId]/route.ts](/app/app/api/member/training-sessions/[sessionId]/route.ts) - Update and Delete endpoint for [TrainingSession](/app/models/TrainingSession.ts) entities. Reschedules or cancels a given training session for the logged in member.
- [/group-classes/](/app/app/api/member/group-classes/) - CRUD endpoints for [ClassEnrollment](/app/models/ClassEnrollment.ts) entities.
    - [/group-classes/route.ts](/app/app/api/member/group-classes/route.ts) - Read endpoint for [ClassEnrollment](/app/models/ClassEnrollment.ts) entities. Returns all enrollments for the logged in member. 
    - [/group-classes/enroll/route.ts](/app/app/api/member/group-classes/enroll/route.ts) - Creation endpoint for [ClassEnrollment](/app/models/ClassEnrollment.ts) entities. Enrolls the logged in user in a given group class on a POST submission as long as they are not already registered and capacity isn't full. Inserts trigger the check_class_capacity() function defined in [CREATE_TRIGGER.ts](/app/migrations/CREATE_TRIGGER.ts).
    - [/group-classes/enroll/[classId]/route.ts](/app/app/api/member/group-classes/enroll/[classId]/route.ts) - Delete endpoint for [ClassEnrollment](/app/models/ClassEnrollment.ts) entities. Withdraws the logged in member from a given group class.
- [/upcoming-sessions/route.ts](/app/app/api/member/upcoming-sessions/route.ts) - Returns all upcoming training sessions and enrolled group classes for the logged in member. Used to populate the [UpcomingSessionsList](/app/app/components/UpcomingSessionsList.tsx) component on the member dashboard.
- [/rooms/available/route.ts](/app/app/api/member/rooms/available/route.ts) - Used to check if a room is available when a member is booking a training session.


### Generic Endpoints
- [/login/route.ts](/app/app/api/login/route.ts) - Authentication route that [LoginForm](/app/app/components/LoginForm.tsx) component submits POST request to. Checks credentials based on userType (admin, trainer or member). If authentication passes it returns a JWT token that we use to access the member/trainer/admin ID for the current session. The passed user type is based on which login page the form is submitted from.

- [/class/[classId]/route.ts](/app/app/api/class/[classId]/route.ts) - Returns data associated with the given classId (name, description, trainer, capacity) and a list of enrollments. Used by the dedicated class page which is accessible to trainers via their upcoming classes list.

