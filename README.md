# PollApp

PollApp is a responsive web application for creating, publishing and participating in online surveys. Users can create surveys with different questions, select categories and define an end date. Survey participants can submit answers and view the current results.

## Features

- Create and publish new surveys
- Add up to ten questions to a survey
- Add multiple answers to each question
- Support for single-choice questions
- Support for multiple-choice questions
- Select a category for every survey
- Set an end date
- Validate the survey before publishing
- Display clear validation messages
- Vote on active surveys
- Display survey results and percentages
- Filter surveys by category
- Filter active and past surveys
- Responsive design for desktop, tablet and mobile devices
- Store surveys, questions and answers with Supabase

## Technologies

The project was developed with:

- Angular
- TypeScript
- HTML
- SCSS
- Supabase
- Angular Router
- RxJS
- npm

## Requirements

Before starting the project, make sure the following programs are installed:

- Node.js
- npm
- Angular CLI
- Git

You can check the installed versions with:

```bash
node --version
npm --version
ng version
git --version
```

## Installation

### 1. Clone the repository

```bash
git clone YOUR_REPOSITORY_URL
```

### 2. Open the project folder

```bash
cd poll-app
```

### 3. Install dependencies

```bash
npm install
```

## Development server

Start the local development server with:

```bash
npm start
```

Alternatively, you can use:

```bash
ng serve
```

Open the application in your browser:

```text
https://akram-aljassim.de/PollApp/
```

The application automatically reloads when source files are changed.

## Application routes

The application uses Angular routing.

| Route | Description |
|---|---|
| `/` | Displays all available surveys |
| `/survey/:id` | Opens a selected survey |
| `/create` | Opens the form for creating a survey |

## Creating a survey

To create a new survey:

1. Open the **New Survey** page.
2. Enter a survey name.
3. Enter an optional description.
4. Choose a category.
5. Select an end date.
6. Enter a question.
7. Add at least two possible answers.
8. Decide whether multiple answers are allowed.
9. Add more questions if required.
10. Select **Publish**.

The form checks that all required information has been entered before saving the survey.

## Survey validation

Before a survey is published, the application checks:

- A survey name is entered.
- A category is selected.
- The end date is today or in the future.
- Every question has a headline.
- Every question contains at least two answers.
- No answer field is empty.

If validation fails, an error message is displayed.

## Database

PollApp uses Supabase as its backend and database.

The application stores:

- Surveys
- Questions
- Possible answers
- Submitted votes
- Survey categories
- Survey end dates

The Supabase services are located in:

```text
src/app/shared/services/
```

## Production build

Create an optimized production build with:

```bash
npm run build
```

The generated production files can be found in:

```text
dist/pollApp/browser/
```

## Deployment

The generated files from the production build can be uploaded to a web server using an FTP program such as FileZilla.

When the application is deployed inside a subfolder, the correct base path must be configured in `src/index.html`.

Example:

```html
<base href="/PollApp/">
```

For Apache servers, an `.htaccess` file is required so that Angular routes continue to work after refreshing the page.

Example:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /PollApp/

  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d

  RewriteRule ^ /PollApp/index.html [L]
</IfModule>
```

The `.htaccess` file should be stored here:

```text
public/.htaccess
```

## Responsive design

PollApp is optimized for different screen sizes:

- Desktop computers
- Tablets
- Smartphones
- Small mobile devices starting at approximately 320 pixels

The layout, cards, buttons, forms and survey results adapt to the available screen width.

## Available scripts

| Command | Description |
|---|---|
| `npm start` | Starts the development server |
| `npm run build` | Creates the production build |
| `npm run watch` | Builds the project and watches for changes |
| `npm test` | Runs the automated tests |

## Browser support

The application is intended for modern browsers, including:

- Google Chrome

## Author

**Akram Al Jassim**

Frontend Developer