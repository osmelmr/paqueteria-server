declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      username: string;
      fullName: string;
      role: string;
      isActive: boolean;
      agencyId: string | null;
    }

    interface Request {
      user?: User;
    }
  }
}

export {};
