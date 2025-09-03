"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  fetchItem,
  createItem,
  updateItem,
  fetchSubtrates,
  fetchCategories,
} from "@/lib/api";
import {
  Package,
  Tags,
  FlaskConical,
  Save,
  X,
  Calendar,
  Hash,
  Palette,
  Layers,
} from "lucide-react";

export default function ItemForm() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  const [tab, setTab] = useState("basic");
  const [formData, setFormData] = useState({
    item: "",
    ic_id: "",
    alternate_id: "",
    unit: "",
    code: "",
    subtrates: "",
    valid_from: null,
    valid_to: null,
    with_white: 0,
    viscosity: "",
    color_bulk: "",
    gloss: "",
    opacity: "",
    fineness: "",
    solid: "",
    adhesion: "",
    e: "",
    a: "",
    l: "",
    b: "",
  });
  const [subtrates, setSubtrates] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const subtratesData = await fetchSubtrates();
        const catData = await fetchCategories();
        setCategories(catData);
        setSubtrates(subtratesData);
        if (id) {
          const item = await fetchItem(id);
          console.log("ITEM: ", formData);
          const from = setFormData({
            ...item,
            description: item.description || "",
            code: item.code || "",
            e: item.e || "",
            a: item.a || "",
            l: item.l || "",
            b: item.b || "",
            fineness: item.fineness || "",
            gloss: item.gloss || "",
            color_bulk: item.color_bulk || "",
            opacity: item.opacity || "",
            viscosity: item.viscosity || "",
            adhesion: item.adhesion || "",
            alternate_id: item.alternate_id || "",
            valid_from: item.valid_from
              ? new Date(item.valid_from).toISOString().split("T")[0]
              : null,
            valid_to: item.valid_to
              ? new Date(item.valid_to).toISOString().split("T")[0]
              : null,
            with_white: item.with_white || 0,
          });
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };
    loadData();
  }, [id]);

  useEffect(() => {
    console.log("FORM DATA: ", formData);
  }, [formData]);

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
        alternate_id: formData.alternate_id
          ? parseInt(formData.alternate_id)
          : undefined,
        valid_from: formData.valid_from
          ? new Date(formData.valid_from).toISOString()
          : null,
        valid_to: formData.valid_to
          ? new Date(formData.valid_to).toISOString()
          : null,
      };
      if (id) {
        await updateItem(id, data);
      } else {
        await createItem(data);
      }
      router.push("/");
    } catch (error) {
      console.error("Error saving item:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {id ? "Edit Item" : "Add New Item"}
              </h1>
              <p className="text-gray-600 mt-1">
                {id
                  ? "Update item details and specifications"
                  : "Create a new item with all necessary details"}
              </p>
            </div>
          </div>
          {id && (
            <Badge variant="secondary" className="text-xs">
              ID: {id}
            </Badge>
          )}
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-0">
            <Tabs value={tab} onValueChange={setTab} className="w-full">
              <div className="px-6 py-4 bg-primary border-b">
                <TabsList className="bg-white/50 backdrop-blur-sm border shadow-sm h-12 p-1">
                  <TabsTrigger
                    value="basic"
                    className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 py-2"
                  >
                    <Package className="h-4 w-4" />
                    Basic Info
                  </TabsTrigger>
                  <TabsTrigger
                    value="group"
                    className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 py-2"
                  >
                    <Tags className="h-4 w-4" />
                    Category
                  </TabsTrigger>
                  <TabsTrigger
                    value="quality"
                    className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 py-2"
                  >
                    <FlaskConical className="h-4 w-4" />
                    Quality Assurance
                  </TabsTrigger>
                </TabsList>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <TabsContent value="basic" className="mt-0">
                  {id && formData.item === "" ? (
                    <div className="flex items-center justify-center h-64 text-gray-500">
                      <div className="text-center">
                        <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Loading item data...</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {/* Primary Information */}
                      <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                          <Palette className="h-5 w-5 text-primary" />
                          <h3 className="text-lg font-semibold text-gray-900">
                            Primary Information
                          </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label
                              htmlFor="item"
                              className="text-sm font-medium text-gray-700"
                            >
                              Material Description
                            </Label>
                            <Input
                              id="item"
                              name="item"
                              value={formData.item}
                              onChange={handleChange}
                              className="h-11 border-gray-200 focus:border-primary focus:ring-primary"
                              placeholder="Enter material description"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor="code"
                              className="text-sm font-medium text-gray-700 flex items-center gap-2"
                            >
                              <Hash className="h-4 w-4" />
                              Code
                            </Label>
                            <Input
                              id="code"
                              name="code"
                              value={formData.code}
                              onChange={handleChange}
                              className="h-11 border-gray-200 focus:border-primary focus:ring-primary"
                              placeholder="Enter item code"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor="unit"
                              className="text-sm font-medium text-gray-700"
                            >
                              Unit of Measurement
                            </Label>
                            <Input
                              id="unit"
                              name="unit"
                              value={formData.unit}
                              onChange={handleChange}
                              className="h-11 border-gray-200 focus:border-primary focus:ring-primary"
                              placeholder="e.g., kg, liter, piece"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor="subtrates"
                              className="text-sm font-medium text-gray-700 flex items-center gap-2"
                            >
                              <Layers className="h-4 w-4" />
                              Substrates
                            </Label>
                            <Select
                              value={formData.subtrates}
                              onValueChange={(value) =>
                                handleSelectChange("subtrates", value)
                              }
                            >
                              <SelectTrigger className="h-11 border-gray-200 focus:border-primary focus:ring-primary">
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
                        </div>
                      </div>

                      <Separator className="my-8" />

                      {/* Additional Details */}
                      <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                          <Calendar className="h-5 w-5 text-primary" />
                          <h3 className="text-lg font-semibold text-gray-900">
                            Additional Details
                          </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label
                              htmlFor="alternate_id"
                              className="text-sm font-medium text-gray-700"
                            >
                              Alternate ID
                            </Label>
                            <Input
                              id="alternate_id"
                              name="alternate_id"
                              type="number"
                              value={formData.alternate_id}
                              onChange={handleChange}
                              className="h-11 border-gray-200 focus:border-primary focus:ring-primary"
                              placeholder="Enter alternate ID"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor="with_white"
                              className="text-sm font-medium text-gray-700"
                            >
                              With White
                            </Label>
                            <div className="flex items-center space-x-2 h-11">
                              <Switch
                                id="with_white"
                                checked={formData.with_white === 1}
                                onCheckedChange={handleSwitchChange}
                              />
                              <Label
                                htmlFor="with_white"
                                className="text-sm text-gray-600"
                              >
                                {formData.with_white === 1
                                  ? "Enabled"
                                  : "Disabled"}
                              </Label>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor="valid_from"
                              className="text-sm font-medium text-gray-700"
                            >
                              Valid From
                            </Label>
                            <Input
                              id="valid_from"
                              name="valid_from"
                              type="date"
                              value={formData.valid_from || ""}
                              onChange={(e) =>
                                handleDateChange("valid_from", e.target.value)
                              }
                              className="h-11 border-gray-200 focus:border-primary focus:ring-primary"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor="valid_to"
                              className="text-sm font-medium text-gray-700"
                            >
                              Valid To
                            </Label>
                            <Input
                              id="valid_to"
                              name="valid_to"
                              type="date"
                              value={formData.valid_to || ""}
                              onChange={(e) =>
                                handleDateChange("valid_to", e.target.value)
                              }
                              className="h-11 border-gray-200 focus:border-primary focus:ring-primary"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="group" className="mt-0">
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-6">
                      <Tags className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        Item Classification
                      </h3>
                    </div>

                    <div className="max-w-md">
                      <div className="space-y-2">
                        <Label
                          htmlFor="ic_id"
                          className="text-sm font-medium text-gray-700"
                        >
                          Item Category
                        </Label>
                        <Select
                          value={formData.ic_id}
                          onValueChange={(value) =>
                            handleSelectChange("ic_id", value)
                          }
                        >
                          <SelectTrigger className="h-11 border-gray-200 focus:border-primary focus:ring-primary">
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
                  </div>
                </TabsContent>

                <TabsContent value="quality" className="mt-0">
                  <div className="space-y-8">
                    <div className="flex items-center gap-2 mb-6">
                      <FlaskConical className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        Quality Parameters
                      </h3>
                    </div>

                    {/* Physical Properties */}
                    <div className="space-y-6">
                      <h4 className="text-md font-medium text-gray-800 border-l-4 border-primary pl-3">
                        Physical Properties
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <Label
                            htmlFor="viscosity"
                            className="text-sm font-medium text-gray-700"
                          >
                            Viscosity
                          </Label>
                          <Input
                            id="viscosity"
                            name="viscosity"
                            value={formData.viscosity}
                            onChange={handleChange}
                            className="h-11 border-gray-200 focus:border-primary focus:ring-primary"
                            placeholder="Enter viscosity"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="opacity"
                            className="text-sm font-medium text-gray-700"
                          >
                            Opacity
                          </Label>
                          <Input
                            id="opacity"
                            name="opacity"
                            value={formData.opacity}
                            onChange={handleChange}
                            className="h-11 border-gray-200 focus:border-primary focus:ring-primary"
                            placeholder="Enter opacity"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="gloss"
                            className="text-sm font-medium text-gray-700"
                          >
                            Gloss
                          </Label>
                          <Input
                            id="gloss"
                            name="gloss"
                            value={formData.gloss}
                            onChange={handleChange}
                            className="h-11 border-gray-200 focus:border-primary focus:ring-primary"
                            placeholder="Enter gloss level"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="fineness"
                            className="text-sm font-medium text-gray-700"
                          >
                            Fineness
                          </Label>
                          <Input
                            id="fineness"
                            name="fineness"
                            value={formData.fineness}
                            onChange={handleChange}
                            className="h-11 border-gray-200 focus:border-primary focus:ring-primary"
                            placeholder="Enter fineness"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="solid"
                            className="text-sm font-medium text-gray-700"
                          >
                            Solid Content
                          </Label>
                          <Input
                            id="solid"
                            name="solid"
                            value={formData.solid}
                            onChange={handleChange}
                            className="h-11 border-gray-200 focus:border-primary focus:ring-primary"
                            placeholder="Enter solid content"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="adhesion"
                            className="text-sm font-medium text-gray-700"
                          >
                            Adhesion
                          </Label>
                          <Input
                            id="adhesion"
                            name="adhesion"
                            value={formData.adhesion}
                            onChange={handleChange}
                            className="h-11 border-gray-200 focus:border-primary focus:ring-primary"
                            placeholder="Enter adhesion level"
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Color Properties */}
                    <div className="space-y-6">
                      <h4 className="text-md font-medium text-gray-800 border-l-4 border-primary pl-3">
                        Color Properties
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <Label
                            htmlFor="color_bulk"
                            className="text-sm font-medium text-gray-700"
                          >
                            Color Bulk
                          </Label>
                          <Input
                            id="color_bulk"
                            name="color_bulk"
                            value={formData.color_bulk}
                            onChange={handleChange}
                            className="h-11 border-gray-200 focus:border-primary focus:ring-primary"
                            placeholder="Enter color bulk"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="e"
                            className="text-sm font-medium text-gray-700"
                          >
                            E Value
                          </Label>
                          <Input
                            id="e"
                            name="e"
                            value={formData.e}
                            onChange={handleChange}
                            className="h-11 border-gray-200 focus:border-primary focus:ring-primary"
                            placeholder="Enter E value"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="a"
                            className="text-sm font-medium text-gray-700"
                          >
                            A Value
                          </Label>
                          <Input
                            id="a"
                            name="a"
                            value={formData.a}
                            onChange={handleChange}
                            className="h-11 border-gray-200 focus:border-primary focus:ring-primary"
                            placeholder="Enter A value"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="l"
                            className="text-sm font-medium text-gray-700"
                          >
                            L Value
                          </Label>
                          <Input
                            id="l"
                            name="l"
                            value={formData.l}
                            onChange={handleChange}
                            className="h-11 border-gray-200 focus:border-primary focus:ring-primary"
                            placeholder="Enter L value"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="b"
                            className="text-sm font-medium text-gray-700"
                          >
                            B Value
                          </Label>
                          <Input
                            id="b"
                            name="b"
                            value={formData.b}
                            onChange={handleChange}
                            className="h-11 border-gray-200 focus:border-primary focus:ring-primary"
                            placeholder="Enter B value"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/accounting/forms/items")}
                    className="flex items-center gap-2 h-11 px-6 bg-secondary hover:text-primary"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex items-center gap-2 h-11 px-6 bg-primary hover:bg-primary/90 text-white shadow-sm"
                  >
                    <Save className="h-4 w-4" />
                    {id ? "Update Item" : "Save Item"}
                  </Button>
                </div>
              </form>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
