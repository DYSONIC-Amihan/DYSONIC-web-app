"use client"

import { useState } from "react"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { authClient } from "@/lib/auth-client"
import { ROUTES } from "@/lib/routes"
import { getFieldErrors, signUpSchema } from "@/lib/validations/auth"
import { GoogleSignInButton } from "@/components/google-sign-in-button"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [done, setDone] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormError(null)

    const formData = new FormData(e.currentTarget)
    const parsed = signUpSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    })

    if (!parsed.success) {
      setErrors(getFieldErrors(parsed.error))
      return
    }
    setErrors({})

    setPending(true)
    const { error } = await authClient.signUp.email({
      name: parsed.data.name,
      email: parsed.data.email,
      password: parsed.data.password,
      callbackURL: `${window.location.origin}${ROUTES.login}`,
    })
    setPending(false)

    if (error) {
      setFormError(
        error.status === 429
          ? "Too many attempts. Please wait a minute and try again."
          : "We couldn't create your account. Check your details and try again.",
      )
      return
    }

    setDone(true)
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          {done ? (
            <div className="flex flex-col items-center justify-center gap-2 p-6 text-center md:p-8">
              <h1 className="text-2xl font-bold">Check your email</h1>
              <p className="text-balance text-muted-foreground">
                We sent a verification link. Verify your email, then log in.
              </p>
              <Link
                href={ROUTES.login}
                className={cn(buttonVariants(), "mt-4")}
              >
                Back to login
              </Link>
            </div>
          ) : (
            <form className="p-6 md:p-8" onSubmit={onSubmit} noValidate>
              <FieldGroup>
                <div className="flex flex-col items-center gap-2 text-center">
                  <h1 className="text-2xl font-bold">Create your account</h1>
                  <p className="text-balance text-muted-foreground">
                    Sign up with email or Google
                  </p>
                </div>

                {formError && (
                  <p
                    role="alert"
                    className="text-center text-sm text-destructive"
                  >
                    {formError}
                  </p>
                )}

                <Field data-invalid={!!errors.name}>
                  <FieldLabel htmlFor="name">Name</FieldLabel>
                  <Input
                    id="name"
                    name="name"
                    autoComplete="name"
                    aria-invalid={!!errors.name}
                  />
                  {errors.name && <FieldError>{errors.name}</FieldError>}
                </Field>

                <Field data-invalid={!!errors.email}>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="m@example.com"
                    aria-invalid={!!errors.email}
                  />
                  {errors.email && <FieldError>{errors.email}</FieldError>}
                </Field>

                <Field data-invalid={!!errors.password}>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    aria-invalid={!!errors.password}
                  />
                  {errors.password && (
                    <FieldError>{errors.password}</FieldError>
                  )}
                </Field>

                <Field data-invalid={!!errors.confirmPassword}>
                  <FieldLabel htmlFor="confirmPassword">
                    Confirm password
                  </FieldLabel>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    aria-invalid={!!errors.confirmPassword}
                  />
                  {errors.confirmPassword && (
                    <FieldError>{errors.confirmPassword}</FieldError>
                  )}
                </Field>

                <Field>
                  <Button type="submit" disabled={pending}>
                    {pending ? "Creating account..." : "Sign up"}
                  </Button>
                </Field>

                <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                  Or continue with
                </FieldSeparator>

                <Field>
                  <GoogleSignInButton />
                </Field>

                <FieldDescription className="text-center">
                  Already have an account?{" "}
                  <Link href={ROUTES.login}>Log in</Link>
                </FieldDescription>
              </FieldGroup>
            </form>
          )}

          <div className="relative hidden bg-muted md:block">
            <div className="absolute inset-0 bg-gradient-to-br from-muted via-muted to-background" />
          </div>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  )
}