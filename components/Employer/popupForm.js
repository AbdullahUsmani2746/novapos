import { useState, useEffect, useMemo } from "react";
import axios from '@/lib/axiosInstance';
import { Country, State, City } from "country-state-city";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, X, Info } from 'lucide-react';
import LoadingSpinner from "../Others/spinner";

const ANIMATION_VARIANTS = {
  container: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, when: "beforeChildren", staggerChildren: 0.1 }
    },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
  },
  item: {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    },
    exit: { opacity: 0, x: 20, transition: { duration: 0.2 } }
  }
};

const PopupForm = ({ onClose, setEmployers, employerToEdit }) => {
  // ... [Keep all the previous state and logic exactly the same] ...
  const [newEmployer, setNewEmployer] = useState({
    businessName: "",
    email: "",
    address: "",
    city: "",
    state:"",
    country: "",
    cpFirstName: "",
    cpMiddleName: "",
    cpSurname: "",
    cpEmail: "",
    cpPhoneNumber: "",
    cpAddress: "",
    employerId: "",
    subscriptionPlan: "",
    status: "ACTIVE",
    paymentMethod: "DIRECT DEPOSIT",
    terms: "MONTHLY",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [states, setStates] = useState([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);

  const uniqueCities = useMemo(() => {
    return Array.from(new Set(cities.map((city) => city.name))).map((name) =>
      cities.find((city) => city.name === name)
    );
  }, [cities]);

  useEffect(() => {
    setCountries(Country.getAllCountries());
  }, []);

  useEffect(() => {
    const fetchSubscriptionPlans = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get("/api/subscriptionPlanMaster");
        setSubscriptionPlans(response.data.data);
      } catch (error) {
        setErrors({ api: "Failed to load subscription plans. Please try again." });
      } finally {
        setIsLoading(false);
      }
    };
    fetchSubscriptionPlans();
  }, []);

  useEffect(() => {
    if (employerToEdit) {
      if (employerToEdit.country) {
        const statesList = State.getStatesOfCountry(employerToEdit.country) || [];
        setStates(statesList);
        const citiesInState = City.getCitiesOfState(employerToEdit.country, employerToEdit.state) || [];
        setCities(citiesInState);
      }
      setNewEmployer(employerToEdit);
    } else {
      generateEmployerId();
    }
  }, [employerToEdit]);

  const handleCountryChange = (value) => {
    setNewEmployer(prev => ({ ...prev, country: value, state: "", city: "" }));
    setStates(State.getStatesOfCountry(value) || []);
    setCities([]);
    setErrors(prev => ({ ...prev, country: "" }));
  };

  const handleStateChange = (value) => {
    setNewEmployer(prev => ({ ...prev, state: value, city: "" }));
    setCities(City.getCitiesOfState(newEmployer.country, value) || []);
    setErrors(prev => ({ ...prev, state: "" }));
  };

  const handleCityChange = (value) => {
    setNewEmployer(prev => ({ ...prev, city: value }));
    setErrors(prev => ({ ...prev, city: "" }));
  };

  const generateEmployerId = async () => {
    try {
      const response = await axios.get("/api/employers");
      const employers = response.data.data;
      const maxId = employers
        .filter(emp => emp.employerId?.startsWith("CLIENT-"))
        .map(emp => parseInt(emp.employerId.split("-")[1]) || 0)
        .reduce((max, current) => Math.max(max, current), 0);
      const nextId = maxId + 1;
      setNewEmployer(prev => ({ ...prev, employerId: `CLIENT-${String(nextId).padStart(3, "0")}` }));
    } catch (error) {
      setNewEmployer(prev => ({ ...prev, employerId: `CLIENT-${Date.now()}` }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewEmployer(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: "", api: "" }));
  };

  const validateForm = () => {
    const validationErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[\d\s-]{10,}$/;

    if (!newEmployer.businessName?.trim()) validationErrors.businessName = "Business name is required";
    if (!newEmployer.email?.trim()) validationErrors.email = "Email is required";
    else if (!emailRegex.test(newEmployer.email)) validationErrors.email = "Invalid email format";
    if (!newEmployer.address?.trim()) validationErrors.address = "Address is required";
    if (!newEmployer.city?.trim()) validationErrors.city = "City is required";
    if (!newEmployer.country?.trim()) validationErrors.country = "Country is required";
    if (!newEmployer.cpFirstName?.trim()) validationErrors.cpFirstName = "First name is required";
    if (!newEmployer.cpSurname?.trim()) validationErrors.cpSurname = "Surname is required";
    if (!newEmployer.cpEmail?.trim()) validationErrors.cpEmail = "Email is required";
    else if (!emailRegex.test(newEmployer.cpEmail)) validationErrors.cpEmail = "Invalid email format";
    if (!newEmployer.cpPhoneNumber?.trim()) validationErrors.cpPhoneNumber = "Phone number is required";
    else if (!phoneRegex.test(newEmployer.cpPhoneNumber)) validationErrors.cpPhoneNumber = "Invalid phone number";
    if (!newEmployer.subscriptionPlan?.trim()) validationErrors.subscriptionPlan = "Subscription plan is required";

    return validationErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const endpoint = employerToEdit?._id 
        ? `/api/employers/${employerToEdit._id}`
        : "/api/employers";
      const method = employerToEdit?._id ? "put" : "post";
      
      const response = await axios[method](endpoint, newEmployer);
      
      setEmployers(prev => employerToEdit
        ? prev.map(emp => emp._id === employerToEdit._id ? response.data.data : emp)
        : [...prev, response.data.data]
      );
      onClose();
    } catch (error) {
      const errorMessage = error.response?.data?.message || "An unexpected error occurred";
      const fieldErrors = error.response?.data?.errors || {};
      
      setErrors({
        ...fieldErrors,
        api: typeof errorMessage === 'string' ? errorMessage : "Invalid form data"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getError = (field) => errors[field] || null;

  return (
    <Dialog open={true} onOpenChange={onClose} className="bg-[#000000] ">
      <DialogContent className="max-w-2xl p-0">
        <motion.div variants={ANIMATION_VARIANTS.container} initial="hidden" animate="visible" exit="exit" className="w-full ">
          <Card className=" border-foreground/10">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-bold text-foreground flex justify-between items-center">
                {employerToEdit ? "Edit Client" : "Add Client"}
                <Button variant="ghost" size="icon" onClick={onClose} className="text-foreground/60 hover:text-background">
                  <X className="w-5 h-5" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <LoadingSpinner />
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6 px-1 h-[75vh] overflow-y-auto">
                  {errors.api && (
                    <div className="p-4 bg-red-100 text-red-700 rounded-lg">
                      {errors.api}
                    </div>
                  )}

                  <AnimatePresence mode="wait">
                    <motion.div variants={ANIMATION_VARIANTS.item} className="space-y-6">
                      <div className="space-y-4 rounded-lg bg-background/5 border border-foreground/5 py-4 px-4 shadow-sm mr-3">
                        <h3 className="text-lg font-semibold text-foreground">Business Information</h3>
                        <div className="space-y-4">
                          <div className="relative">
                            <Input
                              name="businessName"
                              value={newEmployer.businessName}
                              onChange={handleChange}
                              placeholder="Business Name"
                              className={`bg-background/5 border-background/10 text-foreground placeholder:text-foreground/40 ${getError('businessName') ? "border-red-500 pr-10" : ""}`}
                            />
                            {getError('businessName') && (
                              <Info className="absolute right-3 top-3 h-4 w-4 text-red-500" />
                            )}
                          </div>
                          {getError('businessName') && <p className="text-red-500 text-sm -mt-3">{getError('businessName')}</p>}

                          <div className="relative">
                            <Input
                              type="email"
                              name="email"
                              value={newEmployer.email}
                              onChange={handleChange}
                              placeholder="Email"
                              className={`bg-background/5 border-background/10 text-foreground placeholder:text-foreground/40 ${getError('email') ? "border-red-500 pr-10" : ""}`}
                            />
                            {getError('email') && (
                              <Info className="absolute right-3 top-3 h-4 w-4 text-red-500" />
                            )}
                          </div>
                          {getError('email') && <p className="text-red-500 text-sm -mt-3">{getError('email')}</p>}

                          <div className="relative">
                            <Input
                              name="address"
                              value={newEmployer.address}
                              onChange={handleChange}
                              placeholder="Address"
                              className={`bg-background/5 border-background/10 text-foreground placeholder:text-foreground/40 ${getError('address') ? "border-red-500 pr-10" : ""}`}
                            />
                            {getError('address') && (
                              <Info className="absolute right-3 top-3 h-4 w-4 text-red-500" />
                            )}
                          </div>
                          {getError('address') && <p className="text-red-500 text-sm -mt-3">{getError('address')}</p>}

                          <div className="grid grid-cols-3 gap-4">
                            <div className="relative">
                              <Select
                                value={newEmployer.country}
                                onValueChange={handleCountryChange}
                                className={getError('country') ? "[&>button]:border-red-500" : ""}
                              >
                              <SelectTrigger className="bg-red_foreground border-background/10 text-background hover:text-foreground hover:bg-background">
                                  <SelectValue placeholder="Select Country" />
                                </SelectTrigger>
                                <SelectContent>
                                  {countries.map(country => (
                                    <SelectItem key={country.isoCode} value={country.isoCode}>
                                      {country.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {getError('country') && (
                                <Info className="absolute right-3 top-3 h-4 w-4 text-red-500" />
                              )}
                            </div>

                            {states.length > 0 && (
                              <div className="relative">
                                <Select
                                  value={newEmployer.state}
                                  onValueChange={handleStateChange}
                                  className={getError('state') ? "[&>button]:border-red-500" : ""}
                                >
                              <SelectTrigger className="bg-red_foreground border-background/10 text-background hover:text-foreground hover:bg-background">
                                    <SelectValue placeholder="Select State" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {states.map(state => (
                                      <SelectItem key={state.isoCode} value={state.isoCode}>
                                        {state.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                {getError('state') && (
                                  <Info className="absolute right-3 top-3 h-4 w-4 text-red-500" />
                                )}
                              </div>
                            )}

                            <div className="relative">
                              <Select
                                value={newEmployer.city}
                                onValueChange={handleCityChange}
                                className={getError('city') ? "[&>button]:border-red-500" : ""}
                              >
                              <SelectTrigger className="bg-red_foreground border-background/10 text-background hover:text-foreground hover:bg-background">
                                  <SelectValue placeholder="Select City" />
                                </SelectTrigger>
                                <SelectContent>
                                  {uniqueCities.map(city => (
                                    <SelectItem key={city.name} value={city.name}>
                                      {city.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {getError('city') && (
                                <Info className="absolute right-3 top-3 h-4 w-4 text-red-500" />
                              )}
                            </div>
                          </div>
                          {(getError('country') || getError('state') || getError('city')) && (
                            <div className="space-y-1 -mt-3">
                              {getError('country') && <p className="text-red-500 text-sm">{getError('country')}</p>}
                              {getError('state') && <p className="text-red-500 text-sm">{getError('state')}</p>}
                              {getError('city') && <p className="text-red-500 text-sm">{getError('city')}</p>}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Contact Person Section */}
                      <div className="space-y-4 rounded-lg bg-background/5 border border-foreground/5 py-4 px-4 shadow-sm mr-3">
                        <h3 className="text-lg font-semibold text-foreground">Contact Person Information</h3>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="relative">
                            <Input
                              name="cpFirstName"
                              value={newEmployer.cpFirstName}
                              onChange={handleChange}
                              placeholder="First Name"
                              className={`bg-background/5 border-background/10 text-foreground placeholder:text-foreground/40 ${getError('cpFirstName') ? "border-red-500 pr-10" : ""}`}
                            />
                            {getError('cpFirstName') && (
                              <Info className="absolute right-3 top-3 h-4 w-4 text-red-500" />
                            )}
                          </div>
                          <Input
                            name="cpMiddleName"
                            value={newEmployer.cpMiddleName}
                            onChange={handleChange}
                            placeholder="Middle Name"
                            className="bg-background/5 border-background/10 text-foreground placeholder:text-foreground/40"
                          />
                          <div className="relative">
                            <Input
                              name="cpSurname"
                              value={newEmployer.cpSurname}
                              onChange={handleChange}
                              placeholder="Surname"
                              className={`bg-background/5 border-background/10 text-foreground placeholder:text-foreground/40 ${getError('cpSurname') ? "border-red-500 pr-10" : ""}`}
                            />
                            {getError('cpSurname') && (
                              <Info className="absolute right-3 top-3 h-4 w-4 text-red-500" />
                            )}
                          </div>
                        </div>
                        <div className="flex gap-4 -mt-3">
                          {getError('cpFirstName') && <p className="text-red-500 text-sm">{getError('cpFirstName')}</p>}
                          {getError('cpSurname') && <p className="text-red-500 text-sm">{getError('cpSurname')}</p>}
                        </div>

                        <div className="relative">
                          <Input
                            type="email"
                            name="cpEmail"
                            value={newEmployer.cpEmail}
                            onChange={handleChange}
                            placeholder="Email"
                            className={`bg-background/5 border-background/10 text-foreground placeholder:text-foreground/40 ${getError('cpEmail') ? "border-red-500 pr-10" : ""}`}
                          />
                          {getError('cpEmail') && (
                            <Info className="absolute right-3 top-3 h-4 w-4 text-red-500" />
                          )}
                        </div>
                        {getError('cpEmail') && <p className="text-red-500 text-sm -mt-3">{getError('cpEmail')}</p>}

                        <div className="relative">
                          <Input
                            name="cpPhoneNumber"
                            value={newEmployer.cpPhoneNumber}
                            onChange={handleChange}
                            placeholder="Phone Number"
                            className={`bg-background/5 border-background/10 text-foreground placeholder:text-foreground/40 ${getError('cpPhoneNumber') ? "border-red-500 pr-10" : ""}`}
                          />
                          {getError('cpPhoneNumber') && (
                            <Info className="absolute right-3 top-3 h-4 w-4 text-red-500" />
                          )}
                        </div>
                        {getError('cpPhoneNumber') && <p className="text-red-500 text-sm -mt-3">{getError('cpPhoneNumber')}</p>}

                        <Input
                          name="cpAddress"
                          value={newEmployer.cpAddress}
                          onChange={handleChange}
                          placeholder="Address"
                          className="bg-background/5 border-background/10 text-foreground placeholder:text-foreground/40"
                        />
                      </div>

                      {/* Employer Details Section */}
                      <div className="space-y-4 rounded-lg bg-background/5 border border-foreground/5 py-4 px-4 shadow-sm mr-3">
                        <h3 className="text-lg font-semibold text-foreground">Employer Details</h3>
                        <div className="space-y-4">
                          <Input
                            name="employerId"
                            value={newEmployer.employerId}
                            readOnly
                            className="bg-background/5 border-background/10 text-foreground placeholder:text-foreground/40"
                          />

                          <div className="relative">
                            <Select
                              value={newEmployer.subscriptionPlan}
                              onValueChange={value => setNewEmployer(prev => ({ ...prev, subscriptionPlan: value }))}
                              className={getError('subscriptionPlan') ? "[&>button]:border-red-500" : ""}
                            >
                              <SelectTrigger className="bg-background border-background/10 text-foregound hover:text-background hover:bg-red_foreground">
                                <SelectValue placeholder="Select Subscription Plan" />
                              </SelectTrigger>
                              <SelectContent>
                                {subscriptionPlans.map(plan => (
                                  <SelectItem key={plan._id} value={plan._id}>
                                    {plan.planName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {getError('subscriptionPlan') && (
                              <Info className="absolute right-3 top-3 h-4 w-4 text-red-500" />
                            )}
                          </div>
                          {getError('subscriptionPlan') && <p className="text-red-500 text-sm -mt-3">{getError('subscriptionPlan')}</p>}

                          <div className="grid grid-cols-3 gap-4">
                            <Select
                              value={newEmployer.status}
                              onValueChange={value => setNewEmployer(prev => ({ ...prev, status: value }))}
                            >
                              <SelectTrigger className="bg-red_foreground border-background/10 text-background hover:text-foreground hover:bg-background">
                                <SelectValue placeholder="Status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ACTIVE">Active</SelectItem>
                                <SelectItem value="INACTIVE">Inactive</SelectItem>
                              </SelectContent>
                            </Select>

                            <Select
                              value={newEmployer.paymentMethod}
                              onValueChange={value => setNewEmployer(prev => ({ ...prev, paymentMethod: value }))}
                            >
                              <SelectTrigger className="bg-red_foreground border-background/10 text-background hover:text-foreground hover:bg-background">
                                <SelectValue placeholder="Payment Method" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="DIRECT DEPOSIT">Direct Deposit</SelectItem>
                                <SelectItem value="CHEQUE">Cheque</SelectItem>
                              </SelectContent>
                            </Select>

                            <Select
                              value={newEmployer.terms}
                              onValueChange={value => setNewEmployer(prev => ({ ...prev, terms: value }))}
                            >
                              <SelectTrigger className="bg-red_foreground border-background/10 text-background hover:text-foreground hover:bg-background">
                                <SelectValue placeholder="Terms" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="MONTHLY">Monthly</SelectItem>
                                <SelectItem value="YEARLY">Yearly</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-4 py-4 mx-4 border-t border-background/10">
                        <Button
                          type="button"
                          onClick={onClose}
                          variant="outline"
                className="w-full md:w-auto  hover:text-background hover:bg-red_foreground  text-foreground bg-background transition-all duration-200 shadow-md hover:shadow-background/20 flex items-center justify-center py-2 px-4 text-sm sm:text-base"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                className="w-full md:w-auto hover:text-foreground hover:border hover:border-foreground/5 hover:bg-background  transition-all duration-200 shadow-md hover:shadow-background/20 flex items-center justify-center py-2 px-4 text-sm sm:text-base"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          {isSubmitting ? "Saving..." : employerToEdit ? "Update Client" : "Add Client"}
                        </Button>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default PopupForm;