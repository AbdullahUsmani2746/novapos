'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';

export default function VoucherSection({
  title,
  section,
  subTranId,
  formData,
  setFormData,
  onAdd
}) {
  const handleChange = (e, index) => {
    const { name, value } = e.target;

    if (section === 'master') {
      setFormData(prev => ({
        ...prev,
        master: { ...prev.master, [name]: value }
      }));
    } else {
      const updated = [...formData.transactions];
      updated[index][name] = value;

      setFormData(prev => ({
        ...prev,
        transactions: updated
      }));
    }
  };

  const entries =
    section === 'master'
      ? [formData.master]
      : formData.transactions.filter(t => t.sub_tran_id === subTranId);

  return (
    <Card className="mb-6">
      <CardContent className="p-4 space-y-4">
        <h2 className="text-xl font-semibold">{title}</h2>

        {entries.map((entry, index) => (
          <div key={index} className="grid grid-cols-3 gap-4">
            <Input
              name="acno"
              placeholder="Account No"
              value={entry.acno || ''}
              onChange={e => handleChange(e, index)}
            />
            <Input
              name="acname"
              placeholder="Account Name"
              value={entry.acname || ''}
              onChange={e => handleChange(e, index)}
            />
            {section === 'master' && (
              <>
                <Input
                  name="date"
                  placeholder="Date"
                  type="date"
                  value={entry.date || ''}
                  onChange={e => handleChange(e)}
                />
                <Input
                  name="time"
                  placeholder="Time"
                  type="time"
                  value={entry.time || ''}
                  onChange={e => handleChange(e)}
                />
                <Input
                  name="remarks"
                  placeholder="Remarks"
                  value={entry.remarks || ''}
                  onChange={e => handleChange(e)}
                />
              </>
            )}
          </div>
        ))}

        {onAdd && (
          <Button
            type="button"
            onClick={onAdd}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Entry
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
