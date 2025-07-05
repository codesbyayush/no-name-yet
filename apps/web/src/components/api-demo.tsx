import {
	type CreatePostData,
	type LoginCredentials,
	type RegisterData,
	getErrorMessage,
	useAuth,
	useCreatePost,
	useLogin,
	usePosts,
	useRegister,
	useUploadFile,
} from "@/lib/api";
import type React from "react";
import { useState } from "react";

export const ApiDemo: React.FC = () => {
	const { user, isAuthenticated, isLoading: authLoading } = useAuth();
	const [activeTab, setActiveTab] = useState<"auth" | "posts" | "uploads">(
		"auth",
	);

	if (authLoading) {
		return <div className="p-4">Loading authentication state...</div>;
	}

	return (
		<div className="mx-auto max-w-4xl p-6">
			<h1 className="mb-6 font-bold text-3xl">Centralized API System Demo</h1>

			{/* Tab Navigation */}
			<div className="mb-6 flex space-x-4 border-b">
				{["auth", "posts", "uploads"].map((tab) => (
					<button
						key={tab}
						onClick={() => setActiveTab(tab as any)}
						className={`px-4 py-2 capitalize ${
							activeTab === tab
								? "border-blue-500 border-b-2 font-medium text-blue-600"
								: "text-gray-600 hover:text-gray-800"
						}`}
					>
						{tab}
					</button>
				))}
			</div>

			{/* Tab Content */}
			{activeTab === "auth" && <AuthDemo />}
			{activeTab === "posts" && <PostsDemo />}
			{activeTab === "uploads" && <UploadsDemo />}

			{/* Current User Info */}
			{isAuthenticated && (
				<div className="mt-8 rounded-lg border border-green-200 bg-green-50 p-4">
					<h3 className="mb-2 font-medium text-green-800 text-lg">
						Current User
					</h3>
					<p className="text-green-700">
						<strong>Name:</strong> {user?.name} <br />
						<strong>Email:</strong> {user?.email} <br />
						<strong>Role:</strong> {user?.role}
					</p>
				</div>
			)}
		</div>
	);
};

// Authentication Demo Component
const AuthDemo: React.FC = () => {
	const { isAuthenticated, logout } = useAuth();
	const loginMutation = useLogin();
	const registerMutation = useRegister();
	const [isLogin, setIsLogin] = useState(true);

	const [loginData, setLoginData] = useState<LoginCredentials>({
		email: "demo@example.com",
		password: "password123",
	});

	const [registerData, setRegisterData] = useState<RegisterData>({
		email: "newuser@example.com",
		password: "password123",
		name: "New User",
	});

	const handleLogin = async () => {
		try {
			await loginMutation.mutateAsync(loginData);
		} catch (error) {
			alert("Login failed: " + getErrorMessage(error));
		}
	};

	const handleRegister = async () => {
		try {
			await registerMutation.mutateAsync(registerData);
		} catch (error) {
			alert("Registration failed: " + getErrorMessage(error));
		}
	};

	const handleLogout = async () => {
		try {
			await logout.mutateAsync();
		} catch (error) {
			alert("Logout failed: " + getErrorMessage(error));
		}
	};

	if (isAuthenticated) {
		return (
			<div className="space-y-4">
				<div className="rounded-lg border border-green-200 bg-green-50 p-4">
					<p className="mb-4 text-green-800">
						✅ You are successfully logged in!
					</p>
					<button
						onClick={handleLogout}
						disabled={logout.isPending}
						className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600 disabled:opacity-50"
					>
						{logout.isPending ? "Logging out..." : "Logout"}
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex space-x-4">
				<button
					onClick={() => setIsLogin(true)}
					className={`rounded px-4 py-2 ${
						isLogin ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
					}`}
				>
					Login
				</button>
				<button
					onClick={() => setIsLogin(false)}
					className={`rounded px-4 py-2 ${
						!isLogin ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
					}`}
				>
					Register
				</button>
			</div>

			{isLogin ? (
				<div className="space-y-4">
					<h3 className="font-medium text-xl">Login Demo</h3>
					<div className="space-y-3">
						<input
							type="email"
							value={loginData.email}
							onChange={(e) =>
								setLoginData((prev) => ({ ...prev, email: e.target.value }))
							}
							placeholder="Email"
							className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
						<input
							type="password"
							value={loginData.password}
							onChange={(e) =>
								setLoginData((prev) => ({ ...prev, password: e.target.value }))
							}
							placeholder="Password"
							className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
						<button
							onClick={handleLogin}
							disabled={loginMutation.isPending}
							className="w-full rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
						>
							{loginMutation.isPending ? "Logging in..." : "Login"}
						</button>
					</div>
				</div>
			) : (
				<div className="space-y-4">
					<h3 className="font-medium text-xl">Register Demo</h3>
					<div className="space-y-3">
						<input
							type="text"
							value={registerData.name}
							onChange={(e) =>
								setRegisterData((prev) => ({ ...prev, name: e.target.value }))
							}
							placeholder="Full Name"
							className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
						<input
							type="email"
							value={registerData.email}
							onChange={(e) =>
								setRegisterData((prev) => ({ ...prev, email: e.target.value }))
							}
							placeholder="Email"
							className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
						<input
							type="password"
							value={registerData.password}
							onChange={(e) =>
								setRegisterData((prev) => ({
									...prev,
									password: e.target.value,
								}))
							}
							placeholder="Password"
							className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
						<button
							onClick={handleRegister}
							disabled={registerMutation.isPending}
							className="w-full rounded-md bg-green-500 px-4 py-2 text-white hover:bg-green-600 disabled:opacity-50"
						>
							{registerMutation.isPending ? "Registering..." : "Register"}
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

// Posts Demo Component
const PostsDemo: React.FC = () => {
	const { isAuthenticated } = useAuth();
	const { posts, isLoading, error, refetch } = usePosts({ published: true });
	const createPostMutation = useCreatePost();

	const [newPost, setNewPost] = useState<CreatePostData>({
		title: "",
		content: "",
		published: false,
		tags: [],
	});

	const handleCreatePost = async () => {
		try {
			await createPostMutation.mutateAsync(newPost);
			setNewPost({ title: "", content: "", published: false, tags: [] });
		} catch (error) {
			alert("Create post failed: " + getErrorMessage(error));
		}
	};

	if (!isAuthenticated) {
		return (
			<div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
				<p className="text-yellow-800">
					Please login to view and create posts.
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h3 className="font-medium text-xl">Posts Demo</h3>
				<button
					onClick={() => refetch()}
					className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
				>
					Refresh
				</button>
			</div>

			{/* Create Post Form */}
			<div className="rounded-lg border border-gray-200 p-4">
				<h4 className="mb-3 font-medium text-lg">Create New Post</h4>
				<div className="space-y-3">
					<input
						type="text"
						value={newPost.title}
						onChange={(e) =>
							setNewPost((prev) => ({ ...prev, title: e.target.value }))
						}
						placeholder="Post title"
						className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
					<textarea
						value={newPost.content}
						onChange={(e) =>
							setNewPost((prev) => ({ ...prev, content: e.target.value }))
						}
						placeholder="Post content"
						rows={4}
						className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
					<label className="flex items-center space-x-2">
						<input
							type="checkbox"
							checked={newPost.published}
							onChange={(e) =>
								setNewPost((prev) => ({ ...prev, published: e.target.checked }))
							}
							className="h-4 w-4 text-blue-600"
						/>
						<span className="text-gray-700 text-sm">Published</span>
					</label>
					<button
						onClick={handleCreatePost}
						disabled={
							createPostMutation.isPending || !newPost.title || !newPost.content
						}
						className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
					>
						{createPostMutation.isPending ? "Creating..." : "Create Post"}
					</button>
				</div>
			</div>

			{/* Posts List */}
			<div>
				<h4 className="mb-3 font-medium text-lg">Posts List</h4>
				{isLoading ? (
					<div className="py-4 text-center">Loading posts...</div>
				) : error ? (
					<div className="rounded-lg border border-red-200 bg-red-50 p-4">
						<p className="text-red-800">
							Error loading posts: {getErrorMessage(error)}
						</p>
					</div>
				) : posts?.data.length === 0 ? (
					<div className="py-4 text-center text-gray-500">No posts found</div>
				) : (
					<div className="space-y-3">
						{posts?.data.map((post) => (
							<div
								key={post.id}
								className="rounded-lg border border-gray-200 p-4"
							>
								<h5 className="font-medium text-lg">{post.title}</h5>
								<p className="mt-1 text-gray-600">{post.content}</p>
								<div className="mt-2 flex items-center space-x-4 text-gray-500 text-sm">
									<span>Status: {post.published ? "Published" : "Draft"}</span>
									<span>
										Tags: {post.tags.length > 0 ? post.tags.join(", ") : "None"}
									</span>
								</div>
							</div>
						))}
					</div>
				)}

				{posts?.pagination && (
					<div className="mt-4 text-center text-gray-600 text-sm">
						Page {posts.pagination.page} of {posts.pagination.totalPages}(
						{posts.pagination.total} total posts)
					</div>
				)}
			</div>
		</div>
	);
};

// File Upload Demo Component
const UploadsDemo: React.FC = () => {
	const { isAuthenticated } = useAuth();
	const { mutate: uploadFile, isPending, progress } = useUploadFile();

	const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		uploadFile(
			{
				file,
				options: {
					maxSize: 10 * 1024 * 1024, // 10MB
					allowedTypes: ["image/*", "application/pdf", "text/*"],
					folder: "demo-uploads",
					isPublic: true,
				},
			},
			{
				onSuccess: (result) => {
					alert(`File uploaded successfully! URL: ${result.url}`);
				},
				onError: (error) => {
					alert("Upload failed: " + getErrorMessage(error));
				},
			},
		);
	};

	if (!isAuthenticated) {
		return (
			<div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
				<p className="text-yellow-800">Please login to upload files.</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<h3 className="font-medium text-xl">File Upload Demo</h3>

			<div className="rounded-lg border border-gray-200 p-4">
				<div className="space-y-4">
					<input
						type="file"
						onChange={handleFileSelect}
						disabled={isPending}
						accept="image/*,application/pdf,text/*"
						className="w-full rounded-md border border-gray-300 px-3 py-2 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:font-semibold file:text-blue-700 file:text-sm hover:file:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>

					<p className="text-gray-600 text-sm">
						Allowed file types: Images, PDFs, Text files (max 10MB)
					</p>

					{isPending && (
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<span className="text-gray-600 text-sm">Uploading...</span>
								<span className="font-medium text-sm">
									{progress?.percentage || 0}%
								</span>
							</div>
							<div className="h-2 w-full rounded-full bg-gray-200">
								<div
									className="h-2 rounded-full bg-blue-600 transition-all duration-300"
									style={{ width: `${progress?.percentage || 0}%` }}
								/>
							</div>
							{progress && (
								<p className="text-gray-500 text-xs">
									{progress.filename} - {Math.round(progress.loaded / 1024)}KB /{" "}
									{Math.round(progress.total / 1024)}KB
								</p>
							)}
						</div>
					)}
				</div>
			</div>

			<div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
				<h4 className="mb-2 font-medium text-blue-800">
					Features Demonstrated:
				</h4>
				<ul className="space-y-1 text-blue-700 text-sm">
					<li>• File validation (size and type)</li>
					<li>• Upload progress tracking</li>
					<li>• Automatic token handling</li>
					<li>• Error handling with user feedback</li>
					<li>• TanStack Query integration</li>
				</ul>
			</div>
		</div>
	);
};

export default ApiDemo;
