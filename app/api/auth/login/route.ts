import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const { username, password } = (await request.json()) as { username?: string; password?: string }

  const expectedUsername = process.env.LOCAL_AUTH_USERNAME
  const expectedPassword = process.env.LOCAL_AUTH_PASSWORD

  if (!expectedUsername || !expectedPassword) {
    return NextResponse.json({ success: false }, { status: 500 })
  }

  const isValid =
    typeof username === "string" &&
    typeof password === "string" &&
    username === expectedUsername &&
    password === expectedPassword

  if (!isValid) {
    return NextResponse.json({ success: false }, { status: 401 })
  }

  return NextResponse.json({ success: true }, { status: 200 })
}
