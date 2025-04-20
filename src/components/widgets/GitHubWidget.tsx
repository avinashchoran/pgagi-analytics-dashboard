import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import WidgetCard from "./WidgetCard";
import { API_ENDPOINTS, GITHUB_API_KEY } from "@/utils/apiConfig";
import { GitFork, Star, Code, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { cn } from "@/lib/utils";

interface GitHubWidgetProps {
  className?: string;
}

const GitHubWidget = ({ className }: GitHubWidgetProps) => {
  const navigate = useNavigate();
  const [lastSearchedRepos] = useLocalStorage<string[]>("lastSearchedRepos", []);
  const [selectedRepo] = useLocalStorage<string | null>("selectedGithubRepo", null);
  const [repoOwner, setRepoOwner] = useState<string>("");
  const [repoName, setRepoName] = useState<string>("");

  // Initialize with the selected repo
  useEffect(() => {
    if (selectedRepo) {
      const parts = selectedRepo.split('/');
      if (parts.length >= 2) {
        setRepoOwner(parts[0]);
        setRepoName(parts[1]);
      }
    } else if (lastSearchedRepos.length > 0) {
      const parts = lastSearchedRepos[0].split('/');
      if (parts.length >= 2) {
        setRepoOwner(parts[0]);
        setRepoName(parts[1]);
      }
    }
  }, [selectedRepo, lastSearchedRepos]);

  const { data: repo, isLoading } = useQuery({
    queryKey: ['github-widget', repoOwner, repoName],
    queryFn: async () => {
      if (!repoOwner || !repoName) return null;

      const userApiKey = localStorage.getItem('githubApiKey');
      const apiKey = userApiKey || GITHUB_API_KEY;
      
      const headers: HeadersInit = {};
      if (apiKey) {
        headers.Authorization = `token ${apiKey}`;
      }

      const response = await fetch(
        `${API_ENDPOINTS.github}/repos/${repoOwner}/${repoName}`,
        { headers }
      );
      
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!(repoOwner && repoName),
  });

  const languageColors: Record<string, string> = {
    JavaScript: "bg-yellow-300 text-yellow-900",
    TypeScript: "bg-blue-400 text-blue-900",
    Python: "bg-green-400 text-green-900",
    Java: "bg-red-400 text-red-900",
    Ruby: "bg-red-600 text-white",
    "C#": "bg-purple-500 text-white",
    Go: "bg-blue-500 text-white",
    Rust: "bg-orange-600 text-white",
    PHP: "bg-indigo-400 text-indigo-900",
    Swift: "bg-orange-500 text-white",
    Kotlin: "bg-purple-400 text-purple-900",
    "C++": "bg-pink-500 text-white",
    HTML: "bg-orange-400 text-orange-900",
    CSS: "bg-blue-300 text-blue-900",
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const handleGitHubClick = () => {
    navigate('/github');
  };

  return (
    <WidgetCard 
      title="GitHub Repository" 
      isLoading={isLoading} 
      className={className}
    >
      {!repoOwner || !repoName ? (
        <div className="flex flex-col items-center justify-center h-full py-6">
          <Code className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center mb-4">
            Search for a GitHub repository to display information here
          </p>
          <Button size="sm" onClick={handleGitHubClick}>
            Search Repositories
          </Button>
        </div>
      ) : repo ? (
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-lg line-clamp-1">
                <a 
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary flex items-center gap-1"
                >
                  {repo.full_name}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </h3>
              {repo.description && (
                <p className="text-muted-foreground text-sm line-clamp-2 mt-1">
                  {repo.description}
                </p>
              )}
            </div>
            {repo.language && (
              <Badge 
                variant="outline"
                className={cn("ml-2", languageColors[repo.language] || "bg-gray-400 text-gray-900")}
              >
                {repo.language}
              </Badge>
            )}
          </div>
          
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-muted-foreground" />
              <span>{repo.stargazers_count.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <GitFork className="h-4 w-4 text-muted-foreground" />
              <span>{repo.forks_count.toLocaleString()}</span>
            </div>
            <div className="text-muted-foreground">
              Updated {formatDate(repo.updated_at)}
            </div>
          </div>
          
          <Button 
            variant="outline" 
            className="w-full mt-2" 
            size="sm"
            onClick={handleGitHubClick}
          >
            View Details
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full py-6">
          <p className="text-muted-foreground text-center">
            Repository not found or access denied
          </p>
          <Button size="sm" onClick={handleGitHubClick} className="mt-4">
            Try Another Repository
          </Button>
        </div>
      )}
    </WidgetCard>
  );
};

export default GitHubWidget;
