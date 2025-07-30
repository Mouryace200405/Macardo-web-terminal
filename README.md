# ¶ Macardo

![Macardo Banner](https://placehold.co/800x200.png?text=Macardo+Terminal)

**A modern, AI-powered terminal emulator built with Next.js, React, and Genkit.**

Macardo provides a sleek, customizable terminal experience right in your browser. It combines the familiarity of a classic command-line interface with the power of artificial intelligence to help you work faster and smarter.

## ✨ Features

*   **AI Command Suggestions**: Get intelligent command suggestions as you type, based on your input and command history.
*   **Simulated File System**: Navigate a virtual file system with classic commands like `ls`, `cd`, `pwd`, and `cat`.
*   **Theme Customization**: Switch between different visual themes, including a modern "Echo Shell" and a "Powershell" look.
*   **Cursor Customization**: Choose your preferred cursor style from block, underline, or bar to personalize your workspace.
*   **Built with Modern Tech**: Leverages the latest web technologies including Next.js, TypeScript, Tailwind CSS, and Google's Genkit for a fast and responsive experience.

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You'll need to have [Node.js](https://nodejs.org/en/) (version 20 or later) and npm installed on your computer.

```bash
node -v
npm -v
```

### Installation

1.  **Clone the repository:**
    If you've uploaded this project to your GitHub, you can clone it using:
    ```bash
    git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
    cd YOUR_REPOSITORY
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of your project by copying the example file:
    ```bash
    cp .env.example .env
    ```
    You will need to add your Google AI API key to this file to enable the AI features.
    ```
    GEMINI_API_KEY=your_api_key_here
    ```

### Running the Application

Once the dependencies are installed, you can run the development server:

```bash
npm run dev
```

This will start two processes: the Next.js frontend and the Genkit AI backend. Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

## 🔧 Customization

You can customize the terminal's appearance from the settings menu (the gear icon in the top right).

*   **Font Size**: Adjust the font size for better readability.
*   **Theme**: Change the color scheme of the terminal.
*   **Cursor Style**: Select the cursor style that you find most comfortable.

All settings are saved in your browser's local storage, so they'll be remembered for your next session.
