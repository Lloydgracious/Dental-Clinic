"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { UserPlus, Search, Trash2, Stethoscope } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc, onSnapshot, query, orderBy, Timestamp, deleteDoc, doc } from "firebase/firestore";

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [newDoctor, setNewDoctor] = useState({ name: "", specialization: "" });
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "doctors"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const doctorData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDoctors(doctorData);
    });

    return () => unsubscribe();
  }, []);

  const handleAddDoctor = async () => {
    if (!newDoctor.name || !newDoctor.specialization) return;
    try {
      await addDoc(collection(db, "doctors"), {
        ...newDoctor,
        createdAt: Timestamp.now()
      });
      setNewDoctor({ name: "", specialization: "" });
      setIsAdding(false);
    } catch (error) {
      console.error("Error adding doctor:", error);
    }
  };

  const handleDeleteDoctor = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this doctor?")) return;
    try {
      await deleteDoc(doc(db, "doctors", id));
    } catch (error) {
      console.error("Error deleting doctor:", error);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-accent-charcoal">Doctors</h1>
          <p className="text-gray-500 mt-1">Manage your clinic's medical staff.</p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)} className="gap-2">
          <UserPlus className="w-4 h-4" />
          {isAdding ? "Cancel" : "Add New Doctor"}
        </Button>
      </div>

      {isAdding && (
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Doctor Name" 
              value={newDoctor.name} 
              onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })} 
              placeholder="e.g. Dr. Aung Kyaw"
            />
            <Input 
              label="Specialization" 
              value={newDoctor.specialization} 
              onChange={(e) => setNewDoctor({ ...newDoctor, specialization: e.target.value })} 
              placeholder="e.g. Orthodontist"
            />
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={handleAddDoctor} className="bg-accent-primary">Save Doctor</Button>
          </div>
        </Card>
      )}

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-900/10 border-b border-gray-100 dark:border-gray-800 text-sm text-gray-500">
                <th className="py-4 px-6 font-medium">Doctor Name</th>
                <th className="py-4 px-6 font-medium">Specialization</th>
                <th className="py-4 px-6 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800 bg-white dark:bg-surface-dark/10 text-sm">
              {doctors.length === 0 ? (
                <tr><td colSpan={3} className="py-8 text-center text-gray-500">No doctors registered yet.</td></tr>
              ) : doctors.map((doctor) => (
                <tr key={doctor.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-accent-primary/10 flex items-center justify-center text-accent-primary font-bold">
                        <Stethoscope className="w-5 h-5" />
                      </div>
                      <p className="font-semibold text-accent-charcoal dark:text-white">{doctor.name}</p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-gray-700 dark:text-gray-300 font-medium">{doctor.specialization}</p>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button onClick={() => handleDeleteDoctor(doctor.id)} className="p-2 text-red-500 bg-red-50 hover:bg-red-500 hover:text-white rounded-lg transition-colors ml-auto">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </motion.div>
  );
}
