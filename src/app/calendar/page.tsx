"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Plus, Trash2, Clock, AlertCircle, CalendarDays, Calendar as CalendarIcon } from "lucide-react";
import { Modal } from "@/components/ui/Modal";

import { db } from "@/lib/firebase";
import { collection, addDoc, onSnapshot, query, orderBy, Timestamp, deleteDoc, doc, updateDoc } from "firebase/firestore";

interface Appointment {
  id: string;
  name: string;
  time: string;
  date: string;
  type: string;
  status: "Pending" | "Completed";
  isEmergency?: boolean;
  doctorName?: string;
  dentalDiagnosis?: string;
}

export default function CalendarPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
  // New Appointment Form
  const [formData, setFormData] = useState({
    name: "",
    time: "10:00",
    date: new Date().toISOString().split("T")[0],
    type: "", 
    isEmergency: false,
    doctorName: "",
    dentalDiagnosis: "",
  });

  const [doctors, setDoctors] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, "appointments"), orderBy("time", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const aptData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Appointment[];
      setAppointments(aptData);
    });

    const doctorsQuery = query(collection(db, "doctors"), orderBy("name", "asc"));
    const unsubscribeDoctors = onSnapshot(doctorsQuery, (snapshot) => {
      const docData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDoctors(docData);
    });

    return () => {
      unsubscribe();
      unsubscribeDoctors();
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleCreate = async () => {
    if(!formData.name || !formData.type) return;
    try {
      await addDoc(collection(db, "appointments"), {
        name: formData.name,
        time: formData.time,
        date: formData.date,
        type: formData.type,
        status: "Pending",
        isEmergency: formData.isEmergency,
        doctorName: formData.doctorName,
        dentalDiagnosis: formData.dentalDiagnosis,
        createdAt: Timestamp.now()
      });
      setIsModalOpen(false);
      setFormData({ name: "", time: "10:00", date: formData.date, type: "", isEmergency: false, doctorName: "", dentalDiagnosis: "" });
    } catch (error) {
      console.error("Error creating appointment:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "appointments", id));
    } catch (error) {
      console.error("Error deleting appointment:", error);
    }
  };

  const markComplete = async (id: string) => {
    try {
      await updateDoc(doc(db, "appointments", id), {
        status: "Completed"
      });
    } catch (error) {
      console.error("Error updating appointment:", error);
    }
  };

  // Date Math
  const todayDate = new Date();
  const todayStr = todayDate.toISOString().split("T")[0];

  // Lists
  const todaysAppointments = appointments.filter((a: Appointment) => a.date === todayStr);

  // Show EVERYTHING in the future, smoothly animated
  const allFutureAppointments = appointments
    .filter((a: Appointment) => a.date > todayStr)
    .sort((a: Appointment, b: Appointment) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Prepare 3D Mini Calendar (Next 30 days scrolling timeline)
  const timelineDays = Array.from({ length: 30 }).map((_, i) => {
    const d = new Date(todayDate);
    d.setDate(todayDate.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    const dayName = d.toLocaleString('en-US', { weekday: 'short' });
    const monthName = d.toLocaleString('en-US', { month: 'short' });
    
    const dayAppointments = appointments.filter((a: Appointment) => a.date === dateStr);
    const count = dayAppointments.length;
    const hasEmergency = dayAppointments.some((a: Appointment) => a.isEmergency && a.status === "Pending");
    
    return { dateStr, dayName, monthName, dayNum: d.getDate(), count, hasEmergency };
  });

  const selectedDateAppointments = selectedDate ? appointments.filter((a: Appointment) => a.date === selectedDate) : [];

  return (
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="h-full flex flex-col space-y-8 max-w-7xl mx-auto pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between shrink-0 gap-6">
        <div>
          <h1 className="text-4xl font-black text-accent-charcoal dark:text-white tracking-tight flex items-center gap-3">
             <CalendarIcon className="w-8 h-8 text-accent-primary" /> Appointments
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">Your 3D interactive timeline and complete schedule.</p>
        </div>
        <Button 
          className="gap-2 shadow-lg bg-gradient-to-r from-accent-primary to-blue-500 hover:scale-105 transition-transform px-6 h-12 rounded-2xl" 
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="w-5 h-5 text-white" />
          <span className="font-bold text-white tracking-wide text-lg">New Appointment</span>
        </Button>
      </div>

      {/* 3D Mini Calendar Timeline */}
      <div className="relative">
         <div className="flex items-center gap-3 mb-4">
            <h2 className="text-xl font-black text-accent-charcoal dark:text-white">3D Mini Calendar Timeline</h2>
            <span className="bg-blue-100 dark:bg-blue-950/30 text-accent-primary text-xs font-bold px-3 py-1 rounded-full">Next 30 Days</span>
         </div>
         
         {/* Gradient Fades for scrolling */}
         <div className="absolute left-0 top-10 bottom-0 w-8 bg-gradient-to-r from-surface-light dark:from-background to-transparent z-10 pointer-events-none"></div>
         <div className="absolute right-0 top-10 bottom-0 w-12 bg-gradient-to-l from-surface-light dark:from-background to-transparent z-10 pointer-events-none"></div>

         <div className="flex gap-4 perspective-1000 overflow-x-auto pt-6 pb-10 px-4 no-scrollbar items-end" style={{ perspective: 1500 }}>
            {timelineDays.map((day, i) => {
               const isToday = i === 0;
               return (
                 <motion.div
                   key={day.dateStr}
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: i * 0.05, type: "spring", stiffness: 200 }}
                   whileHover={{ 
                     scale: 1.15, 
                     y: -15,
                     rotateX: 10,
                     rotateY: -10,
                     z: 50,
                     boxShadow: day.hasEmergency 
                       ? "0 25px 35px -10px rgba(239, 68, 68, 0.4), inset 0 2px 0 rgba(255,255,255,0.4)" 
                       : "0 25px 35px -10px rgba(65, 105, 225, 0.3), inset 0 2px 0 rgba(255,255,255,0.4)"
                   }}
                   onClick={() => setSelectedDate(day.dateStr)}
                   className={`
                      min-w-[110px] sm:min-w-[130px] flex flex-col items-center p-5 rounded-3xl shrink-0 cursor-pointer transform-style-3d relative 
                      transition-colors duration-200 border border-white/40 dark:border-gray-800
                      ${isToday 
                         ? "bg-gradient-to-br from-accent-charcoal to-gray-800 text-white shadow-[0_10px_20px_rgba(0,0,0,0.15)]" 
                         : day.count > 0 
                            ? "bg-white dark:bg-surface-dark text-accent-charcoal dark:text-white shadow-sm hover:border-blue-200 dark:hover:border-blue-800" 
                            : "bg-white/50 dark:bg-surface-dark/30 text-gray-400 opacity-80 hover:opacity-100 hover:bg-white dark:hover:bg-surface-dark border hover:border-gray-200 dark:hover:border-gray-700"
                      }
                   `}
                 >
                   <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${isToday ? "text-gray-400" : (day.dayName === 'Sun' || day.dayName === 'Sat') ? "text-accent-primary/70" : "text-gray-400"}`}>
                      {day.monthName} {day.dayName}
                   </p>
                   <p className="text-4xl font-black mb-4 tracking-tighter">{day.dayNum}</p>
                   
                   <div className="w-full h-px bg-current opacity-10 mb-3"></div>
                   
                   <div className="w-full flex justify-between items-center">
                      <span className={`text-[10px] font-black px-2 mt-1 py-1 rounded-lg ${isToday ? "bg-white/20 text-white" : day.count > 0 ? "bg-blue-50 dark:bg-blue-950/40 text-accent-primary" : "bg-gray-100 dark:bg-gray-800 text-gray-400"}`}>
                        {day.count} Appts
                      </span>
                      {day.hasEmergency && (
                        <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.8)] mt-1 ml-1" title="Emergency Appointment"></span>
                      )}
                   </div>
                 </motion.div>
               );
            })}
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-6 pt-4">
         {/* Today Column */}
         <div className="flex flex-col h-[600px] bg-white dark:bg-surface-dark/40 dark:backdrop-blur-md rounded-3xl p-6 border border-white dark:border-gray-800 shadow-xl relative overflow-hidden">
            {/* Soft decorative background */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-100/50 dark:bg-blue-500/5 rounded-full blur-[60px] pointer-events-none"></div>
            
            <h2 className="text-2xl font-black text-accent-charcoal dark:text-white mb-6 flex items-center gap-3 relative z-10">
              <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-accent-primary to-blue-300 text-white flex items-center justify-center shadow-lg transform -rotate-6">
                <Clock className="w-5 h-5" />
              </span>
              Today's Schedule
            </h2>
            <div className="space-y-4 flex-1 overflow-y-auto pr-2 no-scrollbar relative z-10">
               {todaysAppointments.length === 0 ? (
                 <div className="p-10 text-center rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20">
                    <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">🌿</div>
                    <p className="font-black text-xl text-gray-400 mb-1">Free day!</p>
                    <p className="text-gray-400 text-sm">No appointments left for today.</p>
                 </div>
               ) : todaysAppointments.map(apt => (
                 <motion.div initial={{opacity:0, x:-20}} animate={{opacity:1, x:0}} key={apt.id} className={`p-5 rounded-2xl flex items-center justify-between group transition-all relative overflow-hidden shadow-sm ${apt.isEmergency && apt.status === 'Pending' ? "bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-100 dark:border-red-900/50" : "bg-white dark:bg-surface-dark border border-gray-100/50 dark:border-gray-800 hover:border-blue-100 dark:hover:border-blue-900 hover:shadow-[0_8px_20px_rgba(65,105,225,0.05)]"}`}>
                    <div className="flex gap-4 items-center">
                       <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 shadow-sm ${apt.isEmergency && apt.status==='Pending' ? "bg-red-500 text-white" : "bg-gray-50 dark:bg-gray-900 text-accent-charcoal dark:text-white border border-gray-200 dark:border-gray-800"}`}>
                         {apt.time}
                       </div>
                       <div>
                         <div className="flex items-center gap-2">
                           <p className="font-bold text-accent-charcoal dark:text-white text-lg leading-none">{apt.name}</p>
                           {apt.isEmergency && apt.status === 'Pending' && (
                             <span className="text-[9px] bg-red-500 text-white uppercase tracking-wider font-bold px-1.5 py-0.5 rounded shadow-sm flex items-center gap-1"><AlertCircle className="w-3 h-3"/> Emergency</span>
                           )}
                         </div>
                         <p className="text-[13px] font-medium text-gray-500 mt-1">{apt.type}</p>
                         {(apt.doctorName || apt.dentalDiagnosis) && (
                            <div className="mt-2 flex flex-wrap gap-2">
                               {apt.doctorName && <span className="text-[10px] bg-blue-50 dark:bg-blue-900/30 text-accent-primary px-2 py-0.5 rounded-full font-bold">Dr. {apt.doctorName}</span>}
                               {apt.dentalDiagnosis && <span className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-500 px-2 py-0.5 rounded-full font-bold">{apt.dentalDiagnosis}</span>}
                            </div>
                          )}
                       </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                       <span className={`text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-lg shadow-sm ${apt.status === "Completed" ? "bg-emerald-400 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-500"}`}>
                         {apt.status}
                       </span>
                    </div>
                    <div className="absolute right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-2 py-1.5 rounded-xl shadow-lg flex items-center gap-2 border border-gray-100 dark:border-gray-700">
                      {apt.status === "Pending" && (
                        <button onClick={() => markComplete(apt.id)} className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-colors" title="Mark Completed">
                          ✓
                        </button>
                      )}
                      <button onClick={() => handleDelete(apt.id)} className="w-9 h-9 bg-red-50 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                 </motion.div>
               ))}
            </div>
         </div>

         {/* All Future Appointments */}
         <div className="flex flex-col h-[600px] bg-white dark:bg-surface-dark/40 dark:backdrop-blur-md rounded-3xl p-6 border border-white dark:border-gray-800 shadow-xl relative overflow-hidden">
            <h2 className="text-2xl font-black text-accent-charcoal dark:text-white mb-6 flex items-center gap-3 relative z-10">
              <span className="w-10 h-10 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 flex items-center justify-center transform rotate-6">
                <CalendarDays className="w-5 h-5" />
              </span>
              All Future Appointments
            </h2>
            <div className="space-y-4 flex-1 overflow-y-auto pr-2 no-scrollbar relative z-10">
               {allFutureAppointments.length === 0 ? (
                 <div className="p-10 text-center rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20">
                    <p className="font-black text-xl text-gray-400 mb-1">All clear!</p>
                    <p className="text-gray-400 text-sm">No future appointments scheduled.</p>
                 </div>
               ) : allFutureAppointments.map(apt => (
                 <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} key={apt.id} className={`p-4 rounded-2xl flex items-center justify-between group transition-all relative overflow-hidden border border-gray-100/40 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-md ${apt.isEmergency && apt.status === 'Pending' ? "bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/50" : "bg-gray-50/50 dark:bg-surface-dark/10"}`}>
                    <div className="flex gap-4 items-center">
                       <div className="flex flex-col items-center justify-center shrink-0 w-16 bg-white dark:bg-gray-800 rounded-xl py-2 shadow-sm border border-gray-100 dark:border-gray-700">
                         <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{new Date(apt.date).toLocaleString('en-US', { weekday: 'short' })}</span>
                         <span className="text-xl font-black text-accent-charcoal dark:text-white leading-none">{apt.date.split("-")[2]}</span>
                         <span className="text-[9px] font-bold text-gray-400 mt-1 uppercase">{new Date(apt.date).toLocaleString('en-US', { month: 'short' })}</span>
                       </div>
                       <div>
                         <div className="flex items-center gap-2">
                           <p className="font-bold text-accent-charcoal dark:text-white text-lg leading-none">{apt.name}</p>
                           {apt.isEmergency && apt.status === 'Pending' && (
                             <span className="text-[9px] bg-red-500 text-white uppercase tracking-wider font-bold px-1.5 py-0.5 rounded shadow-sm">Urgent</span>
                           )}
                         </div>
                         <div className="flex items-center gap-2 text-[11px] text-accent-primary font-black mt-2 bg-blue-50 dark:bg-blue-950/30 w-max px-2 py-1 rounded-md">
                           <Clock className="w-3 h-3" /> {apt.time}
                         </div>
                       </div>
                    </div>
                    <div className="absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-md p-1 rounded-xl shadow-lg border border-gray-100">
                      <button onClick={() => handleDelete(apt.id)} className="w-10 h-10 bg-red-50 text-red-500 rounded-lg flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors" title="Delete Appointment">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                 </motion.div>
               ))}
            </div>
         </div>
      </div>

      {/* Date Details Modal from 3D Mini Calendar */}
      <Modal isOpen={!!selectedDate} onClose={() => setSelectedDate(null)} title={`Schedule for ${selectedDate}`}>
        <div className="space-y-4 pt-2">
          {selectedDateAppointments.length === 0 ? (
            <div className="py-12 bg-gray-50 rounded-3xl text-center text-gray-400 flex flex-col items-center">
              <CalendarDays className="w-16 h-16 mb-4 opacity-10 text-accent-charcoal" />
              <p className="font-black text-2xl text-accent-charcoal">It's a free day.</p>
              <p className="font-medium mt-1">Your schedule is entirely clear here.</p>
            </div>
          ) : selectedDateAppointments.sort((a,b)=>a.time.localeCompare(b.time)).map(apt => (
             <div key={apt.id} className={`flex items-center justify-between p-4 rounded-2xl shadow-sm border ${apt.isEmergency ? 'border-red-200 bg-red-50/50' : 'border-gray-100 bg-white'}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm shadow-sm ${apt.isEmergency ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                    {apt.time}
                  </div>
                  <div>
                     <p className="font-bold text-accent-charcoal text-lg flex items-center gap-2 leading-none">
                       {apt.name}
                       {apt.isEmergency && <span className="text-[9px] bg-red-500 text-white px-1.5 py-0.5 rounded shadow-sm">Urgent</span>}
                     </p>
                     <p className="text-sm font-medium text-gray-500 mt-1">{apt.type}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase shadow-sm ${apt.status==='Completed'?'bg-emerald-400 text-white':'bg-gray-100 text-gray-500'}`}>{apt.status}</span>
             </div>
          ))}
          <Button 
            className="w-full mt-6 bg-accent-charcoal hover:bg-gray-900 text-white font-bold h-14 text-lg rounded-2xl shadow-lg" 
            onClick={() => { setIsModalOpen(true); setFormData({...formData, date: selectedDate as string}); setSelectedDate(null); }}
          >
             <Plus className="w-5 h-5 mr-2" /> Book for this Date
          </Button>
        </div>
      </Modal>

      {/* New Appointment Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Appointment">
        <div className="space-y-4">
          <Input label="Patient Name (လူနာအမည်)" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Aung Aung" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Date" name="date" type="date" value={formData.date} onChange={handleChange} />
            <Input label="Time" name="time" type="time" value={formData.time} onChange={handleChange} />
          </div>

          <div className="flex flex-col gap-1.5 focus-within:z-10">
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400 ml-1">Select Doctor (ဆရာဝန်ရွေးချယ်ပါ)</label>
            <select 
               name="doctorName" 
               value={formData.doctorName} 
               onChange={handleChange} 
               className="w-full bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 rounded-2xl px-4 py-3 text-base font-bold text-accent-charcoal dark:text-white outline-none focus:border-accent-primary transition-colors appearance-none"
            >
              <option value="">Choose a doctor...</option>
              {doctors.map(doc => (
                <option key={doc.id} value={doc.name}>{doc.name} - {doc.specialization}</option>
              ))}
            </select>
          </div>

          <Input label="Dental Diagnosis (ရောဂါရာဇဝင်)" name="dentalDiagnosis" value={formData.dentalDiagnosis} onChange={handleChange} placeholder="e.g. Broken tooth, Periodontitis" />
          <div className="flex flex-col gap-1.5 focus-within:z-10">
            <label className="text-sm font-medium text-gray-600 ml-1">Treatment Type</label>
            <input 
               list="treatment-options" 
               name="type" 
               value={formData.type} 
               onChange={handleChange} 
               placeholder="Select or type your own..."
               className="w-full bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 rounded-2xl px-4 py-3 text-base font-bold text-accent-charcoal dark:text-white outline-none focus:border-accent-primary transition-colors"
            />
            <datalist id="treatment-options">
              <option value="Checkup (စစ်ဆေးခြင်း)" />
              <option value="Tooth Extraction (သွားနှုတ်ခြင်း)" />
              <option value="Whitening (သွားဖြူခြင်း)" />
              <option value="Root Canal (အကြောထုတ်ခြင်း)" />
              <option value="Braces (သွားတု/ကြိုးတပ်ခြင်း)" />
            </datalist>
          </div>
          
          <label className="flex items-center gap-4 p-5 border-2 border-red-50 bg-red-50/20 rounded-2xl cursor-pointer hover:bg-red-50/50 hover:border-red-100 transition-colors mt-2">
             <input type="checkbox" name="isEmergency" checked={formData.isEmergency} onChange={handleChange} className="w-6 h-6 rounded focus:ring-red-500 accent-red-500" />
             <div className="flex flex-col">
               <span className="font-bold text-red-600 text-lg leading-none">Emergency / Urgent Target</span>
               <span className="text-sm text-red-400 font-semibold mt-1">(အရေးပေါ် လူနာ)</span>
             </div>
          </label>

          <Button className="w-full mt-6 h-14 bg-gradient-to-r from-accent-primary to-blue-500 hover:scale-[1.02] text-white shadow-lg border-none font-bold text-lg rounded-xl transition-transform" onClick={handleCreate}>
            Confirm Appointment
          </Button>
        </div>
      </Modal>
    </motion.div>
  );
}
