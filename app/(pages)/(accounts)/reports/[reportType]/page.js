// app/reports/[reportType]/page.jsx
import ReportViewer from '@/components/Reports/ReportViewer';

const ReportPage = ({ params }) => {
  return <ReportViewer reportType={params.reportType} />;
};

export default ReportPage;