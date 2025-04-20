'use client';
import { Card, CardContent } from '@/components/ui/card';

export default function VoucherSummary({ formData }) {
  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <h3 className="text-lg font-bold">Summary</h3>
        <pre className="bg-gray-100 p-3 rounded-md overflow-x-auto text-sm">
          {JSON.stringify(formData, null, 2)}
        </pre>
      </CardContent>
    </Card>
  );
}
