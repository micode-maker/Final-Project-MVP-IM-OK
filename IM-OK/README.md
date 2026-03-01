# IM OK

IM OK is a React + Vite single-page MVP for daily senior check-ins. A senior can complete a daily check-in from the dashboard, receive a motivational quote from an external API, and caregivers can view status and streak progress.

## Technologies Used

- React
- Vite
- React Router DOM
- Vitest + React Testing Library
- CSS

## Project Structure

```text
src/
  components/
    CharacterCard.jsx
    Header.jsx
    NavButtons.jsx
    QuoteCard.jsx
    StatusBadge.jsx
    StreakDisplay.jsx
  contexts/
    CheckInContext.jsx
    checkInContext.js
    useCheckIn.js
  pages/
    Home.jsx
    Dashboard.jsx
    Caregiver.jsx
    Profile.jsx
    NotFound.jsx
  utilities/
    fetchQuote.js
  App.jsx
  App.css
  index.css
  main.jsx
  App.test.jsx
```

## Setup and installation instructions

1. Install dependencies:

```bash
npm install
```

2. Create `.env` in project root:

```bash
VITE_API_NINJAS_KEY=your_api_ninjas_key_here
```

3. Start development server:

```bash
npm run dev
```

## Testing

IM OK uses Vitest and React Testing Library to validate core functionality, component rendering, state transitions, and user interactions.
Run tests:

```bash
npm run test -- --run
```

## Routes

- `/` Home
- `/dashboard` Senior dashboard
- `/caregiver` Caregiver dashboard
- `/profile` Profile overview
- `/profile/:section` Dynamic profile section route (`overview`, `preferences`, `caregiver`)
- `*` Not Found

## Features

- React component architecture with reusable UI components
- React Router navigation with static and dynamic routes
- Local state (`useState`) for dashboard quote workflow
- Global shared state (`Context API`) for check-in status and streak
- External API integration (API Ninjas Quotes)
- Loading and error handling for API requests
- Mobile-first responsive layout
- Unit tests using React Testing Library + Vitest

## API

Quote service: `src/utilities/fetchQuote.js`

- API: `https://api.api-ninjas.com/v2/quotes`
- Required env var: `VITE_API_NINJAS_KEY`
- Categories: `success,wisdom,inspirational,faith,happiness,courage,humor,love`

## Deployment (Vercel)
[Link to IM OK](https://final-project-mvp-im-ok-michael-hos-projects-00257bb5.vercel.app/)

## Screenshots of Application
![Home page](public/Home.png)
![Dashboard page](public/Dashboard.png)
![Caregiver page](public/Caregiver.png)
![Profile page](public/Profile.png)

## Future Enhancements

My MVP meets the requirements for this part of my Final Project. Next, I will be integrating:

- Instructor Feedback
- User Authnetication
- Security Implementation
- Comprehensive Testing
- Secure Deployment


