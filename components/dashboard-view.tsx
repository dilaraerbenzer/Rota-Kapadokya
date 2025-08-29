"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area
} from "recharts"
import { 
  ArrowUpRight, 
  Calendar, 
  CreditCard, 
  DollarSign, 
  Package, 
  Users,
  TrendingUp,
  Clock
} from "lucide-react"
import { motion, AnimatePresence } from './motion-client'
import Image from "next/image"

const reservationData = [
  { month: "Ocak", count: 65 },
  { month: "Şubat", count: 59 },
  { month: "Mart", count: 80 },
  { month: "Nisan", count: 81 },
  { month: "Mayıs", count: 90 },
  { month: "Haziran", count: 125 },
  { month: "Temmuz", count: 160 },
  { month: "Ağustos", count: 170 },
  { month: "Eylül", count: 110 },
  { month: "Ekim", count: 85 },
  { month: "Kasım", count: 70 },
  { month: "Aralık", count: 95 },
]

const packageTypeData = [
  { name: "Macera", value: 35, color: "#3b82f6" },
  { name: "Su Sporları", value: 25, color: "#06b6d4" },
  { name: "Kültür", value: 20, color: "#8b5cf6" },
  { name: "Doğa", value: 15, color: "#10b981" },
  { name: "Spa & Wellness", value: 10, color: "#f59e0b" },
  { name: "Gastronomi", value: 5, color: "#ef4444" },
]

// Daha canlı ve modern renkler
const COLORS = ["#3b82f6", "#06b6d4", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444"]

// Yaklaşan rezervasyonlar için sample veri
const upcomingReservations = [
  { 
    id: 1, 
    name: "Ahmet Yılmaz", 
    details: "2 Yetişkin, 1 Çocuk • Deluxe Oda",
    status: "Onaylandı",
    date: "15 Ağustos, 14:00",
    color: "#10b981"
  },
  { 
    id: 2, 
    name: "Ayşe Öztürk", 
    details: "2 Yetişkin • Standart Oda",
    status: "Onaylandı",
    date: "15 Ağustos, 15:30",
    color: "#10b981"
  },
  { 
    id: 3, 
    name: "Mehmet Kaya", 
    details: "1 Yetişkin • Suite",
    status: "Bekleniyor",
    date: "16 Ağustos, 10:00",
    color: "#f59e0b"
  },
  { 
    id: 4, 
    name: "Zeynep Çelik", 
    details: "4 Yetişkin, 2 Çocuk • Aile Odası",
    status: "Onaylandı",
    date: "16 Ağustos, 12:00",
    color: "#10b981"
  }
];

// Koyu arka plan için özelleştirilmiş tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip bg-gray-800 p-3 border border-gray-700 rounded-lg shadow-lg text-sm">
        <p className="font-medium text-gray-200">{label}</p>
        <p className="text-blue-400 font-medium">
          {payload[0].name ? payload[0].name : "Değer"}: {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

// Donut chart için özel render fonksiyonu
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      className="text-xs font-medium"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export function DashboardView() {
  return (
    <div className="w-full bg-black text-white">
      <div className="flex justify-between items-center mb-6 px-2">
        <div className="flex items-center space-x-4">
          <div className="relative h-12 w-12 rounded-full overflow-hidden border-2 border-cyan-500/50">
            <Image
              src="/images/kapadokya.png"
              alt="Kapadokya Hotel"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">
              Hoşgeldiniz, <span className="text-cyan-400">Kapadokya Hotel</span>
            </h1>
            <p className="text-sm text-gray-400">İstatistik Paneli</p>
          </div>
        </div>
        <a href="#" className="text-blue-400 hover:text-blue-300 text-sm flex items-center transition-all">
          <TrendingUp className="mr-2 h-4 w-4" />
          Detaylı Analiz
        </a>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            <Card className="bg-[#111] border-[#333] text-white overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Toplam Rezervasyon</CardTitle>
                <div className="rounded-full bg-blue-900/30 p-2 text-blue-400">
                  <Users className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">1,245</div>
                <div className="mt-1 flex items-center text-xs">
                  <span className="flex items-center gap-1 text-green-500 font-medium">
                    <ArrowUpRight className="h-3 w-3" />
                    +12.5%
                  </span>
                  <span className="text-gray-500 ml-2">geçen aya göre</span>
                </div>
                <div className="mt-3">
                  <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-1 bg-blue-500 rounded-full" style={{ width: '70%' }}></div>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">Hedefin %70'i tamamlandı</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <Card className="bg-[#111] border-[#333] text-white overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Toplam Paket Satışı</CardTitle>
                <div className="rounded-full bg-purple-900/30 p-2 text-purple-400">
                  <Package className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">845</div>
                <div className="mt-1 flex items-center text-xs">
                  <span className="flex items-center gap-1 text-green-500 font-medium">
                    <ArrowUpRight className="h-3 w-3" />
                    +18.2%
                  </span>
                  <span className="text-gray-500 ml-2">geçen aya göre</span>
                </div>
                <div className="mt-3">
                  <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-1 bg-purple-500 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">Hedefin %85'i tamamlandı</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            <Card className="bg-[#111] border-[#333] text-white overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Toplam Gelir</CardTitle>
                <div className="rounded-full bg-green-900/30 p-2 text-green-400">
                  <DollarSign className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">₺2.4M</div>
                <div className="mt-1 flex items-center text-xs">
                  <span className="flex items-center gap-1 text-green-500 font-medium">
                    <ArrowUpRight className="h-3 w-3" />
                    +8.1%
                  </span>
                  <span className="text-gray-500 ml-2">geçen aya göre</span>
                </div>
                <div className="mt-3">
                  <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-1 bg-green-500 rounded-full" style={{ width: '62%' }}></div>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">Hedefin %62'si tamamlandı</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.3 }}
          >
            <Card className="bg-[#111] border-[#333] text-white overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Ortalama Paket Değeri</CardTitle>
                <div className="rounded-full bg-amber-900/30 p-2 text-amber-400">
                  <CreditCard className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">₺2,850</div>
                <div className="mt-1 flex items-center text-xs">
                  <span className="flex items-center gap-1 text-green-500 font-medium">
                    <ArrowUpRight className="h-3 w-3" />
                    +5.4%
                  </span>
                  <span className="text-gray-500 ml-2">geçen aya göre</span>
                </div>
                <div className="mt-3">
                  <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-1 bg-amber-500 rounded-full" style={{ width: '90%' }}></div>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">Hedefin %90'ı tamamlandı</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="col-span-1 md:col-span-2"
          >
            <Card className="bg-[#111] border-[#333] text-white h-full">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-200">Aylık Rezervasyon Sayısı</CardTitle>
                    <CardDescription className="text-gray-400">Son 12 aydaki rezervasyon sayıları</CardDescription>
                  </div>
                  <Badge className="bg-blue-900/30 text-blue-400 border-0">
                    2025 Yılı
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={reservationData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <defs>
                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis 
                        dataKey="month" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#999', fontSize: 12 }}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#999', fontSize: 12 }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area 
                        type="monotone" 
                        dataKey="count" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        fill="url(#colorCount)" 
                        activeDot={{ r: 6, strokeWidth: 0, fill: '#2563eb' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="col-span-1"
          >
            <Card className="bg-[#111] border-[#333] text-white h-full">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-200">Paket Türleri</CardTitle>
                    <CardDescription className="text-gray-400">Satılan paketlerin türlerine göre dağılımı</CardDescription>
                  </div>
                  <Badge className="bg-gray-800 text-gray-400 border-0">
                    Güncel
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={packageTypeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        labelLine={false}
                        label={renderCustomizedLabel}
                      >
                        {packageTypeData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={COLORS[index % COLORS.length]}
                            stroke={COLORS[index % COLORS.length]}
                            strokeWidth={1}
                          />
                        ))}
                      </Pie>
                      <Tooltip wrapperStyle={{ backgroundColor: '#222', border: 'none' }} />
                      <Legend 
                        layout="vertical" 
                        verticalAlign="middle" 
                        align="right"
                        wrapperStyle={{ fontSize: '12px', paddingLeft: '10px' }}
                        formatter={(value) => <span style={{ color: '#ccc' }}>{value}</span>} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          <Card className="bg-[#111] border-[#333] text-white">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-200">Yaklaşan Rezervasyonlar</CardTitle>
                  <CardDescription className="text-gray-400">Bugün ve yarın için onaylanmış rezervasyonlar</CardDescription>
                </div>
                <Badge className="bg-blue-900/30 text-blue-400 border-0">
                  <Clock className="mr-1 h-3 w-3" /> 
                  Güncel
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingReservations.map((reservation) => (
                  <motion.div 
                    key={reservation.id} 
                    whileHover={{ x: 2 }}
                    className="flex items-center justify-between border-b border-gray-800 pb-4 last:border-0 last:pb-0 hover:bg-gray-900/50 p-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="rounded-full bg-gray-800 p-2 text-gray-400 relative">
                        <Calendar className="h-5 w-5" />
                        <span 
                          className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-[#111]"
                          style={{ backgroundColor: reservation.color }}
                        ></span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-200">{reservation.name}</p>
                        <p className="text-sm text-gray-400">{reservation.details}</p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <Badge 
                        variant="outline" 
                        className="border-0 font-normal" 
                        style={{ 
                          backgroundColor: `${reservation.color}20`, 
                          color: reservation.color 
                        }}
                      >
                        {reservation.status}
                      </Badge>
                      <div className="flex items-center text-sm text-gray-500 mt-1 gap-1">
                        <Clock className="h-3 w-3" />
                        <p>{reservation.date}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}