"use client"
import { useState, useEffect } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Plus, 
  ChevronRight, 
  ChevronLeft, 
  Info, 
  Trash2 
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const ChartOfAccounts = () => {
  const [loading, setLoading] = useState(true)
  const [level1Data, setLevel1Data] = useState([])
  const [level2Data, setLevel2Data] = useState([])
  const [level3Data, setLevel3Data] = useState([])
  const [accounts, setAccounts] = useState([])
  const [selectedLevel1, setSelectedLevel1] = useState(null)
  const [selectedLevel2, setSelectedLevel2] = useState(null)
  const [selectedLevel3, setSelectedLevel3] = useState(null)
  const [activeModal, setActiveModal] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      const mbscdRes = await axios.get("/api/accounts/mbscd")
      setLevel1Data(mbscdRes.data)
      const bscdRes = await axios.get("/api/accounts/bscd")
      setLevel2Data(bscdRes.data)
      const macnoRes = await axios.get("/api/accounts/macno")
      setLevel3Data(macnoRes.data)
      setLoading(false)
    } catch (error) {
      console.error(error)
      setLoading(false)
    }
  }

  const fetchAccounts = async (macno) => {
    try {
      const acnoRes = await axios.get(`/api/accounts/acno?macno=${macno}`)
      setAccounts(acnoRes.data)
    } catch (error) {
      console.error(error)
    }
  }

  const getNextCode = async (level, padding) => {
    try {
      let endpoint = ""
      let codeField = ""
      switch (level) {
        case 1:
          endpoint = "/api/accounts/mbscd"
          codeField = "bscd"
          break
        case 2:
          endpoint = "/api/accounts/bscd"
          codeField = "bscd"
          break
        case 3:
          endpoint = "/api/accounts/macno"
          codeField = "macno"
          break
        case 4:
          endpoint = "/api/accounts/acno"
          codeField = "acno"
          break
        default:
          return "0000"
      }
      const response = await axios.get(endpoint)
      const existingCodes = response.data.map(item => parseInt(item[codeField]))
      const maxCode = existingCodes.length ? Math.max(...existingCodes) : 0
      return (maxCode + 1).toString().padStart(padding, "0")
    } catch (error) {
      console.error(error)
      return "0000"
    }
  }

  const handleLevel1Select = async (value) => {
    setSelectedLevel1(value)
    setSelectedLevel2(null)
    setSelectedLevel3(null)
    try {
      const bscdRes = await axios.get(`/api/accounts/bscd?mbscd=${value}`)
      setLevel2Data(bscdRes.data)
    } catch (error) {
      console.error(error)
    }
  }

  const handleLevel2Select = async (value) => {
    setSelectedLevel2(value)
    setSelectedLevel3(null)
    try {
      const macnoRes = await axios.get(`/api/accounts/macno?bscd=${value}`)
      setLevel3Data(macnoRes.data)
    } catch (error) {
      console.error(error)
    }
  }

  const handleLevel3Select = async (value) => {
    setSelectedLevel3(value)
    await fetchAccounts(value)
  }

  // Delete Functions
  const deleteAccount = async (macno, acno) => {
    await axios.delete(`/api/accounts/acno/${macno}/${acno}`)
  }

  const deleteMainAccount = async (macno) => {
    const accountsRes = await axios.get(`/api/accounts/acno?macno=${macno}`)
    const accountsToDelete = accountsRes.data
    for (const account of accountsToDelete) {
      await axios.delete(`/api/accounts/acno/${macno}/${account.acno}`)
    }
    await axios.delete(`/api/accounts/macno/${macno}`)
  }

  const deleteBusinessCategory = async (bscd) => {
    const mainAccounts = level3Data.filter(item => item.bscd === bscd)
    for (const mainAccount of mainAccounts) {
      await deleteMainAccount(mainAccount.macno)
    }
    await axios.delete(`/api/accounts/bscd/${bscd}`)
  }

  const deleteMainBusinessCategory = async (mbscd) => {
    const businessCategories = level2Data.filter(item => item.mbscd === mbscd)
    for (const businessCategory of businessCategories) {
      await deleteBusinessCategory(businessCategory.bscd)
    }
    await axios.delete(`/api/accounts/mbscd/${mbscd}`)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setLoading(true)
    try {
      switch (deleteTarget.type) {
        case 'mbscd':
          await deleteMainBusinessCategory(deleteTarget.item.bscd)
          break
        case 'bscd':
          await deleteBusinessCategory(deleteTarget.item.bscd)
          break
        case 'macno':
          await deleteMainAccount(deleteTarget.item.macno)
          break
        case 'acno':
          await deleteAccount(deleteTarget.item.macno, deleteTarget.item.acno)
          break
        default:
          break
      }
      setActiveModal(null)
      setDeleteTarget(null)
      await fetchAllData()
      setSelectedLevel1(null)
      setSelectedLevel2(null)
      setSelectedLevel3(null)
    } catch (error) {
      console.error("Error during deletion:", error)
    } finally {
      setLoading(false)
    }
  }

  const AccountCreationWizard = () => {
    const [currentStep, setCurrentStep] = useState(1)
    const [selectedMA, setSelectedMA] = useState(null)
    const [newMAName, setNewMAName] = useState("")
    const [selectedBC, setSelectedBC] = useState(null)
    const [newBCName, setNewBCName] = useState("")
    const [selectedMBC, setSelectedMBC] = useState(null)
    const [newMBCName, setNewMBCName] = useState("")
    const [accountData, setAccountData] = useState({
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
    })

    const renderStep = () => {
      switch (currentStep) {
        case 1:
          return (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <h3 className="text-xl font-semibold text-gray-800">Select or Create Main Account</h3>
              <div className="space-y-4">
                <Select value={selectedMA} onValueChange={setSelectedMA}>
                  <SelectTrigger className="w-full border-gray-300 focus:ring-2 focus:ring-indigo-500 rounded-lg">
                    <SelectValue placeholder="Select Main Account" />
                  </SelectTrigger>
                  <SelectContent>
                    {level3Data.map((item) => (
                      <SelectItem key={item.macno} value={item.macno}>
                        {item.macno} - {item.macname}
                      </SelectItem>
                    ))}
                    <SelectItem value="new">Add New Main Account</SelectItem>
                  </SelectContent>
                </Select>
                {selectedMA === "new" && (
                  <Input 
                    placeholder="New Main Account Name" 
                    value={newMAName} 
                    onChange={(e) => setNewMAName(e.target.value)} 
                    className="border-gray-300 focus:ring-2 focus:ring-indigo-500 rounded-lg"
                  />
                )}
              </div>
            </motion.div>
          )
        case 2:
          return (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <h3 className="text-xl font-semibold text-gray-800">Select or Create Business Category</h3>
              <div className="space-y-4">
                <Select value={selectedBC} onValueChange={setSelectedBC}>
                  <SelectTrigger className="w-full border-gray-300 focus:ring-2 focus:ring-indigo-500 rounded-lg">
                    <SelectValue placeholder="Select Business Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {level2Data.map((item) => (
                      <SelectItem key={item.bscd} value={item.bscd}>
                        {item.bscd} - {item.bscdDetail}
                      </SelectItem>
                    ))}
                    <SelectItem value="new">Add New Business Category</SelectItem>
                  </SelectContent>
                </Select>
                {selectedBC === "new" && (
                  <Input 
                    placeholder="New Business Category Name" 
                    value={newBCName} 
                    onChange={(e) => setNewBCName(e.target.value)} 
                    className="border-gray-300 focus:ring-2 focus:ring-indigo-500 rounded-lg"
                  />
                )}
              </div>
            </motion.div>
          )
        case 3:
          return (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <h3 className="text-xl font-semibold text-gray-800">Select or Create Main Business Category</h3>
              <div className="space-y-4">
                <Select value={selectedMBC} onValueChange={setSelectedMBC}>
                  <SelectTrigger className="w-full border-gray-300 focus:ring-2 focus:ring-indigo-500 rounded-lg">
                    <SelectValue placeholder="Select Main Business Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {level1Data.map((item) => (
                      <SelectItem key={item.bscd} value={item.bscd}>
                        {item.bscd} - {item.bscdDetail}
                      </SelectItem>
                    ))}
                    <SelectItem value="new">Add New Main Business Category</SelectItem>
                  </SelectContent>
                </Select>
                {selectedMBC === "new" && (
                  <Input 
                    placeholder="New Main Business Category Name" 
                    value={newMBCName} 
                    onChange={(e) => setNewMBCName(e.target.value)} 
                    className="border-gray-300 focus:ring-2 focus:ring-indigo-500 rounded-lg"
                  />
                )}
              </div>
            </motion.div>
          )
        case 4:
          return (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <h3 className="text-xl font-semibold text-gray-800">Account Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input 
                  placeholder="Account Name*" 
                  value={accountData.acname} 
                  onChange={(e) => setAccountData({...accountData, acname: e.target.value})} 
                  className="border-gray-300 focus:ring-2 focus:ring-indigo-500 rounded-lg"
                />
                <Input 
                  placeholder="Bank Account No" 
                  value={accountData.bankAccountNo} 
                  onChange={(e) => setAccountData({...accountData, bankAccountNo: e.target.value})} 
                  className="border-gray-300 focus:ring-2 focus:ring-indigo-500 rounded-lg"
                />
                <Input 
                  placeholder="Address" 
                  value={accountData.address} 
                  onChange={(e) => setAccountData({...accountData, address: e.target.value})} 
                  className="border-gray-300 focus:ring-2 focus:ring-indigo-500 rounded-lg"
                />
                <Input 
                  placeholder="City" 
                  value={accountData.city} 
                  onChange={(e) => setAccountData({...accountData, city: e.target.value})} 
                  className="border-gray-300 focus:ring-2 focus:ring-indigo-500 rounded-lg"
                />
                <Input 
                  placeholder="Phone/Fax" 
                  value={accountData.phoneFax} 
                  onChange={(e) => setAccountData({...accountData, phoneFax: e.target.value})} 
                  className="border-gray-300 focus:ring-2 focus:ring-indigo-500 rounded-lg"
                />
                <Input 
                  placeholder="Email" 
                  value={accountData.email} 
                  onChange={(e) => setAccountData({...accountData, email: e.target.value})} 
                  className="border-gray-300 focus:ring-2 focus:ring-indigo-500 rounded-lg"
                />
              </div>
            </motion.div>
          )
        default:
          return null
      }
    }

    const completeCreation = async () => {
      setLoading(true)
      try {
        let macno = selectedMA
        let bscd = selectedBC
        let mbscd = selectedMBC

        if (selectedMBC === "new") {
          const nextMbscd = await getNextCode(1, 2)
          await axios.post("/api/accounts/mbscd", {
            bscd: nextMbscd,
            bscdDetail: newMBCName
          })
          mbscd = nextMbscd
        }

        if (selectedBC === "new" || selectedMBC === "new") {
          const nextBscd = await getNextCode(2, 2)
          await axios.post("/api/accounts/bscd", {
            bscd: nextBscd,
            bscdDetail: newBCName,
            mbscd: mbscd
          })
          bscd = nextBscd
        }

        if (selectedMA === "new" || selectedBC === "new" || selectedMBC === "new") {
          const nextMacno = await getNextCode(3, 3)
          await axios.post("/api/accounts/macno", {
            macno: nextMacno,
            macname: newMAName,
            bscd: bscd
          })
          macno = nextMacno
        }

        const nextAcno = await getNextCode(4, 4)
        await axios.post("/api/accounts/acno", {
          ...accountData,
          acno: nextAcno,
          macno: macno
        })

        setActiveModal(null)
        await fetchAllData()
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    const handleNext = () => {
      if (currentStep === 1) {
        if (!selectedMA) return
        if (selectedMA === "new" && !newMAName.trim()) return
        if (selectedMA !== "new") {
          setCurrentStep(4)
          return
        }
      }
      if (currentStep === 2) {
        if (!selectedBC) return
        if (selectedBC === "new" && !newBCName.trim()) return
        if (selectedBC !== "new") {
          setCurrentStep(4)
          return
        }
      }
      if (currentStep === 3) {
        if (!selectedMBC) return
        if (selectedMBC === "new" && !newMBCName.trim()) return
      }
      if (currentStep === 4) {
        if (!accountData.acname.trim()) return
        completeCreation()
        return
      }
      if (currentStep < 4) setCurrentStep(currentStep + 1)
    }

    const handleBack = () => {
      if (currentStep > 1) setCurrentStep(currentStep - 1)
    }

    return (
      <Dialog open={activeModal === "creation"} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="max-w-2xl w-full p-6 bg-white rounded-xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-indigo-600">Create New Account</DialogTitle>
          </DialogHeader>
          <div className="py-6">
            <AnimatePresence mode="wait">
              {renderStep()}
            </AnimatePresence>
          </div>
          <DialogFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={handleBack} 
              disabled={currentStep === 1}
              className="border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <Button 
              onClick={handleNext}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
            >
              {currentStep < 4 ? "Next" : "Create Account"} <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 min-h-screen bg-gray-50">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-800">Chart of Accounts</h1>
        <Button 
          onClick={() => setActiveModal("creation")} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 transition-colors shadow-md"
        >
          <Plus size={20} />
          Create New Account
        </Button>
      </motion.div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"
          />
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <Card className="overflow-hidden bg-white shadow-lg rounded-xl">
            <div className="bg-indigo-100 p-4 border-b border-indigo-200">
              <h2 className="font-semibold text-indigo-800">Main Business Category</h2>
            </div>
            <CardContent className="p-4 max-h-[400px] overflow-y-auto">
              <div className="space-y-2">
                {level1Data.map((item) => (
                  <motion.div
                    key={item.bscd}
                    whileHover={{ scale: 1.02 }}
                    className="p-3 rounded-lg cursor-pointer flex justify-between items-center transition-colors group"
                    onClick={() => handleLevel1Select(item.bscd)}
                  >
                    <div className="flex gap-2 items-center">
                      <span className="font-mono text-sm">{item.bscd}</span>
                      <span className="text-sm">{item.bscdDetail}</span>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {selectedLevel1 === item.bscd && <ChevronRight size={16} />}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeleteTarget({ type: 'mbscd', item: item })
                          setActiveModal('deleteConfirm')
                        }}
                      >
                        <Trash2 size={16} className="text-red-500" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden bg-white shadow-lg rounded-xl">
            <div className="bg-indigo-100 p-4 border-b border-indigo-200">
              <h2 className="font-semibold text-indigo-800">Business Category</h2>
            </div>
            <CardContent className="p-4 max-h-[400px] overflow-y-auto">
              {selectedLevel1 ? (
                <div className="space-y-2">
                  {level2Data.filter(item => item.mbscd === selectedLevel1).map((item) => (
                    <motion.div
                      key={item.bscd}
                      whileHover={{ scale: 1.02 }}
                      className="p-3 rounded-lg cursor-pointer flex justify-between items-center transition-colors group"
                      onClick={() => handleLevel2Select(item.bscd)}
                    >
                      <div className="flex gap-2 items-center">
                        <span className="font-mono text-sm">{item.bscd}</span>
                        <span className="text-sm">{item.bscdDetail}</span>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {selectedLevel2 === item.bscd && <ChevronRight size={16} />}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            setDeleteTarget({ type: 'bscd', item: item })
                            setActiveModal('deleteConfirm')
                          }}
                        >
                          <Trash2 size={16} className="text-red-500" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-500 h-[400px]">
                  <Info size={24} className="mb-2" />
                  <p className="text-sm">Select a Main Business Category</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden bg-white shadow-lg rounded-xl">
            <div className="bg-indigo-100 p-4 border-b border-indigo-200">
              <h2 className="font-semibold text-indigo-800">Main Account</h2>
            </div>
            <CardContent className="p-4 max-h-[400px] overflow-y-auto">
              {selectedLevel2 ? (
                <div className="space-y-2">
                  {level3Data.filter(item => item.bscd === selectedLevel2).map((item) => (
                    <motion.div
                      key={item.macno}
                      whileHover={{ scale: 1.02 }}
                      className="p-3 rounded-lg cursor-pointer flex justify-between items-center transition-colors group"
                      onClick={() => handleLevel3Select(item.macno)}
                    >
                      <div className="flex gap-2 items-center">
                        <span className="font-mono text-sm">{item.macno}</span>
                        <span className="text-sm">{item.macname}</span>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {selectedLevel3 === item.macno && <ChevronRight size={16} />}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            setDeleteTarget({ type: 'macno', item: item })
                            setActiveModal('deleteConfirm')
                          }}
                        >
                          <Trash2 size={16} className="text-red-500" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-500 h-[400px]">
                  <Info size={24} className="mb-2" />
                  <p className="text-sm">Select a Business Category</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden bg-white shadow-lg rounded-xl">
            <div className="bg-indigo-100 p-4 border-b border-indigo-200">
              <h2 className="font-semibold text-indigo-800">Accounts</h2>
            </div>
            <CardContent className="p-4 max-h-[400px] overflow-y-auto">
              {selectedLevel3 ? (
                <div className="space-y-2">
                  {accounts.length > 0 ? (
                    accounts.map((item) => (
                      <motion.div
                        key={item.acno}
                        whileHover={{ scale: 1.02 }}
                        className="p-3 rounded-lg flex justify-between items-center hover:bg-gray-100 transition-colors group"
                      >
                        <div className="flex gap-2 items-center">
                          <span className="font-mono text-sm">{item.acno}</span>
                          <span className="text-sm">{item.acname}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => {
                            setDeleteTarget({ type: 'acno', item: item })
                            setActiveModal('deleteConfirm')
                          }}
                        >
                          <Trash2 size={16} className="text-red-500" />
                        </Button>
                      </motion.div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-500 h-[350px]">
                      <Info size={24} className="mb-2" />
                      <p className="text-sm">No accounts found</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-500 h-[400px]">
                  <Info size={24} className="mb-2" />
                  <p className="text-sm">Select a Main Account</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
      
      <Dialog open={activeModal === 'deleteConfirm'} onOpenChange={() => setActiveModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          {deleteTarget && (
            <>
              <p>Are you sure you want to delete {
                deleteTarget.type === 'mbscd' ? 'Main Business Category' :
                deleteTarget.type === 'bscd' ? 'Business Category' :
                deleteTarget.type === 'macno' ? 'Main Account' : 'Account'
              } &apos;{deleteTarget.item.bscd || deleteTarget.item.macno || deleteTarget.item.acno} - {deleteTarget.item.bscdDetail || deleteTarget.item.macname || deleteTarget.item.acname}&apos;? This action cannot be undone.</p>
              {deleteTarget.type === 'mbscd' && (
                <p className="text-red-500">This will also delete all related Business Categories, Main Accounts, and Accounts.</p>
              )}
              {deleteTarget.type === 'bscd' && (
                <p className="text-red-500">This will also delete all related Main Accounts and Accounts.</p>
              )}
              {deleteTarget.type === 'macno' && (
                <p className="text-red-500">This will also delete all related Accounts.</p>
              )}
            </>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveModal(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AccountCreationWizard />
    </div>
  )
}

export default ChartOfAccounts