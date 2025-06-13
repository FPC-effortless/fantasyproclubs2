import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Team Management | Admin",
  description: "Manage teams and their logos",
}

export default function TeamsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 
