import { useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Sidebar } from "../components/Sidebar";
import { BottomNav } from "../components/BottomNav";
import { useFoodMood } from "../context/FoodMoodContext";
import { api } from "../../lib/api";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Camera, Upload, CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";

interface ScannedItem {
  name: string;
  price: string;
  expiryDate: string;
  confidence: number;
}

export function Scanner() {
  const navigate = useNavigate();
  const { refresh } = useFoodMood();
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [items, setItems] = useState<ScannedItem[]>([]);
  const [saving, setSaving] = useState(false);

  // Two hidden inputs: one for the camera (mobile), one for file picker.
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setScanning(true);
    try {
      const parsed = await api.scanReceipt(file);
      if (!parsed || !parsed.items || parsed.items.length === 0) {
        toast.error("Couldn't read any food items from the receipt. Try a clearer photo.");
        setScanning(false);
        return;
      }
      setItems(parsed.items || []);
      setScanned(true);
      if (parsed.filteredOutCount > 0) {
        toast.success(`Receipt scanned. AI filtered out ${parsed.filteredOutCount} non-food item(s) automatically.`);
      } else {
        toast.success(`Receipt scanned — found ${parsed.items?.length || 0} items`);
      }
    } catch (err: any) {
      toast.error(err?.message || "Scan failed");
    } finally {
      setScanning(false);
    }
  };

  const onCameraClick = () => cameraInputRef.current?.click();
  const onUploadClick = () => fileInputRef.current?.click();

  const handleItemChange = (index: number, field: keyof ScannedItem, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleAddToPantry = async () => {
    setSaving(true);
    try {
      await api.addItemsBatch(
        items.map((item) => ({
          name: item.name,
          category: "Other",
          quantity: 1,
          unit: "pcs",
          price: parseFloat(item.price) || 0,
          expiryDate: item.expiryDate,
          addedDate: new Date().toISOString().split("T")[0],
        })) as any
      );
      await refresh();
      toast.success(`${items.length} items added to pantry!`);
      navigate("/pantry");
    } catch (err: any) {
      toast.error(err?.message || "Failed to save items");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <BottomNav />

      {/* Hidden inputs — wired to the visible buttons */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />

      <main className="lg:ml-64 pb-20 lg:pb-6">
        <div className="max-w-7xl mx-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold text-[#4A5568] mb-2">Smart Scanner</h1>
            <p className="text-[#4A5568]/60 mb-6">Scan your receipt to automatically add items</p>
          </motion.div>

          {!scanned ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upload/Scan Section */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="p-8">
                  <div className="text-center">
                    <div className="w-32 h-32 mx-auto mb-6 bg-[#B2D2A4]/10 rounded-full flex items-center justify-center">
                      {scanning ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Camera className="w-16 h-16 text-[#B2D2A4]" />
                        </motion.div>
                      ) : (
                        <Upload className="w-16 h-16 text-[#B2D2A4]" />
                      )}
                    </div>

                    <h2 className="text-2xl font-semibold text-[#4A5568] mb-4">
                      {scanning ? "Scanning Receipt..." : "Upload Receipt"}
                    </h2>

                    <p className="text-[#4A5568]/60 mb-6">
                      {scanning
                        ? "Our AI is analyzing your receipt..."
                        : "Take a photo or upload an image of your grocery receipt"}
                    </p>

                    {!scanning && (
                      <div className="flex flex-col gap-3">
                        <Button
                          onClick={onCameraClick}
                          className="bg-[#B2D2A4] hover:bg-[#9BC18A] text-[#4A5568]"
                          size="lg"
                        >
                          <Camera className="w-5 h-5 mr-2" />
                          Take Photo
                        </Button>
                        <Button
                          onClick={onUploadClick}
                          variant="outline"
                          size="lg"
                        >
                          <Upload className="w-5 h-5 mr-2" />
                          Upload Image
                        </Button>
                      </div>
                    )}

                    {scanning && (
                      <div className="mt-6">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-[#B2D2A4]"
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 8 }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>

              {/* Info Section */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="p-8 h-full">
                  <h3 className="text-xl font-semibold text-[#4A5568] mb-4">
                    How it works
                  </h3>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-[#B2D2A4] text-white flex items-center justify-center flex-shrink-0">
                        1
                      </div>
                      <div>
                        <h4 className="font-medium text-[#4A5568] mb-1">Capture Receipt</h4>
                        <p className="text-sm text-[#4A5568]/60">
                          Take a clear photo of your grocery receipt
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-[#B2D2A4] text-white flex items-center justify-center flex-shrink-0">
                        2
                      </div>
                      <div>
                        <h4 className="font-medium text-[#4A5568] mb-1">AI Recognition</h4>
                        <p className="text-sm text-[#4A5568]/60">
                          Our smart OCR extracts item names, prices, and dates
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-[#B2D2A4] text-white flex items-center justify-center flex-shrink-0">
                        3
                      </div>
                      <div>
                        <h4 className="font-medium text-[#4A5568] mb-1">Verify & Adjust</h4>
                        <p className="text-sm text-[#4A5568]/60">
                          Review and edit any information before adding to your pantry
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-[#B2D2A4] text-white flex items-center justify-center flex-shrink-0">
                        4
                      </div>
                      <div>
                        <h4 className="font-medium text-[#4A5568] mb-1">Track Everything</h4>
                        <p className="text-sm text-[#4A5568]/60">
                          Items are automatically tracked with expiry reminders
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-[#4A5568]">
                    Verify Scanned Items
                  </h2>
                  <Badge className="bg-green-500 text-white">
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Scan Complete
                  </Badge>
                </div>

                <div className="space-y-4 mb-6">
                  {items.map((item, index) => (
                    <div key={index} className="p-4 border rounded-xl hover:border-[#B2D2A4] transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-[#4A5568]">Item {index + 1}</span>
                        <Badge
                          variant="outline"
                          className={item.confidence < 85 ? "border-amber-500 text-amber-500" : "border-green-500 text-green-500"}
                        >
                          {item.confidence < 85 && <AlertCircle className="w-3 h-3 mr-1" />}
                          {item.confidence}% confidence
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="text-xs text-[#4A5568]/60 mb-1 block">Item Name</label>
                          <Input
                            value={item.name}
                            onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                            className={item.confidence < 85 ? "border-amber-500" : ""}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-[#4A5568]/60 mb-1 block">Price ($)</label>
                          <Input
                            value={item.price}
                            onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-[#4A5568]/60 mb-1 block">Expiry Date</label>
                          <Input
                            type="date"
                            value={item.expiryDate}
                            onChange={(e) => handleItemChange(index, 'expiryDate', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleAddToPantry}
                    disabled={saving}
                    className="flex-1 bg-[#B2D2A4] hover:bg-[#9BC18A] text-[#4A5568]"
                    size="lg"
                  >
                    {saving ? "Saving..." : `Add ${items.length} Items to Pantry`}
                  </Button>
                  <Button
                    onClick={() => { setScanned(false); setItems([]); }}
                    variant="outline"
                    size="lg"
                  >
                    Scan Again
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
