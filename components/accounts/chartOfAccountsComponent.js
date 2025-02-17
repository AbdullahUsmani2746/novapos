"use client"
import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, ChevronRight, Edit2, Trash2, Info } from "lucide-react";

const ChartOfAccounts = () => {
  const [loading, setLoading] = useState(true);
  const [level1Data, setLevel1Data] = useState([]);
  const [level2Data, setLevel2Data] = useState([]);
  const [level3Data, setLevel3Data] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [selectedLevel1, setSelectedLevel1] = useState(null);
  const [selectedLevel2, setSelectedLevel2] = useState(null);
  const [selectedLevel3, setSelectedLevel3] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [detailedAccountModal, setDetailedAccountModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [newLevel1, setNewLevel1] = useState({ bscd: "", bscdDetail: "" });
  const [newLevel2, setNewLevel2] = useState({ bscd: "", bscdDetail: "" });
  const [newLevel3, setNewLevel3] = useState({ macno: "", macname: "" });
  const [detailedAccountData, setDetailedAccountData] = useState({
    acno: "",
    acname: "",
    bankAccountNo: "",
    address: "",
    city: "",
    phoneFax: "",
    email: "",
    website: "",
    crDays: 0,
    stRate: 0,
    area: "",
    category: "",
    subCategory: "",
    country: "",
    customerBank: "",
    customerBankAddr: "",
    stRegNo: "",
    ntnNo: "",
    contactPerson: "",
    crLimit: 0,
    salesArea: ""
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const mbscdRes = await axios.get("/api/accounts/mbscd");
      setLevel1Data(mbscdRes.data);
      if (selectedLevel1) {
        const bscdRes = await axios.get(`/api/accounts/bscd?mbscd=${selectedLevel1}`);
        setLevel2Data(bscdRes.data);
      }
      if (selectedLevel2) {
        const macnoRes = await axios.get(`/api/accounts/macno?bscd=${selectedLevel2}`);
        setLevel3Data(macnoRes.data);
      }
      if (selectedLevel3) {
        const acnoRes = await axios.get(`/api/accounts/acno?macno=${selectedLevel3}`);
        setAccounts(acnoRes.data);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  const getNextCode = (allLevelsData, padding) => {
    if (!allLevelsData.length) return "1".padStart(padding, "0");
  
    const existingCodes = allLevelsData.map(item => parseInt(item.bscd || item.macno || item.acno));
    const maxCode = existingCodes.length ? Math.max(...existingCodes) : 0;
  
    return (maxCode + 1).toString().padStart(padding, "0");
  };

  const handleLevel1Select = async (value) => {
    setSelectedLevel1(value);
    setSelectedLevel2(null);
    setSelectedLevel3(null);
    try {
      const bscdRes = await axios.get(`/api/accounts/bscd?mbscd=${value}`);
      setLevel2Data(bscdRes.data);
    } catch (error) {
      console.error("Error fetching level 2 data:", error);
    }
  };

  const handleLevel2Select = async (value) => {
    setSelectedLevel2(value);
    setSelectedLevel3(null);
    try {
      const macnoRes = await axios.get(`/api/accounts/macno?bscd=${value}`);
      setLevel3Data(macnoRes.data);
    } catch (error) {
      console.error("Error fetching level 3 data:", error);
    }
  };

  const handleLevel3Select = async (value) => {
    setSelectedLevel3(value);
    try {
      const acnoRes = await axios.get(`/api/accounts/acno?macno=${value}`);
      setAccounts(acnoRes.data);
    } catch (error) {
      console.error("Error fetching level 4 data:", error);
    }
  };

  const handleAddLevel1 = async () => {
    try {
      const nextCode = getNextCode([...level1Data, ...level2Data, ...level3Data, ...accounts], 2);
      await axios.post("/api/accounts/mbscd", {
        ...newLevel1,
        bscd: nextCode,
      });
      setActiveModal(null);
      fetchAllData();
    } catch (error) {
      console.error("Error adding level 1:", error);
    }
  };

  const handleAddLevel2 = async () => {
    if (!selectedLevel1) return;
    try {
      const nextCode = getNextCode([...level1Data, ...level2Data, ...level3Data, ...accounts], 2);
      await axios.post("/api/accounts/bscd", {
        ...newLevel2,
        bscd: nextCode,
        mbscd: selectedLevel1
      });
      setActiveModal(null);
      fetchAllData();
    } catch (error) {
      console.error("Error adding level 2:", error);
    }
  };

  const handleAddLevel3 = async () => {
    if (!selectedLevel2) return;
    try {
      const nextCode = getNextCode([...level1Data, ...level2Data, ...level3Data, ...accounts], 3);

      await axios.post("/api/accounts/macno", {
        ...newLevel3,
        macno: nextCode,
        bscd: selectedLevel2
      });
      setActiveModal(null);
      fetchAllData();
    } catch (error) {
      console.error("Error adding level 3:", error);
    }
  };

  const handleAddLevel4 = async () => {
    if (!selectedLevel3) return;
    try {
      const nextCode = getNextCode([...level1Data, ...level2Data, ...level3Data, ...accounts], 4);

      await axios.post("/api/accounts/acno", {
        ...detailedAccountData,
        acno: nextCode,
        macno: selectedLevel3
      });
      setActiveModal(null);
      setDetailedAccountModal(false);
      fetchAllData();
    } catch (error) {
      console.error("Error adding level 4:", error);
    }
  };

  const handleDeleteAccount = async (macno, acno) => {
    try {
      await axios.delete(`/api/accounts/acno/${macno}/${acno}`);
      fetchAllData();
    } catch (error) {
      console.error("Error deleting account:", error);
    }
  };

  const DetailedAccountForm = () => (
    <Dialog open={detailedAccountModal} onOpenChange={setDetailedAccountModal}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Account Details</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm">Account Name</label>
              <Input value={detailedAccountData.acname} onChange={(e) => setDetailedAccountData({...detailedAccountData, acname: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm">Bank Account No</label>
              <Input value={detailedAccountData.bankAccountNo} onChange={(e) => setDetailedAccountData({...detailedAccountData, bankAccountNo: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm">Address</label>
              <Input value={detailedAccountData.address} onChange={(e) => setDetailedAccountData({...detailedAccountData, address: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm">City</label>
              <Input value={detailedAccountData.city} onChange={(e) => setDetailedAccountData({...detailedAccountData, city: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm">Phone/Fax</label>
              <Input value={detailedAccountData.phoneFax} onChange={(e) => setDetailedAccountData({...detailedAccountData, phoneFax: e.target.value})} />
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm">Email</label>
              <Input value={detailedAccountData.email} onChange={(e) => setDetailedAccountData({...detailedAccountData, email: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm">Website</label>
              <Input value={detailedAccountData.website} onChange={(e) => setDetailedAccountData({...detailedAccountData, website: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm">Credit Days</label>
              <Input type="number" value={detailedAccountData.crDays} onChange={(e) => setDetailedAccountData({...detailedAccountData, crDays: parseInt(e.target.value)})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm">ST Rate</label>
              <Input type="number" value={detailedAccountData.stRate} onChange={(e) => setDetailedAccountData({...detailedAccountData, stRate: parseFloat(e.target.value)})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm">Area</label>
              <Input value={detailedAccountData.area} onChange={(e) => setDetailedAccountData({...detailedAccountData, area: e.target.value})} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDetailedAccountModal(false)}>Cancel</Button>
          <Button onClick={handleAddLevel4}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const renderAddModal = (level) => {
    const modalData = {
      1: {
        title: "Add Main Business Category",
        fields: [
        
          {
            label: "Category Name",
            value: newLevel1.bscdDetail,
            onChange: (e) => setNewLevel1({ ...newLevel1, bscdDetail: e.target.value }),
          },
        ],
        onSave: handleAddLevel1,
      },
      2: {
        title: "Add Business Category",
        fields: [
       
          {
            label: "Category Name",
            value: newLevel2.bscdDetail,
            onChange: (e) => setNewLevel2({ ...newLevel2, bscdDetail: e.target.value }),
          },
        ],
        onSave: handleAddLevel2,
      },
      3: {
        title: "Add Main Account",
        fields: [
       
          {
            label: "Account Name",
            value: newLevel3.macname,
            onChange: (e) => setNewLevel3({ ...newLevel3, macname: e.target.value }),
          },
        ],
        onSave: handleAddLevel3,
      },
    };

    const currentModal = modalData[level];

    return (
      <Dialog open={activeModal === level} onOpenChange={() => setActiveModal(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-primary">{currentModal.title}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {currentModal.fields.map((field, index) => (
              <div key={index} className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm text-muted-foreground">{field.label}</label>
                <Input className="col-span-3" value={field.value} onChange={field.onChange} />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveModal(null)} className="w-24">Cancel</Button>
            <Button onClick={currentModal.onSave} className="w-24">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        <div className="flex items-center gap-2 text-2xl font-semibold text-primary">
          <h1>Chart of Accounts</h1>
        </div>
        <Card className="border-muted/20 shadow-lg">
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-muted-foreground">Main Business Category</h2>
                  <Button variant="outline" onClick={() => setActiveModal(1)} className="hover:bg-primary/10">
                    <Plus className="w-4 h-4 mr-2" />Add New
                  </Button>
                </div>
                <Select value={selectedLevel1} onValueChange={handleLevel1Select}>
                  <SelectTrigger className="w-full md:w-[300px]">
                    <SelectValue placeholder="Select category..." />
                  </SelectTrigger>
                  <SelectContent>
                  {level1Data.map((item) => (
                      <SelectItem key={item.bscd} value={item.bscd}>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.bscd}</span>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          <span>{item.bscdDetail}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedLevel1 && (
                <div className="flex flex-col gap-2 pl-4 border-l-2 border-primary/20">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-medium text-muted-foreground">Business Category</h2>
                    <Button variant="outline" onClick={() => setActiveModal(2)} className="hover:bg-primary/10">
                      <Plus className="w-4 h-4 mr-2" />Add New
                    </Button>
                  </div>
                  <Select value={selectedLevel2} onValueChange={handleLevel2Select}>
                    <SelectTrigger className="w-full md:w-[300px]">
                      <SelectValue placeholder="Select category..." />
                    </SelectTrigger>
                    <SelectContent>
                      {level2Data.map((item) => (
                        <SelectItem key={item.bscd} value={item.bscd}>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{item.bscd}</span>
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            <span>{item.bscdDetail}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {selectedLevel2 && (
                <div className="flex flex-col gap-2 pl-8 border-l-2 border-primary/20">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-medium text-muted-foreground">Main Account</h2>
                    <Button variant="outline" onClick={() => setActiveModal(3)} className="hover:bg-primary/10">
                      <Plus className="w-4 h-4 mr-2" />Add New
                    </Button>
                  </div>
                  <Select value={selectedLevel3} onValueChange={handleLevel3Select}>
                    <SelectTrigger className="w-full md:w-[300px]">
                      <SelectValue placeholder="Select account..." />
                    </SelectTrigger>
                    <SelectContent>
                      {level3Data.map((item) => (
                        <SelectItem key={item.macno} value={item.macno}>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{item.macno}</span>
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            <span>{item.macname}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {selectedLevel3 && (
                <div className="flex flex-col gap-2 pl-12 border-l-2 border-primary/20">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium text-muted-foreground">Accounts</h2>
                    <Button variant="outline" onClick={() => setDetailedAccountModal(true)} className="hover:bg-primary/10">
                      <Plus className="w-4 h-4 mr-2" />Add New
                    </Button>
                  </div>
                  <div className="bg-card rounded-lg border border-muted/20 shadow-sm">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Account No</TableHead>
                          <TableHead>Account Name</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {accounts.map((account) => (
                          <TableRow key={account.acno}>
                            <TableCell className="font-medium">{account.acno}</TableCell>
                            <TableCell>{account.acname}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button size="sm" variant="ghost" className="hover:bg-primary/10" onClick={() => {
                                  setSelectedAccount(account);
                                  setDetailedAccountData(account);
                                  setDetailedAccountModal(true);
                                }}>
                                  <Info className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="ghost" className="hover:bg-destructive/10 text-destructive" onClick={() => handleDeleteAccount(account.macno, account.acno)}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {renderAddModal(1)}
        {renderAddModal(2)}
        {renderAddModal(3)}
        {DetailedAccountForm()}
      </div>
    </div>
  );
};

export default ChartOfAccounts;