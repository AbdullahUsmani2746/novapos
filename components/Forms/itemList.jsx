'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Edit, Plus } from 'lucide-react';
import { fetchItems, deleteItem } from '@/lib/api';

export default function ItemList() {
  const [items, setItems] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const loadItems = async () => {
      try {
        const data = await fetchItems();
        setItems(data);
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    };
    loadItems();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteItem(id);
      setItems(items.filter((item) => item.itcd !== parseInt(id)));
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold">Item Management</CardTitle>
          <Button onClick={() => router.push('/accounting/forms/items/new')} className="bg-primary text-white">
            <Plus className="mr-2 h-4 w-4" /> Add New Item
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">ITCD</TableHead>
                <TableHead className="font-semibold">Description</TableHead>
                <TableHead className="font-semibold">Code</TableHead>
                <TableHead className="font-semibold">Unit</TableHead>
                <TableHead className="font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.itcd}>
                  <TableCell>{item.itcd}</TableCell>
                  <TableCell>{item.item}</TableCell>
                  <TableCell>{item.code}</TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => router.push(`/accounting/forms/items/${item.itcd}`)}
                      className="mr-2"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(item.itcd)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}