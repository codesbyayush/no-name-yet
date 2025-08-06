import type { AppEnv } from "@/lib/env";
import { Resend } from "resend";

export const sendEmail = async (
	env: AppEnv,
	to: string,
	subject: string,
	reactEmail: React.ReactNode,
	from = "OpenFeedback <ayush@openfeedback.tech>",
) => {
	const resend = new Resend(env.RESEND_DOMAIN_KEY);
	return resend.emails.send({
		from,
		to,
		subject,
		react: reactEmail,
	});
};
