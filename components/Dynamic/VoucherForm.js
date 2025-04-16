'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PaymentVoucherSchema, ReceiptVoucherSchema, JournalVoucherSchema } from '@/validators/voucher-schemas';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useFieldArray } from 'react-hook-form';
import DynamicSelect from '@/components/Dynamic/DynamicSelect';
import { voucherConfig } from '@/config/vouchers';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';


export default function VoucherForm({ type, initialData, onSuccess }) {
  const schema = {
    payment: PaymentVoucherSchema,
    receipt: ReceiptVoucherSchema,
    journal: JournalVoucherSchema
  }[type];

  const isEditMode = !!initialData;
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: isEditMode ? normalizeEditData(initialData) : getDefaultValues(type)
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'transactions'
  });

  const onSubmit = async (data) => {
    try {
      const url = isEditMode ? `/api/vouchers/${initialData.tran_id}` : '/api/vouchers';
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(normalizeData(data, type))
      });

      if (!response.ok) throw new Error('Submission failed');
      onSuccess();
    } catch (error) {
      console.error('Error submitting voucher:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
{voucherConfig[type].fields.main.map((field) => (
  <FormField
    key={field.name}
    control={form.control}
    name={field.name}
    render={({ field }) => (
      <FormItem>
        <FormLabel>{field.label}</FormLabel>
        <FormControl>
          {field.type === 'acno-select' ? (
            <DynamicSelect
              type="acno"
              value={field.value}
              onChange={field.onChange}
            />
          ) : field.type === 'date' ? (
            <Input
              type="date"
              {...field}
              value={field.value?.toISOString().split('T')[0] || ''}
            />
          ) : (
            <Input {...field} type={field.type} />
          )}
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
))}
        </div>

        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-4 gap-4 items-end">
              {voucherConfig[type].fields.transactions.fields.map((tField) => (
  <FormField
    key={tField.name}
    control={form.control}
    name={`transactions.${index}.${tField.name}`}
    render={({ field }) => (
      <FormItem>
        <FormLabel>{tField.label}</FormLabel>
        <FormControl>
          {tField.type === 'acno-select' ? (
            <DynamicSelect
              type="acno"
              value={field.value}
              onChange={field.onChange}
            />
          ) : tField.type === 'cost-center-select' ? (
            <DynamicSelect
              type="cost-center"
              value={field.value}
              onChange={field.onChange}
            />
          ) : (
            <Input {...field} type={tField.type} />
          )}
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
))}
              <Button type="button" variant="destructive" onClick={() => remove(index)}>
                Remove
              </Button>
            </div>
          ))}
          <Button type="button" onClick={() => append({})} variant="outline">
            Add Transaction
          </Button>
        </div>

        <div className="flex justify-end gap-4">
          <Button type="submit">{isEditMode ? 'Update' : 'Create'} Voucher</Button>
        </div>
      </form>
    </Form>
  );
}

function getDefaultValues(type) {
  return {
    dateD: new Date(),
    tran_code: voucherConfig[type].tranCode,
    transactions: [{}]
  };
}

function normalizeData(data, type) {
  return {
    ...data,
    transactions: data.transactions.map((t) => ({
      ...t,
      sub_tran_id: type === 'payment' ? 1 : 2
    }))
  };
}

function normalizeEditData(data) {
  return {
    ...data,
    transactions: data.transactions.map((t) => ({
      ...t,
      damt: t.damt || undefined,
      camt: t.camt || undefined
    }))
  };
}