"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { CalendarIcon, Edit, Plus, Save, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { motion, AnimatePresence } from 'framer-motion'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type Activity = {
  id: string
  name: string
  type: string
  capacity: number
  price: number
  discount: number
  date: Date
  status: "active" | "pending" | "sold_out"
}

type Package = {
  id: string
  customerName: string
  activities: string[]
  totalPrice: number
  status: "pending" | "approved" | "rejected"
  createdAt: Date
}

const activityFormSchema = z.object({
  name: z.string().min(2, { message: "Aktivite adı en az 2 karakter olmalıdır" }),
  type: z.string({ required_error: "Aktivite tipi seçiniz" }),
  capacity: z
    .string()
    .min(1, { message: "Kapasite giriniz" })
    .transform((val) => Number.parseInt(val, 10)),
  price: z
    .string()
    .min(1, { message: "Fiyat giriniz" })
    .transform((val) => Number.parseInt(val, 10)),
  discount: z.string().transform((val) => (val ? Number.parseInt(val, 10) : 0)),
  date: z.date({ required_error: "Tarih seçiniz" }),
})

const mockActivities: Activity[] = [
  {
    id: "1",
    name: "ATV Safari Turu",
    type: "adventure",
    capacity: 20,
    price: 1200,
    discount: 10,
    date: new Date(2023, 7, 15),
    status: "active",
  },
  {
    id: "2",
    name: "Tekne Turu",
    type: "water",
    capacity: 30,
    price: 1500,
    discount: 0,
    date: new Date(2023, 7, 16),
    status: "active",
  },
  {
    id: "3",
    name: "Paraşüt",
    type: "adventure",
    capacity: 15,
    price: 2000,
    discount: 5,
    date: new Date(2023, 7, 17),
    status: "active",
  },
  {
    id: "4",
    name: "Kültür Turu",
    type: "culture",
    capacity: 25,
    price: 800,
    discount: 0,
    date: new Date(2023, 7, 18),
    status: "pending",
  },
]

const mockPackages: Package[] = [
  {
    id: "1",
    customerName: "Ahmet Yılmaz",
    activities: ["1", "2"],
    totalPrice: 2700,
    status: "pending",
    createdAt: new Date(2023, 7, 10),
  },
  {
    id: "2",
    customerName: "Ayşe Demir",
    activities: ["3"],
    totalPrice: 2000,
    status: "approved",
    createdAt: new Date(2023, 7, 9),
  },
  {
    id: "3",
    customerName: "Mehmet Kaya",
    activities: ["1", "3"],
    totalPrice: 3200,
    status: "rejected",
    createdAt: new Date(2023, 7, 8),
  },
]

export function InventoryManagement() {
  const [activities, setActivities] = useState<Activity[]>(mockActivities)
  const [packages, setPackages] = useState<Package[]>(mockPackages)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [response, setResponse] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<z.infer<typeof activityFormSchema>>({
    resolver: zodResolver(activityFormSchema),
    defaultValues: {
      name: "",
      capacity: "",
      price: "",
      discount: "0",
    },
  })

  function onSubmit(values: z.infer<typeof activityFormSchema>) {
    const newActivity: Activity = {
      id: (activities.length + 1).toString(),
      name: values.name,
      type: values.type,
      capacity: values.capacity,
      price: values.price,
      discount: values.discount,
      date: values.date,
      status: "active",
    }

    setActivities([...activities, newActivity])
    setIsDialogOpen(false)
    form.reset()
  }

  const handleApprovePackage = (id: string) => {
    setPackages(packages.map((pkg) => (pkg.id === id ? { ...pkg, status: "approved" } : pkg)))
  }

  const handleRejectPackage = (id: string) => {
    setPackages(packages.map((pkg) => (pkg.id === id ? { ...pkg, status: "rejected" } : pkg)))
  }

  const getActivityTypeLabel = (type: string) => {
    const types = {
      adventure: "Macera",
      water: "Su Sporları",
      culture: "Kültür",
      nature: "Doğa",
      relaxation: "Spa & Wellness",
      food: "Gastronomi",
    }
    return types[type as keyof typeof types] || type
  }

  const getActivityById = (id: string) => {
    return activities.find((activity) => activity.id === id)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setResponse('') // Clear previous response

    try {
      const res = await fetch('/api/gpt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`)
      }

      const data = await res.json()
      setResponse(data.response)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(`İstek gönderilirken bir hata oluştu: ${err.message}`)
      } else {
        setError('Bilinmeyen bir hata oluştu.')
      }
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Tabs defaultValue="inventory" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="inventory">Kontenjan Yönetimi</TabsTrigger>
        <TabsTrigger value="packages">Paket Onayları</TabsTrigger>
      </TabsList>

      <TabsContent value="inventory" className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Aktivite Kontenjanları</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-sky-600 hover:bg-sky-700">
                <Plus className="h-4 w-4 mr-2" />
                Yeni Aktivite Ekle
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Yeni Aktivite Ekle</DialogTitle>
                <DialogDescription>
                  Yeni bir aktivite ve kontenjan eklemek için aşağıdaki formu doldurun.
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Aktivite Adı</FormLabel>
                        <FormControl>
                          <Input placeholder="Aktivite adı" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Aktivite Tipi</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Aktivite tipi seçin" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="adventure">Macera</SelectItem>
                            <SelectItem value="water">Su Sporları</SelectItem>
                            <SelectItem value="culture">Kültür</SelectItem>
                            <SelectItem value="nature">Doğa</SelectItem>
                            <SelectItem value="relaxation">Spa & Wellness</SelectItem>
                            <SelectItem value="food">Gastronomi</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="capacity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kapasite</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" placeholder="Kapasite" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fiyat (₺)</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" placeholder="Fiyat" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="discount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>İndirim (%)</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" max="100" placeholder="İndirim" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tarih</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={`w-full pl-3 text-left font-normal ${!field.value ? "text-muted-foreground" : ""}`}
                                >
                                  {field.value ? format(field.value, "PPP", { locale: tr }) : <span>Tarih seçin</span>}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date()}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <DialogFooter>
                    <Button type="submit" className="bg-sky-600 hover:bg-sky-700">
                      <Save className="h-4 w-4 mr-2" />
                      Kaydet
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Aktivite Adı</TableHead>
                <TableHead>Tipi</TableHead>
                <TableHead>Tarih</TableHead>
                <TableHead className="text-right">Kapasite</TableHead>
                <TableHead className="text-right">Fiyat</TableHead>
                <TableHead className="text-right">İndirim</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell className="font-medium">{activity.name}</TableCell>
                  <TableCell>{getActivityTypeLabel(activity.type)}</TableCell>
                  <TableCell>{format(activity.date, "d MMMM yyyy", { locale: tr })}</TableCell>
                  <TableCell className="text-right">{activity.capacity}</TableCell>
                  <TableCell className="text-right">{activity.price.toLocaleString("tr-TR")} ₺</TableCell>
                  <TableCell className="text-right">{activity.discount > 0 ? `%${activity.discount}` : "-"}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        activity.status === "active"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : activity.status === "pending"
                            ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                            : "bg-red-50 text-red-700 border-red-200"
                      }
                    >
                      {activity.status === "active" ? "Aktif" : activity.status === "pending" ? "Beklemede" : "Tükendi"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </TabsContent>

      <TabsContent value="packages" className="p-6">
        <h2 className="text-xl font-semibold mb-6">Paket Onay İstekleri</h2>

        <div className="grid gap-4">
          {packages.map((pkg) => (
            <Card
              key={pkg.id}
              className={
                pkg.status === "pending"
                  ? "border-yellow-200"
                  : pkg.status === "approved"
                    ? "border-green-200"
                    : "border-red-200"
              }
            >
              <CardHeader
                className={
                  pkg.status === "pending" ? "bg-yellow-50" : pkg.status === "approved" ? "bg-green-50" : "bg-red-50"
                }
              >
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{pkg.customerName}</CardTitle>
                    <CardDescription>
                      Oluşturulma: {format(pkg.createdAt, "d MMMM yyyy", { locale: tr })}
                    </CardDescription>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      pkg.status === "pending"
                        ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                        : pkg.status === "approved"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-red-50 text-red-700 border-red-200"
                    }
                  >
                    {pkg.status === "pending"
                      ? "Onay Bekliyor"
                      : pkg.status === "approved"
                        ? "Onaylandı"
                        : "Reddedildi"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <h4 className="font-medium mb-2">Paket İçeriği:</h4>
                <div className="space-y-2 mb-4">
                  {pkg.activities.map((activityId) => {
                    const activity = getActivityById(activityId)
                    return activity ? (
                      <div key={activityId} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">{activity.name}</p>
                          <p className="text-sm text-gray-600">
                            {format(activity.date, "d MMMM yyyy", { locale: tr })}
                          </p>
                        </div>
                        <p>{activity.price.toLocaleString("tr-TR")} ₺</p>
                      </div>
                    ) : null
                  })}
                </div>

                <div className="flex justify-between items-center pt-2 border-t">
                  <p className="font-medium">Toplam Tutar:</p>
                  <p className="font-bold text-lg">{pkg.totalPrice.toLocaleString("tr-TR")} ₺</p>
                </div>

                {pkg.status === "pending" && (
                  <div className="flex gap-2 mt-4">
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => handleApprovePackage(pkg.id)}
                    >
                      Onayla
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => handleRejectPackage(pkg.id)}
                    >
                      Reddet
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  )
}
