import { authClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";

export const Route = createFileRoute("/dashboard")({
	component: RouteComponent,
});

function RouteComponent() {
	const { data: session, isPending } = authClient.useSession();
	const [widgetStatus, setWidgetStatus] = useState({ isLoaded: false, version: 'Unknown' });
	const [feedbackCount, setFeedbackCount] = useState(0);

	const navigate = Route.useNavigate();

	// Query private data (placeholder for future implementation)
	const { data: privateData } = useQuery({
		queryKey: ['privateData'],
		queryFn: async () => ({ message: 'Private data loaded' }),
		enabled: !!session,
	});

	useEffect(() => {
		if (!session && !isPending) {
			navigate({
				to: "/login",
			});
		}
	}, [session, isPending]);

	useEffect(() => {
		// Check widget status periodically
		const checkWidget = () => {
			const isLoaded = typeof (window as any).OmniFeedbackWidget !== 'undefined';
			const version = isLoaded ? (window as any).OmniFeedbackWidget.version || 'Unknown' : 'Unknown';
			setWidgetStatus({ isLoaded, version });
		};

		checkWidget();
		const interval = setInterval(checkWidget, 2000);
		return () => clearInterval(interval);
	}, []);

	const fetchFeedbackCount = async () => {
		try {
			const response = await fetch('http://localhost:8080/api/feedback?tenantId=web-app-tenant');
			const data = await response.json();
			if (data.success) {
				setFeedbackCount(data.pagination.total);
			}
		} catch (error) {
			console.error('Failed to fetch feedback count:', error);
		}
	};

	const openWidget = () => {
		// Simulate user clicking the widget
		const widgetButton = document.querySelector('[aria-label="Open feedback widget"]') as HTMLButtonElement;
		if (widgetButton) {
			widgetButton.click();
		} else {
			alert('Widget button not found. Make sure the widget is loaded.');
		}
	};

	useEffect(() => {
		fetchFeedbackCount();
		// Refresh feedback count every 30 seconds
		const interval = setInterval(fetchFeedbackCount, 30000);
		return () => clearInterval(interval);
	}, []);

	if (isPending) {
		return <div>Loading...</div>;
	}

	return (
		<div className="container mx-auto p-6 space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">Tenant Dashboard</h1>
					<p className="text-muted-foreground mt-2">Welcome back, {session?.user.name}</p>
					<p className="text-sm text-muted-foreground">Tenant: <code>web-app-tenant</code></p>
				</div>
				<Badge variant={widgetStatus.isLoaded ? "default" : "destructive"}>
					{widgetStatus.isLoaded ? "Widget Active" : "Widget Not Loaded"}
				</Badge>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{/* OmniFeedback Widget Status Card */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							💬 Feedback Widget
							<Badge variant={widgetStatus.isLoaded ? "default" : "secondary"}>
								v{widgetStatus.version}
							</Badge>
						</CardTitle>
						<CardDescription>
							Embedded feedback collection widget
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center justify-between">
							<span className="text-sm font-medium">Status:</span>
							<Badge variant={widgetStatus.isLoaded ? "default" : "destructive"}>
								{widgetStatus.isLoaded ? "Loaded" : "Not Loaded"}
							</Badge>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-sm font-medium">Total Feedback:</span>
							<Badge variant="outline">{feedbackCount}</Badge>
						</div>
						<div className="flex gap-2">
							<Button onClick={openWidget} size="sm" className="flex-1">
								Open Widget
							</Button>
							<Button onClick={fetchFeedbackCount} variant="outline" size="sm">
								Refresh
							</Button>
						</div>
					</CardContent>
				</Card>

				{/* Tenant Info Card */}
				<Card>
					<CardHeader>
						<CardTitle>🏢 Tenant Info</CardTitle>
						<CardDescription>
							Your tenant configuration
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center justify-between">
							<span className="text-sm font-medium">Tenant ID:</span>
							<code className="text-xs bg-muted px-2 py-1 rounded">web-app-tenant</code>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-sm font-medium">Theme Color:</span>
							<div className="flex items-center gap-2">
								<div className="w-4 h-4 bg-sky-500 rounded-full"></div>
								<span className="text-xs">#0ea5e9</span>
							</div>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-sm font-medium">Domain:</span>
							<span className="text-xs">localhost:3001</span>
						</div>
					</CardContent>
				</Card>

				{/* Quick Actions Card */}
				<Card>
					<CardHeader>
						<CardTitle>⚡ Quick Actions</CardTitle>
						<CardDescription>
							Manage and test your feedback
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						<Button 
							onClick={() => window.open('http://localhost:8080/api/feedback?tenantId=web-app-tenant', '_blank')}
							variant="outline" 
							className="w-full justify-start"
						>
							📄 View My Feedback
						</Button>
						<Button 
							onClick={() => window.open('http://localhost:3000', '_blank')}
							variant="outline" 
							className="w-full justify-start"
						>
							🔧 Widget Debug Page
						</Button>
						<Button 
							onClick={openWidget}
							className="w-full justify-start"
						>
							💬 Test Feedback Widget
						</Button>
					</CardContent>
				</Card>
			</div>

			{/* Integration Guide Card */}
			<Card>
				<CardHeader>
					<CardTitle>📋 Integration Guide</CardTitle>
					<CardDescription>
						How this widget is integrated into your application
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="bg-muted/50 p-4 rounded-lg">
						<h4 className="font-semibold mb-2">HTML Integration (index.html):</h4>
						<pre className="text-xs bg-background p-3 rounded border overflow-x-auto">
{`<script 
  src="http://localhost:3000/omnifeedback-widget.js"
  data-tenant-id="web-app-tenant"
  data-api-url="http://localhost:8080"
  data-primary-color="#0ea5e9"
  defer
></script>`}
						</pre>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<h4 className="font-semibold mb-2">✅ What Works:</h4>
							<ul className="text-sm space-y-1 text-muted-foreground">
								<li>• Auto-initialization via script tag</li>
								<li>• Floating feedback button</li>
								<li>• Bug reports and suggestions</li>
								<li>• Data stored with tenant ID</li>
								<li>• Custom theme color applied</li>
							</ul>
						</div>
						<div>
							<h4 className="font-semibold mb-2">🧪 Testing Steps:</h4>
							<ul className="text-sm space-y-1 text-muted-foreground">
								<li>• Look for widget button (bottom-right)</li>
								<li>• Submit feedback via the widget</li>
								<li>• Check feedback count updates</li>
								<li>• View submitted data via API</li>
								<li>• Test on different pages</li>
							</ul>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
