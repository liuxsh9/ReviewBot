from abc import ABC, abstractmethod
from typing import Optional, Dict, Any
import httpx
from app.core.config import settings

class GitProvider(ABC):
    @abstractmethod
    async def fetch_pr_diff(self, pr_url: str) -> str:
        pass

    @abstractmethod
    async def fetch_pr_metadata(self, pr_url: str) -> Dict[str, Any]:
        pass

class GitCodeProvider(GitProvider):
    def _parse_url(self, pr_url: str):
        # Expected format: https://gitcode.com/owner/repo/merge_requests/iid
        # or similar. Needs robust parsing.
        # This is a simplified parser.
        try:
            parts = pr_url.split("gitcode.com/")[-1].split("/")
            owner = parts[0]
            repo = parts[1]
            if "merge_requests" in parts:
                mr_index = parts.index("merge_requests")
                iid = parts[mr_index + 1]
            elif "pull" in parts:
                mr_index = parts.index("pull")
                iid = parts[mr_index + 1]
            else:
                raise ValueError("Invalid GitCode PR URL")
            return owner, repo, iid
        except Exception as e:
            raise ValueError(f"Could not parse URL: {pr_url}") from e

    async def fetch_pr_diff(self, pr_url: str) -> str:
        owner, repo, iid = self._parse_url(pr_url)
        # using /files endpoint to get diff
        api_url = f"{settings.GITCODE_API_URL}/repos/{owner}/{repo}/pulls/{iid}/files"
        
        headers = {}
        if settings.GITCODE_ACCESS_TOKEN:
            headers["Authorization"] = f"Bearer {settings.GITCODE_ACCESS_TOKEN}"
            
        async with httpx.AsyncClient() as client:
            resp = await client.get(api_url, headers=headers)
            resp.raise_for_status()
            files = resp.json()
            
            full_diff = ""
            for file in files:
                filename = file.get("filename")
                patch = file.get("patch", {}).get("diff", "")
                if not patch: 
                     # Fallback if patch is direct string or different structure
                     patch = file.get("patch") or ""
                
                full_diff += f"--- {filename}\n+++ {filename}\n{patch}\n\n"
            return full_diff

    async def fetch_pr_metadata(self, pr_url: str) -> Dict[str, Any]:
        owner, repo, iid = self._parse_url(pr_url)
        api_url = f"{settings.GITCODE_API_URL}/repos/{owner}/{repo}/pulls/{iid}"

        headers = {}
        if settings.GITCODE_ACCESS_TOKEN:
            headers["Authorization"] = f"Bearer {settings.GITCODE_ACCESS_TOKEN}"

        async with httpx.AsyncClient() as client:
            resp = await client.get(api_url, headers=headers)
            resp.raise_for_status()
            data = resp.json()
            return {
                "title": data.get("title"),
                "description": data.get("body"), # GitHub style usually uses 'body'
                "author": data.get("user", {}).get("login"), # GitHub style uses 'user.login'
                "state": data.get("state"),
                "web_url": data.get("html_url")
            }

class GitHubProvider(GitProvider):
    # Placeholder for GitHub
    async def fetch_pr_diff(self, pr_url: str) -> str:
        return ""
    async def fetch_pr_metadata(self, pr_url: str) -> Dict[str, Any]:
        return {}

def get_git_provider(url: str) -> GitProvider:
    if "gitcode.com" in url:
        return GitCodeProvider()
    elif "github.com" in url:
        return GitHubProvider()
    else:
        raise ValueError("Unsupported provider")
