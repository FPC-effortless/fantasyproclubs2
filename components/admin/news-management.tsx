"use client"

import { useState, useEffect } from "react"
import {
  FileText,
  Video,
  Plus,
  Pencil,
  Trash,
  Search,
  Calendar,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface NewsItem {
  id: string
  title: string
  content: string
  image_url: string
  category: string
  slug: string
  published_at: string
  created_at: string
  updated_at: string
}

interface NewNewsItem {
  title: string
  content: string
  image_url: string
  category: string
  slug: string
}

export function NewsManagement() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newItem, setNewItem] = useState<NewNewsItem>({
    title: "",
    content: "",
    image_url: "",
    category: "news",
    slug: "",
  })

  useEffect(() => {
    fetchNewsItems()
  }, [])

  async function fetchNewsItems() {
    const supabase = createClientComponentClient()
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('published_at', { ascending: false })

      if (error) throw error

      setNewsItems(data || [])
    } catch (error: any) {
      console.error('Error fetching news:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to load news items",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddNewsItem = async () => {
    const supabase = createClientComponentClient()
    try {
      // Generate slug from title
      const slug = newItem.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      const { error } = await supabase
        .from('news')
        .insert([{
          ...newItem,
          slug,
          published_at: new Date().toISOString(),
        }])

      if (error) throw error

      toast({
        title: "Success",
        description: "News item added successfully",
      })

      setIsAddDialogOpen(false)
      setNewItem({
        title: "",
        content: "",
        image_url: "",
        category: "news",
        slug: "",
      })
      fetchNewsItems()
    } catch (error: any) {
      console.error('Error adding news item:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to add news item",
        variant: "destructive",
      })
    }
  }

  const handleDeleteNewsItem = async (id: string) => {
    const supabase = createClientComponentClient()
    try {
      const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast({
        title: "Success",
        description: "News item deleted successfully",
      })

      fetchNewsItems()
    } catch (error: any) {
      console.error('Error deleting news item:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete news item",
        variant: "destructive",
      })
    }
  }

  const filteredNewsItems = newsItems.filter(item => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            News & Videos Management
          </CardTitle>
          <CardDescription>
            Manage news articles and videos that appear on the homepage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Input
                  placeholder="Search news..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64"
                />
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="news">News</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="announcement">Announcement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add New
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Content</DialogTitle>
                    <DialogDescription>
                      Add a new news article or video to the platform
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label>Title</label>
                      <Input
                        value={newItem.title}
                        onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                        placeholder="Enter title"
                      />
                    </div>
                    <div className="space-y-2">
                      <label>Content</label>
                      <Textarea
                        value={newItem.content}
                        onChange={(e) => setNewItem({ ...newItem, content: e.target.value })}
                        placeholder="Enter content"
                        rows={5}
                      />
                    </div>
                    <div className="space-y-2">
                      <label>Image/Video URL</label>
                      <Input
                        value={newItem.image_url}
                        onChange={(e) => setNewItem({ ...newItem, image_url: e.target.value })}
                        placeholder="Enter image or video URL"
                      />
                    </div>
                    <div className="space-y-2">
                      <label>Category</label>
                      <Select
                        value={newItem.category}
                        onValueChange={(value) => setNewItem({ ...newItem, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="news">News</SelectItem>
                          <SelectItem value="video">Video</SelectItem>
                          <SelectItem value="announcement">Announcement</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddNewsItem}>
                      Add Content
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNewsItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {item.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(item.published_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteNewsItem(item.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 
