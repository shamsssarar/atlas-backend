ATLAS PERFORMANCE HUB
Minimum Viable Product (MVP) Operational & AI Workflows
This document outlines the streamlined Version 1.0 (MVP) architecture for Atlas. By pivoting to a rigidcalendar data model, we eliminate complex Rules Engines (like floating schedules and forced rest logic)
while maintaining an elite, premium user experience. This allows for a much faster launch cycle.
1. Simplified Data Structure (The Calendar Method)
Instead of floating constraints, the relational model is highly linear:
Program (e.g., Beginner 3-Day Split) → WorkoutDay (Fixed to Day 1, Day 2, etc.) → Exercise
(e.g., Back Squat) → SetTarget (e.g., 3 sets, 10 reps).
THE COACH (The Creator Workflow)
The Coach is the architect of the training block. Their workflow prioritizes speed and clarity over
complex mathematical programming.
Program Initialization: The Coach logs into the dashboard, selects "Create New Program," and
chooses a 3-day or 4-day template.
Building the Days: They select a specific day (e.g., "Monday / Day 1") and add exercises from the
global database.
Setting Targets: They assign static, clear targets for the Athlete. For example: "Back Squats: 3 sets
of 10 reps." They do not need to calculate 1RMs or complex percentages.
Publish & Assign: The Coach saves the block and clicks "Assign to Athlete." The payload is saved
to the PostgreSQL database via Prisma.
THE ATHLETE (The Executor Workflow)
The Athlete's workflow is heavily focused on low-friction data entry while actively at the gym.
The Daily Checklist: The Athlete opens the app on their assigned day (e.g., Monday). The app
immediately displays the "Day 1 Workout" like a checklist.
Simple Logging: As they perform their Back Squats, they input the actual weight used (e.g., 135
lbs) and check the "Completed" box for that set.
Handling Missed Days: There are no complex lockout rules. If an Athlete misses Wednesday, it is
simply marked as "Missed" in the database. The Athlete can manually choose to execute that
workout on Thursday without breaking the system logic.
•
•
•
•
•
•
•
THE AI ENGINE (Gemini 1.5 Pro MVP Features)
We deploy AI precisely where it eliminates friction. These features use Gemini's fast processing to
provide immediate value without requiring long-running background tasks.
Feature 1: The "Smart Swap" Button (In-Gym Fix)
Trigger: The Athlete is at the gym, but the required equipment (e.g., Leg Press) is occupied or
broken.
Action: The Athlete taps the "Smart Swap" button on that exercise.
AI Execution: The backend queries Gemini: "Provide exactly one highly similar alternative to the
Leg Press suitable for a standard commercial gym."
Result: The UI instantly replaces "Leg Press" with "Goblet Squat," keeping the athlete moving
without having to text their Coach.
Feature 2: The "Next Week Nudge" (Auto-Progression)
Trigger: The Athlete completes Week 1 of their program.
Action: Before Week 2 begins, the backend compiles Week 1's logged weights.
AI Execution: Gemini is prompted to apply standard linear progression principles (e.g., adding 5
lbs to compound lifts or 1 rep to isolation lifts) based on the Athlete's successful completions.
Result: Week 2 is automatically populated with the new, slightly heavier targets, saving the Coach
hours of manual data entry every Sunday.
Feature 3: The "Weekly Hype Summary" (NLP Feedback)
Trigger: The Athlete logs their final workout of the week.
Action: The backend sends the week's raw JSON completion data to Gemini.
AI Execution: Gemini is instructed to act as an encouraging coach and write a 2-sentence
motivational summary based on the actual numbers.
Result: A modal appears: "Incredible work this week, John! You hit all 3 days and your squat went
up by 5 lbs. Enjoy your rest weekend!"