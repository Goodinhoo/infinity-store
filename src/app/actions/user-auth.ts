'use server'

import { signIn, signOut } from "@/../auth"
import { AuthError } from "next-auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function loginAction(prevState: any, formData: FormData) {
  try {
    formData.append("redirectTo", "/profile")
    await signIn("credentials", formData)
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Credenciais inválidas. Verifica o teu nick/email e palavra-passe." }
        default:
          return { error: "Ocorreu um erro ao iniciar sessão." }
      }
    }
    throw error
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function registerAction(prevState: any, formData: FormData) {
  const username = formData.get("username") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!username || !email || !password) {
    return { error: "Todos os campos são de preenchimento obrigatório." }
  }

  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    })

    if (existingUser) {
      return { error: "Já existe uma conta associada a este nick ou email." }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.user.create({
      data: {
        username: username.trim(),
        name: username.trim(),
        email: email.trim(),
        password: hashedPassword,
        role: "USER",
        balance: 0.0
      }
    })

  } catch (error) {
    console.error("Erro no registo:", error)
    return { error: "Ocorreu um erro ao criar a tua conta." }
  }

  redirect("/login")
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" })
}
