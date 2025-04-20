import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS, GITHUB_API_KEY } from "@/utils/apiConfig";
import { GitHubRepo } from "@/types/global";
import { Star, GitFork, Clock, ExternalLink, Search, Users, Code, GitBranch, GitCommit, BookOpen, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

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

interface RepoOwner {
  login: string;
  avatar_url: string;
}

interface CommitInfo {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
  author: {
    login: string;
    avatar_url: string;
  };
  html_url: string;
}

interface ContributorInfo {
  login: string;
  avatar_url: string;
  contributions: number;
  html_url: string;
}

interface RepoDetails {
  repo: GitHubRepo;
  commits: CommitInfo[];
  contributors: ContributorInfo[];
  branches: {name: string; commit: {sha: string}}[];
}

const GitHub = () => {
  const [input, setInput] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [repoOwner, setRepoOwner] = useState("");
  const [repoName, setRepoName] = useState("");
  const [lastSearchedRepos, setLastSearchedRepos] = useLocalStorage<string[]>("lastSearchedRepos", ["facebook/react", "vercel/next.js", "microsoft/typescript"]);
  const [selectedRepo, setSelectedRepo] = useLocalStorage<string | null>("selectedGithubRepo", null);
  
  // Parse repo URL to get owner and name
  const parseRepoUrl = (url: string) => {
    try {
      // Handle full GitHub URLs
      if (url.includes('github.com')) {
        const urlParts = new URL(url).pathname.split('/').filter(Boolean);
        if (urlParts.length >= 2) {
          return { owner: urlParts[0], name: urlParts[1] };
        }
      } 
      // Handle owner/repo format
      else if (url.includes('/')) {
        const parts = url.split('/');
        if (parts.length >= 2) {
          return { owner: parts[0], name: parts[1] };
        }
      }
    } catch (e) {
      // URL parsing failed
    }
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseRepoUrl(input);
    if (parsed) {
      setRepoOwner(parsed.owner);
      setRepoName(parsed.name);
      setRepoUrl(`${parsed.owner}/${parsed.name}`);
      
      // Add to search history if not already there
      if (!lastSearchedRepos.includes(`${parsed.owner}/${parsed.name}`)) {
        const updatedHistory = [`${parsed.owner}/${parsed.name}`, ...lastSearchedRepos].slice(0, 5);
        setLastSearchedRepos(updatedHistory);
      }
      
      setSelectedRepo(`${parsed.owner}/${parsed.name}`);
    } else {
      toast.error("Invalid repository format", {
        description: "Please enter a valid GitHub repository URL or 'owner/repo' format"
      });
    }
  };

  const selectSuggestedRepo = (repo: string) => {
    const parsed = parseRepoUrl(repo);
    if (parsed) {
      setRepoOwner(parsed.owner);
      setRepoName(parsed.name);
      setRepoUrl(repo);
      setSelectedRepo(repo);
      setInput(repo);
    }
  };

  // Fetch basic repo info
  const { data: repoInfo, isLoading: repoLoading, error: repoError } = useQuery<GitHubRepo>({
    queryKey: ["github-repo", repoOwner, repoName],
    queryFn: async () => {
      try {
        if (!repoOwner || !repoName) return null;
        
        // Get API key from localStorage or use default
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
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Repository not found");
          }
          throw new Error("Failed to fetch GitHub repository");
        }
        
        return await response.json();
      } catch (error) {
        console.error("Error fetching GitHub repository:", error);
        throw error;
      }
    },
    enabled: !!(repoOwner && repoName),
  });

  // Fetch detailed repo information (commits, contributors, etc)
  const { data: repoDetails, isLoading: detailsLoading } = useQuery<RepoDetails>({
    queryKey: ["github-details", repoOwner, repoName],
    queryFn: async () => {
      if (!repoInfo) throw new Error("Repository information not available");
      
      // Get API key from localStorage or use default
      const userApiKey = localStorage.getItem('githubApiKey');
      const apiKey = userApiKey || GITHUB_API_KEY;
      
      const headers: HeadersInit = {};
      if (apiKey) {
        headers.Authorization = `token ${apiKey}`;
      }
      
      // Fetch commits, contributors, and branches in parallel
      const [commitsRes, contributorsRes, branchesRes] = await Promise.all([
        fetch(`${API_ENDPOINTS.github}/repos/${repoOwner}/${repoName}/commits?per_page=10`, { headers }),
        fetch(`${API_ENDPOINTS.github}/repos/${repoOwner}/${repoName}/contributors?per_page=10`, { headers }),
        fetch(`${API_ENDPOINTS.github}/repos/${repoOwner}/${repoName}/branches?per_page=5`, { headers })
      ]);
      
      if (!commitsRes.ok || !contributorsRes.ok || !branchesRes.ok) {
        throw new Error("Failed to fetch repository details");
      }
      
      const [commits, contributors, branches] = await Promise.all([
        commitsRes.json(),
        contributorsRes.json(),
        branchesRes.json()
      ]);
      
      return {
        repo: repoInfo,
        commits,
        contributors,
        branches
      };
    },
    enabled: !!repoInfo,
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const getLanguageColor = (language: string) => {
    return languageColors[language] || "bg-gray-400 text-gray-900";
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  // Handle initial load if we have a stored selected repo
  useEffect(() => {
    if (selectedRepo) {
      const parsed = parseRepoUrl(selectedRepo);
      if (parsed) {
        setRepoOwner(parsed.owner);
        setRepoName(parsed.name);
        setRepoUrl(selectedRepo);
        setInput(selectedRepo);
      }
    } else if (lastSearchedRepos.length > 0) {
      const firstRepo = lastSearchedRepos[0];
      const parsed = parseRepoUrl(firstRepo);
      if (parsed) {
        setRepoOwner(parsed.owner);
        setRepoName(parsed.name);
        setRepoUrl(firstRepo);
        setSelectedRepo(firstRepo);
        setInput(firstRepo);
      }
    }
  }, [lastSearchedRepos, selectedRepo]);

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">GitHub Explorer</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Search GitHub Repository</CardTitle>
            <CardDescription>
              Enter a GitHub repository URL (e.g., https://github.com/facebook/react) or format "owner/repo" (e.g., facebook/react)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                placeholder="Enter GitHub repository URL or owner/repo"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1"
              />
              <Button type="submit">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </form>
          </CardContent>
        </Card>
        
        {/* Repository History */}
        {lastSearchedRepos.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {lastSearchedRepos.map((repo) => (
              <Badge 
                key={repo} 
                variant={selectedRepo === repo ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary/90 transition-colors"
                onClick={() => selectSuggestedRepo(repo)}
              >
                {repo}
              </Badge>
            ))}
          </div>
        )}
        
        {/* Repository Info */}
        {repoLoading ? (
          <Card>
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-full mt-2" />
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
              </div>
            </CardContent>
          </Card>
        ) : repoError ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error fetching repository. Please check the repository URL and try again.
            </AlertDescription>
          </Alert>
        ) : repoInfo ? (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <a 
                      href={repoInfo.html_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-primary flex items-center gap-2"
                    >
                      {repoInfo.name}
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <img 
                      src={repoInfo.owner.avatar_url} 
                      alt={repoInfo.owner.login}
                      className="h-5 w-5 rounded-full"
                    />
                    {repoInfo.owner.login}
                  </CardDescription>
                </div>
                
                {repoInfo.language && (
                  <Badge 
                    variant="outline"
                    className={getLanguageColor(repoInfo.language)}
                  >
                    {repoInfo.language}
                  </Badge>
                )}
              </div>
              
              {repoInfo.description && (
                <p className="text-muted-foreground mt-2">
                  {repoInfo.description}
                </p>
              )}
              
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4" />
                  <span>{repoInfo.stargazers_count.toLocaleString()} stars</span>
                </div>
                <div className="flex items-center gap-1">
                  <GitFork className="h-4 w-4" />
                  <span>{repoInfo.forks_count.toLocaleString()} forks</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>Updated {formatDate(repoInfo.updated_at)}</span>
                </div>
              </div>
            </CardHeader>
            
            {detailsLoading ? (
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-32 w-full" />
                </div>
              </CardContent>
            ) : repoDetails ? (
              <CardContent className="pt-0">
                <Tabs defaultValue="commits" className="w-full">
                  <TabsList className="mb-4">
                    <TabsTrigger value="commits">Commits</TabsTrigger>
                    <TabsTrigger value="contributors">Contributors</TabsTrigger>
                    <TabsTrigger value="branches">Branches</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="commits" className="space-y-4">
                    <h3 className="text-lg font-medium flex items-center gap-2 mb-2">
                      <GitCommit className="h-5 w-5" />
                      Recent Commits
                    </h3>
                    {repoDetails.commits.map((commit, index) => (
                      <motion.div 
                        key={commit.sha}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border rounded-lg p-3 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <a 
                              href={commit.html_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium hover:text-primary line-clamp-2"
                            >
                              {commit.commit.message}
                            </a>
                            <div className="flex items-center mt-1 text-sm text-muted-foreground">
                              <span>{commit.commit.author.name}</span>
                              <span className="mx-1">•</span>
                              <span>{formatDate(commit.commit.author.date)}</span>
                            </div>
                          </div>
                          {commit.author?.avatar_url && (
                            <img 
                              src={commit.author.avatar_url} 
                              alt={commit.author.login} 
                              className="h-8 w-8 rounded-full"
                            />
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="contributors">
                    <h3 className="text-lg font-medium flex items-center gap-2 mb-4">
                      <Users className="h-5 w-5" />
                      Top Contributors
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {repoDetails.contributors.map((contributor, index) => (
                        <motion.div 
                          key={contributor.login}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center gap-3 border rounded-lg p-3 hover:bg-muted/50 transition-colors"
                        >
                          <img 
                            src={contributor.avatar_url} 
                            alt={contributor.login} 
                            className="h-10 w-10 rounded-full"
                          />
                          <div className="flex-1">
                            <a 
                              href={contributor.html_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium hover:text-primary"
                            >
                              {contributor.login}
                            </a>
                            <div className="text-sm text-muted-foreground">
                              {contributor.contributions.toLocaleString()} contributions
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="branches">
                    <h3 className="text-lg font-medium flex items-center gap-2 mb-4">
                      <GitBranch className="h-5 w-5" />
                      Branches
                    </h3>
                    <div className="space-y-2">
                      {repoDetails.branches.map((branch, index) => (
                        <motion.div 
                          key={branch.name}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center justify-between border rounded-lg p-3 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <GitBranch className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{branch.name}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {branch.commit.sha.substring(0, 7)}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            ) : null}
            
            <CardFooter className="text-sm text-muted-foreground border-t pt-4 mt-4">
              <div className="flex items-center gap-4 w-full flex-wrap">
                <a 
                  href={`${repoInfo.html_url}/issues`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-primary"
                >
                  <AlertCircle className="h-4 w-4" />
                  {repoInfo.open_issues_count} issues
                </a>
                <a 
                  href={`${repoInfo.html_url}/stargazers`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-primary"
                >
                  <Star className="h-4 w-4" />
                  {repoInfo.stargazers_count} stars
                </a>
                <a 
                  href={`${repoInfo.html_url}/network/members`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-primary"
                >
                  <GitFork className="h-4 w-4" />
                  {repoInfo.forks_count} forks
                </a>
                <a 
                  href={`${repoInfo.html_url}/watchers`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-primary"
                >
                  <BookOpen className="h-4 w-4" />
                  {repoInfo.watchers_count} watchers
                </a>
              </div>
            </CardFooter>
          </Card>
        ) : (
          selectedRepo === null && (
            <Card className="bg-muted/20">
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Code className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Search for a GitHub Repository</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Enter a GitHub repository URL or use the format "owner/repo" to explore repository details, commits, and contributors.
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        )}
      </div>
    </MainLayout>
  );
};

export default GitHub;
