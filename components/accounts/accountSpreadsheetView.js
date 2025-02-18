"use client"
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
// import { FileDown, FileSpreadsheet, FilePdf } from "lucide-react";
import axios from "axios";


// Move these imports into dynamic imports
let html2pdf;
let XLSX;

const SiegwerkAccountsView = () => {

  
  const [loading, setLoading] = useState(true);
  const [accountData, setAccountData] = useState([]);

  useEffect(() => {
    Promise.all([
      import('html2pdf.js'),
      import('xlsx')
    ]).then(([html2pdfModule, XLSXModule]) => {
      html2pdf = html2pdfModule.default;
      XLSX = XLSXModule;
    });
    fetchAccountData();
  }, []);


  const fetchAccountData = async () => {
    try {
      setLoading(true);
      const level1Res = await axios.get("/api/accounts/mbscd");
      
      const formattedData = [];
      
      for (const l1 of level1Res.data) {
        const level2Res = await axios.get(`/api/accounts/bscd?mbscd=${l1.bscd}`);
        
        for (const l2 of level2Res.data) {
          const level3Res = await axios.get(`/api/accounts/macno?bscd=${l2.bscd}`);
          
          for (const l3 of level3Res.data) {
            const level4Res = await axios.get(`/api/accounts/acno?macno=${l3.macno}`);
            
            // Create entry with empty sub accounts
            const entry = {
              balanceSheetCode: l1.bscd + ' '+ l1.bscdDetail ,
              balanceSheetCategory:l2.bscd + ' '+ l2.bscdDetail,
              mainAccounts: l3.macno + ' ' + l3.macname,
              subAccounts: level4Res.data.map(acc => acc.acno + ' ' + acc.acname)
            };
            formattedData.push(entry);
          }
        }
      }
      
      setAccountData(formattedData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    if (!XLSX) return;

    // Flatten the data for Excel export
    const flatData = accountData.flatMap(item => {
      if (item.subAccounts.length === 0) {
        return [{
          'Balance Sheet Codes': item.balanceSheetCode,
          'Balance Sheet Category': item.balanceSheetCategory,
          'Main Accounts': item.mainAccounts,
          'Sub Accounts': ''
        }];
      }
      return item.subAccounts.map(subAccount => ({
        'Balance Sheet Codes': item.balanceSheetCode,
        'Balance Sheet Category': item.balanceSheetCategory,
        'Main Accounts': item.mainAccounts,
        'Sub Accounts': subAccount
      }));
    });

    const ws = XLSX.utils.json_to_sheet(flatData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Chart of Accounts");
    
    // Adjust column widths
    ws['!cols'] = [
      { wch: 20 }, // Balance Sheet Codes
      { wch: 30 }, // Balance Sheet Category
      { wch: 40 }, // Main Accounts
      { wch: 40 }, // Sub Accounts
    ];

    XLSX.writeFile(wb, "chart-of-accounts.xlsx");
  };

  const exportToPDF = () => {

    if (!html2pdf) return;
    
    const element = document.getElementById('accounts-content');
    const opt = {
      margin: 1,
      filename: 'chart-of-accounts.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' }
    };
    html2pdf().set(opt).from(element).save();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Company Header */}
        {/* <div className="text-center bg-[#F5F5DC] py-4 border">
          <h1 className="text-2xl font-bold text-navy-blue">SIEGWERK PAKISTAN LIMITED</h1>
        </div> */}
        
        {/* Page Title */}
        <div className="text-center py-2">
          <h2 className="text-xl font-bold">Chart Of Accounts</h2>
        </div>

        {/* Export Buttons */}
        <div className="flex justify-end gap-2 mb-4">
          <Button onClick={exportToExcel} className="flex items-center gap-2">
            {/* <FileSpreadsheet className="w-4 h-4" /> */}
            Export to Excel
          </Button>
          <Button onClick={exportToPDF} className="flex items-center gap-2">
            {/* <FilePdf className="w-4 h-4" /> */}
            Export to PDF
          </Button>
        </div>

        {/* Accounts Table */}
        <div id="accounts-content" className="border">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-2 text-left font-bold border-r">Balance Sheet Codes</th>
                <th className="px-4 py-2 text-left font-bold border-r">Balance Sheet Category</th>
                <th className="px-4 py-2 text-left font-bold border-r">Main Accounts</th>
                <th className="px-4 py-2 text-left font-bold">Sub Accounts</th>
              </tr>
            </thead>
            <tbody>
              {accountData.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="px-4 py-2 align-top border-r whitespace-nowrap">
                    {item.balanceSheetCode}
                  </td>
                  <td className="px-4 py-2 align-top border-r">
                    {item.balanceSheetCategory}
                  </td>
                  <td className="px-4 py-2 align-top border-r">
                    {item.mainAccounts}
                  </td>
                  <td className="px-4 py-2 align-top">
                    <div className="space-y-1">
                      {item.subAccounts.map((subAccount, idx) => (
                        <div key={idx}>{subAccount}</div>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SiegwerkAccountsView;