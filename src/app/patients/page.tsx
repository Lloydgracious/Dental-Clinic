"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { UserPlus, Search, Eye, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { db } from "@/lib/firebase";
import { collection, addDoc, onSnapshot, query, orderBy, Timestamp, deleteDoc, doc } from "firebase/firestore";

const STEPS = ["Personal Info", "Medical History", "Confirmation"];

export default function PatientsPage() {
  const [activeTab, setActiveTab] = useState<"list" | "register">("list");
  
  // Registration State
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  // Form Data
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", address: "", phone: "", allergies: "", medications: "", age: "", sex: "Other"
  });

  // Patient List & Details State
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);

  useEffect(() => {
    const q = query(collection(db, "patients"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const patientData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPatients(patientData);
    });

    return () => unsubscribe();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = async () => {
    if (step === 0) {
      const e: any = {};
      let hasError = false;
      if (!formData.firstName) { e.firstName = "First name is required"; hasError = true; }
      if (!formData.lastName) { e.lastName = "Last name is required"; hasError = true; }
      if (!formData.phone) { e.phone = "Phone number is tightly required"; hasError = true; }
      
      if (hasError) {
        setErrors(e);
        return;
      }
    }
    setErrors({});
    
    if (step === 1) {
      // Save patient to Cloud Firestore
      try {
        await addDoc(collection(db, "patients"), {
          ...formData,
          createdAt: Timestamp.now()
        });
      } catch (error) {
        console.error("Error adding patient:", error);
        return;
      }
    }

    if (step < STEPS.length - 1) {
      setDirection(1);
      setStep((s) => s + 1);
    }
  };
  
  const handleDeletePatient = async (id: string) => {
    if(!window.confirm("Are you sure you want to delete this patient?")) return;
    try {
      await deleteDoc(doc(db, "patients", id));
    } catch (error) {
      console.error("Error deleting patient:", error);
    }
  };

  const resetForm = () => {
    setStep(0);
    setFormData({ firstName: "", lastName: "", address: "", phone: "", allergies: "", medications: "", age: "", sex: "Other" });
    setActiveTab("list");
  };

  const slideVariants = {
    enter: (direction: number) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
    center: { zIndex: 1, x: 0, opacity: 1 },
    exit: (direction: number) => ({ zIndex: 0, x: direction < 0 ? 300 : -300, opacity: 0 })
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-accent-charcoal">Patients</h1>
          <p className="text-gray-500 mt-1">Manage your clinic's patient directory.</p>
        </div>
        
        <div className="flex bg-gray-100 p-1 rounded-2xl w-max">
          <button onClick={() => setActiveTab("list")} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === "list" ? "bg-white text-accent-charcoal shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            Directory
          </button>
          <button onClick={() => setActiveTab("register")} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === "register" ? "bg-white text-accent-charcoal shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            Register New
          </button>
        </div>
      </div>

      {activeTab === "list" && (
        <Card className="p-0 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/10">
            <div className="relative w-72">
               <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
               <input type="text" placeholder="Search patients..." className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 transition-all font-sans dark:text-white" />
            </div>
            <Button size="sm" onClick={() => setActiveTab("register")} className="gap-2">
              <UserPlus className="w-4 h-4" />
              Add Patient
            </Button>
          </div>
          <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="bg-white dark:bg-surface-dark/20 border-b border-gray-100 dark:border-gray-800 text-sm text-gray-500">
                     <th className="py-4 px-6 font-medium">Patient Name</th>
                     <th className="py-4 px-6 font-medium">Phone Number</th>
                     <th className="py-4 px-6 font-medium text-right">Actions</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50 dark:divide-gray-800 bg-white dark:bg-surface-dark/10 text-sm">
                  {patients.length === 0 ? (
                    <tr><td colSpan={3} className="py-8 text-center text-gray-500">No patients registered yet.</td></tr>
                  ) : patients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-gray-50/50 transition-colors group cursor-pointer" onClick={() => setSelectedPatient(patient)}>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-accent-primary/10 flex items-center justify-center text-accent-primary font-bold">
                             {patient.firstName[0]}{patient.lastName[0]}
                           </div>
                           <div>
                             <p className="font-semibold text-accent-charcoal dark:text-white">{patient.firstName} {patient.lastName}</p>
                             <p className="text-xs text-gray-400">ID: #{patient.id.slice(-4)}</p>
                           </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-gray-700 font-medium">{patient.phone}</p>
                      </td>
                      <td className="py-4 px-6 text-right">
                         <div className="flex justify-end gap-2 ml-auto">
                           <button onClick={(e) => { e.stopPropagation(); setSelectedPatient(patient); }} className="p-2 text-accent-primary bg-blue-50 hover:bg-accent-primary hover:text-white rounded-lg transition-colors flex items-center justify-center gap-2 text-xs font-bold">
                             <Eye className="w-4 h-4" /> View Details
                           </button>
                           <button onClick={(e) => { e.stopPropagation(); handleDeletePatient(patient.id); }} className="p-2 text-red-500 bg-red-50 hover:bg-red-500 hover:text-white rounded-lg transition-colors flex items-center justify-center gap-2 text-xs font-bold">
                             <Trash2 className="w-4 h-4" /> Delete
                           </button>
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
             </table>
          </div>
        </Card>
      )}

      {/* Patient Details Modal */}
      <Modal isOpen={!!selectedPatient} onClose={() => setSelectedPatient(null)} title="Patient Details">
         {selectedPatient && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
                 <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-accent-primary to-blue-300 flex items-center justify-center text-white text-2xl font-black shadow-md">
                    {selectedPatient.firstName[0]}{selectedPatient.lastName[0]}
                 </div>
                 <div>
                    <h2 className="text-2xl font-bold text-accent-charcoal dark:text-white">{selectedPatient.firstName} {selectedPatient.lastName}</h2>
                    <p className="text-sm text-gray-500">Patient ID: #{selectedPatient.id}</p>
                 </div>
              </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-transparent dark:border-gray-800">
                     <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Phone Number</p>
                     <p className="font-semibold text-accent-charcoal dark:text-white">{selectedPatient.phone}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-transparent dark:border-gray-800">
                     <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Address</p>
                     <p className="font-semibold text-accent-charcoal dark:text-white">{selectedPatient.address || "—"}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-transparent dark:border-gray-800">
                     <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Age</p>
                     <p className="font-semibold text-accent-charcoal dark:text-white">{selectedPatient.age || "—"}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-transparent dark:border-gray-800">
                     <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Sex</p>
                     <p className="font-semibold text-accent-charcoal dark:text-white">{selectedPatient.sex || "—"}</p>
                  </div>
                  <div className="bg-blue-50/50 dark:bg-blue-950/20 p-4 rounded-2xl col-span-2 border border-blue-100/50 dark:border-blue-500/20">
                     <p className="text-xs text-accent-primary font-bold uppercase tracking-wider mb-1">Known Allergies</p>
                     <p className="font-semibold text-accent-charcoal dark:text-white">{selectedPatient.allergies || "None declared"}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl col-span-2 border border-transparent dark:border-gray-800">
                     <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Current Medications</p>
                     <p className="font-semibold text-accent-charcoal dark:text-white">{selectedPatient.medications || "None declared"}</p>
                  </div>
               </div>

              <Button className="w-full bg-accent-charcoal text-white hover:bg-gray-800" onClick={() => setSelectedPatient(null)}>Close</Button>
            </div>
         )}
      </Modal>

      {activeTab === "register" && (
        <Card className="min-h-[500px] relative overflow-hidden bg-white dark:bg-surface-dark border-none shadow-2xl">
          <div className="absolute top-0 left-0 right-0 px-8 pt-8 pb-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-surface-dark z-20">
            <div className="flex items-center gap-4">
              {STEPS.map((s, idx) => (
                <div key={s} className="flex-1 flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= idx ? 'bg-accent-primary text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                      {idx + 1}
                    </span>
                    <span className={`text-sm font-medium hidden sm:block ${step >= idx ? 'text-accent-charcoal dark:text-white' : 'text-gray-400'}`}>
                      {s}
                    </span>
                  </div>
                  {idx !== STEPS.length - 1 && (
                     <div className={`h-[2px] flex-1 transition-colors ${step > idx ? 'bg-accent-primary/50' : 'bg-gray-100 dark:bg-gray-800'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-28 pb-24 px-8 relative h-full">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={step}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="w-full"
              >
                {step === 0 && (
                  <div className="space-y-6 max-w-2xl mx-auto">
                    <h2 className="text-2xl font-semibold mb-6 text-accent-charcoal dark:text-white">Personal Information</h2>
                       <Input name="firstName" value={formData.firstName} onChange={handleInputChange} label="First Name" placeholder="John" error={errors["firstName"]} className="dark:bg-gray-900 dark:border-gray-800" />
                       <Input name="lastName" value={formData.lastName} onChange={handleInputChange} label="Last Name" placeholder="Doe" error={errors["lastName"]} className="dark:bg-gray-900 dark:border-gray-800" />
                       <div className="grid grid-cols-2 gap-4">
                          <Input name="age" type="number" value={formData.age} onChange={handleInputChange} label="Age" placeholder="25" className="dark:bg-gray-900 dark:border-gray-800" />
                          <div className="flex flex-col gap-1.5 focus-within:z-10">
                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400 ml-1">Sex</label>
                            <select 
                              name="sex" 
                              value={formData.sex} 
                              onChange={(e) => setFormData({ ...formData, sex: e.target.value })} 
                              className="w-full bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 rounded-2xl px-4 py-3 text-base text-accent-charcoal dark:text-white outline-none focus:border-accent-primary transition-colors appearance-none"
                            >
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Other">Other / NA</option>
                            </select>
                          </div>
                       </div>
                       <Input name="phone" value={formData.phone} onChange={handleInputChange} label="Phone Number (Required)" placeholder="09 123 45678" error={errors["phone"]} className="dark:bg-gray-900 dark:border-gray-800" />
                       <Input name="address" value={formData.address} onChange={handleInputChange} label="Address" placeholder="City or Social ID" className="dark:bg-gray-900 dark:border-gray-800" />
                  </div>
                )}
                
                {step === 1 && (
                  <div className="space-y-6 max-w-2xl mx-auto">
                    <h2 className="text-2xl font-semibold mb-6 text-accent-charcoal dark:text-white">Medical History</h2>
                    <div className="grid grid-cols-1 gap-6">
                      <Input name="allergies" value={formData.allergies} onChange={handleInputChange} label="Known Allergies" placeholder="Penicillin, etc." className="dark:bg-gray-900 dark:border-gray-800" />
                      <Input name="medications" value={formData.medications} onChange={handleInputChange} label="Current Medications" placeholder="List any medications..." className="dark:bg-gray-900 dark:border-gray-800" />
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="flex flex-col items-center justify-center text-center space-y-4 pt-10">
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 20 }}
                      className="w-24 h-24 bg-green-100 dark:bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-4"
                    >
                      <UserPlus className="w-10 h-10" />
                    </motion.div>
                    <h2 className="text-3xl font-bold text-accent-charcoal dark:text-white">Patient Registered!</h2>
                    <p className="text-gray-500 dark:text-gray-400 max-w-md">
                      {formData.firstName} {formData.lastName} has been successfully saved.
                    </p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-between border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-surface-dark z-20">
            <Button variant="ghost" onClick={() => { setDirection(-1); setStep(s => s -1); }} disabled={step === 0 || step === STEPS.length - 1} className={step === 0 || step === STEPS.length - 1 ? "opacity-0 pointer-events-none" : ""}>
              Back
            </Button>
            <Button variant={step === STEPS.length - 1 ? "secondary" : "primary"} onClick={step === STEPS.length - 1 ? resetForm : handleNext}>
              {step === STEPS.length - 1 ? "Back to Directory" : "Continue"}
            </Button>
          </div>
        </Card>
      )}
    </motion.div>
  );
}
