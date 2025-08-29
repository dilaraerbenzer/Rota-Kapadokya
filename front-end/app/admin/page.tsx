"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";
import { useToast } from "@/components/ui/use-toast";
import { getPredict } from "../backend.js";
import {
  createService,
  getHotel,
  updateCapacity,
  createPackage,
  getPackages,
  acceptPackage,
  getOldPackages,
} from "../backend.js";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ChevronDown,
  Hotel,
  Package,
  Plus,
  PlusCircle,
  RefreshCw,
  Settings,
  ShoppingBag,
  Sparkles,
  Users,
  Utensils,
  Loader2,
  LayoutDashboard,
  FileImage,
  ListFilter,
  Edit,
  Trash2,
  FileText
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";

// Supabase bağlantısı
const SUPABASE_URL = "https://vpmzqnrdzaqcrarnherr.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwbXpxbnJkemFxY3Jhcm5oZXJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2NjYyMjcsImV4cCI6MjA2MTI0MjIyN30.sDxLI0I6i-dTtKfLvyC9jDWJApzwHrAEDOALG_v9qvA";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Utils
function formatDate(dateStr) {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  return date.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(amount);
}

// Sonuç ve hata tipleri
interface ResultType {
  success: boolean;
  type?: string;
  data?: any;
  error?: any;
  recommendations?: Record<string, number>;
}

// Service tipi
interface ServiceType {
  id: number;
  agency: number;
  hotel: number;
  name: string;
  description: string;
  price: number;
  capacity: number;
  image_path: string;
}

// Hotel tipi
interface HotelType {
  id: number;
  name: string;
  description: string;
  services: ServiceType[];
}

// Package tipi
interface PackageType {
  id: number;
  name: string;
  surname: string;
  nationality: string;
  serial_number: string;
  city: string;
  age: number;
  gender: boolean;
  group: string;
  arrival_date: string;
  departure_date: string;
  hotel: number;
  room_type: string;
  services: number[];
  accepted: number[];
}

export default function KapadokyaAdminPanel() {
  // Toast hook
  const { toast } = useToast();

  // Tabs state
  const [activeTab, setActiveTab] = useState("dashboard");

  // Loading state
  const [loading, setLoading] = useState(false);

  // Hotels state
  const [hotels, setHotels] = useState<HotelType[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<HotelType | null>(null);
  const [selectedHotelId, setSelectedHotelId] = useState<number>(1);

  // Services state
  const [services, setServices] = useState<ServiceType[]>([]);
  const [newService, setNewService] = useState({
    agency: 1,
    hotel: 1,
    name: "",
    description: "",
    price: 0,
    capacity: 0,
    image_path: "",
  });

  // Packages state
  const [packages, setPackages] = useState<PackageType[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<PackageType | null>(null);

  // New package state
  const [newPackage, setNewPackage] = useState({
    name: "",
    surname: "",
    nationality: "Turkish",
    serial_number: "",
    city: "",
    age: 30,
    gender: true,
    group: "[]",
    arrival_date: new Date().toISOString(),
    departure_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    hotel: 1,
    room_type: "standard",
    services: [],
  });

  // Dialog state
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [packageDialogOpen, setPackageDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [deleteType, setDeleteType] = useState<string>("");

  // Filters
  const [serviceFilter, setServiceFilter] = useState("");
  const [packageFilter, setPackageFilter] = useState("");

  // File upload
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Stats
  const [stats, setStats] = useState({
    totalPackages: 0,
    totalServices: 0,
    totalHotels: 0,
    revenueToday: 0,
  });

  const [arrivalCalendarOpen, setArrivalCalendarOpen] = useState(false);
const [departureCalendarOpen, setDepartureCalendarOpen] = useState(false);
const [packageArrivalCalendarOpen, setPackageArrivalCalendarOpen] = useState(false);
const [packageDepartureCalendarOpen, setPackageDepartureCalendarOpen] = useState(false);

  // Load hotels on mount
  useEffect(() => {
    fetchHotels();
    fetchStats();
  }, []);

  // Fetch hotels from Supabase
  const fetchHotels = async () => {
    try {
      const { data, error } = await supabase.from("hotels").select("*");
      if (error) throw error;
      setHotels(data || []);
      if (data && data.length > 0) {
        fetchHotelDetails(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching hotels:", error);
      toast({
        title: "Error",
        description: "Oteller yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  // Fetch hotel details
  const fetchHotelDetails = async (hotelId) => {
    setLoading(true);
    try {
      const hotelData = await getHotel(hotelId);
      setSelectedHotel(hotelData);
      setSelectedHotelId(hotelId);
      setServices(hotelData.services || []);
      
      // Fetch packages for this hotel
      const { data, error } = await supabase
        .from("packages")
        .select("*")
        .eq("hotel", hotelId);
      
      if (error) throw error;
      setPackages(data || []);
      
    } catch (error) {
      console.error("Error fetching hotel details:", error);
      toast({
        title: "Error",
        description: "Otel detayları yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      // Get total packages
      const { count: packageCount } = await supabase
        .from("packages")
        .select("*", { count: "exact", head: true });
      
      // Get total services
      const { count: serviceCount } = await supabase
        .from("services")
        .select("*", { count: "exact", head: true });
      
      // Get total hotels
      const { count: hotelCount } = await supabase
        .from("hotels")
        .select("*", { count: "exact", head: true });
      
      // Calculate today's revenue (example)
      let todayRevenue = 0;
      const today = new Date().toISOString().split('T')[0];
      const { data: todayPackages } = await supabase
        .from("packages")
        .select("*")
        .gte("created_at", today);
      
      if (todayPackages && todayPackages.length) {
        // This is just a mock calculation
        todayRevenue = todayPackages.length * 1500; 
      }
      
      setStats({
        totalPackages: packageCount || 0,
        totalServices: serviceCount || 0,
        totalHotels: hotelCount || 0,
        revenueToday: todayRevenue,
      });
      
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setNewService({
        ...newService,
        image_path: `/images/${file.name}`,
      });
    }
  };

  // Create new service
  const handleCreateService = async () => {
    setLoading(true);
    try {
      await createService(
        newService.agency,
        newService.hotel,
        newService.name,
        newService.description,
        newService.price,
        newService.capacity,
        newService.image_path
      );
      
      toast({
        title: "Başarılı",
        description: "Servis başarıyla oluşturuldu.",
      });
      
      // Reset form and refresh services
      setNewService({
        agency: 1,
        hotel: selectedHotelId,
        name: "",
        description: "",
        price: 0,
        capacity: 0,
        image_path: "",
      });
      setUploadedImage(null);
      setImagePreview(null);
      setServiceDialogOpen(false);
      
      // Refresh hotel details to get updated services
      fetchHotelDetails(selectedHotelId);
      
    } catch (error) {
      console.error("Error creating service:", error);
      toast({
        title: "Error",
        description: "Servis oluşturulurken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Update service capacity
  const handleUpdateCapacity = async (serviceId, newCapacity) => {
    setLoading(true);
    try {
      await updateCapacity(serviceId, newCapacity);
      
      toast({
        title: "Başarılı",
        description: "Servis kapasitesi güncellendi.",
      });
      
      // Refresh hotel details to get updated services
      fetchHotelDetails(selectedHotelId);
      
    } catch (error) {
      console.error("Error updating capacity:", error);
      toast({
        title: "Error",
        description: "Kapasite güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Create new package
  const handleCreatePackage = async () => {
    setLoading(true);
    try {
      await createPackage(
        newPackage.name,
        newPackage.surname,
        newPackage.nationality,
        newPackage.serial_number,
        newPackage.city,
        newPackage.age,
        newPackage.gender,
        newPackage.group,
        newPackage.arrival_date,
        newPackage.departure_date,
        newPackage.hotel,
        newPackage.room_type,
        newPackage.services
      );
      
      toast({
        title: "Başarılı",
        description: "Paket başarıyla oluşturuldu.",
      });
      
      // Reset form and refresh packages
      setNewPackage({
        name: "",
        surname: "",
        nationality: "Turkish",
        serial_number: "",
        city: "",
        age: 30,
        gender: true,
        group: "[]",
        arrival_date: new Date().toISOString(),
        departure_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        hotel: selectedHotelId,
        room_type: "standard",
        services: [],
      });
      setPackageDialogOpen(false);
      
      // Refresh hotel details to get updated packages
      fetchHotelDetails(selectedHotelId);
      fetchStats();
      
    } catch (error) {
      console.error("Error creating package:", error);
      toast({
        title: "Error",
        description: "Paket oluşturulurken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Accept service for package
  const handleAcceptService = async (packageId, serviceId) => {
    setLoading(true);
    try {
      await acceptPackage(packageId, serviceId);
      
      toast({
        title: "Başarılı",
        description: "Servis pakete eklendi.",
      });
      
      // Refresh hotel details to get updated packages
      fetchHotelDetails(selectedHotelId);
      
    } catch (error) {
      console.error("Error accepting service:", error);
      toast({
        title: "Error",
        description: "Servis eklenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter services
  const filteredServices = services.filter(service => 
    service.name.toLowerCase().includes(serviceFilter.toLowerCase()) ||
    service.description.toLowerCase().includes(serviceFilter.toLowerCase())
  );

  // Filter packages
  const filteredPackages = packages.filter(pkg => 
    pkg.name.toLowerCase().includes(packageFilter.toLowerCase()) ||
    pkg.surname.toLowerCase().includes(packageFilter.toLowerCase()) ||
    pkg.nationality.toLowerCase().includes(packageFilter.toLowerCase()) ||
    pkg.city.toLowerCase().includes(packageFilter.toLowerCase())
  );

  // Handle delete item
  const handleDeleteItem = async () => {
    if (!itemToDelete || !deleteType) return;
    
    setLoading(true);
    try {
      if (deleteType === "service") {
        // Delete service
        const { error } = await supabase
          .from("services")
          .delete()
          .eq("id", itemToDelete.id);
        
        if (error) throw error;
        
        toast({
          title: "Başarılı",
          description: "Servis başarıyla silindi.",
        });
      } else if (deleteType === "package") {
        // Delete package
        const { error } = await supabase
          .from("packages")
          .delete()
          .eq("id", itemToDelete.id);
        
        if (error) throw error;
        
        toast({
          title: "Başarılı",
          description: "Paket başarıyla silindi.",
        });
      }
      
      // Refresh data
      fetchHotelDetails(selectedHotelId);
      fetchStats();
      
    } catch (error) {
      console.error(`Error deleting ${deleteType}:`, error);
      toast({
        title: "Error",
        description: `${deleteType === "service" ? "Servis" : "Paket"} silinirken bir hata oluştu.`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      setDeleteType("");
    }
  };

  // Handle date change
  const handleDateChange = (field, date) => {
    setNewPackage({
      ...newPackage,
      [field]: date.toISOString(),
    });
  };

  // Utils
  const getPackageServiceNames = (serviceIds = []) => {
    if (!services || !serviceIds.length) return "No services";
    
    return serviceIds.map(id => {
      const service = services.find(s => s.id === id);
      return service ? service.name : "Unknown Service";
    }).join(", ");
  };

  // Format group information to show gender and age groups
  const formatGroupInfo = (groupStr) => {
    if (!groupStr || groupStr === "[]") return "Belirtilmemiş";
    
    try {
      // Parse the group string which is in JSON format
      const groupArray = JSON.parse(groupStr);
      
      if (!groupArray || !Array.isArray(groupArray) || !groupArray.length) return "Belirtilmemiş";
      
      // Group by gender
      const males = [];
      const females = [];
      
      groupArray.forEach(item => {
        // Format is like "10M" or "15F"
        if (!item || typeof item !== 'string') return;
        
        const match = item.match(/(\d+)([MF])/);
        if (!match) return;
        
        const age = parseInt(match[1], 10);
        const gender = match[2];
        
        if (gender === "M") {
          males.push(age);
        } else if (gender === "F") {
          females.push(age);
        }
      });
      
      // Format the result
      const result = [];
      if (males.length > 0) {
        result.push(`Erkek(${males.sort((a, b) => a - b).join(',')})`);
      }
      if (females.length > 0) {
        result.push(`Kadın(${females.sort((a, b) => a - b).join(',')})`);
      }
      
      return result.length > 0 ? result.join(' ') : "Belirtilmemiş";
    } catch (e) {
      console.error("Error parsing group:", e);
      return "Belirtilmemiş"; // Return placeholder if parsing fails
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">
                Yönetim Paneli
              </h1>
              <p className="text-slate-400 mt-1">
                Otel, servis ve paket yönetimi için kapsamlı kontrol merkezi
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Select
                value={String(selectedHotelId)}
                onValueChange={(value) => fetchHotelDetails(Number(value))}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white w-[200px]">
                  <SelectValue placeholder="Otel Seçin" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                  {hotels.map((hotel) => (
                    <SelectItem key={hotel.id} value={String(hotel.id)} className="text-white">
                      {hotel.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => fetchHotelDetails(selectedHotelId)}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Yenile
              </Button>
            </div>
          </div>
        </header>
        
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="bg-slate-800 p-1 mb-6">
            <TabsTrigger
              value="dashboard"
              className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-400"
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger
              value="services"
              className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-400"
            >
              <Utensils className="mr-2 h-4 w-4" />
              Servisler
            </TabsTrigger>
            <TabsTrigger
              value="packages"
              className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-400"
            >
              <Package className="mr-2 h-4 w-4" />
              Paketler
            </TabsTrigger>
          </TabsList>
          
          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-slate-800 border-slate-700 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">Toplam Paketler</p>
                      <h3 className="text-2xl font-bold text-white mt-1">{stats.totalPackages}</h3>
                    </div>
                    <div className="p-3 bg-blue-500/20 rounded-full">
                      <Package className="h-6 w-6 text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-slate-800 border-slate-700 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">Toplam Servisler</p>
                      <h3 className="text-2xl font-bold text-white mt-1">{stats.totalServices}</h3>
                    </div>
                    <div className="p-3 bg-purple-500/20 rounded-full">
                      <Utensils className="h-6 w-6 text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-slate-800 border-slate-700 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">Toplam Oteller</p>
                      <h3 className="text-2xl font-bold text-white mt-1">{stats.totalHotels}</h3>
                    </div>
                    <div className="p-3 bg-emerald-500/20 rounded-full">
                      <Hotel className="h-6 w-6 text-emerald-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-slate-800 border-slate-700 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">Bugünkü Gelir</p>
                      <h3 className="text-2xl font-bold text-white mt-1">{formatCurrency(stats.revenueToday)}</h3>
                    </div>
                    <div className="p-3 bg-amber-500/20 rounded-full">
                      <ShoppingBag className="h-6 w-6 text-amber-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {selectedHotel && (
              <Card className="bg-slate-800 border-slate-700 shadow-md overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-700">
                  <CardTitle className="text-white flex items-center">
                    <Hotel className="mr-2 h-5 w-5 text-purple-400" />
                    {selectedHotel.name}
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    {selectedHotel.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium text-white mb-3 flex items-center">
                        <Utensils className="mr-2 h-4 w-4 text-purple-400" />
                        Servis İstatistikleri
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                          <span className="text-slate-300">Toplam Servis Sayısı</span>
                          <Badge className="bg-purple-600">{services.length}</Badge>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                          <span className="text-slate-300">Toplam Kapasite</span>
                          <Badge className="bg-blue-600">
                            {services.reduce((sum, service) => sum + service.capacity, 0)}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                          <span className="text-slate-300">Ortalama Fiyat</span>
                          <Badge className="bg-green-600">
                            {formatCurrency(
                              services.length
                                ? services.reduce((sum, service) => sum + service.price, 0) / services.length
                                : 0
                            )}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium text-white mb-3 flex items-center">
                        <Package className="mr-2 h-4 w-4 text-blue-400" />
                        Paket İstatistikleri
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                          <span className="text-slate-300">Toplam Paket Sayısı</span>
                          <Badge className="bg-blue-600">{packages.length}</Badge>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                          <span className="text-slate-300">Aktif Paketler</span>
                          <Badge className="bg-green-600">
                            {packages.filter(p => new Date(p.departure_date) > new Date()).length}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                          <span className="text-slate-300">Farklı Milliyetler</span>
                          <Badge className="bg-amber-600">
                            {new Set(packages.map(p => p.nationality)).size}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-slate-800 border-slate-700 shadow-md">
                <CardHeader>
                  <CardTitle className="text-white">Son Eklenen Servisler</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {services.slice(0, 5).map((service) => (
                      <div key={service.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-purple-600/20 mr-3">
                            <Utensils className="h-5 w-5 text-purple-400" />
                          </div>
                          <div>
                            <p className="text-white font-medium">{service.name}</p>
                            <p className="text-sm text-slate-400">{formatCurrency(service.price)}</p>
                          </div>
                        </div>
                        <Badge className="bg-slate-600">
                          Kapasite: {service.capacity}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-slate-800 border-slate-700 shadow-md">
                <CardHeader>
                  <CardTitle className="text-white">Son Eklenen Paketler</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {packages.slice(0, 5).map((pkg) => (
                      <div key={pkg.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600/20 mr-3">
                            <Package className="h-5 w-5 text-blue-400" />
                          </div>
                          <div>
                            <p className="text-white font-medium">{pkg.name} {pkg.surname}</p>
                            <p className="text-sm text-slate-400">{pkg.nationality}, {pkg.city}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-amber-600 mb-1 block">
                            {formatDate(pkg.arrival_date)}
                          </Badge>
                          <Badge className="bg-slate-600 block">
                            {pkg.services.length} servis
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Services Tab */}
          <TabsContent value="services" className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Servisler</h2>
                <p className="text-slate-400">
                  {selectedHotel?.name} için mevcut servisler ve yeni servis ekleme
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Input
                    placeholder="Servis ara..."
                    value={serviceFilter}
                    onChange={(e) => setServiceFilter(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white w-[240px] pl-9"
                  />
                  <ListFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
                
                <Dialog open={serviceDialogOpen} onOpenChange={setServiceDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      <Plus className="mr-2 h-4 w-4" />
                      Yeni Servis Ekle
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-800 text-white border-slate-700">
                    <DialogHeader>
                      <DialogTitle>Yeni Servis Oluştur</DialogTitle>
                      <DialogDescription className="text-slate-400">
                        {selectedHotel?.name} için yeni bir servis ekleyin
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-300">Servis Adı</label>
                          <Input
                            value={newService.name}
                            onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                            className="bg-slate-700 border-slate-600 text-white"
                            placeholder="Örnek: Balon Turu"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-300">Fiyat (₺)</label>
                          <Input
                            type="number"
                            value={newService.price}
                            onChange={(e) => setNewService({ ...newService, price: Number(e.target.value) })}
                            className="bg-slate-700 border-slate-600 text-white"
                            placeholder="1000"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Açıklama</label>
                        <Textarea
                          value={newService.description}
                          onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                          className="bg-slate-700 border-slate-600 text-white min-h-[80px]"
                          placeholder="Servis açıklaması..."
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-300">Kapasite</label>
                          <Input
                            type="number"
                            value={newService.capacity}
                            onChange={(e) => setNewService({ ...newService, capacity: Number(e.target.value) })}
                            className="bg-slate-700 border-slate-600 text-white"
                            placeholder="10"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-300">Görsel</label>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              className="bg-slate-700 border-slate-600 text-white w-full h-10"
                              onClick={() => document.getElementById("service-image").click()}
                            >
                              <FileImage className="mr-2 h-4 w-4" />
                              Görsel Seç
                            </Button>
                            <input
                              id="service-image"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleFileChange}
                            />
                          </div>
                          {imagePreview && (
                            <div className="mt-2 rounded-md overflow-hidden">
                              <img
                                src={imagePreview}
                                alt="Preview"
                                className="w-full h-auto max-h-[150px] object-cover"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button variant="outline" className="bg-slate-700 border-slate-600 text-white" onClick={() => setServiceDialogOpen(false)}>
                        İptal
                      </Button>
                      <Button className="bg-purple-600 hover:bg-purple-700" onClick={handleCreateService} disabled={loading}>
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            İşleniyor...
                          </>
                        ) : (
                          <>
                            <Plus className="mr-2 h-4 w-4" />
                            Servis Oluştur
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.length === 0 ? (
                <div className="col-span-full p-8 bg-slate-800 rounded-lg border border-slate-700 text-center">
                  <div className="p-3 bg-slate-700/50 rounded-full mx-auto w-fit mb-4">
                    <Utensils className="h-6 w-6 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">Servis Bulunamadı</h3>
                  <p className="text-slate-400">
                    Bu otel için henüz servis eklenmemiş veya arama kriterinize uygun servis yok.
                  </p>
                  <Button className="mt-4 bg-purple-600 hover:bg-purple-700" onClick={() => setServiceDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Yeni Servis Ekle
                  </Button>
                </div>
              ) : (
                filteredServices.map((service) => (
                  <Card key={service.id} className="bg-slate-800 border-slate-700 shadow-md overflow-hidden">
                    <div className="h-48 bg-slate-700 relative">
                      {service.image_path ? (
                        <div className="w-full h-full bg-slate-700 flex items-center justify-center overflow-hidden">
                          <img
                          src={service.image_path ? 
                            (service.image_path.includes('/images/') ? 
                              service.image_path : 
                              `/images/${service.image_path.replace(/^\/+/, '')}`) : 
                            ''}
                            alt={service.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback if image fails to load
                              e.currentTarget.src = "/images/turistik.jpg";
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800">
                          <Utensils className="h-16 w-16 text-slate-600" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2 flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 bg-slate-800/90 border-slate-700 text-white hover:bg-slate-700"
                          onClick={() => {
                            setItemToDelete(service);
                            setDeleteType("service");
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 bg-slate-800/90 border-slate-700 text-white hover:bg-slate-700"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-semibold text-white">{service.name}</h3>
                        <Badge className="bg-purple-600">{formatCurrency(service.price)}</Badge>
                      </div>
                      <p className="text-sm text-slate-400 mb-4 line-clamp-2">{service.description}</p>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-300">Kapasite</span>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7 bg-slate-700 border-slate-600 text-white"
                              onClick={() => handleUpdateCapacity(service.id, Math.max(0, service.capacity - 1))}
                            >
                              -
                            </Button>
                            <span className="min-w-[40px] text-center font-medium text-white">
                              {service.capacity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7 bg-slate-700 border-slate-600 text-white"
                              onClick={() => handleUpdateCapacity(service.id, service.capacity + 1)}
                            >
                              +
                            </Button>
                          </div>
                        </div>
                        
                        <Separator className="bg-slate-700" />
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-300">Servis ID</span>
                          <Badge variant="outline" className="border-slate-600 text-slate-300">
                            {service.id}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
          
          {/* Packages Tab */}
          <TabsContent value="packages" className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Paketler</h2>
                <p className="text-slate-400">
                  {selectedHotel?.name} için mevcut paketler ve yeni paket ekleme
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Input
                    placeholder="Paket ara..."
                    value={packageFilter}
                    onChange={(e) => setPackageFilter(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white w-[240px] pl-9"
                  />
                  <ListFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
                
                <Dialog open={packageDialogOpen} onOpenChange={setPackageDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="mr-2 h-4 w-4" />
                      Yeni Paket Ekle
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-800 text-white border-slate-700 max-w-3xl">
                    <DialogHeader>
                      <DialogTitle>Yeni Paket Oluştur</DialogTitle>
                      <DialogDescription className="text-slate-400">
                        {selectedHotel?.name} için yeni bir paket ekleyin
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="py-4">
                      <Tabs defaultValue="customer" className="w-full">
                        <TabsList className="bg-slate-700 p-1 mb-6">
                          <TabsTrigger
                            value="customer"
                            className="data-[state=active]:bg-slate-600 data-[state=active]:text-white text-slate-400"
                          >
                            <Users className="mr-2 h-4 w-4" />
                            Müşteri Bilgileri
                          </TabsTrigger>
                          <TabsTrigger
                            value="booking"
                            className="data-[state=active]:bg-slate-600 data-[state=active]:text-white text-slate-400"
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            Rezervasyon Detayları
                          </TabsTrigger>
                          <TabsTrigger
                            value="services"
                            className="data-[state=active]:bg-slate-600 data-[state=active]:text-white text-slate-400"
                          >
                            <Utensils className="mr-2 h-4 w-4" />
                            Servisler
                          </TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="customer" className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-slate-300">İsim</label>
                              <Input
                                value={newPackage.name}
                                onChange={(e) => setNewPackage({ ...newPackage, name: e.target.value })}
                                className="bg-slate-700 border-slate-600 text-white"
                                placeholder="İsim girin"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-slate-300">Soyisim</label>
                              <Input
                                value={newPackage.surname}
                                onChange={(e) => setNewPackage({ ...newPackage, surname: e.target.value })}
                                className="bg-slate-700 border-slate-600 text-white"
                                placeholder="Soyisim girin"
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-slate-300">Uyruk</label>
                              <Input
                                value={newPackage.nationality}
                                onChange={(e) => setNewPackage({ ...newPackage, nationality: e.target.value })}
                                className="bg-slate-700 border-slate-600 text-white"
                                placeholder="Ör: Turkish"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-slate-300">Kimlik No</label>
                              <Input
                                value={newPackage.serial_number}
                                onChange={(e) => setNewPackage({ ...newPackage, serial_number: e.target.value })}
                                className="bg-slate-700 border-slate-600 text-white"
                                placeholder="TC Kimlik veya Pasaport No"
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-slate-300">Şehir</label>
                              <Input
                                value={newPackage.city}
                                onChange={(e) => setNewPackage({ ...newPackage, city: e.target.value })}
                                className="bg-slate-700 border-slate-600 text-white"
                                placeholder="Ör: İstanbul"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-slate-300">Yaş</label>
                              <Input
                                type="number"
                                value={newPackage.age}
                                onChange={(e) => setNewPackage({ ...newPackage, age: Number(e.target.value) })}
                                className="bg-slate-700 border-slate-600 text-white"
                                placeholder="Ör: 30"
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-slate-300">Cinsiyet</label>
                              <Select
                                value={newPackage.gender ? "male" : "female"}
                                onValueChange={(value) => setNewPackage({ ...newPackage, gender: value === "male" })}
                              >
                                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                                  <SelectValue placeholder="Cinsiyet seçin" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                                  <SelectItem value="male" className="text-white">Erkek</SelectItem>
                                  <SelectItem value="female" className="text-white">Kadın</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-slate-300">Grup (ör: 30M,28F,7M)</label>
                              <Input
                                value={newPackage.group}
                                onChange={(e) => setNewPackage({ ...newPackage, group: e.target.value })}
                                className="bg-slate-700 border-slate-600 text-white"
                                placeholder="Ör: 30M,28F,7M"
                              />
                            </div>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="booking" className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
  <label className="text-sm font-medium text-slate-300">Giriş Tarihi</label>
  <Popover open={packageArrivalCalendarOpen} onOpenChange={setPackageArrivalCalendarOpen}>
    <PopoverTrigger asChild>
      <Button
        variant="outline"
        className="w-full justify-start text-left bg-slate-700 border-slate-600 text-white"
      >
        <Calendar className="mr-2 h-4 w-4" />
        {formatDate(newPackage.arrival_date)}
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-auto p-0 bg-slate-800 border-slate-700">
      <Calendar
        mode="single"
        selected={new Date(newPackage.arrival_date)}
        onSelect={(date) => {
          handleDateChange("arrival_date", date);
          setPackageArrivalCalendarOpen(false);
        }}
        initialFocus
        className="bg-slate-800 text-white"
      />
    </PopoverContent>
  </Popover>
</div>

<div className="space-y-2">
  <label className="text-sm font-medium text-slate-300">Çıkış Tarihi</label>
  <Popover open={packageDepartureCalendarOpen} onOpenChange={setPackageDepartureCalendarOpen}>
    <PopoverTrigger asChild>
      <Button
        variant="outline"
        className="w-full justify-start text-left bg-slate-700 border-slate-600 text-white"
      >
        <Calendar className="mr-2 h-4 w-4" />
        {formatDate(newPackage.departure_date)}
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-auto p-0 bg-slate-800 border-slate-700">
      <Calendar
        mode="single"
        selected={new Date(newPackage.departure_date)}
        onSelect={(date) => {
          handleDateChange("departure_date", date);
          setPackageDepartureCalendarOpen(false);
        }}
        initialFocus
        className="bg-slate-800 text-white"
      />
    </PopoverContent>
  </Popover>
</div>
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Oda Tipi</label>
                            <Select
                              value={newPackage.room_type}
                              onValueChange={(value) => setNewPackage({ ...newPackage, room_type: value })}
                            >
                              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                                <SelectValue placeholder="Oda tipi seçin" />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-800 border-slate-700 text-white">
                                <SelectItem value="standard" className="text-white">Standard</SelectItem>
                                <SelectItem value="deluxe" className="text-white">Deluxe</SelectItem>
                                <SelectItem value="suite" className="text-white">Suite</SelectItem>
                                <SelectItem value="family" className="text-white">Family</SelectItem>
                                <SelectItem value="cave" className="text-white">Cave Room</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="services" className="space-y-4">
                          <div className="mb-4">
                            <label className="text-sm font-medium text-slate-300 mb-2 block">Servis Seçimi</label>
                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                              {services.map((service) => (
                                <div
                                  key={service.id}
                                  className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-all"
                                >
                                  <div className="flex items-center">
                                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-purple-600/20 mr-3">
                                      <Utensils className="h-5 w-5 text-purple-400" />
                                    </div>
                                    <div>
                                      <p className="text-white font-medium">{service.name}</p>
                                      <p className="text-sm text-slate-400">{formatCurrency(service.price)}</p>
                                    </div>
                                  </div>
                                  <Switch
                                    checked={newPackage.services.includes(service.id)}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        setNewPackage({
                                          ...newPackage,
                                          services: [...newPackage.services, service.id],
                                        });
                                      } else {
                                        setNewPackage({
                                          ...newPackage,
                                          services: newPackage.services.filter((id) => id !== service.id),
                                        });
                                      }
                                    }}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="p-4 bg-slate-700/30 rounded-lg">
                            <h3 className="text-white font-medium mb-2">Seçilen Servisler</h3>
                            {newPackage.services.length === 0 ? (
                              <p className="text-slate-400 text-sm">Henüz servis seçilmedi</p>
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                {newPackage.services.map((serviceId) => {
                                  const service = services.find((s) => s.id === serviceId);
                                  return (
                                    <Badge
                                      key={serviceId}
                                      className="bg-purple-600 flex items-center gap-1 px-3 py-1.5"
                                    >
                                      {service ? service.name : `Servis #${serviceId}`}
                                      <button
                                        className="ml-1 text-white/80 hover:text-white"
                                        onClick={() => {
                                          setNewPackage({
                                            ...newPackage,
                                            services: newPackage.services.filter((id) => id !== serviceId),
                                          });
                                        }}
                                      >
                                        &times;
                                      </button>
                                    </Badge>
                                  );
                                })}
                              </div>
                            )}
                            
                            <div className="mt-4 flex justify-between items-center">
                              <span className="text-slate-300">Toplam:</span>
                              <Badge className="bg-slate-600">
                                {newPackage.services.length} servis seçildi
                              </Badge>
                            </div>
                          </div>
                          
                          )}
                        </TabsContent>
                      </Tabs>
                    </div>
                    
                    <DialogFooter>
                      <Button variant="outline" className="bg-slate-700 border-slate-600 text-white" onClick={() => setPackageDialogOpen(false)}>
                        İptal
                      </Button>
                      <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleCreatePackage} disabled={loading}>
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            İşleniyor...
                          </>
                        ) : (
                          <>
                            <Plus className="mr-2 h-4 w-4" />
                            Paket Oluştur
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            
            <Card className="bg-slate-800 border-slate-700 shadow-md">
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-slate-700">
                    <TableRow className="hover:bg-slate-700/80">
                      <TableHead className="text-white">Müşteri</TableHead>
                      <TableHead className="text-white">Detaylar</TableHead>
                      <TableHead className="text-white">Tarihler</TableHead>
                      <TableHead className="text-white">Servisler</TableHead>
                      <TableHead className="text-white w-[100px]">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPackages.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center p-8">
                          <div className="flex flex-col items-center">
                            <Package className="h-10 w-10 text-slate-600 mb-2" />
                            <p className="text-slate-400 font-medium">Paket Bulunamadı</p>
                            <p className="text-slate-500 text-sm mt-1">Bu otel için henüz paket eklenmemiş veya arama kriterinize uygun paket yok.</p>
                            <Button className="mt-4 bg-blue-600 hover:bg-blue-700" onClick={() => setPackageDialogOpen(true)}>
                              <Plus className="mr-2 h-4 w-4" />
                              Yeni Paket Ekle
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPackages.map((pkg) => (
                        <TableRow key={pkg.id} className="hover:bg-slate-700/20">
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center">
                                <Users className="h-5 w-5 text-blue-400" />
                              </div>
                              <div>
                                <p className="font-medium text-white">{pkg.name} {pkg.surname}</p>
                                <p className="text-sm text-slate-400">{pkg.nationality}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <Badge className="bg-slate-700 text-slate-300 mb-1">{pkg.city}</Badge>
                              <p className="text-sm text-slate-400">
                                {pkg.age} yaş, {pkg.gender ? "Erkek" : "Kadın"}
                              </p>
                              <p className="text-xs text-slate-500 mt-1">
                                Grup: {formatGroupInfo(pkg.group)}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <Badge className="bg-green-600/20 text-green-400 mb-1">
                                {formatDate(pkg.arrival_date)}
                              </Badge>
                              <Badge className="bg-amber-600/20 text-amber-400 block">
                                {formatDate(pkg.departure_date)}
                              </Badge>
                              <p className="text-xs text-slate-500 mt-1">
                                Oda: {pkg.room_type || "Standart"}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <Badge className="bg-purple-600">{pkg.services.length} servis</Badge>
                              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                                {getPackageServiceNames(pkg.services)}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                                onClick={() => {
                                  setSelectedPackage(pkg);
                                }}
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                                onClick={() => {
                                  setItemToDelete(pkg);
                                  setDeleteType("package");
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Package Details Dialog */}
      {selectedPackage && (
        <Dialog open={!!selectedPackage} onOpenChange={() => setSelectedPackage(null)}>
          <DialogContent className="bg-slate-800 text-white border-slate-700 max-w-3xl">
            <DialogHeader>
              <DialogTitle>Paket Detayları</DialogTitle>
              <DialogDescription className="text-slate-400">
                {selectedPackage.name} {selectedPackage.surname} için paket bilgileri
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-blue-600/20 flex items-center justify-center mr-4">
                    <Users className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-white">{selectedPackage.name} {selectedPackage.surname}</h3>
                    <p className="text-slate-400">{selectedPackage.nationality}, {selectedPackage.city}</p>
                  </div>
                </div>
                <Badge className={`
                  ${new Date(selectedPackage.departure_date) > new Date() 
                    ? "bg-green-600"
                    : "bg-slate-600"
                  }
                `}>
                  {new Date(selectedPackage.departure_date) > new Date() ? "Aktif" : "Tamamlandı"}
                </Badge>
              </div>
              
              <Separator className="bg-slate-700" />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-md font-medium text-white mb-2">Müşteri Bilgileri</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-slate-700/30 rounded">
                      <span className="text-slate-300">Kimlik No</span>
                      <span className="text-white font-medium">{selectedPackage.serial_number}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-700/30 rounded">
                      <span className="text-slate-300">Yaş</span>
                      <span className="text-white font-medium">{selectedPackage.age}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-700/30 rounded">
                      <span className="text-slate-300">Cinsiyet</span>
                      <span className="text-white font-medium">{selectedPackage.gender ? "Erkek" : "Kadın"}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-700/30 rounded">
                      <span className="text-slate-300">Grup</span>
                      <span className="text-white font-medium">{formatGroupInfo(selectedPackage.group)}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-md font-medium text-white mb-2">Rezervasyon Detayları</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-slate-700/30 rounded">
                      <span className="text-slate-300">Giriş Tarihi</span>
                      <span className="text-white font-medium">{formatDate(selectedPackage.arrival_date)}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-700/30 rounded">
                      <span className="text-slate-300">Çıkış Tarihi</span>
                      <span className="text-white font-medium">{formatDate(selectedPackage.departure_date)}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-700/30 rounded">
                      <span className="text-slate-300">Konaklama Süresi</span>
                      <span className="text-white font-medium">
                        {Math.ceil(
                          (new Date(selectedPackage.departure_date).getTime() - 
                           new Date(selectedPackage.arrival_date).getTime()) / 
                          (1000 * 60 * 60 * 24)
                        )} gün
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-700/30 rounded">
                      <span className="text-slate-300">Oda Tipi</span>
                      <span className="text-white font-medium capitalize">{selectedPackage.room_type || "Standard"}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator className="bg-slate-700" />
              
              <div>
                <h4 className="text-md font-medium text-white mb-3">Servisler</h4>
                <div className="space-y-3">
                  {selectedPackage.services.length === 0 ? (
                    <p className="text-slate-400 text-sm">Bu paket için henüz servis eklenmemiş.</p>
                  ) : (
                    selectedPackage.services.map((serviceId) => {
                      const service = services.find((s) => s.id === serviceId);
                      return service ? (
                        <div key={serviceId} className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                          <div className="flex items-center">
                            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-purple-600/20 mr-3">
                              <Utensils className="h-5 w-5 text-purple-400" />
                            </div>
                            <div>
                              <p className="text-white font-medium">{service.name}</p>
                              <p className="text-sm text-slate-400">{formatCurrency(service.price)}</p>
                            </div>
                          </div>
                          <Badge className="bg-slate-600">
                            ID: {serviceId}
                          </Badge>
                        </div>
                      ) : (
                        <div key={serviceId} className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                          <div className="flex items-center">
                            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-600/20 mr-3">
                              <Utensils className="h-5 w-5 text-slate-400" />
                            </div>
                            <div>
                              <p className="text-white">Bilinmeyen Servis (ID: {serviceId})</p>
                              <p className="text-sm text-slate-400">Servis bulunamadı</p>
                            </div>
                          </div>
                          <Badge className="bg-red-600">
                            Eksik Servis
                          </Badge>
                        </div>
                      );
                    })
                  )}
                </div>
                
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg border border-blue-500/30">
                  <div className="flex justify-between items-center">
                    <h4 className="text-md font-medium text-white">Toplam</h4>
                    <div className="text-right">
                      <p className="text-lg font-bold text-white">
                        {formatCurrency(
                          selectedPackage.services.reduce((total, serviceId) => {
                            const service = services.find((s) => s.id === serviceId);
                            return total + (service ? service.price : 0);
                          }, 0)
                        )}
                      </p>
                      <p className="text-sm text-slate-400">{selectedPackage.services.length} servis</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" className="bg-slate-700 border-slate-600 text-white" onClick={() => setSelectedPackage(null)}>
                Kapat
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <FileText className="mr-2 h-4 w-4" />
                PDF Olarak İndir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      >
        <AlertDialogContent className="bg-slate-800 text-white border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle>Silmek istediğinize emin misiniz?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              {deleteType === "service" ? (
                <>
                  <strong className="text-white">{itemToDelete?.name}</strong> isimli servisi silmek üzeresiniz. 
                  Bu işlem geri alınamaz ve servis kalıcı olarak silinecektir.
                </>
              ) : (
                <>
                  <strong className="text-white">{itemToDelete?.name} {itemToDelete?.surname}</strong> isimli müşterinin 
                  paketini silmek üzeresiniz. Bu işlem geri alınamaz ve paket kalıcı olarak silinecektir.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600">
              İptal
            </AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDeleteItem}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  İşleniyor...
                </>
              ) : (
                "Evet, Sil"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
    </div>
  );
}