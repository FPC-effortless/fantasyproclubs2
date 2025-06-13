"use client"

import { NewsManagement } from "@/components/admin/news-management"

export default function ContentManagementPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Content Management</h1>
      <NewsManagement />
    </div>
  )
} 
