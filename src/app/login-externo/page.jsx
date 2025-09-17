import { LoginFormExterno } from "@/components/LoginFormExterno"

export default function LoginExternoPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <LoginFormExterno />
      </div>
    </div>
  )
}
