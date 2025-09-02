'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchItem, createItem, updateItem, fetchSubtrates, fetchCategories } from '@/lib/api';

export default function ItemForm() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  const [tab, setTab] = useState('basic');
  const [formData, setFormData] = useState({
    item: '',
    ic_id: '',
    alternate_id: '',
    unit: '',
    code: '',
    subtrates: '',
    valid_from: null,
    valid_to: null,
    with_white: 0,
    viscosity: '',
    color_bulk: '',
    gloss: '',
    opacity: '',
    fineness: '',
    solid: '',
    adhesion: '',
    e: '',
    a: '',
    l: '',
    b: '',
  });
  const [subtrates, setSubtrates] = useState([]);
  const [categories, setCategories] = useState([]);

  // const [categories] = useState([
  //   { id: 1, name: 'Category 1' },
  //   { id: 2, name: 'Category 2' },
  // ]); // Stub; replace with API call if needed

  useEffect(() => {
    const loadData = async () => {
      try {
        const subtratesData = await fetchSubtrates();
        const catData = await fetchCategories();
        setCategories(catData)
        setSubtrates(subtratesData);
        if (id) {
          const item = await fetchItem(id);
          console.log("ITEM: ",formData)
          const from = setFormData({
            ...item,
            description: item.description || '',
            code: item.code || '',
            e: item.e || '',
            a: item.a || '',
            l: item.l || '',
            b: item.b || '',
            fineness: item.fineness || '',
            gloss: item.gloss || '',
            color_bulk: item.color_bulk || '',
            opacity: item.opacity || '',
            viscosity:item.viscosity || '',
            adhesion:item.adhesion || '',
            alternate_id: item.alternate_id || '',
            valid_from: item.valid_from ? new Date(item.valid_from).toISOString().split('T')[0] : null,
            valid_to: item.valid_to ? new Date(item.valid_to).toISOString().split('T')[0] : null,
            with_white: item.with_white || 0,
          }); 
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, [id]);


  useEffect(()=>{
    console.log("FORM DATA: ",formData)
  }, [formData])

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleDateChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSwitchChange = (checked) => {
    setFormData({ ...formData, with_white: checked ? 1 : 0 });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        ic_id: parseInt(formData.ic_id) || undefined,
        alternate_id: formData.alternate_id ? parseInt(formData.alternate_id) : undefined,
        valid_from: formData.valid_from ? new Date(formData.valid_from).toISOString() : null,
        valid_to: formData.valid_to ? new Date(formData.valid_to).toISOString() : null,
      };
      if (id) {
        await updateItem(id, data);
      } else {
        await createItem(data);
      }
      router.push('/');
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{id ? 'Edit Item' : 'Add New Item'}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="group">Group</TabsTrigger>
              <TabsTrigger value="quality">Quality Assurance</TabsTrigger>
            </TabsList>
            <form onSubmit={handleSubmit}>
              <TabsContent value="basic">
                {formData.item === "" ? null:(
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="item" className="text-right">Material Description</Label>
                    <Input id="item" name="item" value={formData.item} onChange={handleChange} className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="code" className="text-right">Code</Label>
                    <Input id="code" name="code" value={formData.code} onChange={handleChange} className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="unit" className="text-right">Unit of Measurement</Label>
                    <Input id="unit" name="unit" value={formData.unit} onChange={handleChange} className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="subtrates" className="text-right">Subtrates</Label>
                    <Select
                      value={formData.subtrates}
                      onValueChange={(value) => handleSelectChange('subtrates', value)}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select a substrate" />
                      </SelectTrigger>
                      <SelectContent>
                        {subtrates.map((sub) => (
                          <SelectItem key={sub.id} value={sub.subtrate}>
                            {sub.subtrate}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="alternate_id" className="text-right">Alternate ID</Label>
                    <Input
                      id="alternate_id"
                      name="alternate_id"
                      type="number"
                      value={formData.alternate_id}
                      onChange={handleChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="valid_from" className="text-right">Valid From</Label>
                    <Input
                      id="valid_from"
                      name="valid_from"
                      type="date"
                      value={formData.valid_from || ''}
                      onChange={(e) => handleDateChange('valid_from', e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="valid_to" className="text-right">Valid To</Label>
                    <Input
                      id="valid_to"
                      name="valid_to"
                      type="date"
                      value={formData.valid_to || ''}
                      onChange={(e) => handleDateChange('valid_to', e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="with_white" className="text-right">With White</Label>
                    <Switch
                      id="with_white"
                      checked={formData.with_white === 1}
                      onCheckedChange={handleSwitchChange}
                      className="col-span-3"
                    />
                  </div>
                </div>)}
              </TabsContent>
              <TabsContent value="group">
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="ic_id" className="text-right">Item Category</Label>
                    <Select
                      value={formData.ic_id}
                      onValueChange={(value) => handleSelectChange('ic_id', value)}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.ic_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="quality">
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="viscosity" className="text-right">Viscosity</Label>
                    <Input id="viscosity" name="viscosity" value={formData.viscosity} onChange={handleChange} className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="color_bulk" className="text-right">Color Bulk</Label>
                    <Input id="color_bulk" name="color_bulk" value={formData.color_bulk} onChange={handleChange} className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="opacity" className="text-right">Opacity</Label>
                    <Input id="opacity" name="opacity" value={formData.opacity} onChange={handleChange} className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="gloss" className="text-right">Gloss</Label>
                    <Input id="gloss" name="gloss" value={formData.gloss} onChange={handleChange} className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="fineness" className="text-right">Fineness</Label>
                    <Input id="fineness" name="fineness" value={formData.fineness} onChange={handleChange} className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="solid" className="text-right">Solid</Label>
                    <Input id="solid" name="solid" value={formData.solid} onChange={handleChange} className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="adhesion" className="text-right">Adhesion</Label>
                    <Input id="adhesion" name="adhesion" value={formData.adhesion} onChange={handleChange} className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="e" className="text-right">E</Label>
                    <Input id="e" name="e" value={formData.e} onChange={handleChange} className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="a" className="text-right">A</Label>
                    <Input id="a" name="a" value={formData.a} onChange={handleChange} className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="l" className="text-right">L</Label>
                    <Input id="l" name="l" value={formData.l} onChange={handleChange} className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="b" className="text-right">B</Label>
                    <Input id="b" name="b" value={formData.b} onChange={handleChange} className="col-span-3" />
                  </div>
                </div>
              </TabsContent>
              <div className="flex justify-end gap-4 mt-4">
                <Button variant="outline" onClick={() => router.push('/')}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-primary text-white">
                  Save
                </Button>
              </div>
            </form>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}