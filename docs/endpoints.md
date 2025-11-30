Below is a brief description of the purpose of every API endpoint in the NextJS app

### Admin Endpoints
[/admin](/app/app/api/admin/) - Contains all API routes related to the admin user type
- [/dashboard/route.ts](/app/app/api/admin/dashboard/route.ts) - This just returns the data associated with the admin user to display in the dashboard header. The actual admin dashboard contents are fetched from the admin dashboard page file and it is not based on the specific admin that's logged in. Any admin account can see all of the admin dashboard contents (all rooms and classes).
- [/login/route.ts](/app/app/api/admin/login/route.ts) - Endpoint that login form submits POST request to when the user type is admin
- [/classes/](/app/app/api/admin/classes/) - CRUD endpoints for [GroupClass](/app/models/GroupClass.ts) entities  
    - [/classes/route.ts](/app/app/api/admin/classes/route.ts) - Read and Create endpoints for [GroupClass](/app/models/GroupClass.ts) entities.
    - [/classes/[classId]/route.ts](/app/app/api/admin/classes/[classId]/route.ts) - Update and Delete endpoints for [GroupClass](/app/models/GroupClass.ts) entities.
- [/rooms/](/app/app/api/admin/rooms/) - CRUD endpoints for [Room](/app/models/Room.ts) entities. Also contains an endpoint to check room availability.  
    - [/rooms/route.ts](/app/app/api/admin/rooms/route.ts) - Read and Create endpoints for [Room](/app/models/Room.ts) entities.
    - [/rooms/[roomId]/route.ts](/app/app/api/admin/rooms/[roomId]/route.ts) - Update and Delete endpoints for [Room](/app/models/Room.ts) entities.
    - [/rooms/check-availability/route.ts](/app/app/api/admin/rooms/check-availability/route.ts) - Checks a given room, day and time with entries in the group_classes table to determine whether or not a room is already booked. No longer checks entries in the training_sessions table because I don't see why multiple personal training sessions couldn't take place in the same room.
- [/trainers/](/app/app/api/trainers/) - Creation endpoint for [Trainer](/app/models/Trainer.ts.ts) entities. Also contains an endpoint to check if a trainer is available at a given time.  
    - [/trainers/route.ts](/app/app/api/admin/trainers/route.ts) - Read and Create endpoints for [Trainer](/app/models/Trainer.ts.ts) entities. Currently, admins cannot edit or delete trainer accounts after creating them without querying the database directly.
    - [/trainers/available/route.ts](/app/app/api/admin/trainers/available/route.ts) - Returns a list of trainers that are available at a given time and day (they have availability, are not teaching a class, and have no training session booked). This endpoint is used to populate the trainer dropdown in the [CreateClassModal](/app/app/components/CreateClassModal.tsx) and [BookTrainingSessionModal](/app/app/components/BookTrainingSessionModal.tsx). Member user types can also make requests to this endpoint.

### Trainer Endpoints
[/trainer](/app/app/api/trainer/) - Contains all API routes related to the trainer user type
- [/dashboard/route.ts](/app/app/api/trainer/dashboard/route.ts) - This just returns the data associated with the logged in trainer user. Their actual schedule you see in the dashboard is returned from the /trainer/sessions route.
- [/login/route.ts](/app/app/api/trainer/login/route.ts) - Endpoint that login form submits POST request to when the user type is trainer.
- [/availability/route.ts](/app/app/api/trainer/availability/route.ts) - CRUD endpoints for [TrainerDaySchedule](/app/models/TrainerDaySchedule.ts) entities. The [AvailabilityManager](/app/app/components/AvailabilityManager.tsx) makes requests to this endpoint on submission.
- [/member-lookup/route.ts](/app/app/api/trainer/member-lookup/route.ts) - Returns the latest fitness goal and health metric for a member that matches the case insensitive name based search. The [MemberLookup](/app/app/components/MemberLookup.tsx) component submits requests to this endpoint on submission.
- [/sessions/route.ts](/app/app/api/trainer/sessions/route.ts) - Returns all training sessions and group classes associated with the logged in trainer. This is used to populate the trainer's schedule on their dashboard.
- [/profile/route.ts](/app/app/api/trainer/profile/route.ts) - Read and Update endpoints for the trainer profile. Allows a trainer to change their name and password. The availability management is done on the profile page, but uses the [/availability/route.ts](/app/app/api/trainer/availability/route.ts) API route.
    
### Member Endpoints


