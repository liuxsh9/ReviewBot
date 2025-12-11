# ReviewBot - AI-Powered Code Review Assistant

**ReviewBot** is a powerful, locally-hosted tool that leverages Large Language Models (LLMs) to provide intelligent, automated code reviews for your Pull Requests. It supports **GitCode** and **GitHub**, integrating seamlessly into your workflow to catch bugs, improve code quality, and ensure best practices.

## ✨ Features

*   **Multi-Platform Support**: Seamlessly review PRs/MRs from **GitCode** and **GitHub**.
*   **AI-Powered Analysis**: Utilizes advanced LLMs (Volcengine Ark/Doubao, OpenAI GPT-4) to deeply analyze code changes.
*   **Smart Feedback**: Provides structured feedback including:
    *   summary of changes
    *   Potential bugs & security risks
    *   Code improvement suggestions (Clean Code, SOLID)
    *   Code quality score
*   **Interactive Dashboard**: A modern, responsive React UI to manage reviews, configure settings, and view history.
*   **Configurable Prompts**: Customize the AI's persona and review instructions directly from the UI.
*   **Privacy-Focused**: Runs locally on your machine. Your API keys and data stay with you.

## 🚀 Quick Start

### Prerequisites

*   **Python 3.9+**
*   **Node.js 16+** & **npm**
*   **Git**

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/reviewbot.git
    cd reviewbot
    ```

2.  **Start the Application**:
    The project includes a convenient startup script that sets up both the backend (Python/FastAPI) and frontend (React/Vite) environments automatically.
    
    ```bash
    ./start.sh
    ```
    
    *First run may take a few minutes to install dependencies.*

3.  **Access the Dashboard**:
    Open your browser to: **http://localhost:3101**

## ⚙️ Configuration

You can configure ReviewBot via the **Settings** button in the web interface, or manually via the `.env` file.

### Web Interface (Recommended)
1.  Click **Settings** (top right).
2.  **General Tab**: Enter your API Keys (GitCode/GitHub) and choose your AI Provider (Volcengine/OpenAI).
3.  **Prompts Tab**: Customize the "System Prompt" to change how the AI reviews your code (e.g., "Be very strict about variable naming").

### Manual Configuration
Copy the example file and edit it:
```bash
cp backend/.env.example backend/.env
vi backend/.env
```

| Variable | Description |
| :--- | :--- |
| `GITCODE_ACCESS_TOKEN` | Personal Access Token for GitCode. |
| `GITHUB_ACCESS_TOKEN` | Personal Access Token for GitHub. |
| `AI_PROVIDER` | `volcengine` or `openai`. |
| `VOLC_API_KEY` | Volcengine Ark API Key. |
| `VOLC_MODEL` | Volcengine Endpoint ID (e.g., `ep-2024...`). |
| `OPENAI_API_KEY` | OpenAI API Key. |

## 🛠️ Usage

1.  **Copy a PR URL**:
    *   GitCode: `https://gitcode.com/owner/repo/pull/123`
    *   GitHub: `https://github.com/owner/repo/pull/456`
2.  **Paste & Review**: Paste the URL into the dashboard and click **Start AI Review**.
3.  **View Results**: The AI's analysis will appear on the right.
4.  **History**: Previous reviews are saved automatically. Click the trash icon to delete them.

## 🛑 Stopping the App

To stop both backend and frontend processes:

```bash
./stop.sh
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

[MIT](LICENSE)
