export interface PasswordHasher {
  hash(plain: string): Promise<string>;
  verify(plain: string, hash: string): Promise<boolean>;
}

export class BunPasswordHasher implements PasswordHasher {
  async hash(plain: string): Promise<string> {
    return await Bun.password.hash(plain, { algorithm: 'argon2id' });
  }

  verify(plain: string, hash: string): Promise<boolean> {
    return Bun.password.verify(plain, hash);
  }
}
