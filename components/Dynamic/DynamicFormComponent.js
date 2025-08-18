import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AnimatePresence, motion } from "framer-motion";
import { PenSquare, Plus, Save, Trash2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

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

const DynamicFormComponent = ({
  title = 'Dynamic Form',
  fields = [],
  existingData = null,
  onSubmit,
  onClose,
  allowMultiple = true,
  endpoint = '',
  onFieldChange,

}) => {
  const { data: session } = useSession();
  const employerId = session?.user?.username || "CLIENT-001";
  const [data, setData] = useState([{}]);
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  useEffect(() => {
    if (existingData) {
      setData([existingData]);
      setIsEditing(true);
      setEditIndex(0);
    }
  }, [existingData]);

  const handleDataChange = (index, field, value) => {
    const updatedData = [...data];
    updatedData[index] = {
      ...updatedData[index],
      [field]: value,
      employerId
    };
    setData(updatedData);
    console.log(updatedData)

  };

  const addData = () => {
    setData([...data, { employerId }]);
  };

  const removeData = (index) => {
    const updatedData = [...data];
    updatedData.splice(index, 1);
    setData(updatedData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (onSubmit) {
        await onSubmit(data, isEditing, editIndex);
      }
      if (onClose) onClose();
    } catch (error) {
      console.error('Error submitting data:', error);
    }
  };

  const handleFieldChange = (index, field, value) => {
    if (onFieldChange) {
      onFieldChange(field, value, data[index], (newData) => {
        const updatedData = [...data];
        updatedData[index] = newData;
        setData(updatedData);
        console.log(updatedData)
      });
    } else {
      handleDataChange(index, field, value);
    }
  };

  const renderField = (field, value, index) => {
    const commonProps = {
      value: value || '',
      onChange: (e) => handleFieldChange(index, field.name, e.target.value),
      placeholder: field.placeholder,
      className: "bg-background/5 border-background/10 text-text_background placeholder:text-text_background/40",
      required: field.required !== false,
      disabled: field.disabled
    };

    if (field.type === 'select') {
      const currentValue = value?._id || value || '';
      const currentLabel = value?.[field.displayKey] || field.placeholder;

      console.log("Value: ", currentValue)
      console.log("label: ", currentLabel)


      return (
        <div className="relative group">
          {field.icon && (
            <field.icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-background group-hover:text-red_foreground w-4 h-4" />
          )}
          <Select
            value={currentValue}
            onValueChange={(selectedValue) => {
              const selectedOption = field.options.find(opt => (opt.value ? opt.value : opt) === selectedValue);
              console.log(selectedOption)
              if (selectedOption) {
                console.log(selectedOption)

                handleFieldChange(index, field.name, selectedOption.value ? {
                  _id: selectedOption.value,
                  [field.displayKey]: selectedOption.label
                } : selectedOption);
              }
            }}
            disabled={field.disabled}
          >
            <SelectTrigger className={field.icon ? 'pl-10' : ''}>
              <SelectValue placeholder={currentLabel} />
            </SelectTrigger>
            <SelectContent>
              {field.options.map((option) => (
                <SelectItem key={option.value ? option.value : option} value={option.value ? option.value : option}>
                  {option.label ? option.label : option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }
    if (field.type === 'textarea') {
      return (
        <div className="relative">
          {field.icon && (
            <field.icon className="absolute left-3 top-4 transform -translate-y-1/2 text-red_foreground w-4 h-4" />
          )}
          <Textarea
            {...commonProps}
            className={`${commonProps.className} ${field.icon ? 'pl-10' : ''}`}
          />
        </div>
      );
    }
    if (field.type === 'checkbox') {
      return (
        <div className="flex items-center space-x-2">
          <Checkbox
            id={`${field.name}-${index}`}
            checked={value || false}
            onCheckedChange={(checked) => handleFieldChange(index, field.name, checked)}
            disabled={field.disabled}
          />
          <label
            htmlFor={`${field.name}-${index}`}
            className="text-sm text-text_background/80 font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {field.label}
          </label>
        </div>
      );
    }

    return (
      <div className="relative">
        {field.icon && (
          <field.icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red_foreground w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
        )}
        <Input
          {...commonProps}
          type={field.type || 'text'}
          className={`${commonProps.className} ${field.icon ? 'pl-10 sm:pl-12 md:pl-14' : ''}`}
        />
      </div>
    );
  };

  return (
    <motion.div
      variants={ANIMATION_VARIANTS.container}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="w-full max-w-2xl mx-auto p-2 sm:p-2 md:p-1"
    >
      <Card className="bg-background border-white/10 ">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold text-text_background">
            {isEditing ? `Edit ${title}` : `Create ${title}`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {data.map((item, index) => (
                <motion.div
                  key={index}
                  variants={ANIMATION_VARIANTS.item}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-4 px-4 py-4 rounded-lg bg-background/5 border border-foreground/5"
                >
                  <div className="space-y-4">
                    {fields.map((field) => (
                      <div key={field.name} className="space-y-2">
                        {field.label && (
                          <label className="text-sm text-text_background/60">
                            {field.label}
                          </label>
                        )}
                        {renderField(field, item[field.name], index)}
                      </div>
                    ))}
                  </div>

                  {allowMultiple && (index > 0 || isEditing) && (
                    <motion.div
                      className="flex justify-end"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <Button
                        type="button"
                        onClick={() => removeData(index)}
                        variant="destructive"
                        size="sm"
                        className="bg-red-500 hover:bg-red-600 text-white"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove
                      </Button>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            <div className="flex flex-col sm:flex-row justify-between pt-4 border-t border-background/10 gap-4">
              {allowMultiple && !isEditing && (
                <Button
                  type="button"
                  onClick={addData}
                  variant="outline"
                  className="border-background/10 text-background hover:bg-background  hover:text-foreground bg-red_foreground w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Another
                </Button>
              )}

              {/* Updated Button Group */}
              <div className="flex gap-2 w-full">
                <Button
                  type="button"
                  onClick={onClose}
                  variant="outline"
                  className="border-background/10 text-foreground hover:bg-red_foreground  flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="border-background/10 text-background hover:bg-background  hover:text-foreground bg-red_foreground w-full sm:w-auto"
                >
                  {isEditing ? (
                    <>
                      <PenSquare className="w-4 h-4 mr-2" />
                      Update
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Create
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DynamicFormComponent;