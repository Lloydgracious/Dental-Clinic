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
    <Card className="lg:col-span-2 overflow-hidden relative group h-[320px] flex items-end justify-center gap-2 md:gap-5 pb-7 pt-16 bg-surface-light" style={{ perspective: 1200 }}>
       <div className="absolute top-6 left-6">
         <h2 className="text-lg font-bold flex items-center gap-2 text-foreground uppercase tracking-[0.08em]">
            <TrendingUp className="w-5 h-5 text-accent-primary" />
            Weekly Performance Analytics
         </h2>
         <p className="text-sm text-muted mt-1">Real-time data from the last 7 days</p>
       </div>
       
       <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-surface-muted to-transparent pointer-events-none" />

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
             className="w-9 sm:w-12 bg-gradient-to-t from-accent-strong to-accent-primary rounded-t-sm relative cursor-pointer flex flex-col items-center justify-end transform-style-3d border border-accent-primary/40 shadow-layer"
           >
             {/* Data Pop-up label */}
             <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 font-bold text-foreground transition-opacity bg-surface-light px-3 py-1 rounded-md shadow-sm text-sm border border-border pointer-events-none whitespace-nowrap z-10">
                {item.patients} Patients
             </div>
             {/* Base Day label */}
             <div className="absolute -bottom-7 font-semibold text-muted text-xs tracking-wider">
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
      
      <div className="flex items-center justify-between z-10 relative border-b border-border pb-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground uppercase tracking-[0.04em]">Dashboard</h1>
          <p className="text-muted mt-1">Real-time statistics loaded from your usage.</p>
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
                  <p className="text-muted text-xs uppercase tracking-[0.12em] font-semibold mb-2">{stat.label}</p>
                  <h3 className="text-3xl font-bold text-foreground overflow-hidden text-ellipsis whitespace-nowrap max-w-[200px]" title={stat.value}>{stat.value}</h3>
                </div>
                <div className="w-12 h-12 rounded-md bg-surface-muted flex items-center justify-center text-accent-primary group-hover:bg-accent-primary group-hover:text-white transition-colors duration-300 shadow-sm border border-border">
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm">
                <span className="flex items-center gap-1 font-semibold text-muted">
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
        
        <Card hoverEffect className="bg-gradient-to-br from-slate-900 to-slate-700 text-white border-none relative overflow-hidden flex flex-col justify-center">
          <div className="absolute -right-10 -bottom-10 opacity-10">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-64 h-64">
              <path d="M12 2c-3.5 0-6 2.5-6 6v3c0 2.5 1.5 5 2.5 7.5.5 1 2 1.5 3.5 1.5s3-.5 3.5-1.5C16.5 16 18 13.5 18 11V8c0-3.5-2.5-6-6-6zm0 14c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2z"/>
            </svg>
          </div>
          <div className="relative z-10 p-2">
            <h2 className="text-2xl font-bold mb-2 uppercase tracking-[0.06em]">Quick Actions</h2>
            <p className="text-slate-300 text-sm mb-8">Frequently used essential tools</p>
            
            <div className="space-y-4">
               <a href="/patients" className="w-full bg-slate-100 text-slate-900 hover:bg-white transition-colors py-3 rounded-md flex items-center justify-center gap-2 font-medium border border-white/20">
                 Register Patient
               </a>
               <a href="/calendar" className="w-full bg-accent-primary hover:bg-accent-strong transition-colors py-3 rounded-md flex items-center justify-center gap-2 font-medium shadow-lg">
                 New Appointment
               </a>
            </div>
          </div>
        </Card>
      </div>

      {/* Modals for Details */}
      <Modal isOpen={activeModal === "revenue"} onClose={() => setActiveModal(null)} title="Daily Revenue Details">
         <div className="space-y-4">
            <p className="text-sm text-muted border-b border-border pb-2">Breakdown of today's generated invoices ({invoices.length} total).</p>
            {invoices.length === 0 ? (
              <p className="text-center text-muted py-4">No revenue recorded today.</p>
            ) : invoices.map(inv => (
              <div key={inv.id} className="flex justify-between items-center p-3 bg-surface-muted rounded-xl border border-border">
                 <div>
                   <p className="font-bold text-sm">{inv.invoiceNumber}</p>
                   <p className="text-xs text-muted">{inv.patientName}</p>
                 </div>
                 <p className="font-bold text-green-600">{formatMMK(inv.total)}</p>
              </div>
            ))}
            <div className="flex justify-between font-black text-lg pt-4 border-t border-border mt-4">
               <span>Total:</span>
               <span>{formatMMK(dailyRevenue)}</span>
            </div>
         </div>
      </Modal>

      <Modal isOpen={activeModal === "treatments"} onClose={() => setActiveModal(null)} title="Treatments & Services Today">
         <div className="space-y-4">
            <p className="text-sm text-muted border-b border-border pb-2">All line-item services provided in today's invoices.</p>
            {invoices.length === 0 ? (
              <p className="text-center text-muted py-4">No treatments processed today.</p>
            ) : 
              invoices.map(inv => inv.items.map((item: any, idx: number) => (
                <div key={inv.id+'-'+idx} className="flex justify-between items-center p-3 border border-border rounded-xl bg-surface-light">
                   <div className="max-w-[70%]">
                     <p className="font-bold text-sm text-foreground truncate">{item.description}</p>
                     <p className="text-xs text-muted">From {inv.patientName}</p>
                   </div>
                   <div className="text-right">
                     <p className="font-medium">Qty: {item.qty}</p>
                     <p className="text-xs text-muted">{formatMMK(item.price)}</p>
                   </div>
                </div>
              )))
            }
         </div>
      </Modal>

      <Modal isOpen={activeModal === "appointments"} onClose={() => setActiveModal(null)} title="Today's Appointments List">
         <div className="space-y-4">
            <p className="text-sm text-muted border-b border-border pb-2">All patients scheduled for today ({appointments.length} total).</p>
            {appointments.length === 0 ? (
              <p className="text-center text-muted py-4">No appointments for today.</p>
            ) : appointments.map(apt => (
              <div key={apt.id} className="flex justify-between items-center p-3 bg-surface-light border border-border shadow-sm rounded-xl">
                 <div className="flex gap-4 items-center">
                    <span className="font-black text-accent-primary text-lg w-16 text-center shadow-sm border border-border rounded-lg py-1 bg-surface-muted">{apt.time}</span>
                    <div>
                      <p className="font-bold text-sm text-foreground">{apt.name}</p>
                      <p className="text-xs text-muted">{apt.type}</p>
                    </div>
                 </div>
                 <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${apt.status==='Completed'?'bg-green-100 text-green-700':'bg-surface-muted text-muted'}`}>{apt.status}</span>
              </div>
            ))}
         </div>
      </Modal>

    </motion.div>
  );
}
