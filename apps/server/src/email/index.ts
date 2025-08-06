import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_DOMAIN_KEY);

export const sendEmail = async (
	to: string,
	subject: string,
	reactEmail: React.ReactNode,
	from = "OpenFeedback <ayush@openfeedback.tech>",
) => {
	return resend.emails.send({
		from,
		to,
		subject,
		react: reactEmail,
	});
};
