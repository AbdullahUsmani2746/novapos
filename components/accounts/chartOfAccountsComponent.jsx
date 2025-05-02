"use client"
import { useState, useEffect, useRef } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
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
  Trash2,
  Search,
  AlertCircle,
  User,
  Mail,
  MapPin,
  Phone,
  Building,
  Edit,
  Circle
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

// Custom Input with Icon and Error Handling
const FormInput = ({ icon: Icon, error, label, ...props }) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      )}
      <Input
        className={`pl-10 w-full rounded-md border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 ${error ? "border-red-500 focus:ring-red-500" : ""}`}
        {...props}
      />
      {error && (
        <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
      )}
    </div>
    {error && (
      <p className="text-xs text-red-500">{error}</p>
    )}
  </div>
)

const ChartOfAccounts = () => {
  const [loading, setLoading] = useState(false)
  const [cardLoading, setCardLoading] = useState({
    level1: false,
    level2: false,
    level3: false,
    accounts: false
  })
  const [level1Data, setLevel1Data] = useState([]) // Main Business Categories
  const [allLevel2Data, setAllLevel2Data] = useState([]) // All Business Categories
  const [allLevel3Data, setAllLevel3Data] = useState([]) // All Main Accounts
  const [level2Data, setLevel2Data] = useState({}) // { mbscd: [{ bscd, bscdDetail, mbscd }] }
  const [level3Data, setLevel3Data] = useState({}) // { bscd: [{ macno, macname, bscd }] }
  const [accounts, setAccounts] = useState({}) // { macno: [{ acno, acname, macno, ... }] }
  const [selectedLevel1, setSelectedLevel1] = useState(null)
  const [selectedLevel2, setSelectedLevel2] = useState(null)
  const [selectedLevel3, setSelectedLevel3] = useState(null)
  const [activeModal, setActiveModal] = useState(null) // creation, edit, deleteConfirm
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [editTarget, setEditTarget] = useState(null)
  const [searchTerms, setSearchTerms] = useState({
    level1: '',
    level2: '',
    level3: '',
    accounts: ''
  })

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true)
        const [mbscdRes, bscdRes, macnoRes] = await Promise.all([
          axios.get("/api/accounts/mbscd"),
          axios.get("/api/accounts/bscd"),
          axios.get("/api/accounts/macno")
        ])
        setLevel1Data(mbscdRes.data.data)
        setAllLevel2Data(bscdRes.data.data)
        setAllLevel3Data(macnoRes.data.data)
      } catch (error) {
        console.error("Error fetching initial data:", error)
        toast.error("Failed to load initial data.")
      } finally {
        setLoading(false)
      }
    }
    fetchInitialData()
  }, [])

  // Fetch Business Categories based on selected mbscd (for cards)
  const fetchLevel2Data = async (mbscd) => {
    if (level2Data[mbscd]) {
      return // Data already cached
    }
    try {
      setCardLoading(prev => ({ ...prev, level2: true }))
      const response = await axios.get(`/api/accounts/bscd?mbscd=${mbscd}`)
      setLevel2Data(prev => ({ ...prev, [mbscd]: response.data.data }))
    } catch (error) {
      console.error("Error fetching Business Categories:", error)
      toast.error("Failed to load Business Categories.")
    } finally {
      setCardLoading(prev => ({ ...prev, level2: false }))
    }
  }

  // Fetch Main Accounts based on selected bscd (for cards)
  const fetchLevel3Data = async (bscd) => {
    if (level3Data[bscd]) {
      return // Data already cached
    }
    try {
      setCardLoading(prev => ({ ...prev, level3: true }))
      const response = await axios.get(`/api/accounts/macno?bscd=${bscd}`)
      setLevel3Data(prev => ({ ...prev, [bscd]: response.data.data }))
    } catch (error) {
      console.error("Error fetching Main Accounts:", error)
      toast.error("Failed to load Main Accounts.")
    } finally {
      setCardLoading(prev => ({ ...prev, level3: false }))
    }
  }

  // Fetch Accounts based on selected macno (for cards)
  const fetchAccounts = async (macno) => {
    if (accounts[macno]) {
      return // Data already cached
    }
    try {
      setCardLoading(prev => ({ ...prev, accounts: true }))
      const response = await axios.get(`/api/accounts/acno?macno=${macno}`)
      setAccounts(prev => ({ ...prev, [macno]: response.data.data }))
    } catch (error) {
      console.error("Error fetching Accounts:", error)
      toast.error("Failed to load Accounts.")
    } finally {
      setCardLoading(prev => ({ ...prev, accounts: false }))
    }
  }

  // Generate next code for new entries
  const getNextCode = async (level, padding) => {
    try {
      const endpoint = {
        1: "/api/accounts/mbscd",
        2: "/api/accounts/bscd",
        3: "/api/accounts/macno",
        4: "/api/accounts/acno"
      }[level]
      const codeField = {
        1: "bscd",
        2: "bscd",
        3: "macno",
        4: "acno"
      }[level]
      
      const response = await axios.get(endpoint)
      const existingCodes = response.data.data.map(item => parseInt(item[codeField]))
      const maxCode = existingCodes.length ? Math.max(...existingCodes) : 0
      return (maxCode + 1).toString().padStart(padding, "0")
    } catch (error) {
      console.error("Error generating code:", error)
      toast.error("Failed to generate code.")
      return "0000"
    }
  }

  // Handlers for level selections
  const handleLevel1Select = async (value) => {
    setSelectedLevel1(value)
    setSelectedLevel2(null)
    setSelectedLevel3(null)
    await fetchLevel2Data(value)
  }

  const handleLevel2Select = async (value) => {
    setSelectedLevel2(value)
    setSelectedLevel3(null)
    await fetchLevel3Data(value)
  }

  const handleLevel3Select = async (value) => {
    setSelectedLevel3(value)
    await fetchAccounts(value)
  }

  // Deletion handlers
  const deleteAccount = async (macno, acno) => {
    try {
      await axios.delete(`/api/accounts/acno/${macno}/${acno}`)
      toast.success("Account deleted successfully.")
      setAccounts(prev => ({ ...prev, [macno]: prev[macno].filter(acc => acc.acno !== acno) }))
      setAllLevel3Data(prev => prev.filter(item => !(item.macno === macno && item.acno === acno)))
    } catch (error) {
      console.error("Error deleting account:", error)
      toast.error("Failed to delete account.")
    }
  }

  const deleteMainAccount = async (macno) => {
    try {
      const response = await axios.get(`/api/accounts/acno?macno=${macno}`)
      const accountsToDelete = response.data.data
      for (const account of accountsToDelete) {
        await axios.delete(`/api/accounts/acno/${macno}/${account.acno}`)
      }
      await axios.delete(`/api/accounts/macno/${macno}`)
      toast.success("Main Account deleted successfully.")
      setLevel3Data(prev => {
        const updated = { ...prev }
        updated[selectedLevel2] = updated[selectedLevel2].filter(item => item.macno !== macno)
        return updated
      })
      setAllLevel3Data(prev => prev.filter(item => item.macno !== macno))
      setAccounts(prev => {
        const updated = { ...prev }
        delete updated[macno]
        return updated
      })
    } catch (error) {
      console.error("Error deleting main account:", error)
      toast.error("Failed to delete main account.")
    }
  }

  const deleteBusinessCategory = async (bscd) => {
    try {
      const mainAccounts = (level3Data[bscd] || []).filter(item => item.bscd === bscd)
      for (const mainAccount of mainAccounts) {
        await deleteMainAccount(mainAccount.macno)
      }
      await axios.delete(`/api/accounts/bscd/${bscd}`)
      toast.success("Business Category deleted successfully.")
      setLevel2Data(prev => {
        const updated = { ...prev }
        updated[selectedLevel1] = updated[selectedLevel1].filter(item => item.bscd !== bscd)
        return updated
      })
      setAllLevel2Data(prev => prev.filter(item => item.bscd !== bscd))
      setLevel3Data(prev => {
        const updated = { ...prev }
        delete updated[bscd]
        return updated
      })
    } catch (error) {
      console.error("Error deleting business category:", error)
      toast.error("Failed to delete business category.")
    }
  }

  const deleteMainBusinessCategory = async (mbscd) => {
    try {
      const businessCategories = (level2Data[mbscd] || []).filter(item => item.mbscd === mbscd)
      for (const businessCategory of businessCategories) {
        await deleteBusinessCategory(businessCategory.bscd)
      }
      await axios.delete(`/api/accounts/mbscd/${mbscd}`)
      toast.success("Main Business Category deleted successfully.")
      setLevel1Data(prev => prev.filter(item => item.bscd !== mbscd))
      setLevel2Data(prev => {
        const updated = { ...prev }
        delete updated[mbscd]
        return updated
      })
    } catch (error) {
      console.error("Error deleting main business category:", error)
      toast.error("Failed to delete main business category.")
    }
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
      }
      setActiveModal(null)
      setDeleteTarget(null)
      setSelectedLevel1(null)
      setSelectedLevel2(null)
      setSelectedLevel3(null)
    } catch (error) {
      console.error("Error during deletion:", error)
      toast.error("Deletion failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Searchable Select Component
  const SearchableSelect = ({ value, onValueChange, items, placeholder, searchKey, type, error }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [search, setSearch] = useState('')
    const inputRef = useRef(null)

    const filteredItems = items.filter(item => 
      (item.bscdDetail || item.macname || item.acname || '')
        .toLowerCase()
        .includes(search.toLowerCase())
    )

    useEffect(() => {
      if (isOpen && inputRef.current) {
        inputRef.current.focus()
      }
    }, [isOpen])

    return (
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">{placeholder}</label>
        <Select 
          value={value} 
          onValueChange={onValueChange}
          open={isOpen}
          onOpenChange={setIsOpen}
        >
          <SelectTrigger className={`w-full rounded-md border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 ${error ? "border-red-500" : ""}`}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            <div className="p-2 sticky top-0 bg-white">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  ref={inputRef}
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 w-full rounded-md"
                  onKeyDown={(e) => e.stopPropagation()}
                />
              </div>
            </div>
            {filteredItems.map((item) => (
              <SelectItem 
                key={item[type]} 
                value={item[type]}
                className="hover:bg-indigo-50 focus:bg-indigo-50"
              >
                {item[type]} - {item.bscdDetail || item.macname || item.acname}
              </SelectItem>
            ))}
            <SelectItem value="new" className="hover:bg-indigo-50 focus:bg-indigo-50">
              Add New {placeholder.split('Select ')[1]}
            </SelectItem>
          </SelectContent>
        </Select>
        {error && (
          <p className="text-xs text-red-500">{error}</p>
        )}
      </div>
    )
  }

  // Creation/Edit Wizard
  const AccountWizard = ({ mode = 'creation' }) => {
    const [currentStep, setCurrentStep] = useState(1)
    const [selectedMA, setSelectedMA] = useState(mode === 'edit' && editTarget?.type === 'acno' ? editTarget.item.macno : null)
    const [newMAName, setNewMAName] = useState(mode === 'edit' && editTarget?.type === 'macno' ? editTarget.item.macname : "")
    const [selectedBC, setSelectedBC] = useState(mode === 'edit' && editTarget?.type === 'macno' ? editTarget.item.bscd : null)
    const [newBCName, setNewBCName] = useState(mode === 'edit' && editTarget?.type === 'bscd' ? editTarget.item.bscdDetail : "")
    const [selectedMBC, setSelectedMBC] = useState(mode === 'edit' && editTarget?.type === 'bscd' ? editTarget.item.mbscd : null)
    const [newMBCName, setNewMBCName] = useState(mode === 'edit' && editTarget?.type === 'mbscd' ? editTarget.item.bscdDetail : "")
    const [accountData, setAccountData] = useState({
      acname: mode === 'edit' && editTarget?.type === 'acno' ? editTarget.item.acname : "",
      bankAccountNo: mode === 'edit' && editTarget?.type === 'acno' ? editTarget.item.bankAccountNo || "" : "",
      address: mode === 'edit' && editTarget?.type === 'acno' ? editTarget.item.address || "" : "",
      city: mode === 'edit' && editTarget?.type === 'acno' ? editTarget.item.city || "" : "",
      phoneFax: mode === 'edit' && editTarget?.type === 'acno' ? editTarget.item.phoneFax || "" : "",
      email: mode === 'edit' && editTarget?.type === 'acno' ? editTarget.item.email || "" : "",
    })
    const [formErrors, setFormErrors] = useState({})

    const validateStep = () => {
      const newErrors = {}
      if (currentStep === 1) {
        if (!accountData.acname.trim()) newErrors.acname = "Account Name is required"
        if (accountData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(accountData.email)) {
          newErrors.email = "Invalid email format"
        }
      }
      if (currentStep === 2) {
        if (!selectedMA) newErrors.selectedMA = "Main Account is required"
        if (selectedMA === "new" && !newMAName.trim()) newErrors.newMAName = "Main Account Name is required"
      }
      if (currentStep === 3) {
        if (!selectedBC) newErrors.selectedBC = "Business Category is required"
        if (selectedBC === "new" && !newBCName.trim()) newErrors.newBCName = "Business Category Name is required"
      }
      if (currentStep === 4) {
        if (!selectedMBC) newErrors.selectedMBC = "Main Business Category is required"
        if (selectedMBC === "new" && !newMBCName.trim()) newErrors.newMBCName = "Main Business Category Name is required"
      }
      setFormErrors(newErrors)
      return Object.keys(newErrors).length === 0
    }

    const handleInputChange = (field, value) => {
      setAccountData(prev => ({ ...prev, [field]: value }))
      setFormErrors(prev => ({ ...prev, [field]: null }))
    }

    const renderStep = () => {
      switch (currentStep) {
        case 1:
          return (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-semibold text-gray-800">Account Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'acname', label: 'Account Name*', icon: User, required: true },
                  { name: 'bankAccountNo', label: 'Bank Account No', icon: Building },
                  { name: 'address', label: 'Address', icon: MapPin },
                  { name: 'city', label: 'City', icon: MapPin },
                  { name: 'phoneFax', label: 'Phone/Fax', icon: Phone },
                  { name: 'email', label: 'Email', icon: Mail }
                ].map(({ name, label, icon, required }) => (
                  <FormInput
                    key={name}
                    icon={icon}
                    label={label}
                    placeholder={label}
                    value={accountData[name]}
                    onChange={(e) => handleInputChange(name, e.target.value)}
                    required={required}
                    error={formErrors[name]}
                  />
                ))}
              </div>
            </motion.div>
          )
        case 2:
          return (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-semibold text-gray-800">Main Account</h3>
              <div className="space-y-4">
                <SearchableSelect
                  value={selectedMA}
                  onValueChange={setSelectedMA}
                  items={allLevel3Data}
                  placeholder="Select Main Account"
                  searchKey="macname"
                  type="macno"
                  error={formErrors.selectedMA}
                />
                {selectedMA === "new" && (
                  <FormInput
                    icon={Building}
                    label="New Main Account Name*"
                    placeholder="Enter Main Account Name"
                    value={newMAName}
                    onChange={(e) => setNewMAName(e.target.value)}
                    error={formErrors.newMAName}
                  />
                )}
              </div>
            </motion.div>
          )
        case 3:
          return (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-semibold text-gray-800">Business Category</h3>
              <div className="space-y-4">
                <SearchableSelect
                  value={selectedBC}
                  onValueChange={setSelectedBC}
                  items={allLevel2Data}
                  placeholder="Select Business Category"
                  searchKey="bscdDetail"
                  type="bscd"
                  error={formErrors.selectedBC}
                />
                {selectedBC === "new" && (
                  <FormInput
                    icon={Building}
                    label="New Business Category Name*"
                    placeholder="Enter Business Category Name"
                    value={newBCName}
                    onChange={(e) => setNewBCName(e.target.value)}
                    error={formErrors.newBCName}
                  />
                )}
              </div>
            </motion.div>
          )
        case 4:
          return (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-semibold text-gray-800">Main Business Category</h3>
              <div className="space-y-4">
                <SearchableSelect
                  value={selectedMBC}
                  onValueChange={setSelectedMBC}
                  items={level1Data}
                  placeholder="Select Main Business Category"
                  searchKey="bscdDetail"
                  type="bscd"
                  error={formErrors.selectedMBC}
                />
                {selectedMBC === "new" && (
                  <FormInput
                    icon={Building}
                    label="New Main Business Category Name*"
                    placeholder="Enter Main Business Category Name"
                    value={newMBCName}
                    onChange={(e) => setNewMBCName(e.target.value)}
                    error={formErrors.newMBCName}
                  />
                )}
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

        if (selectedMBC === "new" && newMBCName.trim()) {
          const nextMbscd = await getNextCode(1, 2)
          await axios.post("/api/accounts/mbscd", {
            bscd: nextMbscd,
            bscdDetail: newMBCName
          })
          mbscd = nextMbscd
          setLevel1Data(prev => [...prev, { bscd: nextMbscd, bscdDetail: newMBCName }])
        }

        if (selectedBC === "new" && newBCName.trim()) {
          const nextBscd = await getNextCode(2, 2)
          await axios.post("/api/accounts/bscd", {
            bscd: nextBscd,
            bscdDetail: newBCName,
            mbscd: mbscd || selectedMBC
          })
          bscd = nextBscd
          setAllLevel2Data(prev => [...prev, { bscd: nextBscd, bscdDetail: newBCName, mbscd: mbscd || selectedMBC }])
        }

        if (selectedMA === "new" && newMAName.trim()) {
          const nextMacno = await getNextCode(3, 3)
          await axios.post("/api/accounts/macno", {
            macno: nextMacno,
            macname: newMAName,
            bscd: bscd || selectedBC
          })
          macno = nextMacno
          setAllLevel3Data(prev => [...prev, { macno: nextMacno, macname: newMAName, bscd: bscd || selectedBC }])
        }

        const nextAcno = await getNextCode(4, 4)
        await axios.post("/api/accounts/acno", {
          ...accountData,
          acno: nextAcno,
          macno: macno || selectedMA
        })

        toast.success("Account created successfully.")
        setActiveModal(null)
        setSelectedLevel1(null)
        setSelectedLevel2(null)
        setSelectedLevel3(null)
      } catch (error) {
        console.error("Error creating account:", error)
        toast.error("Failed to create account. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    const completeEdit = async () => {
      setLoading(true)
      try {
        switch (editTarget.type) {
          case 'mbscd':
            await axios.patch(`/api/accounts/mbscd/${editTarget.item.bscd}`, {
              bscdDetail: newMBCName || editTarget.item.bscdDetail
            })
            setLevel1Data(prev => prev.map(item => 
              item.bscd === editTarget.item.bscd ? { ...item, bscdDetail: newMBCName || editTarget.item.bscdDetail } : item
            ))
            break
          case 'bscd':
            await axios.patch(`/api/accounts/bscd/${editTarget.item.bscd}`, {
              bscdDetail: newBCName || editTarget.item.bscdDetail,
              mbscd: selectedMBC || editTarget.item.mbscd
            })
            setAllLevel2Data(prev => prev.map(item => 
              item.bscd === editTarget.item.bscd ? { ...item, bscdDetail: newBCName || editTarget.item.bscdDetail, mbscd: selectedMBC || editTarget.item.mbscd } : item
            ))
            break
          case 'macno':
            await axios.patch(`/api/accounts/macno/${editTarget.item.macno}`, {
              macname: newMAName || editTarget.item.macname,
              bscd: selectedBC || editTarget.item.bscd
            })
            setAllLevel3Data(prev => prev.map(item => 
              item.macno === editTarget.item.macno ? { ...item, macname: newMAName || editTarget.item.macname, bscd: selectedBC || editTarget.item.bscd } : item
            ))
            break
          case 'acno':
            await axios.patch(`/api/accounts/acno/${editTarget.item.macno}/${editTarget.item.acno}`, {
              ...accountData,
              macno: selectedMA || editTarget.item.macno
            })
            break
        }
        toast.success(`${editTarget.type.toUpperCase()} updated successfully.`)
        setActiveModal(null)
        setEditTarget(null)
        setSelectedLevel1(null)
        setSelectedLevel2(null)
        setSelectedLevel3(null)
      } catch (error) {
        console.error("Error updating item:", error)
        toast.error("Failed to update item. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    const handleNext = () => {
      if (!validateStep()) return
      if (currentStep === 1) {
        if (mode === 'edit' && editTarget.type === 'acno') {
          completeEdit()
          return
        }
        setCurrentStep(2)
      } else if (currentStep === 2) {
        if (mode === 'edit' && editTarget.type === 'macno') {
          completeEdit()
          return
        }
        if (selectedMA !== "new") {
          completeCreation()
          return
        }
        setCurrentStep(3)
      } else if (currentStep === 3) {
        if (mode === 'edit' && editTarget.type === 'bscd') {
          completeEdit()
          return
        }
        if (selectedBC !== "new") {
          completeCreation()
          return
        }
        setCurrentStep(4)
      } else if (currentStep === 4) {
        if (mode === 'edit' && editTarget.type === 'mbscd') {
          completeEdit()
          return
        }
        completeCreation()
      }
    }

    const handleBack = () => {
      if (currentStep > 1) setCurrentStep(currentStep - 1)
    }

    // Progress Indicator
    const steps = [
      { label: "Account Details", step: 1 },
      { label: "Main Account", step: 2 },
      ...(selectedMA === "new" ? [{ label: "Business Category", step: 3 }] : []),
      ...(selectedMA === "new" && selectedBC === "new" ? [{ label: "Main Business Category", step: 4 }] : [])
    ]

    return (
      <Dialog 
        open={activeModal === mode} 
        onOpenChange={(open) => !open && setActiveModal(null)}
      >
        <DialogContent className="max-w-2xl w-full p-6 bg-white rounded-xl shadow-2xl sm:max-w-[95vw]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-indigo-700">
              {mode === 'edit' ? `Edit ${editTarget?.type.toUpperCase()}` : "Create New Account"}
            </DialogTitle>
          </DialogHeader>
          {mode === 'creation' && (
            <div className="flex justify-between mb-6">
              {steps.map(({ label, step }) => (
                <div key={step} className="flex items-center">
                  <Circle 
                    className={`w-6 h-6 ${step <= currentStep ? 'text-indigo-600 fill-indigo-600' : 'text-gray-300'}`} 
                  />
                  <span className={`ml-2 text-sm ${step <= currentStep ? 'text-indigo-600' : 'text-gray-500'}`}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          )}
          <div className="py-4">
            <AnimatePresence mode="wait">
              {renderStep()}
            </AnimatePresence>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row justify-between gap-4">
            <Button 
              variant="outline" 
              onClick={handleBack} 
              disabled={currentStep === 1}
              className="rounded-md border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              <ChevronLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <Button 
              onClick={handleNext}
              className="rounded-md bg-indigo-600 hover:bg-indigo-700 text-white"
              disabled={loading}
            >
              {mode === 'edit' ? "Update" : currentStep < steps.length ? "Next" : "Create"} 
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  const filteredData = {
    level1: level1Data.filter(item => 
      item.bscdDetail.toLowerCase().includes(searchTerms.level1.toLowerCase())
    ),
    level2: (level2Data[selectedLevel1] || []).filter(item => 
      item.bscdDetail.toLowerCase().includes(searchTerms.level2.toLowerCase())
    ),
    level3: (level3Data[selectedLevel2] || []).filter(item => 
      item.macname.toLowerCase().includes(searchTerms.level3.toLowerCase())
    ),
    accounts: (accounts[selectedLevel3] || []).filter(item => 
      item.acname.toLowerCase().includes(searchTerms.accounts.toLowerCase())
    )
  }

  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 min-h-screen bg-gray-50">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4"
      >
        <h1 className="text-3xl font-bold text-gray-900">Chart of Accounts</h1>
        <Button 
          onClick={() => setActiveModal("creation")} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-md px-4 py-2 flex items-center gap-2 shadow-md"
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
            className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full"
          />
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {[
            {
              title: "Main Business Category",
              data: filteredData.level1,
              type: "mbscd",
              selected: selectedLevel1,
              onSelect: handleLevel1Select,
              searchKey: "level1",
              codeField: "bscd",
              nameField: "bscdDetail",
              loading: cardLoading.level1
            },
            {
              title: "Business Category",
              data: filteredData.level2,
              type: "bscd",
              selected: selectedLevel2,
              onSelect: handleLevel2Select,
              searchKey: "level2",
              codeField: "bscd",
              nameField: "bscdDetail",
              loading: cardLoading.level2
            },
            {
              title: "Main Account",
              data: filteredData.level3,
              type: "macno",
              selected: selectedLevel3,
              onSelect: handleLevel3Select,
              searchKey: "level3",
              codeField: "macno",
              nameField: "macname",
              loading: cardLoading.level3
            },
            {
              title: "Accounts",
              data: filteredData.accounts,
              type: "acno",
              selected: null,
              onSelect: null,
              searchKey: "accounts",
              codeField: "acno",
              nameField: "acname",
              loading: cardLoading.accounts
            }
          ].map((section, index) => (
            <Card 
              key={section.title} 
              className="bg-white shadow-lg rounded-xl overflow-hidden"
            >
              <CardHeader className="bg-indigo-50 p-4 border-b border-indigo-100">
                <h2 className="text-lg font-semibold text-indigo-800">{section.title}</h2>
              </CardHeader>
              <CardContent className="p-4">
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder={`Search ${section.title.toLowerCase()}...`}
                    value={searchTerms[section.searchKey]}
                    onChange={(e) => setSearchTerms({
                      ...searchTerms,
                      [section.searchKey]: e.target.value
                    })}
                    className="pl-10 w-full rounded-md border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                  {section.loading ? (
                    <div className="flex justify-center items-center h-[350px]">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full"
                      />
                    </div>
                  ) : section.data.length > 0 ? (
                    section.data.map((item) => (
                      <motion.div
                        key={item[section.codeField]}
                        whileHover={{ scale: 1.02 }}
                        className="p-3 rounded-lg cursor-pointer flex justify-between items-center hover:bg-indigo-50 transition-colors group"
                        onClick={() => section.onSelect?.(item[section.codeField])}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') section.onSelect?.(item[section.codeField])
                        }}
                        role="button"
                      >
                        <div className="flex gap-3 items-center">
                          <span className="font-mono text-sm text-gray-600">{item[section.codeField]}</span>
                          <span className="text-sm text-gray-800">{item[section.nameField]}</span>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity">
                          {section.selected === item[section.codeField] && <ChevronRight size={16} className="text-indigo-600" />}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              setEditTarget({ type: section.type, item })
                              setActiveModal('edit')
                            }}
                            className="hover:bg-indigo-100"
                            title="Edit"
                          >
                            <Edit size={16} className="text-indigo-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              setDeleteTarget({ type: section.type, item })
                              setActiveModal('deleteConfirm')
                            }}
                            className="hover:bg-red-100"
                            title="Delete"
                          >
                            <Trash2 size={16} className="text-red-500" />
                          </Button>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-500 h-[350px]">
                      <Info size={24} className="mb-2" />
                      <p className="text-sm text-center">
                        {index === 0 ? "No main business categories found" :
                         index === 1 ? "Select a Main Business Category" :
                         index === 2 ? "Select a Business Category" :
                         "Select a Main Account"}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      )}
      
      <Dialog open={activeModal === 'deleteConfirm'} onOpenChange={() => setActiveModal(null)}>
        <DialogContent className="rounded-xl sm:max-w-[95vw] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">Confirm Deletion</DialogTitle>
          </DialogHeader>
          {deleteTarget && (
            <div className="space-y-4">
              <p className="text-gray-600">
                Are you sure you want to delete {
                  deleteTarget.type === 'mbscd' ? 'Main Business Category' :
                  deleteTarget.type === 'bscd' ? 'Business Category' :
                  deleteTarget.type === 'macno' ? 'Main Account' : 'Account'
                } <span className="font-medium">'{deleteTarget.item[deleteTarget.type]} - {deleteTarget.item.bscdDetail || deleteTarget.item.macname || deleteTarget.item.acname}'</span>? This action cannot be undone.
              </p>
              {['mbscd', 'bscd', 'macno'].includes(deleteTarget.type) && (
                <p className="text-red-500 text-sm">
                  This will also delete all related {
                    deleteTarget.type === 'mbscd' ? 'Business Categories, Main Accounts, and Accounts' :
                    deleteTarget.type === 'bscd' ? 'Main Accounts and Accounts' : 'Accounts'
                  }.
                </p>
              )}
            </div>
          )}
          <DialogFooter className="mt-6 flex flex-col sm:flex-row gap-4">
            <Button 
              variant="outline" 
              onClick={() => setActiveModal(null)}
              className="rounded-md border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              className="rounded-md"
              disabled={loading}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AccountWizard mode="creation" />
      <AccountWizard mode="edit" />
    </div>
  )
}

export default ChartOfAccounts