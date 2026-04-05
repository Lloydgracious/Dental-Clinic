"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Printer, Plus, Trash2, Download, CheckCircle, FileText } from "lucide-react";

import { db } from "@/lib/firebase";
import { collection, addDoc, onSnapshot, query, orderBy, Timestamp } from "firebase/firestore";

export default function InvoicesPage() {
  const [activeTab, setActiveTab] = useState<"create" | "history">("create");

  // Create Invoice State
  const [invoice, setInvoice] = useState({
    invoiceNumber: "INV-" + Math.floor(1000 + Math.random() * 9000),
    date: new Date().toISOString().split("T")[0],
    patientName: "မောင်မောင် (Maung Maung)",
    address: "Yangon, Myanmar",
    note: "Thank you for trusting Lumiere with your smile.",
  });

  const [items, setItems] = useState([
    { id: 1, description: "သွားနှုတ်ခြင်း (Tooth Extraction)", qty: 1, price: 50000, notes: "Deep root extraction" },
    { id: 2, description: "သွားဖြူစေခြင်း (Teeth Whitening)", qty: 1, price: 150000, notes: "Complete session" },
  ]);

  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, "invoices"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const invData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setHistory(invData);
    });

    return () => unsubscribe();
  }, []);

  const totalAmount = items.reduce((sum, item) => sum + (Number(item.qty) * Number(item.price)), 0);

  const handleInvoiceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInvoice({ ...invoice, [e.target.name]: e.target.value });
  };

  const handleItemChange = (id: number, field: string, value: string | number) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const addItem = () => setItems([...items, { id: Date.now(), description: "", qty: 1, price: 0, notes: "" }]);
  const removeItem = (id: number) => setItems(items.filter(item => item.id !== id));

  const saveInvoice = async () => {
    if (!invoice.patientName || items.length === 0) return;
    try {
      await addDoc(collection(db, "invoices"), {
        ...invoice,
        items,
        total: totalAmount,
        createdAt: Timestamp.now()
      });
      
      alert("Invoice saved to cloud!");
      
      // Reset form for next invoice
      setInvoice({
        invoiceNumber: "INV-" + Math.floor(1000 + Math.random() * 9000),
        date: new Date().toISOString().split("T")[0],
        patientName: "", address: "", note: "Thank you for trusting Lumiere with your smile.",
      });
      setItems([{ id: Date.now(), description: "", qty: 1, price: 0, notes: "" }]);
      setActiveTab("history");
    } catch (error) {
      console.error("Error saving invoice:", error);
    }
  };

  const exportCSV = () => {
    const today = new Date().toISOString().split("T")[0];
    const todaysInvoices = history.filter(inv => inv.date === today);
    
    if(todaysInvoices.length === 0) {
      alert("No invoices found for today to export.");
      return;
    }

    let csv = "Invoice Number,Patient Name,Date,Items (Qty),Total (MMK)\n";
    todaysInvoices.forEach(inv => {
        const itemDesc = inv.items.map((i: any) => `${i.description} (x${i.qty})`).join("; ");
        csv += `"${inv.invoiceNumber}","${inv.patientName}","${inv.date}","${itemDesc}",${inv.total}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `Lumiere_Invoices_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatMMK = (num: number) => {
    return num.toLocaleString('en-US') + " Ks";
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-accent-charcoal dark:text-white">Invoices & Billing</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage billing, print cooler invoices, and export daily excel sheets.</p>
        </div>
        
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl w-max">
          <button onClick={() => setActiveTab("create")} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === "create" ? "bg-white dark:bg-gray-700 text-accent-charcoal dark:text-white shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"}`}>
            Create Invoice
          </button>
          <button onClick={() => setActiveTab("history")} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === "history" ? "bg-white dark:bg-gray-700 text-accent-charcoal dark:text-white shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"}`}>
            Invoice History
          </button>
        </div>
      </div>

      {activeTab === "history" && (
        <Card className="p-0 overflow-hidden print:hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/10">
             <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <h2 className="font-semibold text-accent-charcoal dark:text-white">All Saved Invoices</h2>
             </div>
             <Button size="sm" onClick={exportCSV} className="gap-2 bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-600/20 text-white border-0">
               <Download className="w-4 h-4" />
               Export Today's (CSV)
             </Button>
          </div>
          <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white dark:bg-surface-dark border-b border-gray-100 dark:border-gray-800 text-sm text-gray-500">
                    <th className="py-4 px-6 font-medium">Invoice #</th>
                    <th className="py-4 px-6 font-medium">Patient</th>
                    <th className="py-4 px-6 font-medium">Date</th>
                    <th className="py-4 px-6 font-medium">Total Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800 bg-white dark:bg-surface-dark text-sm">
                  {history.length === 0 ? (
                    <tr><td colSpan={4} className="py-12 text-center text-gray-500">No invoices saved yet. Go to Create Invoice.</td></tr>
                  ) : history.map((inv) => (
                    <tr key={inv.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/10 transition-colors">
                      <td className="py-4 px-6 font-semibold text-accent-charcoal dark:text-white">{inv.invoiceNumber}</td>
                      <td className="py-4 px-6 dark:text-gray-300">{inv.patientName}</td>
                      <td className="py-4 px-6 text-gray-500 dark:text-gray-400">{inv.date}</td>
                      <td className="py-4 px-6 font-bold text-accent-charcoal dark:text-white">{formatMMK(inv.total)}</td>
                    </tr>
                  ))}
                </tbody>
             </table>
          </div>
        </Card>
      )}

      {activeTab === "create" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Editor Sidebar */}
          <div className="lg:col-span-4 space-y-6 print:hidden">
            <Card className="!p-5 space-y-4">
              <h3 className="font-semibold text-lg border-b border-gray-100 dark:border-gray-800 pb-2 dark:text-white">Invoice Details</h3>
              <Input label="Invoice Number" name="invoiceNumber" value={invoice.invoiceNumber} onChange={handleInvoiceChange} />
              <Input label="Date" name="date" type="date" value={invoice.date} onChange={handleInvoiceChange} />
              <Input label="Patient Name" name="patientName" value={invoice.patientName} onChange={handleInvoiceChange} />
              <Input label="Address" name="address" value={invoice.address} onChange={handleInvoiceChange} />
              <Input label="Footer Note" name="note" value={invoice.note} onChange={handleInvoiceChange} />
            </Card>

            <Card className="!p-5 space-y-4 max-h-[500px] overflow-y-auto no-scrollbar">
               <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2 mb-2 sticky top-0 bg-white dark:bg-surface-dark z-10">
                  <h3 className="font-semibold text-lg dark:text-white">Line Items (MMK)</h3>
               </div>
               
               {items.map((item, index) => (
                 <div key={item.id} className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl relative group border border-transparent dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 transition-colors mb-4">
                    <button onClick={() => removeItem(item.id)} className="absolute -top-3 -right-3 w-8 h-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-20">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="space-y-3">
                      
                      {/* Using the Datalist approach for Invoices like we did in Appointments */}
                      <div className="flex flex-col gap-1.5 focus-within:z-10 relative">
                         <label className="text-sm font-medium text-gray-600 dark:text-gray-400 ml-1">Treatment {index + 1}</label>
                         <input 
                            list="invoice-treatment-options"
                            value={item.description}
                            onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                            placeholder="Select or type item here..."
                            className="w-full bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 rounded-2xl px-4 py-3 text-base text-accent-charcoal dark:text-white outline-none focus:border-accent-primary transition-colors"
                         />
                       </div>
                       
                       <div className="flex flex-col gap-1.5 focus-within:z-10">
                          <label className="text-[11px] font-bold text-gray-400 ml-1 uppercase tracking-wider">Treatment Notes / Plan</label>
                          <input 
                             value={item.notes || ""}
                             onChange={(e) => handleItemChange(item.id, 'notes', e.target.value)}
                             placeholder="Why this treatment? (e.g. Broken tooth, aesthetics)"
                             className="w-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-2 text-sm text-accent-charcoal dark:text-white outline-none focus:border-accent-primary transition-colors"
                          />
                       </div>

                      <div className="grid grid-cols-2 gap-3">
                        <Input label="Qty" type="number" min="1" value={item.qty} onChange={(e) => handleItemChange(item.id, 'qty', parseInt(e.target.value) || 0)} />
                        <Input label="Price Ks" type="number" min="0" value={item.price} onChange={(e) => handleItemChange(item.id, 'price', parseFloat(e.target.value) || 0)} />
                      </div>
                    </div>
                 </div>
               ))}

               {/* Global Datalist for the entire page */}
               <datalist id="invoice-treatment-options">
                  <option value="Checkup (စစ်ဆေးခြင်း)" />
                  <option value="Tooth Extraction (သွားနှုတ်ခြင်း)" />
                  <option value="Whitening (သွားဖြူခြင်း)" />
                  <option value="Root Canal (အကြောထုတ်ခြင်း)" />
                  <option value="Braces (သွားတု/ကြိုးတပ်ခြင်း)" />
                  <option value="X-Ray Scan (ဓာတ်မှန်ရိုက်ခြင်း)" />
               </datalist>
               
               <Button variant="outline" className="w-full gap-2 border-dashed border-2 bg-transparent" onClick={addItem}>
                 <Plus className="w-4 h-4" /> Add Item
               </Button>
            </Card>

            <div className="flex gap-4">
               <Button onClick={saveInvoice} className="flex-1 bg-accent-charcoal hover:bg-gray-800 text-white gap-2">
                  <CheckCircle className="w-4 h-4" /> Save Invoice
               </Button>
               <Button onClick={() => window.print()} className="flex-1 gap-2 shadow-lg">
                  <Printer className="w-4 h-4" /> Print / PDF
               </Button>
            </div>
          </div>

          {/* Cooler Invoice Preview Area */}
          <div className="lg:col-span-8">
            <Card className="font-sans shadow-2xl print:shadow-none print:p-0 print:border-none print:w-[800px] print:max-w-none bg-white overflow-hidden p-0 relative min-h-[800px] flex flex-col">
              
              {/* Brand Header Strip */}
              <div className="h-4 bg-accent-primary shrink-0"></div>
              
              <div className="p-10 pt-14 flex-1 flex flex-col">
                <div className="flex justify-between items-start pb-8">
                  <div>
                    <img 
                      src="/logo.png" 
                      alt="One Dental Specialist Clinic" 
                      className="h-auto w-56 object-contain mb-4"
                    />
                    <p className="text-sm text-gray-700 font-bold tracking-widest uppercase mt-4">Dental Specialist Clinic</p>
                    <p className="text-xs text-gray-500 mt-0.5 font-medium tracking-wide">Ortho & Implanter Center</p>
                    <p className="text-sm text-gray-500 mt-3 font-medium">Myawady Kayin</p>
                    <p className="text-sm text-gray-500">+95 9 123 456 789</p>
                  </div>
                  <div className="text-right">
                    <h3 className="text-5xl font-black text-gray-100 tracking-tighter uppercase mb-2">INVOICE</h3>
                    <div className="bg-gray-50 inline-block px-4 py-2 rounded-xl text-right">
                      <p className="text-gray-500 font-semibold mb-1">Invoice No: <span className="text-accent-charcoal">{invoice.invoiceNumber}</span></p>
                      <p className="text-gray-500 text-sm">Date Issued: <span className="text-accent-charcoal">{invoice.date}</span></p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 mb-12 flex gap-12 bg-gray-50 rounded-2xl p-6 border border-gray-100 print:bg-transparent print:border-none print:p-0">
                  <div>
                    <p className="text-xs text-gray-400 font-bold mb-2 uppercase tracking-widest">Billed To</p>
                    <p className="text-xl font-bold text-accent-charcoal mb-1">{invoice.patientName || "—"}</p>
                  </div>
                </div>

                <div className="min-h-[250px] flex-1">
                  <table className="w-full text-left mb-10">
                    <thead>
                      <tr className="border-b-2 border-accent-charcoal/10 uppercase text-xs tracking-widest text-gray-400">
                        <th className="py-4 px-2 font-bold w-full">Item Description</th>
                        <th className="py-4 px-2 font-bold text-center">Qty</th>
                        <th className="py-4 px-2 font-bold text-right min-w-[120px]">Price</th>
                        <th className="py-4 px-2 font-bold text-right min-w-[120px]">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm text-accent-charcoal">
                      {items.map((item, index) => (
                        <tr key={item.id} className="group hover:bg-blue-50/20 transition-colors">
                          <td className="py-5 px-2 font-medium">
                            <p className="font-bold">{item.description || <span className="text-gray-300 italic">No description</span>}</p>
                          </td>
                          <td className="py-5 px-2 text-center text-gray-500">{item.qty}</td>
                          <td className="py-5 px-2 text-right">{formatMMK(item.price)}</td>
                          <td className="py-5 px-2 text-right font-bold text-accent-charcoal">{formatMMK(item.qty * item.price)}</td>
                        </tr>
                      ))}
                      {items.length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-10 text-center text-gray-400 italic">No items added to this invoice.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end pt-8 mb-12">
                   <div className="w-1/2 min-w-[300px]">
                      <div className="bg-gray-50 rounded-2xl p-6 space-y-4 print:bg-transparent print:p-0">
                        <div className="flex justify-between text-gray-500 text-sm font-medium">
                          <span>Subtotal</span>
                          <span>{formatMMK(totalAmount)}</span>
                        </div>
                        <div className="flex justify-between text-gray-500 text-sm font-medium">
                          <span>Tax (0%)</span>
                          <span>0 Ks</span>
                        </div>
                        <div className="flex justify-between items-center text-xl font-black text-accent-charcoal border-t-2 border-gray-200 pt-4 mt-4">
                          <span>Total Due</span>
                          <span className="text-accent-primary text-2xl">{formatMMK(totalAmount)}</span>
                        </div>
                      </div>
                   </div>
                </div>

                {/* Footer now pushed to bottom if space permits, otherwise follows flow */}
                 <div className="mt-auto px-4 py-8 border-t border-gray-100 text-center" style={{ pageBreakInside: 'avoid' }}>
                    <p className="text-sm text-gray-500 italic mb-2 tracking-wide font-medium">{invoice.note}</p>
                    <p className="text-xs text-gray-400 uppercase tracking-[0.2em] font-bold">"One" Dental Specialist Clinic • Myawady Kayin</p>
                 </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </motion.div>
  );
}
