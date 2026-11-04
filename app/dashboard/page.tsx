import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"

export default function DashboardPage(){
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()

  useEffect(() => {
    if(!isPending && !session) router.replace("/login")
  }, [isPending, session, router])

  if (isPending || !session) return null

  return(
    <main className="p-8">
      <h1 className="text-xl font-semibold">Hi, {session.user.name}</h1>
    <Button 
      className="mt-4"
      onClick={()=>
        authClient.signOut({fetchOptions: { onSuccess:() => router.push("/login")}})
      }>
        Sign Out
      </Button>
    </main>

  )
}