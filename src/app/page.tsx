"use client";
import { cn } from "@/lib/utils";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { Activity, Wallet, Calendar as CalendarIcon, ArrowUpRight, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import React, { useState, useEffect } from 'react';

function Interactive3DAnalytics({ data }: { data: { day: string; patients: number }[] }) {
  const maxPatients = Math.max(...data.map(d => d.patients), 10);

  return (
    <Card className="lg:col-span-2 overflow-hidden relative group h-[350px] flex items-end justify-center gap-2 md:gap-6 pb-8 pt-20 bg-gradient-to-tr from-surface-light via-white to-blue-50/20 dark:from-surface-dark dark:via-surface-dark dark:to-blue-500/5" style={{ perspective: 1200 }}>
       <div className="absolute top-6 left-6">
         <h2 className="text-xl font-bold flex items-center gap-2 text-accent-charcoal dark:text-white">
            <TrendingUp className="w-5 h-5 text-accent-primary" />
            Weekly Performance Analytics
         </h2>
         <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Real-time data from the last 7 days</p>
       </div>
       
       <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-blue-50/30 to-transparent pointer-events-none" />

       {data.map((item, i) => {
         const heightPercent = (item.patients / maxPatients) * 100;
         return (
           <motion.div
             key={i}
             initial={{ height: 0, opacity: 0 }}
             animate={{ height: `${Math.max(heightPercent, 5)}%`, opacity: 1 }}
             transition={{ duration: 0.8, delay: i * 0.1, type: "spring", stiffness: 100 }}
             whileHover={{ 
               scale: 1.15, 
               y: -10, 
               rotateX: -15, 
               rotateY: 10,
               boxShadow: "-15px 20px 30px rgba(59, 130, 246, 0.2)"
             }}
             className="w-10 sm:w-14 bg-gradient-to-t from-blue-500 to-cyan-400 rounded-t-xl relative cursor-pointer flex flex-col items-center justify-end transform-style-3d border border-blue-300/50 shadow-layer"
           >
             {/* Data Pop-up label */}
             <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 font-bold text-accent-charcoal dark:text-white transition-opacity bg-white dark:bg-surface-dark px-3 py-1 rounded-lg shadow-sm text-sm border border-blue-100 dark:border-blue-900/30 pointer-events-none whitespace-nowrap z-10">
                {item.patients} Patients
             </div>
             {/* Base Day label */}
             <div className="absolute -bottom-7 font-semibold text-gray-400 text-xs tracking-wider">
                {item.day}
             </div>
           </motion.div>
         );
       })}
    </Card>
  )
}

import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";

export default function DashboardPage() {
  const [dailyRevenue, setDailyRevenue] = useState(0);
  const [activeTreatments, setActiveTreatments] = useState(0);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [weeklyAnalytics, setWeeklyAnalytics] = useState<{ day: string; patients: number }[]>([]);
  
  const [activeModal, setActiveModal] = useState<"revenue" | "treatments" | "appointments" | null>(null);

  useEffect(() => {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    
    // Fetch Invoices for today from Firestore
    const qInvoices = query(collection(db, "invoices"), where("date", "==", todayStr));
    const unsubscribeInvoices = onSnapshot(qInvoices, (snapshot) => {
      const todaysInvoices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInvoices(todaysInvoices);
      
      const revenue = todaysInvoices.reduce((sum: number, inv: any) => sum + (inv.total || 0), 0);
      setDailyRevenue(revenue);
      
      const treatmentsCount = todaysInvoices.reduce((sum: number, inv: any) => sum + (inv.items?.length || 0), 0);
      setActiveTreatments(treatmentsCount);
    });
    
    // Fetch Appointments for today from Firestore
    const qAppointments = query(collection(db, "appointments"), where("date", "==", todayStr));
    const unsubscribeAppointments = onSnapshot(qAppointments, (snapshot) => {
      const todaysAppointments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAppointments(todaysAppointments);
    });

    // Weekly Analytics: Fetch ALL appointments and group by day for the last 7 days
    const qAllAppts = query(collection(db, "appointments"), orderBy("date", "desc"));
    const unsubscribeAll = onSnapshot(qAllAppts, (snapshot) => {
      const allAppts = snapshot.docs.map(doc => doc.data());
      const last7Days = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(today.getDate() - (6 - i));
        const dateStr = d.toISOString().split("T")[0];
        const dayName = d.toLocaleString('en-US', { weekday: 'short' });
        const count = allAppts.filter((a: any) => a.date === dateStr).length;
        return { day: dayName, patients: count };
      });
      setWeeklyAnalytics(last7Days);
    });

    return () => {
      unsubscribeInvoices();
      unsubscribeAppointments();
      unsubscribeAll();
    };
  }, []);

  const formatMMK = (num: number) => num.toLocaleString('en-US') + " Ks";

  const STATS = [
    { id: "revenue", label: "Daily Revenue (MMK)", value: formatMMK(dailyRevenue), icon: Wallet, trend: "Auto-calculated" },
    { id: "treatments", label: "Active Treatments", value: activeTreatments.toString(), icon: Activity, trend: "Items today" },
    { id: "appointments", label: "Upcoming Appointments", value: appointments.length.toString(), icon: CalendarIcon, trend: "Scheduled" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 relative max-w-7xl mx-auto">
      
      <div className="flex items-center justify-between z-10 relative">
        <div>
          <h1 className="text-3xl font-bold text-accent-charcoal dark:text-white">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Real-time statistics loaded from your usage.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        {STATS.map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.id}
          >
            <Card hoverEffect className="group cursor-pointer select-none" onClick={() => setActiveModal(stat.id as any)}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">{stat.label}</p>
                  <h3 className="text-3xl font-bold text-accent-charcoal dark:text-white overflow-hidden text-ellipsis whitespace-nowrap max-w-[200px]" title={stat.value}>{stat.value}</h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-accent-primary group-hover:bg-accent-primary group-hover:text-white transition-colors duration-300 shadow-sm border border-blue-100/50 dark:border-blue-500/20">
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm">
                <span className="flex items-center gap-1 font-semibold text-gray-400">
                  <ArrowUpRight className="w-4 h-4" />
                  Tap to view details
                </span>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10 mt-8">
        <Interactive3DAnalytics data={weeklyAnalytics} />
        
        <Card hoverEffect className="bg-gradient-to-br from-accent-charcoal to-gray-800 text-white border-none relative overflow-hidden flex flex-col justify-center">
          <div className="absolute -right-10 -bottom-10 opacity-10">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-64 h-64">
              <path d="M12 2c-3.5 0-6 2.5-6 6v3c0 2.5 1.5 5 2.5 7.5.5 1 2 1.5 3.5 1.5s3-.5 3.5-1.5C16.5 16 18 13.5 18 11V8c0-3.5-2.5-6-6-6zm0 14c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2z"/>
            </svg>
          </div>
          <div className="relative z-10 p-2">
            <h2 className="text-2xl font-bold mb-2">Quick Actions</h2>
            <p className="text-gray-400 text-sm mb-8">Frequently used essential tools</p>
            
            <div className="space-y-4">
               <a href="/patients" className="w-full bg-white/10 hover:bg-white/20 transition-colors py-4 rounded-xl flex items-center justify-center gap-2 font-medium">
                 Register Patient
               </a>
               <a href="/calendar" className="w-full bg-accent-primary hover:bg-[#2B4CB3] transition-colors py-4 rounded-xl flex items-center justify-center gap-2 font-medium shadow-lg">
                 New Appointment
               </a>
            </div>
          </div>
        </Card>
      </div>

      {/* Modals for Details */}
      <Modal isOpen={activeModal === "revenue"} onClose={() => setActiveModal(null)} title="Daily Revenue Details">
         <div className="space-y-4">
            <p className="text-sm text-gray-500 border-b pb-2">Breakdown of today's generated invoices ({invoices.length} total).</p>
            {invoices.length === 0 ? (
              <p className="text-center text-gray-400 py-4">No revenue recorded today.</p>
            ) : invoices.map(inv => (
              <div key={inv.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                 <div>
                   <p className="font-bold text-sm">{inv.invoiceNumber}</p>
                   <p className="text-xs text-gray-500">{inv.patientName}</p>
                 </div>
                 <p className="font-bold text-green-600">{formatMMK(inv.total)}</p>
              </div>
            ))}
            <div className="flex justify-between font-black text-lg pt-4 border-t border-gray-100 mt-4">
               <span>Total:</span>
               <span>{formatMMK(dailyRevenue)}</span>
            </div>
         </div>
      </Modal>

      <Modal isOpen={activeModal === "treatments"} onClose={() => setActiveModal(null)} title="Treatments & Services Today">
         <div className="space-y-4">
            <p className="text-sm text-gray-500 border-b pb-2">All line-item services provided in today's invoices.</p>
            {invoices.length === 0 ? (
              <p className="text-center text-gray-400 py-4">No treatments processed today.</p>
            ) : 
              invoices.map(inv => inv.items.map((item: any, idx: number) => (
                <div key={inv.id+'-'+idx} className="flex justify-between items-center p-3 border border-gray-100 rounded-xl">
                   <div className="max-w-[70%]">
                     <p className="font-bold text-sm text-accent-charcoal truncate">{item.description}</p>
                     <p className="text-xs text-gray-500">From {inv.patientName}</p>
                   </div>
                   <div className="text-right">
                     <p className="font-medium">Qty: {item.qty}</p>
                     <p className="text-xs text-gray-400">{formatMMK(item.price)}</p>
                   </div>
                </div>
              )))
            }
         </div>
      </Modal>

      <Modal isOpen={activeModal === "appointments"} onClose={() => setActiveModal(null)} title="Today's Appointments List">
         <div className="space-y-4">
            <p className="text-sm text-gray-500 border-b pb-2">All patients scheduled for today ({appointments.length} total).</p>
            {appointments.length === 0 ? (
              <p className="text-center text-gray-400 py-4">No appointments for today.</p>
            ) : appointments.map(apt => (
              <div key={apt.id} className="flex justify-between items-center p-3 bg-white border border-gray-100 shadow-sm rounded-xl">
                 <div className="flex gap-4 items-center">
                    <span className="font-black text-accent-primary text-lg w-16 text-center shadow-sm border border-blue-100 rounded-lg py-1">{apt.time}</span>
                    <div>
                      <p className="font-bold text-sm text-accent-charcoal">{apt.name}</p>
                      <p className="text-xs text-gray-500">{apt.type}</p>
                    </div>
                 </div>
                 <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${apt.status==='Completed'?'bg-green-100 text-green-600':'bg-gray-100 text-gray-500'}`}>{apt.status}</span>
              </div>
            ))}
         </div>
      </Modal>

    </motion.div>
  );
}
