import type { LoginInput, RegisterInput, User } from "@todoodle/shared";
import { authRepository, type UserRow } from "./auth.repository";

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export type Session = { token: string; expiresAt: Date; user: User };

// Checked when the email is unknown, so a failed login takes the same time
// whether or not the account exists
const dummyPasswordHash = await Bun.password.hash("todoodle-dummy-password");

function toUser(row: UserRow): User {
	return {
		id: row.id,
		email: row.email,
		createdAt: row.createdAt.toISOString(),
	};
}

function hashToken(token: string): string {
	return new Bun.CryptoHasher("sha256").update(token).digest("hex");
}

function startSession(user: UserRow): Session {
	const token = Buffer.from(
		crypto.getRandomValues(new Uint8Array(32)),
	).toString("base64url");
	const session = authRepository.createSession({
		id: hashToken(token),
		userId: user.id,
		expiresAt: new Date(Date.now() + SESSION_TTL_MS),
	});
	return {
		token,
		expiresAt: session.expiresAt,
		user: toUser(user),
	};
}

export const authService = {
	/** Returns null when the email is already registered. */
	async register(input: RegisterInput): Promise<Session | null> {
		if (authRepository.findUserByEmail(input.email)) return null;
		const user = authRepository.createUser({
			email: input.email,
			passwordHash: await Bun.password.hash(input.password),
		});
		return startSession(user);
	},

	/** Returns null when the email or password is wrong. */
	async login(input: LoginInput): Promise<Session | null> {
		const user = authRepository.findUserByEmail(input.email);
		const valid = await Bun.password.verify(
			input.password,
			user?.passwordHash ?? dummyPasswordHash,
		);
		return user && valid ? startSession(user) : null;
	},

	/** Returns the session owner, or null when the token is unknown or expired. */
	authenticate(token: string): User | null {
		const id = hashToken(token);
		const found = authRepository.findSessionWithUser(id);
		if (!found) return null;
		if (found.session.expiresAt.getTime() <= Date.now()) {
			authRepository.deleteSession(id);
			return null;
		}
		return toUser(found.user);
	},

	logout(token: string): void {
		authRepository.deleteSession(hashToken(token));
	},

	logoutAll(userId: string): void {
		authRepository.deleteUserSessions(userId);
	},
};
