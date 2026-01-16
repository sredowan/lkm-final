import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/db"; // We need to create this db instance export
import { admins } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const [admin] = await db.select().from(admins).where(eq(admins.email, credentials.email)).limit(1);

                if (!admin) return null;

                const isPasswordValid = await bcrypt.compare(credentials.password, admin.password);

                if (!isPasswordValid) return null;

                return {
                    id: admin.id.toString(),
                    email: admin.email,
                    name: admin.name,
                    role: admin.role || 'admin',
                };
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).role = token.role;
            }
            return session;
        }
    },
    pages: {
        signIn: '/admin/login',
    },
    session: {
        strategy: "jwt",
    }
};
