import {
	Body,
	Container,
	Head,
	Html,
	Preview,
	Section,
	Text,
} from "@react-email/components";

export const WelcomeSubject = "How was your onboarding to OpenFeedback?";

export const WelcomeEmail = ({ firstname }: { firstname?: string }) => (
	<Html>
		<Head />
		<Body style={main}>
			<Preview>
				A quick hello and a small favor: How’s OpenFeedback working for you so
				far?
			</Preview>
			<Container style={container}>
				<Section style={box}>
					{firstname && <Text style={paragraph}>Hi {firstname} 👋,</Text>}
					<Text style={paragraph}>
						I’m really glad you decided to try out OpenFeedback!
					</Text>
					<Text style={paragraph}>
						How’s your experience so far? It might be a bit early to ask, but if
						you have any ideas for improvement or if anything feels off, just
						hit reply with your thoughts. Or, if you prefer, we can hop on a
						quick call, whatever works best for you.
					</Text>
					<Text style={paragraph}>
						I truly appreciate you trying our product.
					</Text>
					<Text style={paragraph}>— Ayush</Text>
				</Section>
			</Container>
		</Body>
	</Html>
);

const main = {
	backgroundColor: "#f6f9fc",
	fontFamily:
		'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
	backgroundColor: "#ffffff",
	margin: "0 auto",
	padding: "20px 0 48px",
	marginBottom: "64px",
};

const box = {
	padding: "0 48px",
};

const paragraph = {
	color: "#525f7f",

	fontSize: "16px",
	lineHeight: "24px",
	textAlign: "left" as const,
};
