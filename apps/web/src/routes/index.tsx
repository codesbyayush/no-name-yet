import { createFileRoute } from "@tanstack/react-router";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/")({
	component: HomeComponent,
});

const TITLE_TEXT = `
 ╔═══════════════════════════════════════════════════════════════╗
 ║                      OMNIFEEDBACK                             ║
 ║                  AI-Powered Bug Reporting                     ║
 ║                & Job Improvement Suggestions                  ║
 ╚═══════════════════════════════════════════════════════════════╝
 `;

function HomeComponent() {
	const [widgetStatus, setWidgetStatus] = useState({ isLoaded: false, version: 'Unknown' });

	useEffect(() => {
		const checkWidget = () => {
			const isLoaded = typeof (window as any).OmniFeedbackWidget !== 'undefined';
			const version = isLoaded ? (window as any).OmniFeedbackWidget.version || 'Unknown' : 'Unknown';
			setWidgetStatus({ isLoaded, version });
		};

		checkWidget();
		const interval = setInterval(checkWidget, 2000);
		return () => clearInterval(interval);
	}, []);

	const openWidget = () => {
		const widgetButton = document.querySelector('[aria-label="Open feedback widget"]') as HTMLButtonElement;
		if (widgetButton) {
			widgetButton.click();
		} else {
			alert('Widget not found. Please make sure the widget is loaded.');
		}
	};

	return (
		<div className="container mx-auto max-w-6xl px-4 py-8">
			<div className="text-center mb-12">
				<pre className="font-mono text-sm mb-6 text-muted-foreground">{TITLE_TEXT}</pre>
				<h1 className="text-4xl font-bold mb-4">Demo SaaS Application</h1>
				<p className="text-xl text-muted-foreground mb-6">
					A sample application with OmniFeedback widget integration
				</p>
				<div className="flex items-center justify-center gap-4">
					<Badge variant={widgetStatus.isLoaded ? "default" : "destructive"}>
						Feedback Widget {widgetStatus.isLoaded ? "Loaded" : "Loading..."}
					</Badge>
					<Badge variant="outline">Tenant: web-app-tenant</Badge>
					<Badge variant="outline">v{widgetStatus.version}</Badge>
				</div>
			</div>

			<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-12">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							📊 User Dashboard
						</CardTitle>
						<CardDescription>
							Manage your projects and view analytics
						</CardDescription>
					</CardHeader>
					<CardContent>
						<ul className="text-sm space-y-2 text-muted-foreground">
							<li>• Project overview and metrics</li>
							<li>• Team collaboration tools</li>
							<li>• Real-time notifications</li>
							<li>• Customizable workflows</li>
						</ul>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							⚙️ Settings & Config
						</CardTitle>
						<CardDescription>
							Customize your application experience
						</CardDescription>
					</CardHeader>
					<CardContent>
						<ul className="text-sm space-y-2 text-muted-foreground">
							<li>• Account preferences</li>
							<li>• Integration management</li>
							<li>• Security settings</li>
							<li>• Billing and subscriptions</li>
						</ul>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							💬 Feedback System
						</CardTitle>
						<CardDescription>
							Help us improve by sharing your thoughts
						</CardDescription>
					</CardHeader>
					<CardContent>
						<ul className="text-sm space-y-2 text-muted-foreground">
							<li>• Report bugs and issues</li>
							<li>• Suggest new features</li>
							<li>• Share improvement ideas</li>
							<li>• Track feedback status</li>
						</ul>
					</CardContent>
				</Card>
			</div>

			<div className="text-center mb-8">
				<h2 className="text-2xl font-bold mb-4">Have Feedback?</h2>
				<p className="text-muted-foreground mb-6">
					We'd love to hear from you! Use our feedback widget to report bugs, suggest improvements, or share your thoughts.
					Look for the feedback button in the bottom-right corner.
				</p>
				<Button onClick={openWidget} size="lg" className="mr-4">
					💬 Give Feedback
				</Button>
				<Button variant="outline" size="lg" onClick={() => window.open('/dashboard', '_self')}>
					📊 View Dashboard
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>🚀 About This Demo</CardTitle>
					<CardDescription>
						This is a sample SaaS application showcasing the OmniFeedback widget integration
					</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-6 md:grid-cols-2">
					<div>
						<h4 className="font-semibold mb-3 text-green-600">✨ Application Features</h4>
						<ul className="space-y-2 text-sm">
							<li>📊 Modern React-based dashboard</li>
							<li>🔐 Authentication system</li>
							<li>🎨 Responsive design with Tailwind CSS</li>
							<li>🔄 Real-time data updates</li>
							<li>📱 Mobile-friendly interface</li>
							<li>⚙️ Customizable settings</li>
							<li>📈 Analytics and reporting</li>
							<li>💬 Integrated feedback system</li>
						</ul>
					</div>
					<div>
						<h4 className="font-semibold mb-3 text-blue-600">🔧 Widget Integration</h4>
						<ul className="space-y-2 text-sm">
							<li>🎯 Tenant ID: <code className="text-xs">web-app-tenant</code></li>
							<li>🎨 Custom theme color applied</li>
							<li>🌐 Cross-origin requests enabled</li>
							<li>📡 Real-time feedback submission</li>
							<li>💾 Data persistence in PostgreSQL</li>
							<li>🔍 Browser context collection</li>
							<li>📎 File attachment support</li>
							<li>📱 Mobile responsive design</li>
						</ul>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
