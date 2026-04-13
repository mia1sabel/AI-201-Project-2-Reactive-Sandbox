# AI-201-Project-2-Reactive-Sandbox
This project is a System-Driven React Application designed for film production management. The application serves as a live 1st AD Production Dashboard, allowing a producer to manage the status and details of a shoot day through a centralized data model.
Call Time Production Dashboard - Design Brief
Domain: Film Production / Project Management 
System Role: Lead Producer / 1st AD
This project is a System-Driven React Application designed for film production management. The application serves as a live 1st AD Production Dashboard, allowing a producer to manage the status and details of a shoot day through a centralized data model.
System Vision & Mood
The Concept: A high-pressure, real-time "Call Sheet" manager for a film set. This is not a static PDF; it is a live machine used by a 1st AD to track the progress of a shoot day.
Visual Mood: "Midnight Production."
Palette: Deep charcoal backgrounds (#121212), high-contrast "Safety Orange" (#FF8C00) for actions, and "Script White" (#F5F5F5) for text.
Typography: Courier Prime or a similar Monospace font for data (to mimic a screenplay) and a clean Sans-Serif (Inter or Roboto) for UI labels.
Feel: Industrial, urgent, and precise. It should look like a tool that belongs on a rugged production monitor.
The Data Model (JSON Shape)
JSON
{
  "selectedSceneId": 1,
  "filterStatus": "all",
  "scenes": [
    {
      "id": 1,
      "slugline": "INT. APARTMENT - DAY",
      "description": "The protagonist discovers the hidden letter in the desk.",
      "cast": ["Aria", "Ben"],
      "props": ["Old Letter", "Antique Desk", "Letter Opener"],
      "location": "Soundstage A",
      "type": "INT",
      "status": "Ready"
    },
    {
      "id": 2,
      "slugline": "EXT. ALLEYWAY - NIGHT",
      "description": "Ben escapes through the back fire exit.",
      "cast": ["Ben", "Thug #1"],
      "props": ["Trash bags", "Dummy pistol"],
      "location": "4th St. Alley",
      "type": "EXT",
      "status": "In Progress"
    }
  ]
}

The Three Panels:
The Browser (Daily Strip): * Role: Vertical list of all scenes in the day’s shoot.
Logic: Reads scenes[]. When a user clicks a scene card, it triggers a callback to the parent to update selectedSceneId.
State Interaction: Highlights the "Active" scene.
The Detail View (Scene Breakdown): * Role: The "Deep Dive." Displays the description, cast list, and prop list for the selectedSceneId.
Logic: Read-only. It finds the scene object matching the ID and renders the details. It never changes state itself.
The Controller (The Production Desk): * Role: Global controls for the AD.
Actions: * Status Toggle: Buttons to mark the currently selected scene as "Ready," "In Progress," or "Wrapped."
Global Filter: A dropdown to filter the Browser by "INT" or "EXT" scenes.
Logic: Reads selectedSceneId to know what to edit; writes updates back to the scenes array in the parent state.
Interaction Rules
Selection: Clicking a scene in the Browser instantly populates the Detail View.
Updates: Clicking "Mark as Wrapped" in the Controller changes the status indicator on that scene’s card in the Browser.
Filtering: Changing the "INT/EXT" filter in the Controller causes the Browser to hide/show scenes immediately.
ESF Guardrails
Rule 1: State must live in the App.js (or highest parent). Components receive data via props.
Rule 2: Use Events Up. The Controller and Browser must use callback functions (e.g., onSelectScene, onUpdateStatus) to talk to the parent.
Rule 3: No Redux or Context API. Use useState only.
Rule 4: Structure over Style. Do not write a single line of CSS until the "wiring" (clicking a button updates the text) is 100% functional.
Defense Questions (Pre-filled for README)
Can I defend this? Yes. The architecture ensures that if the Producer marks a scene as "Wrapped," the entire crew (the UI) sees the same update simultaneously because there is only one source of truth.
Did I verify? I will check the React DevTools to ensure state only changes in the Parent component.
Is it mine? This tool is designed specifically for my workflow as a Film Producer, using industry-standard terminology (sluglines, cast, props).

