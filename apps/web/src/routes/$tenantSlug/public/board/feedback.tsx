import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";

export const Route = createFileRoute("/$tenantSlug/public/board/feedback")({
  component: FeedbackPage,
});

function FeedbackPage() {
  const { tenantSlug } = Route.useParams();

  const feedbackData = [
    {
      id: 1,
      title: "Love the new design updates!",
      description: "The recent UI changes have made the platform so much more intuitive and visually appealing. The color scheme and typography choices are excellent. Keep up the great work!",
      author: "designfan",
      sentiment: "Positive",
      sentimentColor: "bg-green-500",
      category: "UI/UX",
      categoryColor: "bg-blue-500",
      createdAt: "2 hours ago",
      tags: ["design", "ui", "positive"],
      likes: 15,
      type: "Praise",
    },
    {
      id: 2,
      title: "Performance has improved significantly",
      description: "I've noticed a major improvement in page load times and overall application responsiveness since the last update. Whatever optimizations you made are working great!",
      author: "speeduser",
      sentiment: "Positive",
      sentimentColor: "bg-green-500",
      category: "Performance",
      categoryColor: "bg-purple-500",
      createdAt: "5 hours ago",
      tags: ["performance", "speed", "optimization"],
      likes: 12,
      type: "Praise",
    },
    {
      id: 3,
      title: "Navigation could be more intuitive",
      description: "While the platform is great overall, I sometimes find it challenging to locate certain features. Maybe consider reorganizing the main navigation or adding breadcrumbs.",
      author: "uxfeedback",
      sentiment: "Constructive",
      sentimentColor: "bg-yellow-500",
      category: "Navigation",
      categoryColor: "bg-orange-500",
      createdAt: "8 hours ago",
      tags: ["navigation", "ux", "improvement"],
      likes: 8,
      type: "Suggestion",
    },
    {
      id: 4,
      title: "Great customer support experience",
      description: "Had an issue last week and the support team was incredibly helpful and responsive. They resolved my problem quickly and provided excellent guidance.",
      author: "happycustomer",
      sentiment: "Positive",
      sentimentColor: "bg-green-500",
      category: "Support",
      categoryColor: "bg-teal-500",
      createdAt: "1 day ago",
      tags: ["support", "service", "positive"],
      likes: 20,
      type: "Praise",
    },
    {
      id: 5,
      title: "Feature documentation needs improvement",
      description: "Some of the newer features lack comprehensive documentation. It would be helpful to have more detailed guides and examples for advanced functionality.",
      author: "docreader",
      sentiment: "Constructive",
      sentimentColor: "bg-yellow-500",
      category: "Documentation",
      categoryColor: "bg-indigo-500",
      createdAt: "2 days ago",
      tags: ["documentation", "guides", "improvement"],
      likes: 6,
      type: "Suggestion",
    },
    {
      id: 6,
      title: "Mobile experience is fantastic",
      description: "The mobile version of the platform works seamlessly. All features are accessible and the responsive design adapts perfectly to different screen sizes.",
      author: "mobileuser",
      sentiment: "Positive",
      sentimentColor: "bg-green-500",
      category: "Mobile",
      categoryColor: "bg-pink-500",
      createdAt: "3 days ago",
      tags: ["mobile", "responsive", "positive"],
      likes: 18,
      type: "Praise",
    },
  ];

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "Positive":
        return "😊";
      case "Constructive":
        return "💭";
      case "Negative":
        return "😞";
      default:
        return "💬";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Praise":
        return "👏";
      case "Suggestion":
        return "💡";
      case "Complaint":
        return "⚠️";
      default:
        return "💬";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">General Feedback</h2>
          <p className="text-muted-foreground">
            Share your thoughts and suggestions for {tenantSlug}
          </p>
        </div>
        <Button>
          💭 Share Feedback
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">💬</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">324</div>
            <p className="text-xs text-muted-foreground">+12 this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Positive</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">😊</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89%</div>
            <p className="text-xs text-muted-foreground">Satisfaction rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suggestions</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">💡</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">67</div>
            <p className="text-xs text-muted-foreground">Improvement ideas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Implemented</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">✅</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">Ideas realized</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Response</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">⏱️</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.1d</div>
            <p className="text-xs text-muted-foreground">Days to respond</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Sort Options */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">All Feedback</Button>
            <Button variant="outline" size="sm">Positive</Button>
            <Button variant="outline" size="sm">Suggestions</Button>
            <Button variant="outline" size="sm">Recent</Button>
            <Button variant="outline" size="sm">Most Liked</Button>
            <Button variant="outline" size="sm">UI/UX</Button>
          </div>
        </CardContent>
      </Card>

      {/* Feedback Categories Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Feedback Categories</CardTitle>
          <CardDescription>
            Most common topics in recent feedback for {tenantSlug}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-500 text-white">UI/UX</Badge>
              <span className="text-sm text-muted-foreground">34%</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-purple-500 text-white">Performance</Badge>
              <span className="text-sm text-muted-foreground">22%</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-teal-500 text-white">Support</Badge>
              <span className="text-sm text-muted-foreground">18%</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-orange-500 text-white">Features</Badge>
              <span className="text-sm text-muted-foreground">15%</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-pink-500 text-white">Mobile</Badge>
              <span className="text-sm text-muted-foreground">7%</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-indigo-500 text-white">Documentation</Badge>
              <span className="text-sm text-muted-foreground">4%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feedback List */}
      <div className="space-y-4">
        {feedbackData.map((feedback) => (
          <Card key={feedback.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xl">{getSentimentIcon(feedback.sentiment)}</span>
                    <span className="text-lg">{getTypeIcon(feedback.type)}</span>
                    <CardTitle className="text-lg">{feedback.title}</CardTitle>
                    <Badge className={`${feedback.sentimentColor} text-white`}>
                      {feedback.sentiment}
                    </Badge>
                    <Badge className={`${feedback.categoryColor} text-white`}>
                      {feedback.category}
                    </Badge>
                  </div>
                  <CardDescription className="text-sm mb-3">
                    {feedback.description}
                  </CardDescription>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {feedback.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2 ml-4">
                  <Button variant="outline" size="sm" className="flex flex-col gap-1 h-auto py-2">
                    <span className="text-lg">❤️</span>
                    <span className="text-sm font-bold">{feedback.likes}</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span>By @{feedback.author}</span>
                  <span>•</span>
                  <span>{feedback.createdAt}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    💬 Reply
                  </Button>
                  <Button variant="ghost" size="sm">
                    🏷️ Tag
                  </Button>
                  <Button variant="ghost" size="sm">
                    📤 Share
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center">
        <Button variant="outline">
          Load More Feedback
        </Button>
      </div>
    </div>
  );
}
